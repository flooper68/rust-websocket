import { MoveClientCursor, CommandContext } from '../commands'
import { SessionSelectors } from '../selectors'
import { ClientCursorMoved } from '../session/types'

export function moveClientCursor(
  command: MoveClientCursor,
  context: CommandContext
) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [new ClientCursorMoved(command.payload)]

  context.dispatch(events)
}
