import { LockSelection, CommandContext } from '../commands.js'
import { NodeLocked } from '../document/types.js'
import { SessionSelectors } from '../selectors.js'

export function lockSelection(command: LockSelection, context: CommandContext) {
  const activeSelection = SessionSelectors.getClientActiveSelection(
    command.payload.clientUuid,
    context.getState()
  )

  const events = activeSelection.map((node) => {
    return new NodeLocked({ uuid: node.uuid })
  })

  context.dispatch(events)
}
