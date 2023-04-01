import { match } from 'ts-pattern'
import { Result } from '../common/result'
import {
  ConnectedClientActions,
  NodeActions,
  SelectionActions
} from './actions'
import {
  DomainState,
  isNodeActive,
  isNodeSelected,
  isNodeUnselected
} from './domain-types'
import {
  ClientAlreadyConnected,
  ClientNotConnected,
  DomainError,
  NodeAlreadyExists,
  NodeDoesNotExist,
  NodeIsNotActive,
  NodeIsSelectedByOtherClient
} from './errors'
import { DomainEvent, DomainEventType } from './events'
import { DomainSelectors } from './selectors'

export function reduce(
  event: DomainEvent,
  state: DomainState
): Result<DomainError, DomainState> {
  return match(event)
    .with(
      {
        type: DomainEventType.ClientConnected
      },
      (e) => {
        const connection = DomainSelectors.getClientConnection(
          e.payload.uuid,
          state
        )

        if (connection.isSome()) {
          return Result.Err(new ClientAlreadyConnected(e.payload.uuid))
        }

        state.connections[e.payload.uuid] = ConnectedClientActions.create({
          uuid: e.payload.uuid,
          name: e.payload.name,
          color: e.payload.color
        })

        return Result.Ok(state)
      }
    )
    .with(
      {
        type: DomainEventType.ClientDisconnected
      },
      (e) => {
        const connection = DomainSelectors.getClientConnection(
          e.payload.uuid,
          state
        )

        if (connection.isNone()) {
          return Result.Err(new ClientNotConnected(e.payload.uuid))
        }

        delete state.connections[e.payload.uuid]

        return Result.Ok(state)
      }
    )
    .with(
      {
        type: DomainEventType.ClientCursorMoved
      },
      (e) => {
        const connection = DomainSelectors.getClientConnection(
          e.payload.uuid,
          state
        )

        if (connection.isNone()) {
          return Result.Err(new ClientNotConnected(e.payload.uuid))
        }

        return connection.match(
          (connection) => {
            ConnectedClientActions.moveCursor(e.payload.position, connection)

            return Result.Ok(state)
          },
          () => {
            return Result.Err(new ClientNotConnected(e.payload.uuid))
          }
        )
      }
    )
    .with(
      {
        type: DomainEventType.RectangleCreated
      },
      (e) => {
        const node = DomainSelectors.getActiveNode(
          e.payload.rectangle.uuid,
          state
        )

        return node.match(
          () => {
            return Result.Err(new NodeAlreadyExists(e.payload.rectangle.uuid))
          },
          () => {
            const selection = DomainSelectors.getActiveClientSelection(
              e.payload.clientUuid,
              state
            )

            SelectionActions.deselect(selection)

            state.nodes[e.payload.rectangle.uuid] = {
              ...e.payload.rectangle,
              base: { ...e.payload.rectangle.base },
              position: { ...e.payload.rectangle.position },
              dimensions: { ...e.payload.rectangle.dimensions },
              rectangleMetadata: { ...e.payload.rectangle.rectangleMetadata }
            }

            return Result.Ok(state)
          }
        )
      }
    )
    .with(
      {
        type: DomainEventType.NodeDeleted
      },
      (e) => {
        const node = DomainSelectors.getActiveNode(e.payload.uuid, state)

        return node.match(
          (node) => {
            NodeActions.delete(node)

            return Result.Ok(state)
          },
          () => {
            return Result.Err(new NodeDoesNotExist(e.payload.uuid))
          }
        )
      }
    )
    .with(
      {
        type: DomainEventType.ClientCommandAddedToHistory
      },
      (e) => {
        const client = DomainSelectors.getClientConnection(
          e.payload.clientUuid,
          state
        )

        return client.match(
          (client) => {
            ConnectedClientActions.addCommandToHistory(
              e.payload.command,
              client
            )

            return Result.Ok(state)
          },
          () => {
            return Result.Err(new ClientNotConnected(e.payload.clientUuid))
          }
        )
      }
    )
    .with(
      {
        type: DomainEventType.LastClientCommandUndone
      },
      (e) => {
        const client = Result.fromOption(
          DomainSelectors.getClientConnection(e.payload.uuid, state),
          () => new ClientNotConnected(e.payload.uuid)
        )

        return client.chain((client) => {
          ConnectedClientActions.undoCommand(client)

          return e.payload.events.reduce<Result<DomainError, DomainState>>(
            (acc, event) => {
              return acc.chain((state) => reduce(event, state))
            },
            Result.Ok(state)
          )
        })
      }
    )
    .with(
      {
        type: DomainEventType.LastClientCommandRedone
      },
      (e) => {
        const client = Result.fromOption(
          DomainSelectors.getClientConnection(e.payload.uuid, state),
          () => new ClientNotConnected(e.payload.uuid)
        )

        return client.chain((client) => {
          ConnectedClientActions.redoCommand(client)

          return e.payload.events.reduce<Result<DomainError, DomainState>>(
            (acc, event) => {
              return acc.chain((state) => reduce(event, state))
            },
            Result.Ok(state)
          )
        })
      }
    )
    .with(
      {
        type: DomainEventType.NodesSelected
      },
      (e) => {
        const nodes = Result.sequenceArrayValidation(
          e.payload.nodes.map((uuid) => {
            const node = Result.fromOption(
              DomainSelectors.getNode(uuid, state),
              () => new NodeDoesNotExist(uuid)
            )

            const activeNode = node.chain((node) => {
              return isNodeActive(node)
                ? Result.Ok(node)
                : Result.Err(new NodeIsNotActive(node.uuid))
            })

            const unselectedNode = activeNode.chain((node) => {
              return isNodeSelected(node, e.payload.clientUuid) ||
                isNodeUnselected(node)
                ? Result.Ok(node)
                : Result.Err(
                    new NodeIsSelectedByOtherClient(
                      node.uuid,
                      node.base.selectedBy.unwrap()
                    )
                  )
            })

            return unselectedNode
          })
        )

        return nodes.chain((unselectedNodes) => {
          const activeSelection = DomainSelectors.getActiveClientSelection(
            e.payload.clientUuid,
            state
          )

          SelectionActions.selectNodes(
            { clientUuid: e.payload.clientUuid, nodes: unselectedNodes },
            activeSelection
          )

          return Result.Ok(state)
        })
      }
    )
    .exhaustive()
}
