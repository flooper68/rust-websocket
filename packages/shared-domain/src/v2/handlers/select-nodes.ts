import { Result } from '../../common/result'
import { SelectNodes } from '../commands'
import { NodesSelected } from '../events'

export function selectNode(command: SelectNodes) {
  return Result.Ok([
    new NodesSelected(
      {
        nodes: command.payload.nodes,
        clientUuid: command.payload.clientUuid
      },
      command.headers
    )
  ])
}
