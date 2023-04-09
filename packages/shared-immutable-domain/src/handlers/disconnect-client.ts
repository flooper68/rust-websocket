import { DisconnectClient, CommandContext } from '../commands.js'
import { SessionSelectors } from '../selectors.js'
import { ClientDisconnected } from '../session/types.js'

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
