import { ClientConnected } from '../../events/events.js'
import { ConnectClient, DomainCommandType } from '../commands.js'
import { CommandFactory } from '../core/undo-redo-core.js'

export const connectClient = CommandFactory.createOneTimeHandler<ConnectClient>(
  DomainCommandType.ConnectClient
).handle((command) => {
  const clientConnected = new ClientConnected(
    {
      uuid: command.payload.uuid,
      name: command.payload.name,
      color: command.payload.color
    },
    command.headers
  )

  return [clientConnected]
})
