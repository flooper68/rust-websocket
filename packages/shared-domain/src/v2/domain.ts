import { Subject } from 'rxjs'
import { match, P } from 'ts-pattern'
import { Result } from '../common/result'
import {
  DomainCommand,
  DomainCommandType,
  OneTimeDomainCommand,
  UndoableDomainCommand
} from './commands'
import { DomainState } from './domain-types'
import { DomainError, DomainStateNotInitialized } from './errors'
import { ClientCommandAddedToHistory, DomainEvent } from './events'
import { connectClient } from './handlers/connect-client'
import { createRectangle } from './handlers/create-rectangle'
import { disconnectClient } from './handlers/disconnect-client'
import { moveClientCursor } from './handlers/move-client-cursor'
import { redoLastClientCommand } from './handlers/redo-last-client-command'
import { selectNode } from './handlers/select-nodes'
import { undoLastClientCommand } from './handlers/undo-last-client-command'
import { reduce } from './reducer'
import { DomainSelectors } from './selectors'

export class Domain {
  private _initialized = false
  private _errorCallback: () => void
  readonly $domainStream = new Subject<DomainEvent>()
  private _state: DomainState = {
    connections: {},
    nodes: {}
  }

  constructor(callback: () => void) {
    this._errorCallback = callback
  }

  initialize(state: DomainState) {
    this._state = state
    this._initialized = true
  }

  private handleOneTimeCommand(command: OneTimeDomainCommand) {
    const events: Result<DomainError, DomainEvent[]> = match(command)
      .with({ type: DomainCommandType.ConnectClient }, connectClient)
      .with({ type: DomainCommandType.DisconnectClient }, disconnectClient)
      .with({ type: DomainCommandType.MoveClientCursor }, moveClientCursor)
      .with({ type: DomainCommandType.UndoLastClientCommand }, (c) =>
        undoLastClientCommand(c, this._state)
      )
      .with({ type: DomainCommandType.RedoLastClientCommand }, (c) =>
        redoLastClientCommand(c, this._state)
      )
      .with({ type: DomainCommandType.SelectNodes }, selectNode)
      .exhaustive()

    const result = events.chain((events) => {
      return events
        .reduce<Result<DomainError, DomainState>>(
          (state, event) => state.chain((s) => reduce(event, s)),
          Result.Ok(this._state)
        )
        .map(() => {
          return { events }
        })
    })

    result.match(
      ({ events }) => {
        events.forEach((event) => this.$domainStream.next(event))
      },
      () => {
        this._initialized = false
        this._errorCallback()
      }
    )

    return result.chain((_) => Result.Ok())
  }

  private handleUndoableCommand(command: UndoableDomainCommand) {
    const { undo, redo } = match(command)
      .with({ type: DomainCommandType.CreateRectangle }, createRectangle)
      .exhaustive()

    const result = redo.reduce<Result<DomainError, DomainState>>(
      (state, event) => state.chain((s) => reduce(event, s)),
      Result.Ok(this._state)
    )

    const withUndo = result.chain((state) => {
      const selection = DomainSelectors.getActiveClientSelection(
        command.payload.clientUuid,
        state
      )
      const addedToHistory = new ClientCommandAddedToHistory(
        {
          command: {
            undoEvents: undo,
            redoEvents: redo,
            selection: selection.map((s) => s.uuid)
          },
          clientUuid: command.payload.clientUuid
        },
        command.headers
      )

      return reduce(addedToHistory, state).map(() => addedToHistory)
    })

    withUndo.match(
      (addedToHistory) => {
        redo.forEach((event) => this.$domainStream.next(event))
        this.$domainStream.next(addedToHistory)
      },
      () => {
        this._initialized = false
        this._errorCallback()
      }
    )

    return withUndo.chain((_) => Result.Ok())
  }

  handle(command: DomainCommand) {
    if (!this._initialized) {
      this._errorCallback()
      return Result.Err(new DomainStateNotInitialized())
    }

    return match(command)
      .with(
        {
          type: P.union(
            DomainCommandType.ConnectClient,
            DomainCommandType.DisconnectClient,
            DomainCommandType.MoveClientCursor,
            DomainCommandType.UndoLastClientCommand,
            DomainCommandType.RedoLastClientCommand,
            DomainCommandType.SelectNodes
          )
        },
        (c) => this.handleOneTimeCommand(c)
      )
      .with(
        {
          type: P.union(DomainCommandType.CreateRectangle)
        },
        (c) => this.handleUndoableCommand(c)
      )
      .exhaustive()
  }

  getState() {
    return this._state
  }

  getObservable() {
    return this.$domainStream.asObservable()
  }
}
