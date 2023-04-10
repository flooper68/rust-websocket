import { Subject } from 'rxjs'
import {
  DocumentSessionCommandType,
  RedoClientCommand,
  SelectNodes,
  UndoClientCommand
} from '../commands.js'
import { Document } from '../document/document.js'
import {
  DocumentEvent,
  DocumentEventType,
  isNodeEvent,
  NodeUuid
} from '../document/types.js'
import { SelectionSystem } from './selection-system.js'
import { SessionSystem, SessionSystemEventType } from './session-system.js'
import { ClientIsNotConnected } from './errors.js'
import { ClientUuid } from './types.js'

export interface CommittedCommand {
  redoEvents: DocumentEvent[]
  undoEvents: DocumentEvent[]
}

export interface ClientUndoRedo {
  uuid: ClientUuid
  undoStack: CommittedCommand[]
  redoStack: CommittedCommand[]
}

interface UndoRedoSystemState {
  clientCommands: Record<ClientUuid, ClientUndoRedo>
  nodeEditors: Record<NodeUuid, ClientUuid>
}

export enum UndoRedoSystemEventType {
  ClientCommandAddedToHistory = 'ClientCommandAddedToHistory',
  LastClientCommandUndone = 'LastClientCommandUndone',
  LastClientCommandUndoSkipped = 'LastClientCommandUndoSkipped',
  LastClientCommandRedone = 'LastClientCommandRedone',
  LastClientCommandRedoSkipped = 'LastClientCommandRedoSkipped',
  NodesEdited = 'NodesEdited'
}

export class ClientCommandAddedToHistory {
  readonly type = UndoRedoSystemEventType.ClientCommandAddedToHistory
  constructor(
    public readonly payload: {
      clientUuid: ClientUuid
      command: CommittedCommand
    }
  ) {}
}

export class LastClientCommandUndone {
  readonly type = UndoRedoSystemEventType.LastClientCommandUndone
  constructor(public readonly payload: { clientUuid: ClientUuid }) {}
}

export class LastClientCommandUndoSkipped {
  readonly type = UndoRedoSystemEventType.LastClientCommandUndoSkipped
  constructor(public readonly payload: { clientUuid: ClientUuid }) {}
}

export class LastClientCommandRedone {
  readonly type = UndoRedoSystemEventType.LastClientCommandRedone
  constructor(public readonly payload: { clientUuid: ClientUuid }) {}
}

export class LastClientCommandRedoSkipped {
  readonly type = UndoRedoSystemEventType.LastClientCommandRedoSkipped
  constructor(public readonly payload: { clientUuid: ClientUuid }) {}
}

export class NodesEdited {
  readonly type = UndoRedoSystemEventType.NodesEdited
  constructor(
    public readonly payload: {
      nodes: NodeUuid[]
      clientUuid: ClientUuid
    }
  ) {}
}

export type UndoRedoSystemEvent =
  | ClientCommandAddedToHistory
  | LastClientCommandUndone
  | LastClientCommandUndoSkipped
  | LastClientCommandRedone
  | LastClientCommandRedoSkipped
  | NodesEdited

