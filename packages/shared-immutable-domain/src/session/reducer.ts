import { match } from 'ts-pattern'
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
  DraggingMoved
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
    .exhaustive()
}

export const SessionReducer = {
  reduce
}
