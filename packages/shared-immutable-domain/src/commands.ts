import { DocumentSessionState } from './document-session-root.js'
import { NodeFactories } from './document/factories.js'
import {
  Fill,
  ImageUrl,
  NodeDeleted,
  NodeMoved,
  NodeRestored,
  NodeUuid,
  PositionValue,
  RectangleCreated
} from './document/types.js'
import { addNodeToSelection } from './handlers/add-node-to-selection.js'
import { connectClient } from './handlers/connect-client.js'
import { createImage } from './handlers/create-image.js'
import { disconnectClient } from './handlers/disconnect-client.js'
import { lockSelection } from './handlers/lock-selection.js'
import { moveClientCursor } from './handlers/move-client-cursor.js'
import { moveDragging } from './handlers/move-dragging.js'
import { selectNodes } from './handlers/select-nodes.js'
import { setImageSelectionUrl } from './handlers/set-image-selection-url.js'
import { setRectangleSelectionFill } from './handlers/set-rectangle-selection-fill.js'
import { startDragging } from './handlers/start-dragging.js'
import { unlockSelection } from './handlers/unlock-selection.js'
import { SessionSelectors } from './selectors.js'
import {
  ClientColor,
  ClientName,
  ClientUuid,
  DocumentSessionEvent,
  DraggingFinished,
  NodesSelected
} from './session/types.js'
import { UndoRedoBuilder } from './undo-redo-system.js'

export enum DocumentSessionCommandType {
  LockSelection = 'LockSelection',
  UnlockSelection = 'UnlockSelection',
  DeleteSelection = 'DeleteSelection',
  SetRectangleSelectionFill = 'SetRectangleSelectionFill',
  SetImageSelectionUrl = 'SetImageSelectionUrl',
  ConnectClient = 'ConnectClient',
  DisconnectClient = 'DisconnectClient',
  MoveClientCursor = 'MoveClientCursor',
  CreateRectangle = 'CreateRectangle',
  CreateImage = 'CreateImage',
  SelectNodes = 'SelectNodes',
  AddNodeToSelection = 'NodeAddedToSelection',
  StartDragging = 'StartDragging',
  FinishDragging = 'FinishDragging',
  MoveDragging = 'MoveDragging',
  UndoClientCommand = 'UndoClientCommand',
  RedoClientCommand = 'RedoClientCommand'
}

