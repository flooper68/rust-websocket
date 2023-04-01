import { RectangleActions } from '../actions'
import { CreateRectangle } from '../commands'
import { NodeDeleted, RectangleCreated } from '../events'

export function createRectangle(command: CreateRectangle) {
  const rectangle = RectangleActions.create({
    uuid: command.payload.uuid,
    clientUuid: command.payload.clientUuid
  })

  return {
    redo: [
      new RectangleCreated(
        { rectangle, clientUuid: command.payload.clientUuid },
        command.headers
      )
    ],
    undo: [
      new NodeDeleted(
        {
          uuid: rectangle.uuid
        },
        command.headers
      )
    ]
  }
}
