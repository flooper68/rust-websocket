import { LockSelection, CommandContext } from '../commands'
import { NodeLocked } from '../document/types'
import { SessionSelectors } from '../selectors'

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