export class LockSelection {
  readonly type = DocumentSessionCommandType.LockSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class UnlockSelection {
  readonly type = DocumentSessionCommandType.UnlockSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class DeleteSelection {
  readonly type = DocumentSessionCommandType.DeleteSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class SetRectangleSelectionFill {
  readonly type = DocumentSessionCommandType.SetRectangleSelectionFill
  constructor(
    public payload: {
      clientUuid: ClientUuid
      fill: Fill
    }
  ) {}
}

export class SetImageSelectionUrl {
  readonly type = DocumentSessionCommandType.SetImageSelectionUrl
  constructor(
    public payload: {
      clientUuid: ClientUuid
      url: ImageUrl
    }
  ) {}
}

export class ConnectClient {
  readonly type = DocumentSessionCommandType.ConnectClient
  constructor(
    public payload: {
      clientUuid: ClientUuid
      color: ClientColor
      name: ClientName
    }
  ) {}
}

export class DisconnectClient {
  readonly type = DocumentSessionCommandType.DisconnectClient
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class MoveClientCursor {
  readonly type = DocumentSessionCommandType.MoveClientCursor
  constructor(
    public payload: {
      clientUuid: ClientUuid
      left: PositionValue
      top: PositionValue
    }
  ) {}
}

export class CreateRectangle {
  readonly type = DocumentSessionCommandType.CreateRectangle
  constructor(
    public payload: {
      clientUuid: ClientUuid
      uuid: NodeUuid
      fill: Fill
    }
  ) {}
}

export class CreateImage {
  readonly type = DocumentSessionCommandType.CreateImage
  constructor(
    public payload: {
      clientUuid: ClientUuid
      uuid: NodeUuid
    }
  ) {}
}

export class SelectNodes {
  readonly type = DocumentSessionCommandType.SelectNodes
  constructor(
    public payload: {
      clientUuid: ClientUuid
      nodes: NodeUuid[]
    }
  ) {}
}

export class AddNodeToSelection {
  readonly type = DocumentSessionCommandType.AddNodeToSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
      node: NodeUuid
    }
  ) {}
}

export class StartDragging {
  readonly type = DocumentSessionCommandType.StartDragging
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class FinishDragging {
  readonly type = DocumentSessionCommandType.FinishDragging
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class MoveDragging {
  readonly type = DocumentSessionCommandType.MoveDragging
  constructor(
    public payload: {
      clientUuid: ClientUuid
      diffLeft: PositionValue
      diffTop: PositionValue
    }
  ) {}
}

export class UndoClientCommand {
  readonly type = DocumentSessionCommandType.UndoClientCommand
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class RedoClientCommand {
  readonly type = DocumentSessionCommandType.RedoClientCommand
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export type DocumentSessionCommand =
  | LockSelection
  | UnlockSelection
  | DeleteSelection
  | SetRectangleSelectionFill
  | SetImageSelectionUrl
  | ConnectClient
  | DisconnectClient
  | MoveClientCursor
  | CreateImage
  | CreateRectangle
  | SelectNodes
  | AddNodeToSelection
  | StartDragging
  | FinishDragging
  | MoveDragging
  | UndoClientCommand
  | RedoClientCommand

export interface CommandContext {
  getState: () => DocumentSessionState
  dispatch: (event: DocumentSessionEvent[]) => void
}

export const DocumentSessionCommands = {
  lockSelection,
  unlockSelection,
  setRectangleSelectionFill,
  setImageSelectionUrl,
  connectClient,
  disconnectClient,
  moveClientCursor,
  createImage,
  selectNodes,
  addNodeToSelection,
  startDragging,
  moveDragging
}

export const Commands = new UndoRedoBuilder()
  .undoableCommand(
    DocumentSessionCommandType.CreateRectangle,
    (command: CreateRectangle) => {
      const rectangle = NodeFactories.createRectangle({
        uuid: command.payload.uuid,
        fill: command.payload.fill
      })

      const redoEvents = [
        new RectangleCreated(rectangle),
        new NodesSelected({
          clientUuid: command.payload.clientUuid,
          nodes: [rectangle.uuid]
        })
      ]

      const undoEvents = [new NodeDeleted({ uuid: rectangle.uuid })]

      return {
        undoEvents,
        redoEvents,
        transientEvents: []
      }
    }
  )
  .undoableCommand(
    DocumentSessionCommandType.DeleteSelection,
    (command: DeleteSelection, context) => {
      const activeSelection = SessionSelectors.getClientActiveSelection(
        command.payload.clientUuid,
        context.getState()
      )

      const redoEvents = [
        ...activeSelection.map((node) => {
          return new NodeDeleted({ uuid: node.uuid })
        }),
        new NodesSelected({ clientUuid: command.payload.clientUuid, nodes: [] })
      ]

      const undoEvents = [
        ...activeSelection.map((node) => {
          return new NodeRestored({ uuid: node.uuid })
        }),
        new NodesSelected({
          clientUuid: command.payload.clientUuid,
          nodes: activeSelection.map((node) => node.uuid)
        })
      ]

      return {
        redoEvents,
        undoEvents,
        transientEvents: []
      }
    }
  )
  .undoableCommand(
    DocumentSessionCommandType.FinishDragging,
    (command: FinishDragging, context) => {
      const client = SessionSelectors.getConnectedClient(
        command.payload.clientUuid,
        context.getState().session
      )

      if (client == null) {
        throw new Error('Client not connected')
      }

      const activeSelection = SessionSelectors.getClientActiveSelection(
        command.payload.clientUuid,
        context.getState()
      )

      const redoEvents = [
        ...activeSelection.map((node) => {
          return new NodeMoved({
            uuid: node.uuid,
            left: node.left + (client.dragging?.left ?? 0),
            top: node.top + (client.dragging?.top ?? 0)
          })
        })
      ]

      const transientEvents = [
        new DraggingFinished({
          clientUuid: command.payload.clientUuid
        })
      ]

      const undoEvents = [
        ...activeSelection.map((node) => {
          return new NodeMoved({
            uuid: node.uuid,
            left: node.left,
            top: node.top
          })
        })
      ]

      return {
        undoEvents,
        redoEvents,
        transientEvents
      }
    }
  )
  .build()
