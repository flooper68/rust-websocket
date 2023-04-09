import { SetImageSelectionUrl, CommandContext } from '../commands.js'
import { NodeUrlSet } from '../document/types.js'
import { SessionSelectors } from '../selectors.js'

export function setImageSelectionUrl(
  command: SetImageSelectionUrl,
  context: CommandContext
) {
  if (
    !SessionSelectors.isOnlyActiveImageSelection(
      command.payload.clientUuid,
      context.getState()
    )
  ) {
    throw new Error('Only images can have url set')
  }

  const activeImageSelection = SessionSelectors.getClientActiveImageSelection(
    command.payload.clientUuid,
    context.getState()
  )

  const events = activeImageSelection.map((node) => {
    return new NodeUrlSet({ uuid: node.uuid, url: command.payload.url })
  })

  context.dispatch(events)
}
