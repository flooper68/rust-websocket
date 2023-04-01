import { Subject } from 'rxjs'
import { DomainState } from '../../domain/domain-types.js'
import { reduceDomainEvent } from '../../events/domain-projection.js'
import {
  ClientCommandAddedToHistory,
  DomainEvent,
  LastClientCommandRedone,
  LastClientCommandRedoSkipped,
  LastClientCommandUndone,
  LastClientCommandUndoSkipped,
  NodeDeselected,
  NodeSelected
} from '../../events/events.js'
import { DomainSelectors } from '../../projections/selectors.js'
import { UndoRedoSelectors } from '../../projections/undo-redo.js'
import {
  DomainCommand,
  OneTimeDomainCommand,
  RedoLastClientCommand,
  UndoableDomainCommand,
  UndoLastClientCommand
} from '../commands.js'
import { ClientSelection, ClientUuid } from '../../domain/node'

type StateSnapshot<
  CU extends ClientUuid,
  C extends UndoableDomainCommand,
  S
> = (props: { command: C; currentSelection: ClientSelection<CU> }) => S

type RedoHandler<
  CU extends ClientUuid,
  C extends UndoableDomainCommand,
  RE extends readonly DomainEvent[],
  S
> = (props: {
  command: C
  currentSelection: ClientSelection<CU>
  historySnapshot: S
}) => RE

type UndoHandler<
  CU extends ClientUuid,
  C extends UndoableDomainCommand,
  UE extends readonly DomainEvent[],
  S
> = (props: {
  command: C
  currentSelection: ClientSelection<CU>
  historySnapshot: S
}) => UE

interface RegisteredUndoableCommand<
  CU extends ClientUuid,
  C extends UndoableDomainCommand,
  RE extends readonly DomainEvent[],
  UE extends readonly DomainEvent[],
  S
> {
  type: C['type']
  undoable: true
  historySnapshot: StateSnapshot<CU, C, S>
  redoHandler: RedoHandler<CU, C, RE, S>
  undoHandler: UndoHandler<CU, C, UE, S>
}

type Handler<C, E extends readonly DomainEvent[]> = (
  command: C,
  state: Readonly<DomainState>
) => E

interface RegisteredOneTimeCommand<
  C extends DomainCommand,
  RE extends readonly DomainEvent[]
> {
  type: C['type']
  undoable: false
  handler: Handler<C, RE>
}

interface GeneralUndoableCommandHandler {
  type: string
  undoable: true
  historySnapshot: (props: { currentSelection: any[]; command: any }) => unknown
  redoHandler: (props: {
    command: any
    historySnapshot: any
    currentSelection: any[]
  }) => readonly DomainEvent[]
  undoHandler: (props: {
    command: any
    historySnapshot: any
    currentSelection: any[]
  }) => readonly DomainEvent[]
}

interface GeneralOnetimeCommandHandler {
  type: string
  undoable: false
  handler: (input: any, state: DomainState) => readonly DomainEvent[]
}

/**
 * There is no other way to type this than to use any, as the concrete type comming out of factory
 * is more restrictive than the type that is going in and there is nothing in common bewtween different
 * rows of the record, other than the shape of the functions.
 */
type CommandHandlerRouter = Record<
  string,
  GeneralUndoableCommandHandler | GeneralOnetimeCommandHandler
>

type UndoRedoCommandsMap<R extends CommandHandlerRouter> = {
  [key in keyof R]: R[key] extends RegisteredUndoableCommand<
    any,
    infer C,
    any,
    any,
    any
  >
    ? C
    : R[key] extends RegisteredOneTimeCommand<infer OC, any>
    ? OC
    : never
}

type UndoRedoCommands<R extends CommandHandlerRouter> =
  UndoRedoCommandsMap<R>[keyof UndoRedoCommandsMap<R>]

