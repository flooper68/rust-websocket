import { UnlockSelection, CommandContext } from '../commands.js'
import { NodeUnlocked } from '../document/types.js'
import { SessionSelectors } from '../selectors.js'

export function unlockSelection(
  command: UnlockSelection,
  context: CommandContext
) {
  const lockedSelection = SessionSelectors.getClientLockedSelection(
    command.payload.clientUuid,
    context.getState()
  )

  const events = lockedSelection.map((node) => {
    return new NodeUnlocked({ uuid: node.uuid })
  })

  context.dispatch(events)
}
