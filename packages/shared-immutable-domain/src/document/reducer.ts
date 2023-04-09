import { match } from 'ts-pattern'
import {
  NodeAlreadyExist,
  NodeDoesNotExist,
  NodeIsAlreadyDeleted,
  NodeIsNotActive,
  NodeIsNotDeleted,
  NodeIsNotImage,
  NodeIsNotLocked,
  NodeIsNotRectangle
} from './errors.js'
import {
  DocumentEvent,
  DocumentEventType,
  DocumentState,
  ImageCreated,
  NodeDeleted,
  NodeFillSet,
  NodeKind,
  NodeLocked,
  NodeMoved,
  NodeRestored,
  NodeStatus,
  NodeUnlocked,
  NodeUrlSet,
  RectangleCreated
} from './types.js'

function reduceRectangleCreated(
  event: RectangleCreated,
  state: DocumentState
): DocumentState {
  const node = state.nodes[event.payload.uuid]

  if (node != null && node.status !== NodeStatus.Deleted) {
    throw new NodeAlreadyExist(event.payload.uuid)
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: event.payload
    }
  }
}

function reduceImageCreated(
  event: ImageCreated,
  state: DocumentState
): DocumentState {
  const node = state.nodes[event.payload.uuid]

  if (node != null && node.status !== NodeStatus.Deleted) {
    throw new NodeAlreadyExist(event.payload.uuid)
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.payload.uuid]: event.payload
    }
  }
}

function reduceNodeDeleted(
  event: NodeDeleted,
  state: DocumentState
): DocumentState {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    throw new NodeDoesNotExist(event.payload.uuid)
  }

  if (node.status === NodeStatus.Deleted) {
    throw new NodeIsAlreadyDeleted(event.payload.uuid)
  }

  const updatedNode = {
    ...node,
    status: NodeStatus.Deleted
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [node.uuid]: updatedNode
    }
  }
}

function reduceNodeRestored(
  event: NodeRestored,
  state: DocumentState
): DocumentState {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    throw new NodeDoesNotExist(event.payload.uuid)
  }

  if (node.status !== NodeStatus.Deleted) {
    throw new NodeIsNotDeleted(event.payload.uuid)
  }

  const updatedNode = {
    ...node,
    status: NodeStatus.Active
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [node.uuid]: updatedNode
    }
  }
}

function reduceNodeLocked(
  event: NodeLocked,
  state: DocumentState
): DocumentState {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    throw new NodeDoesNotExist(event.payload.uuid)
  }

  if (node.status !== NodeStatus.Active) {
    throw new NodeIsNotActive(event.payload.uuid)
  }

  const updatedNode = {
    ...node,
    status: NodeStatus.Locked
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [node.uuid]: updatedNode
    }
  }
}

function reduceNodeUnlocked(
  event: NodeUnlocked,
  state: DocumentState
): DocumentState {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    throw new NodeDoesNotExist(event.payload.uuid)
  }

  if (node.status !== NodeStatus.Locked) {
    throw new NodeIsNotLocked(event.payload.uuid)
  }

  const updatedNode = {
    ...node,
    status: NodeStatus.Active
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [node.uuid]: updatedNode
    }
  }
}

function reduceNodeMoved(
  event: NodeMoved,
  state: DocumentState
): DocumentState {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    throw new NodeDoesNotExist(event.payload.uuid)
  }

  if (node.status !== NodeStatus.Active) {
    throw new NodeIsNotActive(event.payload.uuid)
  }

  const updatedNode = {
    ...node,
    left: event.payload.left,
    top: event.payload.top
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [node.uuid]: updatedNode
    }
  }
}

function reduceNodeUrlSet(
  event: NodeUrlSet,
  state: DocumentState
): DocumentState {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    throw new NodeDoesNotExist(event.payload.uuid)
  }

  if (node.status !== NodeStatus.Active) {
    throw new NodeIsNotActive(event.payload.uuid)
  }

  if (node.kind !== NodeKind.Image) {
    throw new NodeIsNotImage(event.payload.uuid)
  }

  const updatedNode = {
    ...node,
    url: event.payload.url
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [node.uuid]: updatedNode
    }
  }
}

function reduceNodeFillSet(
  event: NodeFillSet,
  state: DocumentState
): DocumentState {
  const node = state.nodes[event.payload.uuid]

  if (node == null) {
    throw new NodeDoesNotExist(event.payload.uuid)
  }

  if (node.status !== NodeStatus.Active) {
    throw new NodeIsNotActive(event.payload.uuid)
  }

  if (node.kind !== NodeKind.Rectangle) {
    throw new NodeIsNotRectangle(event.payload.uuid)
  }

  const updatedNode = {
    ...node,
    fill: event.payload.fill
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [node.uuid]: updatedNode
    }
  }
}

function reduce(event: DocumentEvent, state: DocumentState): DocumentState {
  return match(event)
    .with(
      {
        type: DocumentEventType.RectangleCreated
      },
      (e) => {
        return reduceRectangleCreated(e, state)
      }
    )
    .with(
      {
        type: DocumentEventType.ImageCreated
      },
      (e) => {
        return reduceImageCreated(e, state)
      }
    )
    .with(
      {
        type: DocumentEventType.NodeDeleted
      },
      (e) => {
        return reduceNodeDeleted(e, state)
      }
    )
    .with(
      {
        type: DocumentEventType.NodeLocked
      },
      (e) => {
        return reduceNodeLocked(e, state)
      }
    )
    .with(
      {
        type: DocumentEventType.NodeUnlocked
      },
      (e) => {
        return reduceNodeUnlocked(e, state)
      }
    )
    .with(
      {
        type: DocumentEventType.NodeMoved
      },
      (e) => {
        return reduceNodeMoved(e, state)
      }
    )
    .with(
      {
        type: DocumentEventType.NodeFillSet
      },
      (e) => {
        return reduceNodeFillSet(e, state)
      }
    )
    .with(
      {
        type: DocumentEventType.NodeUrlSet
      },
      (e) => {
        return reduceNodeUrlSet(e, state)
      }
    )
    .with(
      {
        type: DocumentEventType.NodeRestored
      },
      (e) => {
        return reduceNodeRestored(e, state)
      }
    )
    .exhaustive()
}

export const DocumentReducer = {
  reduce
}
