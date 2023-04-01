import { NodeDeselected } from '../../events/events.js'
import { DomainSelectors } from '../../projections/selectors.js'
import { DeselectAll, DomainCommandType } from '../commands.js'
import { CommandFactory } from '../core/undo-redo-core.js'

export const deselectAll = CommandFactory.createOneTimeHandler<DeselectAll>(
  DomainCommandType.DeselectAll
).handle((command, state) => {
  const selection = DomainSelectors.getSelection(
    command.payload.clientUuid,
    state
  )

  return selection.map((node) => {
    return new NodeDeselected(
      {
        uuid: node.uuid,
        clientUuid: command.payload.clientUuid
      },
      command.headers
    )
  })
})