function create<R extends CommandHandlerRouter>(
  router: R,
  $domainStream: Subject<DomainEvent>
) {
  let domainState: { value: DomainState } = {
    value: {
      connections: {},
      nodes: {}
    }
  }

  function getState(): Readonly<DomainState> {
    return domainState.value
  }

  function initialize(state: DomainState) {
    domainState.value = state
  }

  function reduceState(event: DomainEvent) {
    domainState.value = reduceDomainEvent(event, getState())
    $domainStream.next(event)
  }

  function handleOneTimeCommand(
    command: OneTimeDomainCommand,
    handler: GeneralOnetimeCommandHandler
  ) {
    const redoEvents = handler.handler(command, getState())
    redoEvents.forEach(reduceState)
  }

  function handleUndoableCommand(
    command: UndoableDomainCommand,
    handler: GeneralUndoableCommandHandler
  ) {
    const state = getState()

    const currentSelection = DomainSelectors.getSelection(
      command.payload.clientUuid,
      state
    )

    const selectionUuids = currentSelection.map((node) => node.uuid)

    const historySnapshot = handler.historySnapshot({
      command,
      currentSelection
    })

    const redoEvents = handler.redoHandler({
      command,
      currentSelection,
      historySnapshot
    })

    const commandHandled = new ClientCommandAddedToHistory(
      {
        command: {
          currentSelection: selectionUuids,
          command,
          historySnapshot
        },
        clientUuid: command.payload.clientUuid
      },
      command.headers
    )

    reduceState(commandHandled)
    redoEvents.forEach(reduceState)
  }

  function handle(command: UndoRedoCommands<R>) {
    const handler = Object.values(router).find(
      (registeredHandler) => registeredHandler.type === command.type
    )

    if (handler == null) {
      throw new Error(`No handler registered for ${command.type}`)
    }

    switch (handler.undoable) {
      case false: {
        handleOneTimeCommand(command as OneTimeDomainCommand, handler)
        break
      }
      case true: {
        /**
         * This retyping is safe, because of the way the factory is constrained just to UndoableDomainCommands.
         */
        handleUndoableCommand(command as UndoableDomainCommand, handler)
        break
      }
    }
  }

  function undoLastClientCommand(command: UndoLastClientCommand) {
    const state = getState()

    const connectedClient = state.connections[command.payload.clientUuid]

    if (!connectedClient) {
      throw new Error(`Client ${command.payload.clientUuid} not found.`)
    }

    const lastCommand =
      connectedClient.undoStack[connectedClient.undoStack.length - 1]

    if (!lastCommand) {
      console.log(`No command to undo, skipping.`)
      return
    }

    const isEditedByOtherUser = UndoRedoSelectors.isCommandInvalid(
      lastCommand.currentSelection,
      command.payload.clientUuid,
      state
    )

    if (isEditedByOtherUser) {
      const skipped = new LastClientCommandUndoSkipped(
        {
          clientUuid: command.payload.clientUuid
        },
        command.headers
      )
      reduceState(skipped)
      return
    }

    const lastClientCommandUndone = new LastClientCommandUndone(
      {
        clientUuid: command.payload.clientUuid
      },
      command.headers
    )

    const deselectedNodes = DomainSelectors.getSelection(
      command.payload.clientUuid,
      state
    ).map(
      (node) =>
        new NodeDeselected(
          {
            clientUuid: command.payload.clientUuid,
            uuid: node.uuid
          },
          command.headers
        )
    )

    const nodesSelected = lastCommand.currentSelection.map((uuid) => {
      return new NodeSelected(
        { clientUuid: command.payload.clientUuid, uuid },
        command.headers
      )
    })

    const handler = Object.values(router).find(
      (registeredHandler) => registeredHandler.type === lastCommand.command.type
    ) as GeneralUndoableCommandHandler

    const undoEvents = handler.undoHandler({
      command: lastCommand.command,
      currentSelection: lastCommand.currentSelection.map((uuid) => {
        const node = state.nodes[uuid]

        if (!node) {
          throw new Error(`Node ${uuid} not found.`)
        }

        return node
      }),
      historySnapshot: lastCommand.historySnapshot
    })

    const events = [
      lastClientCommandUndone,
      ...deselectedNodes,
      ...nodesSelected,
      ...undoEvents
    ]

    events.forEach(reduceState)
  }

  function redoLastClientCommand(command: RedoLastClientCommand) {
    const state = getState()

    const connectedClient = state.connections[command.payload.clientUuid]

    if (!connectedClient) {
      throw new Error(`Client ${command.payload.clientUuid} not found.`)
    }

    const lastCommand =
      connectedClient.redoStack[connectedClient.redoStack.length - 1]

    if (!lastCommand) {
      console.log(`No command to redo, skipping.`)
      return
    }

    const isEditedByOtherUser = UndoRedoSelectors.isCommandInvalid(
      lastCommand.currentSelection,
      command.payload.clientUuid,
      state
    )

    if (isEditedByOtherUser) {
      const skipped = new LastClientCommandRedoSkipped(
        {
          clientUuid: command.payload.clientUuid
        },
        command.headers
      )
      reduceState(skipped)
      return
    }

    const lastClientCommandRedone = new LastClientCommandRedone(
      {
        clientUuid: command.payload.clientUuid
      },
      command.headers
    )

    const deselectedNodes = DomainSelectors.getSelection(
      command.payload.clientUuid,
      state
    ).map(
      (node) =>
        new NodeDeselected(
          {
            clientUuid: command.payload.clientUuid,
            uuid: node.uuid
          },
          command.headers
        )
    )

    const nodesSelected = lastCommand.currentSelection.map((uuid) => {
      return new NodeSelected(
        { clientUuid: command.payload.clientUuid, uuid },
        command.headers
      )
    })

    const handler = Object.values(router).find(
      (registeredHandler) => registeredHandler.type === lastCommand.command.type
    ) as GeneralUndoableCommandHandler

    const redoEvents = handler.redoHandler({
      command: lastCommand.command,
      currentSelection: lastCommand.currentSelection.map((uuid) => {
        const node = state.nodes[uuid]

        if (!node) {
          throw new Error(`Node ${uuid} not found.`)
        }

        return node
      }),
      historySnapshot: lastCommand.historySnapshot
    })

    const events = [
      lastClientCommandRedone,
      ...deselectedNodes,
      ...nodesSelected,
      ...redoEvents
    ]
    events.forEach(reduceState)
  }

  return {
    handle,
    undoLastClientCommand,
    redoLastClientCommand,
    initialize,
    getState
  }
}

