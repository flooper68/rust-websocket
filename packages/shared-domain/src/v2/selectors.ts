import { Option } from '../common/option'
import {
  ActiveClientSelection,
  ActiveNode,
  ClientUuid,
  ConnectedClient,
  DomainState,
  isNodeActive,
  isNodeSelected,
  Node,
  NodeUuid,
  UnselectedNode
} from './domain-types'

function getClientConnection(
  clientUuid: ClientUuid,
  state: DomainState
): Option<ConnectedClient> {
  return Option.fromNullable(state.connections[clientUuid])
}

function getLastClientUndoCommand(client: ConnectedClient) {
  return Option.fromNullable(client.undoStack[client.undoStack.length - 1])
}

function getLastClientRedoCommand(client: ConnectedClient) {
  return Option.fromNullable(client.redoStack[client.redoStack.length - 1])
}

function getActiveNode(
  nodeUuid: NodeUuid,
  state: DomainState
): Option<ActiveNode> {
  return Option.fromNullable(state.nodes[nodeUuid]).chain((node) =>
    node.base.deleted ? Option.None() : Option.Some(node as ActiveNode)
  )
}

function getNode(nodeUuid: NodeUuid, state: DomainState): Option<Node> {
  return Option.fromNullable(state.nodes[nodeUuid])
}

function getClientUnselectedNode(
  nodeUuid: NodeUuid,
  state: DomainState
): Option<UnselectedNode> {
  return Option.fromNullable(state.nodes[nodeUuid]).chain((node) =>
    node.base.selectedBy.isSome()
      ? Option.None()
      : Option.Some(node as UnselectedNode)
  )
}

function getActiveClientSelection<C extends ClientUuid>(
  clientUuid: C,
  state: DomainState
): ActiveClientSelection<C> {
  return Object.values(state.nodes).filter((node) => {
    if (isNodeActive(node) && isNodeSelected(node, clientUuid)) {
      return true
    }

    return false
  }) as ActiveClientSelection<C>
}

export const DomainSelectors = {
  getNode,
  getActiveNode,
  getClientConnection,
  getClientUnselectedNode,
  getLastClientUndoCommand,
  getLastClientRedoCommand,
  getActiveClientSelection
}
