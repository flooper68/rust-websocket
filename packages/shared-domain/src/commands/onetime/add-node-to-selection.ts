import { NodeSelected } from '../../events/events.js'
import { Uuid } from '../../domain/domain-types.js'
import { AddNodeToSelection, DomainCommandType } from '../commands.js'
import { CommandFactory } from '../core/undo-redo-core.js'

export const addNodeToSelection =
  CommandFactory.createOneTimeHandler<AddNodeToSelection>(
    DomainCommandType.AddNodeToSelection
  ).handle((command) => {
    return [
      new NodeSelected(
        {
          uuid: Uuid(command.payload.uuid),
          clientUuid: command.payload.clientUuid
        },
        command.headers
      )
    ]
  })