function reduce(
  event: UndoRedoSystemEvent,
  state: UndoRedoSystemState
): UndoRedoSystemState {
  switch (event.type) {
    case UndoRedoSystemEventType.ClientCommandAddedToHistory: {
      const client = state.clientCommands[event.payload.clientUuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }

      const undoStack = [...client.undoStack, event.payload.command]

      if (undoStack.length > 100) {
        undoStack.shift()
      }

      const updatedClient = {
        ...client,
        undoStack,
        redoStack: []
      }

      return {
        ...state,
        clientCommands: {
          ...state.clientCommands,
          [event.payload.clientUuid]: updatedClient
        }
      }
    }
    case UndoRedoSystemEventType.LastClientCommandRedone: {
      const client = state.clientCommands[event.payload.clientUuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }
      const lastCommand = client.redoStack[client.redoStack.length - 1]

      if (!lastCommand) {
        throw new Error(`No command to redo!`)
      }

      const updatedClient = {
        ...client,
        redoStack: client.redoStack.slice(0, -1),
        undoStack: [...client.undoStack, lastCommand]
      }

      return {
        ...state,
        clientCommands: {
          ...state.clientCommands,
          [event.payload.clientUuid]: updatedClient
        }
      }
    }
    case UndoRedoSystemEventType.LastClientCommandRedoSkipped: {
      const client = state.clientCommands[event.payload.clientUuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }
      const lastCommand = client.redoStack[client.redoStack.length - 1]

      if (!lastCommand) {
        throw new Error(`No command to skip!`)
      }

      const updatedClient = {
        ...client,
        redoStack: client.redoStack.slice(0, -1)
      }

      return {
        ...state,
        clientCommands: {
          ...state.clientCommands,
          [event.payload.clientUuid]: updatedClient
        }
      }
    }
    case UndoRedoSystemEventType.LastClientCommandUndone: {
      const client = state.clientCommands[event.payload.clientUuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }
      const lastCommand = client.undoStack[client.undoStack.length - 1]

      if (!lastCommand) {
        throw new Error(`No command to undo!`)
      }

      const updatedClient = {
        ...client,
        undoStack: client.undoStack.slice(0, -1),
        redoStack: [...client.redoStack, lastCommand]
      }

      return {
        ...state,
        clientCommands: {
          ...state.clientCommands,
          [event.payload.clientUuid]: updatedClient
        }
      }
    }
    case UndoRedoSystemEventType.LastClientCommandUndoSkipped: {
      const client = state.clientCommands[event.payload.clientUuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }
      const lastCommand = client.undoStack[client.undoStack.length - 1]

      if (!lastCommand) {
        throw new Error(`No command to skip!`)
      }

      const updatedClient = {
        ...client,
        undoStack: client.undoStack.slice(0, -1)
      }

      return {
        ...state,
        clientCommands: {
          ...state.clientCommands,
          [event.payload.clientUuid]: updatedClient
        }
      }
    }
    case UndoRedoSystemEventType.NodesEdited: {
      const client = state.clientCommands[event.payload.clientUuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }

      const editedNodes = event.payload.nodes.reduce<
        Record<NodeUuid, ClientUuid>
      >((acc, node) => {
        acc[node] = event.payload.clientUuid

        return acc
      }, {})

      return {
        ...state,
        nodeEditors: {
          ...state.nodeEditors,
          ...editedNodes
        }
      }
    }
    default: {
      const exhaustiveCheck: never = event
      throw new Error(`Unhandled event type ${exhaustiveCheck}`)
    }
  }
}

export class UndoRedoSystem {
  private _state: UndoRedoSystemState
  private _sessionSystem: SessionSystem
  private _selectionSystem: SelectionSystem
  private _document: Document
  private _subject$ = new Subject<UndoRedoSystemEvent>()

  public eventStream$ = this._subject$.asObservable()

  constructor(
    initialState: UndoRedoSystemState,
    sessionSystem: SessionSystem,
    selectionSystem: SelectionSystem,
    document: Document
  ) {
    this._state = initialState
    this._sessionSystem = sessionSystem
    this._selectionSystem = selectionSystem
    this._document = document

    this._sessionSystem.eventStream$.subscribe((event) => {
      switch (event.type) {
        case SessionSystemEventType.ClientConnected:
          this._state.clientCommands[event.payload.uuid] = {
            uuid: event.payload.uuid,
            undoStack: [],
            redoStack: []
          }
          break
        case SessionSystemEventType.ClientDisconnected:
          delete this._state.clientCommands[event.payload.uuid]
          break
      }
    })
  }

  private _dispatch(event: UndoRedoSystemEvent) {
    this._state = reduce(event, this._state)
    this._subject$.next(event)
  }

