import { ConnectClient, CommandContext } from '../commands'
import { SessionSelectors } from '../selectors'
import { SessionFactories } from '../session/factories'
import { ClientConnected } from '../session/types'

export function connectClient(command: ConnectClient, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client != null) {
    throw new Error('Client already connected')
  }

  const newClient = SessionFactories.createConnectedClient({
    uuid: command.payload.clientUuid,
    color: command.payload.color,
    name: command.payload.name
  })

  const events = [new ClientConnected(newClient)]

  context.dispatch(events)
}
