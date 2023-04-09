import { MoveDragging, CommandContext } from '../commands.js'
import { SessionSelectors } from '../selectors.js'
import { DraggingMoved } from '../session/types.js'

export function moveDragging(command: MoveDragging, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [
    new DraggingMoved({
      clientUuid: command.payload.clientUuid,
      diffLeft: command.payload.diffLeft,
      diffTop: command.payload.diffTop
    })
  ]

  context.dispatch(events)
}
