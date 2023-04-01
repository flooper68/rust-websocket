import { v4 } from 'uuid'
import {
  createRectangleFactory,
  Fill,
  Position,
  Dimensions,
  createImageFactory,
  Node,
  Uuid
} from './domain/domain-types.js'

const urls = [
  'https://media.tenor.com/MW_H9cw1-2gAAAAC/mario-gif-pic.gif',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/The_death.png/564px-The_death.png',
  'https://media.tenor.com/TNfKYA-LVToAAAAM/cute.gif'
]

function getRandomUrl(): string {
  return urls[Math.floor(Math.random() * urls.length)] as string
}

const POSITION_SPREAD = 10000
const DIMENSIONS_SPREAD = 200
const NODES_COUNT = 0

export function createInitialState() {
  const nodes: Record<Uuid, Node> = {}

  for (let i = 0; i < NODES_COUNT; i++) {
    const rectangle = createRectangleFactory({
      uuid: v4(),
      fill: Fill(`#${Math.floor(Math.random() * 16777215).toString(16)}`),
      position: Position(
        (0.5 - Math.random()) * POSITION_SPREAD,
        (0.5 - Math.random()) * POSITION_SPREAD
      ),
      dimensions: Dimensions(
        DIMENSIONS_SPREAD * Math.random() + 20,
        DIMENSIONS_SPREAD * Math.random() + 20
      ),
      clientUuid: v4(),
      correlationUuid: v4()
    })

    nodes[rectangle.payload.uuid] = rectangle.payload
  }

  for (let i = 0; i < NODES_COUNT; i++) {
    const scale = 3 + Math.random()

    const image = createImageFactory({
      uuid: v4(),
      url: getRandomUrl(),
      position: Position(
        (0.5 - Math.random()) * POSITION_SPREAD,
        (0.5 - Math.random()) * POSITION_SPREAD
      ),
      dimensions: Dimensions(564 / scale, 599 / scale),
      clientUuid: v4(),
      correlationUuid: v4()
    })

    nodes[image.payload.uuid] = image.payload
  }

  return nodes
}
