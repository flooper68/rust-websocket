import {
  NodeUuid,
  isActiveNode,
  isImage,
  isRectangle,
  isNodeLocked,
  DocumentState
} from './document/types'
import { DocumentSession } from './document-session-root'
import { ClientUuid, SessionState } from './session/types'

const getConnectedClient = (clientUuid: ClientUuid, state: SessionState) => {
  return state.clients[clientUuid]
}

const getNode = (nodeUuid: NodeUuid, state: DocumentState) => {
  return state.nodes[nodeUuid]
}

const getClientSelection = (clientUuid: ClientUuid, state: DocumentSession) => {
  const client = getConnectedClient(clientUuid, state.session)

  if (client == null) {
    throw new Error('Client not found')
  }

  return client.selection.map((nodeUuid) => {
    const node = getNode(nodeUuid, state.document)

    if (node == null) {
      throw new Error('Node not found')
    }

    return node
  })
}

const getClientActiveSelection = (
  clientUuid: ClientUuid,
  state: DocumentSession
) => {
  return getClientSelection(clientUuid, state).filter(isActiveNode)
}

const getClientActiveImageSelection = (
  clientUuid: ClientUuid,
  state: DocumentSession
) => {
  return getClientSelection(clientUuid, state)
    .filter(isActiveNode)
    .filter(isImage)
}

const getClientActiveRectangleSelection = (
  clientUuid: ClientUuid,
  state: DocumentSession
) => {
  return getClientSelection(clientUuid, state)
    .filter(isActiveNode)
    .filter(isRectangle)
}

const isOnlyActiveImageSelection = (
  clientUuid: ClientUuid,
  state: DocumentSession
) => {
  return (
    getClientActiveSelection(clientUuid, state).length ===
    getClientActiveImageSelection(clientUuid, state).length
  )
}

const isOnlyActiveRectangleSelection = (
  clientUuid: ClientUuid,
  state: DocumentSession
) => {
  return (
    getClientActiveSelection(clientUuid, state).length ===
    getClientActiveRectangleSelection(clientUuid, state).length
  )
}

const getClientLockedSelection = (
  clientUuid: ClientUuid,
  state: DocumentSession
) => {
  return getClientSelection(clientUuid, state).filter(isNodeLocked)
}

export const SessionSelectors = {
  getConnectedClient,
  getNode,
  getClientSelection,
  getClientActiveSelection,
  getClientActiveImageSelection,
  getClientActiveRectangleSelection,
  isOnlyActiveImageSelection,
  isOnlyActiveRectangleSelection,
  getClientLockedSelection
}
