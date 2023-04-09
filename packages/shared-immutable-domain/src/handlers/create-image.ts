import { CreateImage, CommandContext } from '../commands.js'
import { NodeFactories } from '../document/factories.js'
import { ImageCreated } from '../document/types.js'
import { SessionSelectors } from '../selectors.js'
import { NodesSelected } from '../session/types.js'

export function createImage(command: CreateImage, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const image = NodeFactories.createImage({
    uuid: command.payload.uuid,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/The_death.png/564px-The_death.png',
    imageWidth: 100,
    imageHeight: 100
  })

  const events = [
    new ImageCreated(image),
    new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: [image.uuid]
    })
  ]

  context.dispatch(events)
}
