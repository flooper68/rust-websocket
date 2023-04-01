import {
  ConnectedClient,
  Dimensions,
  DomainState,
  Image,
  ImageMetadata,
  NodeKind,
  Position,
  Rectangle,
  RectangleMetadata
} from '../domain/domain-types.js'
import {
  ClientCommandAddedToHistory,
  LastClientCommandRedone,
  LastClientCommandUndone,
  ClientConnected,
  ClientCursorMoved,
  ClientDisconnected,
  DomainEvent,
  DomainEventType,
  ImageCreated,
  NodeDeleted,
  NodeDeselected,
  NodeLocked,
  NodeMoved,
  NodePositionSet,
  NodeRestored,
  NodeSelected,
  NodeUnlocked,
  PositionDraggingStarted,
  RectangleCreated,
  RectangleFillSet,
  LastClientCommandRedoSkipped,
  LastClientCommandUndoSkipped
} from './events.js'
import { startMeasurement } from '../measure.js'

function applyClientCommandAddedToHistory(
  event: ClientCommandAddedToHistory,
  state: DomainState
): DomainState {
  const connection = state.connections[event.payload.clientUuid]

  if (!connection) {
    throw new Error(`Connection ${event.payload.clientUuid} not found!`)
  }

  const updatedConnection: ConnectedClient = {
    ...connection,
    undoStack: [...connection.undoStack, event.payload.command],
    redoStack: []
  }

  return {
    ...state,
    connections: {
      ...state.connections,
      [event.payload.clientUuid]: updatedConnection
    }
  }
}

function applyLastClientCommandRedone(
  event: LastClientCommandRedone,
  state: DomainState
) {
  const connection = state.connections[event.payload.clientUuid]

  if (!connection) {
    throw new Error(`Connection ${event.payload.clientUuid} not found!`)
  }

  const lastCommand = connection.redoStack[connection.redoStack.length - 1]

  if (!lastCommand) {
    throw new Error(`No command to redo!`)
  }

  const updatedConnection: ConnectedClient = {
    ...connection,
    undoStack: [...connection.undoStack, lastCommand],
    redoStack: connection.redoStack.slice(0, -1)
  }

  return {
    ...state,
    connections: {
      ...state.connections,
      [event.payload.clientUuid]: updatedConnection
    }
  }
}
function applyLastClientCommandRedoSkipped(
  event: LastClientCommandRedoSkipped,
  state: DomainState
) {
  const connection = state.connections[event.payload.clientUuid]

  if (!connection) {
    throw new Error(`Connection ${event.payload.clientUuid} not found!`)
  }

  const lastCommand = connection.redoStack[connection.undoStack.length - 1]

  if (!lastCommand) {
    throw new Error(`No command to undo!`)
  }

  const updatedConnection: ConnectedClient = {
    ...connection,
    redoStack: connection.redoStack.slice(0, -1)
  }

  return {
    ...state,
    connections: {
      ...state.connections,
      [event.payload.clientUuid]: updatedConnection
    }
  }
}

function applyLastClientCommandUndone(
  event: LastClientCommandUndone,
  state: DomainState
) {
  const connection = state.connections[event.payload.clientUuid]

  if (!connection) {
    throw new Error(`Connection ${event.payload.clientUuid} not found!`)
  }

  const lastCommand = connection.undoStack[connection.undoStack.length - 1]

  if (!lastCommand) {
    throw new Error(`No command to undo!`)
  }

  const updatedConnection: ConnectedClient = {
    ...connection,
    undoStack: connection.undoStack.slice(0, -1),
    redoStack: [...connection.redoStack, lastCommand]
  }

  return {
    ...state,
    connections: {
      ...state.connections,
      [event.payload.clientUuid]: updatedConnection
    }
  }
}

function applyLastClientCommandUndoSkipped(
  event: LastClientCommandUndoSkipped,
  state: DomainState
) {
  const connection = state.connections[event.payload.clientUuid]

  if (!connection) {
    throw new Error(`Connection ${event.payload.clientUuid} not found!`)
  }

  const lastCommand = connection.undoStack[connection.undoStack.length - 1]

  if (!lastCommand) {
    throw new Error(`No command to undo!`)
  }

  const updatedConnection: ConnectedClient = {
    ...connection,
    undoStack: connection.undoStack.slice(0, -1)
  }

  return {
    ...state,
    connections: {
      ...state.connections,
      [event.payload.clientUuid]: updatedConnection
    }
  }
}

