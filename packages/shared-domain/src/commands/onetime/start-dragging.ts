import { StartDragging, DomainCommandType } from '../commands.js'
import { PositionDraggingStarted } from '../../events/events.js'
import { DomainSelectors } from '../../projections/selectors.js'
import { CommandFactory } from '../core/undo-redo-core.js'

export const startDragging = CommandFactory.createOneTimeHandler<StartDragging>(
  DomainCommandType.StartDragging
).handle((command, state) => {
  const selection = DomainSelectors.getUnlockedActiveSelection(
    command.payload.clientUuid,
    state
  )

  return selection.map((node) => {
    const left = node.position.left
    const top = node.position.top

    return new PositionDraggingStarted(
      {
        uuid: node.uuid,
        positionX: left,
        positionY: top,
        clientUuid: command.payload.clientUuid
      },
      command.headers
    )
  })
})
