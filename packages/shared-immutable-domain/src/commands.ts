import { DocumentSessionState } from './document-session-root.js'
import { NodeFactories } from './document/factories.js'
import {
  Fill,
  ImageUrl,
  isNodeEvent,
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
  ClientCommandAddedToHistory,
  ClientName,
  ClientUuid,
  DocumentSessionEvent,
  DraggingFinished,
  LastClientCommandRedone,
  LastClientCommandRedoSkipped,
  LastClientCommandUndone,
  LastClientCommandUndoSkipped,
  NodesEdited,
  NodesSelected,
  SessionEvent
} from './session/types.js'

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

function buildUndoableCommand<
  C extends { payload: { clientUuid: ClientUuid } }
>(
  handler: (
    command: C,
    context: CommandContext
  ) => {
    undoEvents: DocumentSessionEvent[]
    redoEvents: DocumentSessionEvent[]
    transientEvents: SessionEvent[]
  }
) {
  return (command: C, context: CommandContext) => {
    const { redoEvents, undoEvents, transientEvents } = handler(
      command,
      context
    )

    const events = [...transientEvents, ...redoEvents]

    context.dispatch(events)

    const updatedClient = SessionSelectors.getConnectedClient(
      command.payload.clientUuid,
      context.getState().session
    )

    if (updatedClient == null) {
      throw new Error('Client not connected')
    }

    const editedNodes = redoEvents
      .filter(isNodeEvent)
      .map((e) => e.payload.uuid)

    context.dispatch([
      new NodesEdited({
        clientUuid: command.payload.clientUuid,
        nodes: editedNodes
      }),
      new ClientCommandAddedToHistory({
        clientUuid: command.payload.clientUuid,
        command: {
          undoEvents,
          redoEvents,
          selection: editedNodes
        }
      })
    ])
  }
}

const deleteSelection = buildUndoableCommand(
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

const createRectangle = buildUndoableCommand((command: CreateRectangle) => {
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
})

const finishDragging = buildUndoableCommand(
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

function undoClientCommand(
  command: UndoClientCommand,
  context: CommandContext
) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const lastCommand = client.undoStack[client.undoStack.length - 1]

  if (lastCommand == null) {
    throw new Error('No command to undo')
  }

  for (const node of lastCommand.selection) {
    const nodeEditor = context.getState().session.nodeEditors[node]

    const editedByOtherUser =
      nodeEditor != null && nodeEditor !== command.payload.clientUuid

    const seletedByOtherUser = Object.values(
      context.getState().session.clients
    ).some(
      (client) =>
        client.uuid !== command.payload.clientUuid &&
        client.selection.includes(node)
    )

    if (seletedByOtherUser || editedByOtherUser) {
      context.dispatch([
        new LastClientCommandUndoSkipped({
          clientUuid: command.payload.clientUuid
        })
      ])
      return
    }
  }

  const events = [
    new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: lastCommand.selection
    }),
    ...lastCommand.undoEvents,
    new LastClientCommandUndone({
      clientUuid: command.payload.clientUuid
    })
  ]

  context.dispatch(events)
}

function redoClientCommand(
  command: RedoClientCommand,
  context: CommandContext
) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const lastCommand = client.redoStack[client.redoStack.length - 1]

  if (lastCommand == null) {
    throw new Error('No command to redo')
  }

  for (const node of lastCommand.selection) {
    const nodeEditor = context.getState().session.nodeEditors[node]

    const editedByOtherUser =
      nodeEditor != null && nodeEditor !== command.payload.clientUuid

    const seletedByOtherUser = Object.values(
      context.getState().session.clients
    ).some(
      (client) =>
        client.uuid !== command.payload.clientUuid &&
        client.selection.includes(node)
    )

    if (seletedByOtherUser || editedByOtherUser) {
      context.dispatch([
        new LastClientCommandRedoSkipped({
          clientUuid: command.payload.clientUuid
        })
      ])
      return
    }
  }

  const events = [
    new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: lastCommand.selection
    }),
    ...lastCommand.redoEvents,
    new LastClientCommandRedone({
      clientUuid: command.payload.clientUuid
    })
  ]

  context.dispatch(events)
}

export const DocumentSessionCommands = {
  lockSelection,
  unlockSelection,
  deleteSelection,
  setRectangleSelectionFill,
  setImageSelectionUrl,
  connectClient,
  disconnectClient,
  moveClientCursor,
  createRectangle,
  createImage,
  selectNodes,
  addNodeToSelection,
  startDragging,
  finishDragging,
  moveDragging,
  undoClientCommand,
  redoClientCommand
}
