import { Subject } from 'rxjs'
import {
  AddNodeToSelection,
  DocumentSessionCommandType,
  SelectNodes
} from '../commands.js'
import { NodeUuid } from '../document/types.js'
import { SessionSystem, SessionSystemEventType } from './session-system.js'
import { ClientIsNotConnected } from './errors.js'
import { ClientUuid } from './types.js'

interface SelectionSystemState {
  selections: Record<ClientUuid, { uuid: ClientUuid; selection: NodeUuid[] }>
}

export enum SelectionSystemEventType {
  NodesSelected = 'NodesSelected'
}

export class NodesSelected {
  readonly type = SelectionSystemEventType.NodesSelected
  constructor(
    public readonly payload: { nodes: NodeUuid[]; clientUuid: ClientUuid }
  ) {}
}

export type SelectionSystemEvent = NodesSelected

function reduce(
  event: SelectionSystemEvent,
  state: SelectionSystemState
): SelectionSystemState {
  switch (event.type) {
    case SelectionSystemEventType.NodesSelected: {
      const clientSelection = state.selections[event.payload.clientUuid]

      if (clientSelection == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }

      for (const node of event.payload.nodes) {
        Object.values(state.selections).forEach((client) => {
          if (
            client.uuid !== event.payload.clientUuid &&
            client.selection.includes(node)
          ) {
            throw new Error(
              `Node ${node} is already selected by client ${client}`
            )
          }
        })
      }

      const updatedClient = {
        ...clientSelection,
        selection: event.payload.nodes
      }

      return {
        ...state,
        selections: {
          ...state.selections,
          [event.payload.clientUuid]: updatedClient
        }
      }
    }
    default: {
      const exhaustiveCheck: never = event.type
      throw new Error(`Unhandled event type ${exhaustiveCheck}`)
    }
  }
}

export class SelectionSystem {
  private _state: SelectionSystemState
  private _sessionSystem: SessionSystem
  private _subject$ = new Subject<SelectionSystemEvent>()

  public eventStream$ = this._subject$.asObservable()

  constructor(
    initialState: SelectionSystemState,
    sessionSystem: SessionSystem
  ) {
    this._state = initialState
    this._sessionSystem = sessionSystem

    this._sessionSystem.eventStream$.subscribe((event) => {
      switch (event.type) {
        case SessionSystemEventType.ClientConnected:
          this._state.selections[event.payload.uuid] = {
            uuid: event.payload.uuid,
            selection: []
          }
          break
        case SessionSystemEventType.ClientDisconnected:
          delete this._state.selections[event.payload.uuid]
          break
      }
    })
  }

  private _dispatch(event: SelectionSystemEvent) {
    this._state = reduce(event, this._state)
    this._subject$.next(event)
  }

  private _selectNodes(command: SelectNodes) {
    const event = new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: command.payload.nodes
    })

    this._dispatch(event)
  }

  private _addNodeToSelection(command: AddNodeToSelection) {
    const activeSelection = this.getClientSelection(command.payload.clientUuid)

    const event = new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: [...activeSelection.selection, command.payload.node]
    })

    this._dispatch(event)
  }

  getState() {
    return this._state.selections
  }

  getClientSelection(clientUuid: ClientUuid) {
    const selection = this._state.selections[clientUuid]

    if (selection == null) {
      throw new Error('Client not connected')
    }

    return selection
  }

  dispatch(command: SelectNodes | AddNodeToSelection) {
    switch (command.type) {
      case DocumentSessionCommandType.SelectNodes: {
        return this._selectNodes(command)
      }
      case DocumentSessionCommandType.AddNodeToSelection: {
        return this._addNodeToSelection(command)
      }
      default: {
        const exhaustiveCheck: never = command
        throw new Error(`Unhandled command type ${exhaustiveCheck}`)
      }
    }
  }
}