  private _redoClientCommand(command: RedoClientCommand) {
    const client = this._state.clientCommands[command.payload.clientUuid]

    if (client == null) {
      throw new Error('Client not connected')
    }

    const lastCommand = client.redoStack[client.redoStack.length - 1]

    if (lastCommand == null) {
      throw new Error('No command to redo')
    }

    const editedNodes = lastCommand.redoEvents.filter(isNodeEvent)

    for (const node of editedNodes) {
      const nodeEditor = this._state.nodeEditors[node.payload.uuid]

      const editedByOtherUser =
        nodeEditor != null && nodeEditor !== command.payload.clientUuid

      const seletedByOtherUser = Object.values(this._state.clientCommands).some(
        (client) =>
          client.uuid !== command.payload.clientUuid &&
          this._selectionSystem
            .getClientSelection(client.uuid)
            .selection.includes(node.payload.uuid)
      )

      if (seletedByOtherUser || editedByOtherUser) {
        this._dispatch(
          new LastClientCommandRedoSkipped({
            clientUuid: command.payload.clientUuid
          })
        )
        return
      }
    }

    const selection = editedNodes
      .filter((e) => e.type !== DocumentEventType.NodeDeleted)
      .map((e) => e.payload.uuid)

    lastCommand.redoEvents.forEach((event) => this._document.commitEvent(event))

    this._selectionSystem.dispatch(
      new SelectNodes({
        clientUuid: command.payload.clientUuid,
        nodes: selection
      })
    )

    const event = new LastClientCommandRedone({
      clientUuid: command.payload.clientUuid
    })

    this._dispatch(event)
  }

  private _undoClientCommand(command: UndoClientCommand) {
    const client = this._state.clientCommands[command.payload.clientUuid]

    if (client == null) {
      throw new Error('Client not connected')
    }

    const lastCommand = client.undoStack[client.undoStack.length - 1]

    if (lastCommand == null) {
      throw new Error('No command to undo')
    }

    const editedNodes = lastCommand.undoEvents.filter(isNodeEvent)

    for (const node of editedNodes) {
      const nodeEditor = this._state.nodeEditors[node.payload.uuid]

      const editedByOtherUser =
        nodeEditor != null && nodeEditor !== command.payload.clientUuid

      const seletedByOtherUser = Object.values(this._state.clientCommands).some(
        (client) =>
          client.uuid !== command.payload.clientUuid &&
          this._selectionSystem
            .getClientSelection(client.uuid)
            .selection.includes(node.payload.uuid)
      )

      if (seletedByOtherUser || editedByOtherUser) {
        this._dispatch(
          new LastClientCommandUndoSkipped({
            clientUuid: command.payload.clientUuid
          })
        )
        return
      }
    }

    const selection = editedNodes
      .filter((e) => e.type !== DocumentEventType.NodeDeleted)
      .map((e) => e.payload.uuid)

    lastCommand.undoEvents.forEach((event) => this._document.commitEvent(event))

    this._selectionSystem.dispatch(
      new SelectNodes({
        clientUuid: command.payload.clientUuid,
        nodes: selection
      })
    )

    const event = new LastClientCommandUndone({
      clientUuid: command.payload.clientUuid
    })

    this._dispatch(event)
  }

  commit<C extends { payload: { clientUuid: ClientUuid } }>(props: {
    undoEvents: DocumentEvent[]
    redoEvents: DocumentEvent[]
  }) {
    return (command: C) => {
      const { redoEvents, undoEvents } = props

      redoEvents.forEach((event) => this._document.commitEvent(event))

      const editedNodes = redoEvents
        .filter(isNodeEvent)
        .filter((e) => e.type !== DocumentEventType.NodeDeleted)
        .map((e) => e.payload.uuid)

      this._dispatch(
        new NodesEdited({
          clientUuid: command.payload.clientUuid,
          nodes: editedNodes
        })
      )

      this._selectionSystem.dispatch(
        new SelectNodes({
          clientUuid: command.payload.clientUuid,
          nodes: editedNodes
        })
      )

      this._dispatch(
        new ClientCommandAddedToHistory({
          clientUuid: command.payload.clientUuid,
          command: {
            undoEvents,
            redoEvents
          }
        })
      )
    }
  }

  getState() {
    return this._state
  }

  dispatch(command: RedoClientCommand | UndoClientCommand) {
    switch (command.type) {
      case DocumentSessionCommandType.UndoClientCommand: {
        return this._undoClientCommand(command)
      }
      case DocumentSessionCommandType.RedoClientCommand: {
        return this._redoClientCommand(command)
      }
      default: {
        const exhaustiveCheck: never = command
        throw new Error(`Unhandled command type ${exhaustiveCheck}`)
      }
    }
  }
}
