import { NodeDeselected, NodeSelected } from '../../events/events.js'
import { DomainSelectors } from '../../projections/selectors.js'
import { Uuid } from '../../domain/domain-types.js'
import { DomainCommandType, SelectNode } from '../commands.js'
import { CommandFactory } from '../core/undo-redo-core.js'

export const selectNode = CommandFactory.createOneTimeHandler<SelectNode>(
  DomainCommandType.SelectedNode
).handle((command, state) => {
  const selection = DomainSelectors.getSelection(
    command.payload.clientUuid,
    state
  )

  const deselectedEvents = selection.map((node) => {
    return new NodeDeselected(
      {
        uuid: node.uuid,
        clientUuid: command.payload.clientUuid
      },
      command.headers
    )
  })

  const selectNode = new NodeSelected(
    {
      uuid: Uuid(command.payload.uuid),
      clientUuid: command.payload.clientUuid
    },
    command.headers
  )

  return [...deselectedEvents, selectNode]
})
