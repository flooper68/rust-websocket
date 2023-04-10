import {
  ActiveImage,
  ActiveRectangle,
  DimensionValue,
  Fill,
  ImageUrl,
  NodeKind,
  NodeStatus,
  NodeUuid,
  PositionValue
} from './types.js'

interface RectangleFactoryProps {
  uuid: NodeUuid
  fill: Fill
  left: PositionValue
  top: PositionValue
}

export type RectangleFactory = (props: RectangleFactoryProps) => ActiveRectangle

const createRectangle: RectangleFactory = (props) => {
  return {
    uuid: props.uuid,
    kind: NodeKind.Rectangle,
    status: NodeStatus.Active,
    fill: props.fill,
    left: props.left,
    top: props.top,
    width: 100,
    height: 100
  }
}

interface ImageFactoryProps {
  uuid: NodeUuid
  url: ImageUrl
  left: PositionValue
  top: PositionValue
  imageWidth: DimensionValue
  imageHeight: DimensionValue
}

export type ImageFactory = (props: ImageFactoryProps) => ActiveImage

const createImage: ImageFactory = (props) => {
  return {
    uuid: props.uuid,
    kind: NodeKind.Image,
    status: NodeStatus.Active,
    url: props.url,
    imageWidth: props.imageWidth,
    imageHeight: props.imageHeight,
    left: props.left,
    top: props.top,
    width: props.imageWidth,
    height: props.imageHeight
  }
}

export const NodeFactories = {
  createRectangle,
  createImage
}
