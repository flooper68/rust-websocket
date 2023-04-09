import { DocumentSessionState } from './document-session-root.js'
import { NodeFactories } from './document/factories.js'
import {
  Fill,
  ImageCreated,
  ImageUrl,
  isNodeEvent,
  NodeDeleted,
  NodeFillSet,
  NodeLocked,
  NodeMoved,
  NodeRestored,
  NodeUnlocked,
  NodeUrlSet,
  NodeUuid,
  PositionValue,
  RectangleCreated
} from './document/types.js'
import { SessionSelectors } from './selectors.js'
import { SessionFactories } from './session/factories.js'
import {
  ClientColor,
  ClientCommandAddedToHistory,
  ClientConnected,
  ClientCursorMoved,
  ClientDisconnected,
  ClientName,
  ClientUuid,
  DocumentSessionEvent,
  DraggingFinished,
  DraggingMoved,
  DraggingStarted,
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

function lockSelection(command: LockSelection, context: CommandContext) {
  const activeSelection = SessionSelectors.getClientActiveSelection(
    command.payload.clientUuid,
    context.getState()
  )

  const events = activeSelection.map((node) => {
    return new NodeLocked({ uuid: node.uuid })
  })

  context.dispatch(events)
}

function unlockSelection(command: UnlockSelection, context: CommandContext) {
  const lockedSelection = SessionSelectors.getClientLockedSelection(
    command.payload.clientUuid,
    context.getState()
  )

  const events = lockedSelection.map((node) => {
    return new NodeUnlocked({ uuid: node.uuid })
  })

  context.dispatch(events)
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

function setRectangleSelectionFill(
  command: SetRectangleSelectionFill,
  context: CommandContext
) {
  if (
    !SessionSelectors.isOnlyActiveRectangleSelection(
      command.payload.clientUuid,
      context.getState()
    )
  ) {
    throw new Error('Only rectangles can be filled')
  }

  const activeRectangleSelection =
    SessionSelectors.getClientActiveRectangleSelection(
      command.payload.clientUuid,
      context.getState()
    )

  const events = activeRectangleSelection.map((node) => {
    return new NodeFillSet({ uuid: node.uuid, fill: command.payload.fill })
  })

  context.dispatch(events)
}

function setImageSelectionUrl(
  command: SetImageSelectionUrl,
  context: CommandContext
) {
  if (
    !SessionSelectors.isOnlyActiveImageSelection(
      command.payload.clientUuid,
      context.getState()
    )
  ) {
    throw new Error('Only images can have url set')
  }

  const activeImageSelection = SessionSelectors.getClientActiveImageSelection(
    command.payload.clientUuid,
    context.getState()
  )

  const events = activeImageSelection.map((node) => {
    return new NodeUrlSet({ uuid: node.uuid, url: command.payload.url })
  })

  context.dispatch(events)
}

function connectClient(command: ConnectClient, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client != null) {
    throw new Error('Client already connected')
  }

  const newClient = SessionFactories.createConnectedClient({
    uuid: command.payload.clientUuid,
    color: command.payload.color,
    name: command.payload.name
  })

  const events = [new ClientConnected(newClient)]

  context.dispatch(events)
}

function disconnectClient(command: DisconnectClient, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [new ClientDisconnected(client)]

  context.dispatch(events)
}

function moveClientCursor(command: MoveClientCursor, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [new ClientCursorMoved(command.payload)]

  context.dispatch(events)
}

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

function createImage(command: CreateImage, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const image = NodeFactories.createImage({
    uuid: command.payload.uuid,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/The_death.png/564px-The_death.png',
    imageWidth: 100,
    imageHeight: 100
  })

  const events = [
    new ImageCreated(image),
    new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: [image.uuid]
    })
  ]

  context.dispatch(events)
}

function selectNodes(command: SelectNodes, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [
    new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: command.payload.nodes
    })
  ]

  context.dispatch(events)
}

function addNodeToSelection(
  command: AddNodeToSelection,
  context: CommandContext
) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const activeSelection = SessionSelectors.getClientNotDeletedSelection(
    command.payload.clientUuid,
    context.getState()
  )

  const events = [
    new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: [...activeSelection.map((node) => node.uuid), command.payload.node]
    })
  ]

  context.dispatch(events)
}

function startDragging(command: StartDragging, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [
    new DraggingStarted({
      clientUuid: command.payload.clientUuid
    })
  ]

  context.dispatch(events)
}

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

function moveDragging(command: MoveDragging, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [
    new DraggingMoved({
      clientUuid: command.payload.clientUuid,
      diffLeft: command.payload.diffLeft,
      diffTop: command.payload.diffTop
    })
  ]

  context.dispatch(events)
}

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
