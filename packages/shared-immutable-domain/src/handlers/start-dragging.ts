import { StartDragging, CommandContext } from '../commands.js'
import { SessionSelectors } from '../selectors.js'
import { DraggingStarted } from '../session/types.js'

export function startDragging(command: StartDragging, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [
    new DraggingStarted({
      clientUuid: command.payload.clientUuid
    })
  ]

  context.dispatch(events)
}