function createUndoableHandler<
  C extends UndoableDomainCommand = never,
  CU extends ClientUuid = ClientUuid
>(type: C['type']) {
  return {
    /**
     * Creates a state snapshot that is stored in the command history. Use this to store the state before the command is executed.
     * This should return the props for domain actions used in the command. Be carefull not to store references there,
     * as they can be mutated during the command execution and the stored state will be invalid.
     */
    snapshotState<S>(historySnapshot: StateSnapshot<CU, C, S>) {
      return {
        /**
         * Redo handler, called when the command is redone (also during initial call), with the command, stored state snapshot and current state.
         */
        redo<RE extends readonly DomainEvent[]>(
          redoHandler: (props: {
            command: C
            historySnapshot: S
            currentSelection: ClientSelection<CU>
          }) => RE
        ) {
          return {
            /**
             * Undo handler, called when the command is undo, with the command, stored state snapshot and current state.
             */
            undo<UE extends readonly DomainEvent[]>(
              undoHandler: (props: {
                command: C
                historySnapshot: S
                currentSelection: ClientSelection<CU>
              }) => UE
            ): RegisteredUndoableCommand<CU, C, RE, UE, S> {
              return {
                type,
                undoable: true,
                redoHandler,
                undoHandler,
                historySnapshot
              }
            }
          }
        }
      }
    }
  }
}

function createOneTimeHandler<C extends OneTimeDomainCommand = never>(
  type: C['type']
) {
  return {
    handle<RE extends readonly DomainEvent[]>(
      handler: (command: C, state: Readonly<DomainState>) => RE
    ): RegisteredOneTimeCommand<C, RE> {
      return {
        type,
        undoable: false,
        handler
      }
    }
  }
}

export const CommandFactory = {
  createUndoableHandler,
  createOneTimeHandler
}

export const UndoRedoSystemFactory = {
  create
}
