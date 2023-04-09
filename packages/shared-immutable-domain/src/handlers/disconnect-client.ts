import { DisconnectClient, CommandContext } from '../commands'
import { SessionSelectors } from '../selectors'
import { ClientDisconnected } from '../session/types'

export function disconnectClient(
  command: DisconnectClient,
  context: CommandContext
) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [new ClientDisconnected(client)]

  context.dispatch(events)
}