function applyRectangleCreated(event: RectangleCreated, state: DomainState) {
  const rectangle: Rectangle = Rectangle({
    uuid: event.payload.uuid,
    locked: event.payload.locked,
    deleted: event.payload.deleted,
    selectedBy: event.payload.selectedBy,
    lastEditor: event.payload.lastEditor,
    position: Position(event.payload.position.left, event.payload.position.top),
    dimensions: Dimensions(
      event.payload.dimensions.width,
      event.payload.dimensions.height
    ),
    rectangleMetadata: RectangleMetadata(event.payload.rectangleMetadata.fill),
    dragging: null
  })

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: rectangle
    }
  }
}

function applyImageCreated(event: ImageCreated, state: DomainState) {
  const image: Image = Image({
    uuid: event.payload.uuid,
    locked: event.payload.locked,
    deleted: event.payload.deleted,
    selectedBy: event.payload.selectedBy,
    lastEditor: event.payload.lastEditor,
    position: Position(event.payload.position.left, event.payload.position.top),
    dimensions: Dimensions(
      event.payload.dimensions.width,
      event.payload.dimensions.height
    ),
    imageMetadata: ImageMetadata({
      url: event.payload.imageMetadata.url,
      width: event.payload.imageMetadata.width,
      height: event.payload.imageMetadata.height
    }),
    dragging: null
  })

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: image
    }
  }
}

function applyNodeSelected(event: NodeSelected, state: DomainState) {
  const node = state.nodes[event.payload.uuid]

  if (!node) {
    throw new Error(`Node ${event.payload.uuid} does not exist.`)
  }

  const updatedNode = {
    ...node,
    selectedBy: event.payload.clientUuid
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: updatedNode
    }
  }
}

function applyNodeDeselected(event: NodeDeselected, state: DomainState) {
  const node = state.nodes[event.payload.uuid]

  if (!node) {
    throw new Error(`Node ${event.payload.uuid} does not exist.`)
  }

  const updatedNode = {
    ...node,
    selectedBy: null
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: updatedNode
    }
  }
}

function applyNodeDeleted(event: NodeDeleted, state: DomainState) {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    console.error(`Node ${event.payload.uuid} does not exist.`)
    return state
  }

  const updatedNode = {
    ...node,
    deleted: true,
    lastEditor: event.payload.clientUuid
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: updatedNode
    }
  }
}

function applyNodeMoved(event: NodeMoved, state: DomainState) {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    console.error(`Node ${event.payload.uuid} does not exist.`)
    return state
  }

  const updatedNode = {
    ...node,
    position: Position(
      node.position.left + event.payload.positionDiff.left,
      node.position.top + event.payload.positionDiff.top
    ),
    lastEditor: event.payload.clientUuid
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: updatedNode
    }
  }
}

function applyNodePositionSet(event: NodePositionSet, state: DomainState) {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    console.error(`Node ${event.payload.uuid} does not exist.`)
    return state
  }

  const updatedNode = {
    ...node,
    position: Position(event.payload.position.left, event.payload.position.top),
    lastEditor: event.payload.clientUuid
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: updatedNode
    }
  }
}

function applyPositionDraggingStarted(
  event: PositionDraggingStarted,
  state: DomainState
) {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    console.error(`Node ${event.payload.uuid} does not exist.`)
    return state
  }

  const updatedNode = {
    ...node,
    dragging: {
      draggingStartingPositionX: event.payload.positionX,
      draggingStartingPositionY: event.payload.positionY
    },
    lastEditor: event.payload.clientUuid
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: updatedNode
    }
  }
}

function applyNodeRestored(event: NodeRestored, state: DomainState) {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    console.error(`Node ${event.payload.uuid} does not exist.`)
    return state
  }

  const updatedNode = {
    ...node,
    deleted: false,
    lastEditor: event.payload.clientUuid
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: updatedNode
    }
  }
}

function applyRectangleFillSet(event: RectangleFillSet, state: DomainState) {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    console.error(`Node ${event.payload.uuid} does not exist.`)
    return state
  }

  if (node.kind !== NodeKind.Rectangle) {
    console.error(`Node ${event.payload.uuid} is not a rectangle.`)
    return state
  }

  const updatedNode = {
    ...node,
    lastEditor: event.payload.clientUuid,
    rectangleMetadata: {
      ...node.rectangleMetadata,
      fill: event.payload.fill
    }
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: updatedNode
    }
  }
}

