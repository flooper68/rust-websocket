import { SelectNodes, CommandContext } from '../commands'
import { SessionSelectors } from '../selectors'
import { NodesSelected } from '../session/types'

export function selectNodes(command: SelectNodes, context: CommandContext) {
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
