import { SetRectangleSelectionFill, CommandContext } from '../commands.js'
import { NodeFillSet } from '../document/types.js'
import { SessionSelectors } from '../selectors.js'

export function setRectangleSelectionFill(
  command: SetRectangleSelectionFill,
  context: CommandContext
) {
  if (
    !SessionSelectors.isOnlyActiveRectangleSelection(
      command.payload.clientUuid,
      context.getState()
    )
  ) {
    throw new Error('Only rectangles can be filled')
  }

  const activeRectangleSelection =
    SessionSelectors.getClientActiveRectangleSelection(
      command.payload.clientUuid,
      context.getState()
    )

  const events = activeRectangleSelection.map((node) => {
    return new NodeFillSet({ uuid: node.uuid, fill: command.payload.fill })
  })

  context.dispatch(events)
}