function applyNodeLocked(event: NodeLocked, state: DomainState) {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    console.error(`Node ${event.payload.uuid} does not exist.`)
    return state
  }

  const updatedNode = {
    ...node,
    locked: true,
    lastEditor: event.payload.clientUuid
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: updatedNode
    }
  }
}

function applyNodeUnlocked(event: NodeUnlocked, state: DomainState) {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    console.error(`Node ${event.payload.uuid} does not exist.`)
    return state
  }

  const updatedNode = {
    ...node,
    locked: false,
    lastEditor: event.payload.clientUuid
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: updatedNode
    }
  }
}

function applyClientCursorMoved(event: ClientCursorMoved, state: DomainState) {
  const connection = state.connections[event.payload.clientUuid]

  if (!connection) {
    console.error(
      `Connection with uuid ${event.payload.clientUuid} does not exist`
    )
    return state
  }

  const updatedConnection = {
    ...connection,
    cursor: Position(event.payload.left, event.payload.top)
  }

  return {
    ...state,
    connections: {
      ...state.connections,
      [event.payload.clientUuid]: updatedConnection
    }
  }
}

function applyClientConnected(event: ClientConnected, state: DomainState) {
  const connection = state.connections[event.payload.uuid]

  if (connection) {
    console.error(`Connection with uuid ${event.payload.uuid} already exists`)

    return state
  }

  const newConnection: ConnectedClient = {
    cursor: Position(0, 0),
    name: event.payload.name,
    color: event.payload.color,
    uuid: event.payload.uuid,
    undoStack: [],
    redoStack: []
  }

  return {
    ...state,
    connections: {
      ...state.connections,
      [event.payload.uuid]: newConnection
    }
  }
}

function applyClientDisconnected(
  event: ClientDisconnected,
  state: DomainState
) {
  const connection = state.connections[event.payload.uuid]

  if (!connection) {
    console.error(`Connection with uuid ${event.payload.uuid} does not exist`)
    return state
  }

  const updatedConnections = { ...state.connections }
  delete updatedConnections[event.payload.uuid]

  return {
    ...state,
    connections: updatedConnections
  }
}

function applyEvent(event: DomainEvent, state: DomainState) {
  switch (event.type) {
    case DomainEventType.ClientCommandAddedToHistory:
      return applyClientCommandAddedToHistory(event, state)
    case DomainEventType.LastClientCommandRedone:
      return applyLastClientCommandRedone(event, state)
    case DomainEventType.LastClientCommandRedoSkipped:
      return applyLastClientCommandRedoSkipped(event, state)
    case DomainEventType.LastClientCommandUndone:
      return applyLastClientCommandUndone(event, state)
    case DomainEventType.LastClientCommandUndoSkipped:
      return applyLastClientCommandUndoSkipped(event, state)
    case DomainEventType.RectangleCreated:
      return applyRectangleCreated(event, state)
    case DomainEventType.ImageCreated:
      return applyImageCreated(event, state)
    case DomainEventType.NodeDeleted:
      return applyNodeDeleted(event, state)
    case DomainEventType.NodeSelected:
      return applyNodeSelected(event, state)
    case DomainEventType.NodeDeselected:
      return applyNodeDeselected(event, state)
    case DomainEventType.NodeMoved:
      return applyNodeMoved(event, state)
    case DomainEventType.NodePositionSet:
      return applyNodePositionSet(event, state)
    case DomainEventType.PositionDraggingStarted:
      return applyPositionDraggingStarted(event, state)
    case DomainEventType.NodeRestored:
      return applyNodeRestored(event, state)
    case DomainEventType.RectangleFillSet:
      return applyRectangleFillSet(event, state)
    case DomainEventType.NodeLocked:
      return applyNodeLocked(event, state)
    case DomainEventType.NodeUnlocked:
      return applyNodeUnlocked(event, state)
    case DomainEventType.ClientCursorMoved:
      return applyClientCursorMoved(event, state)
    case DomainEventType.ClientConnected:
      return applyClientConnected(event, state)
    case DomainEventType.ClientDisconnected:
      return applyClientDisconnected(event, state)
    default: {
      const check: never = event
      console.error(`Unhandled event type ${check}.`)
      return state
    }
  }
}

export function reduceDomainEvent(
  event: DomainEvent,
  state: DomainState
): DomainState {
  const measure = startMeasurement(
    `Applying domain event ${event.type} to domain projection`
  )

  let newState = applyEvent(event, state)

  measure()

  return newState
}
