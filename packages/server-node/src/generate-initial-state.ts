import { getRandomColor } from '@shared/common'
import {
  DocumentSessionState,
  Image,
  Node,
  NodeKind,
  NodeStatus,
  Rectangle
} from '@shared/immutable-domain'
import { NodeUuid } from '@shared/immutable-domain'
import { v4 } from 'uuid'

const SPREAD = 8000

function generateRandomImage(): Image {
  const left = (Math.random() - 0.5) * SPREAD
  const top = (Math.random() - 0.5) * SPREAD

  return {
    uuid: v4(),
    kind: NodeKind.Image,
    status: NodeStatus.Active,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/The_death.png/564px-The_death.png',
    imageWidth: 100,
    imageHeight: 100,
    width: 100,
    height: 100,
    left,
    top
  }
}

function generateRandomRectangle(): Rectangle {
  const left = (Math.random() - 0.5) * SPREAD
  const top = (Math.random() - 0.5) * SPREAD

  return {
    uuid: v4(),
    kind: NodeKind.Rectangle,
    status: NodeStatus.Active,
    fill: getRandomColor(),
    width: 100,
    height: 100,
    left,
    top
  }
}

function getRandomNode() {
  if (Math.random() > 0.5) {
    return generateRandomImage()
  } else {
    return generateRandomRectangle()
  }
}

export function generateInitialState(props: {
  amountOfNodes: number
}): DocumentSessionState {
  const nodes: Record<NodeUuid, Node> = {}

  for (let i = 0; i < props.amountOfNodes; i++) {
    const node = getRandomNode()
    nodes[node.uuid] = node
  }

  return {
    session: {
      clients: {},
      selections: {},
      clientCommands: {},
      nodeEditors: {},
      clientDragging: {}
    },
    document: { nodes }
  }
}
