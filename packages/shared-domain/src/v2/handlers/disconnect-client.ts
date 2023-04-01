import { Result } from '../../common/result'
import { ClientDisconnected } from '../events'
import { DisconnectClient } from './../commands'

export function disconnectClient(command: DisconnectClient) {
  return Result.Ok([
    new ClientDisconnected(
      {
        uuid: command.payload.uuid
      },
      command.headers
    )
  ])
}
