import { Result } from '../../common/result'
import { MoveClientCursor } from '../commands'
import { ClientCursorMoved } from '../events'

export function moveClientCursor(command: MoveClientCursor) {
  return Result.Ok([
    new ClientCursorMoved(
      {
        uuid: command.payload.uuid,
        position: {
          left: command.payload.left,
          top: command.payload.top
        }
      },
      command.headers
    )
  ])
}
