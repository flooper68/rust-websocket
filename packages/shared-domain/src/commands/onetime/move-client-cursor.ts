import { ClientCursorMoved } from '../../events/events.js'
import { DomainCommandType, MoveClientCursor } from '../commands.js'
import { CommandFactory } from '../core/undo-redo-core.js'

export const moveClientCursor =
  CommandFactory.createOneTimeHandler<MoveClientCursor>(
    DomainCommandType.MoveClientCursor
  ).handle((command) => {
    const event = new ClientCursorMoved(
      {
        clientUuid: command.payload.clientUuid,
        left: command.payload.left,
        top: command.payload.top
      },
      command.headers
    )

    return [event]
  })
