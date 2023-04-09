import { match } from 'ts-pattern'
import { NodeUuid } from '../document/types.js'
import {
  ClientAlreadyExists,
  ClientIsAlreadyDragging,
  ClientIsNotConnected,
  ClientIsNotDragging
} from './errors.js'
import {
  ClientConnected,
  ClientDisconnected,
  SessionEvent,
  SessionEventType,
  SessionState,
  ClientCursorMoved,
  NodesSelected,
  DraggingStarted,
  DraggingFinished,
  DraggingMoved,
  ClientCommandAddedToHistory,
  ConnectedClient,
  LastClientCommandUndone,
  LastClientCommandRedone,
  NodesEdited,
  ClientUuid,
  LastClientCommandUndoSkipped,
  LastClientCommandRedoSkipped
} from './types.js'

function reduceClientConnected(
  event: ClientConnected,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.uuid]

  if (client != null) {
    throw new ClientAlreadyExists(event.payload.uuid)
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.uuid]: event.payload
    }
  }
}

function reduceClientDisconnected(
  event: ClientDisconnected,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.uuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.uuid)
  }

  const updatedClients = {
    ...state.clients
  }

  delete updatedClients[event.payload.uuid]

  return {
    ...state,
    clients: updatedClients
  }
}

function reduceClientCursorMoved(
  event: ClientCursorMoved,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }

  const updatedClient = {
    ...client,
    cursor: {
      left: event.payload.left,
      top: event.payload.top
    }
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.clientUuid]: updatedClient
    }
  }
}

function reduceNodesSelected(
  event: NodesSelected,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }

  for (const node of event.payload.nodes) {
    Object.values(state.clients).forEach((client) => {
      if (
        client.uuid !== event.payload.clientUuid &&
        client.selection.includes(node)
      ) {
        throw new Error(
          `Node ${node} is already selected by client ${client.uuid}`
        )
      }
    })
  }

  const updatedClient = {
    ...client,
    selection: event.payload.nodes
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.clientUuid]: updatedClient
    }
  }
}

function reduceDraggingStarted(
  event: DraggingStarted,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }

  if (client.dragging) {
    throw new ClientIsAlreadyDragging(event.payload.clientUuid)
  }

  const updatedClient = {
    ...client,
    dragging: {
      left: 0,
      top: 0
    }
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.clientUuid]: updatedClient
    }
  }
}

function reduceDraggingMoved(
  event: DraggingMoved,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }

  if (client.dragging == null) {
    throw new ClientIsNotDragging(event.payload.clientUuid)
  }

  const updatedClient = {
    ...client,
    dragging: {
      left: client.dragging.left + event.payload.diffLeft,
      top: client.dragging.top + event.payload.diffTop
    }
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.clientUuid]: updatedClient
    }
  }
}

function reduceDraggingFinished(
  event: DraggingFinished,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }

  if (client.dragging == null) {
    throw new ClientIsNotDragging(event.payload.clientUuid)
  }

  const updatedClient = {
    ...client,
    dragging: null
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.clientUuid]: updatedClient
    }
  }
}

function reduceClientCommandAddedToHistory(
  event: ClientCommandAddedToHistory,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }

  const undoStack = [...client.undoStack, event.payload.command]

  if (undoStack.length > 100) {
    undoStack.shift()
  }

  const updatedClient: ConnectedClient = {
    ...client,
    undoStack,
    redoStack: []
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.clientUuid]: updatedClient
    }
  }
}

function reduceLastClientCommandUndone(
  event: LastClientCommandUndone,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }
  const lastCommand = client.undoStack[client.undoStack.length - 1]

  if (!lastCommand) {
    throw new Error(`No command to undo!`)
  }

  const updatedClient: ConnectedClient = {
    ...client,
    undoStack: client.undoStack.slice(0, -1),
    redoStack: [...client.redoStack, lastCommand]
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.clientUuid]: updatedClient
    }
  }
}

