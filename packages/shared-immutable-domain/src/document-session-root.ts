import { merge, Observable } from 'rxjs'
import {
  DocumentSessionCommand,
  DocumentSessionCommandType
} from './commands.js'
import { Document } from './document/document.js'
import { DocumentState, NodeUuid, PositionValue } from './document/types.js'
import { DraggingSystem } from './session/dragging-system.js'
import { LockingSystem } from './session/locking-system.js'
import { SelectionSystem } from './session/selection-system.js'
import {
  SessionConnectedClient,
  SessionSystem
} from './session/session-system.js'
import { ClientUuid, DocumentSessionEvent } from './session/types.js'
import { DocumentCommands } from './session/document-commands.js'
import { ClientUndoRedo, UndoRedoSystem } from './session/undo-redo.js'

export interface DocumentSessionState {
  session: {
    clients: Record<ClientUuid, SessionConnectedClient>
    selections: Record<ClientUuid, { uuid: ClientUuid; selection: NodeUuid[] }>
    clientCommands: Record<ClientUuid, ClientUndoRedo>
    nodeEditors: Record<NodeUuid, ClientUuid>
    clientDragging: Record<
      ClientUuid,
      {
        uuid: ClientUuid
        dragging: { left: PositionValue; top: PositionValue } | null
      }
    >
  }
  document: DocumentState
}

export class DocumentSessionRoot {
  private _document: Document
  private _sessionSystem: SessionSystem
  private _selectionSystem: SelectionSystem
  private _undoRedoSystem: UndoRedoSystem
  private _lockingSystem: LockingSystem
  private _draggingSystem: DraggingSystem
  private _commandsNew: DocumentCommands

  public domainStream$: Observable<DocumentSessionEvent>

  constructor(
    initialState: DocumentSessionState = {
      session: {
        clients: {},
        selections: {},
        clientCommands: {},
        nodeEditors: {},
        clientDragging: {}
      },
      document: { nodes: {} }
    }
  ) {
    console.log('initialState', initialState)
    this._document = new Document(initialState.document)
    this._sessionSystem = new SessionSystem({
      clients: initialState.session.clients
    })
    this._selectionSystem = new SelectionSystem(
      {
        selections: initialState.session.selections
      },
      this._sessionSystem
    )
    this._undoRedoSystem = new UndoRedoSystem(
      {
        clientCommands: initialState.session.clientCommands,
        nodeEditors: initialState.session.nodeEditors
      },
      this._sessionSystem,
      this._selectionSystem,
      this._document
    )
    this._lockingSystem = new LockingSystem(
      this._selectionSystem,
      this._document,
      this._undoRedoSystem
    )

    this._draggingSystem = new DraggingSystem(
      {
        clientDragging: initialState.session.clientDragging
      },
      this._sessionSystem,
      this._lockingSystem
    )

    this._commandsNew = new DocumentCommands(
      this._undoRedoSystem,
      this._lockingSystem
    )

    this.domainStream$ = merge(
      this._document.eventStream$,
      this._sessionSystem.eventStream$,
      this._selectionSystem.eventStream$,
      this._undoRedoSystem.eventStream$,
      this._draggingSystem.eventStream$
    ) as Observable<DocumentSessionEvent>
  }

  getState(): DocumentSessionState {
    return {
      session: {
        clients: this._sessionSystem.getState().clients,
        selections: this._selectionSystem.getState(),
        clientCommands: this._undoRedoSystem.getState().clientCommands,
        nodeEditors: this._undoRedoSystem.getState().nodeEditors,
        clientDragging: this._draggingSystem.getState()
      },
      document: this._document.getState()
    }
  }

  dispatch(command: DocumentSessionCommand) {
    switch (command.type) {
      case DocumentSessionCommandType.ConnectClient:
      case DocumentSessionCommandType.DisconnectClient:
      case DocumentSessionCommandType.MoveClientCursor: {
        this._sessionSystem.dispatch(command)
        break
      }
      case DocumentSessionCommandType.SelectNodes:
      case DocumentSessionCommandType.AddNodeToSelection: {
        this._selectionSystem.dispatch(command)
        break
      }
      case DocumentSessionCommandType.UndoClientCommand:
      case DocumentSessionCommandType.RedoClientCommand: {
        this._undoRedoSystem.dispatch(command)
        break
      }
      case DocumentSessionCommandType.LockSelection:
      case DocumentSessionCommandType.UnlockSelection: {
        this._lockingSystem.dispatch(command)
        break
      }
      case DocumentSessionCommandType.DeleteSelection:
      case DocumentSessionCommandType.CreateRectangle:
      case DocumentSessionCommandType.CreateImage:
      case DocumentSessionCommandType.SetRectangleSelectionFill: {
        this._commandsNew.dispatch(command)
        break
      }
      case DocumentSessionCommandType.StartDragging:
      case DocumentSessionCommandType.MoveDragging:
      case DocumentSessionCommandType.FinishDragging: {
        this._draggingSystem.dispatch(command)
        break
      }
      default: {
        console.warn(`Unhandled command: ${command.type}.`)
      }
    }
  }
}
