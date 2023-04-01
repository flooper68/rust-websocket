import { Result } from '../../common/result'
import { ConnectClient } from '../commands'
import { ClientConnected } from '../events'

export function connectClient(command: ConnectClient) {
  return Result.Ok([
    new ClientConnected(
      {
        uuid: command.payload.uuid,
        name: command.payload.name,
        color: command.payload.color
      },
      command.headers
    )
  ])
}
