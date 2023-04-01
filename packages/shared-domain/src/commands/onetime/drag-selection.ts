import { DragSelection, DomainCommandType } from '../commands.js'
import { Position } from '../../domain/domain-types.js'
import { NodeMoved } from '../../events/events.js'
import { DomainSelectors } from '../../projections/selectors.js'
import { CommandFactory } from '../core/undo-redo-core.js'

export const dragSelection = CommandFactory.createOneTimeHandler<DragSelection>(
  DomainCommandType.DragSelection
).handle((command, state) => {
  const selection = DomainSelectors.getUnlockedActiveSelection(
    command.payload.clientUuid,
    state
  )

  return selection.map((node) => {
    return new NodeMoved(
      {
        uuid: node.uuid,
        positionDiff: Position(
          command.payload.diffLeft,
          command.payload.diffTop
        ),
        clientUuid: command.payload.clientUuid
      },
      command.headers
    )
  })
})
