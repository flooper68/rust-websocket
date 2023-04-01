import { ClientDisconnected } from '../../events/events.js'
import { DisconnectClient, DomainCommandType } from '../commands.js'
import { CommandFactory } from '../core/undo-redo-core.js'

export const disconnectClient =
  CommandFactory.createOneTimeHandler<DisconnectClient>(
    DomainCommandType.DisconnectClient
  ).handle((command) => {
    const event = new ClientDisconnected(
      {
        uuid: command.payload.uuid
      },
      command.headers
    )

    return [event]
  })