function reduceLastClientCommandUndoSkipped(
  event: LastClientCommandUndoSkipped,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }
  const lastCommand = client.undoStack[client.undoStack.length - 1]

  if (!lastCommand) {
    throw new Error(`No command to skip!`)
  }

  const updatedClient: ConnectedClient = {
    ...client,
    undoStack: client.undoStack.slice(0, -1)
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.clientUuid]: updatedClient
    }
  }
}

function reduceLastClientCommandRedone(
  event: LastClientCommandRedone,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }
  const lastCommand = client.redoStack[client.redoStack.length - 1]

  if (!lastCommand) {
    throw new Error(`No command to redo!`)
  }

  const updatedClient: ConnectedClient = {
    ...client,
    redoStack: client.redoStack.slice(0, -1),
    undoStack: [...client.undoStack, lastCommand]
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.clientUuid]: updatedClient
    }
  }
}

function reduceLastClientCommandRedoSkipped(
  event: LastClientCommandRedoSkipped,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }
  const lastCommand = client.redoStack[client.redoStack.length - 1]

  if (!lastCommand) {
    throw new Error(`No command to skip!`)
  }

  const updatedClient: ConnectedClient = {
    ...client,
    redoStack: client.redoStack.slice(0, -1)
  }

  return {
    ...state,
    clients: {
      ...state.clients,
      [event.payload.clientUuid]: updatedClient
    }
  }
}

function reduceNodesEdited(
  event: NodesEdited,
  state: SessionState
): SessionState {
  const client = state.clients[event.payload.clientUuid]

  if (client == null) {
    throw new ClientIsNotConnected(event.payload.clientUuid)
  }

  const editedNodes = event.payload.nodes.reduce<Record<NodeUuid, ClientUuid>>(
    (acc, node) => {
      acc[node] = event.payload.clientUuid

      return acc
    },
    {}
  )

  return {
    ...state,
    nodeEditors: {
      ...state.nodeEditors,
      ...editedNodes
    }
  }
}

function reduce(event: SessionEvent, state: SessionState): SessionState {
  return match(event)
    .with(
      {
        type: SessionEventType.ClientConnected
      },
      (e) => reduceClientConnected(e, state)
    )
    .with(
      {
        type: SessionEventType.ClientDisconnected
      },
      (e) => reduceClientDisconnected(e, state)
    )
    .with(
      {
        type: SessionEventType.ClientCursorMoved
      },
      (e) => reduceClientCursorMoved(e, state)
    )
    .with(
      {
        type: SessionEventType.NodesSelected
      },
      (e) => reduceNodesSelected(e, state)
    )
    .with(
      {
        type: SessionEventType.DraggingStarted
      },
      (e) => reduceDraggingStarted(e, state)
    )
    .with(
      {
        type: SessionEventType.DraggingMoved
      },
      (e) => reduceDraggingMoved(e, state)
    )
    .with(
      {
        type: SessionEventType.DraggingFinished
      },
      (e) => reduceDraggingFinished(e, state)
    )
    .with(
      {
        type: SessionEventType.ClientCommandAddedToHistory
      },
      (e) => reduceClientCommandAddedToHistory(e, state)
    )
    .with(
      {
        type: SessionEventType.LastClientCommandUndone
      },
      (e) => reduceLastClientCommandUndone(e, state)
    )
    .with(
      {
        type: SessionEventType.LastClientCommandUndoSkipped
      },
      (e) => reduceLastClientCommandUndoSkipped(e, state)
    )
    .with(
      {
        type: SessionEventType.LastClientCommandRedone
      },
      (e) => reduceLastClientCommandRedone(e, state)
    )
    .with(
      {
        type: SessionEventType.LastClientCommandRedoSkipped
      },
      (e) => reduceLastClientCommandRedoSkipped(e, state)
    )
    .with(
      {
        type: SessionEventType.NodesEdited
      },
      (e) => reduceNodesEdited(e, state)
    )
    .exhaustive()
}

export const SessionReducer = {
  reduce
}
