import { MoveClientCursor, CommandContext } from '../commands.js'
import { SessionSelectors } from '../selectors.js'
import { ClientCursorMoved } from '../session/types.js'

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
