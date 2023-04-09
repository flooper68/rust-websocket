import { StartDragging, CommandContext } from '../commands'
import { SessionSelectors } from '../selectors'
import { DraggingStarted } from '../session/types'

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
