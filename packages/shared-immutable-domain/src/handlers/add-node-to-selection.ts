import { AddNodeToSelection, CommandContext } from '../commands.js'
import { SessionSelectors } from '../selectors.js'
import { NodesSelected } from '../session/types.js'

export function addNodeToSelection(
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
