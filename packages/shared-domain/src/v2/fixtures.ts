import { Option } from '../common/option'
import {
  Rectangle,
  ClientColor,
  ClientName,
  ClientUuid,
  ConnectedClient,
  NodeUuid,
  PositionValue,
  NodeKind,
  Fill,
  DimensionValue
} from './domain-types'

export function getConnectedClientFixture(props?: {
  uuid?: ClientUuid
}): ConnectedClient {
  return {
    uuid: props?.uuid ?? ClientUuid('uuid'),
    name: ClientName('name'),
    color: ClientColor('color'),
    cursor: {
      left: PositionValue(0),
      top: PositionValue(0)
    },
    undoStack: [],
    redoStack: []
  }
}

export function getRectangleFixture(props?: {
  uuid?: NodeUuid
  selectedBy?: Option<ClientUuid>
  deleted?: boolean
}): Rectangle {
  return {
    uuid: props?.uuid ?? NodeUuid('uuid'),
    kind: NodeKind.Rectangle,
    base: {
      locked: false,
      deleted: props?.deleted ?? false,
      selectedBy: props?.selectedBy ?? Option.None(),
      lastEditor: ClientUuid('client-uuid')
    },
    position: {
      left: PositionValue(0),
      top: PositionValue(0)
    },
    dimensions: {
      width: DimensionValue(100).unwrap(),
      height: DimensionValue(100).unwrap()
    },
    rectangleMetadata: {
      fill: Fill('red')
    }
  }
}
