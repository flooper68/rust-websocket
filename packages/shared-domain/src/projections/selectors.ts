import {
  DomainState,
  NodeKind,
  Rectangle,
  Uuid
} from '../domain/domain-types.js'

function getSelection(clientUuid: string, state: DomainState) {
  const selectedNodes = Object.values(state.nodes).filter(
    (node) => node.selectedBy === clientUuid
  )

  return selectedNodes
}

function getActiveSelection(clientUuid: string, state: DomainState) {
  const selectedNodes = Object.values(state.nodes).filter(
    (node) => node.selectedBy === clientUuid && !node.deleted
  )

  return selectedNodes
}

function getUnlockedActiveSelection(clientUuid: string, state: DomainState) {
  const selectedNodes = Object.values(state.nodes).filter(
    (node) => node.selectedBy === clientUuid && !node.deleted && !node.locked
  )

  return selectedNodes
}

function isClientSelectionLocked(clientUuid: string, state: DomainState) {
  const activeSelection = getActiveSelection(clientUuid, state)

  return activeSelection.every((node) => node.locked)
}

function getUnlockedActiveRectangleSelection(
  clientUuid: string,
  state: DomainState
) {
  const selectedNodes = Object.values(state.nodes).filter(
    (node) =>
      node.selectedBy === clientUuid &&
      !node.deleted &&
      !node.locked &&
      node.kind === NodeKind.Rectangle
  )

  return selectedNodes as Rectangle[]
}

function isNodeLocked(uuid: Uuid, state: DomainState) {
  const node = state.nodes[uuid]

  return !!node?.locked
}

function getConnectedClients(state: DomainState) {
  return Object.values(state.connections).filter((client) => client.uuid)
}

function getClient(uuid: string, state: DomainState) {
  return state.connections[uuid]
}

function getNode(uuid: Uuid, state: DomainState) {
  return state.nodes[uuid]
}

export const DomainSelectors = {
  getSelection,
  getUnlockedActiveSelection,
  getUnlockedActiveRectangleSelection,
  getActiveSelection,
  isClientSelectionLocked,
  isNodeLocked,
  getConnectedClients,
  getClient,
  getNode
}
