import { UndoableDomainCommand } from '../commands/commands.js'
import { Opaque } from '../common/opaque.js'
import {
  DomainEventType,
  ImageCreated,
  RectangleCreated
} from '../events/events.js'

export type Uuid = Opaque<string, 'Uuid'>

export function Uuid(value: string): Uuid {
  return Opaque(value)
}

export type ClientUuid = Opaque<string, 'ClientUuid'>

export function ClientUuid(value: string): ClientUuid {
  return Opaque(value)
}

export type DimensionValue = Opaque<number, 'DimensionValue '>

function DimensionValue(value: number): DimensionValue {
  return Opaque(value)
}

export type PositionValue = Opaque<number, 'PositionValue'>

function PositionValue(value: number): PositionValue {
  return Opaque(value)
}

export type Position = Opaque<
  {
    left: PositionValue
    top: PositionValue
  },
  'Position'
>

export function Position(left: number, top: number): Position {
  return Opaque({
    left: PositionValue(left),
    top: PositionValue(top),
    positionBeforeDraggingX: PositionValue(left),
    positionBeforeDraggingY: PositionValue(left)
  })
}

export type Dimensions = Opaque<
  {
    width: DimensionValue
    height: DimensionValue
  },
  'Dimensions'
>

export function Dimensions(width: number, height: number): Dimensions {
  return Opaque({
    width: DimensionValue(width),
    height: DimensionValue(height)
  })
}

export enum NodeKind {
  Rectangle = 'Rectangle',
  Image = 'Image',
  Text = 'Text'
}

export type Fill = Opaque<string, 'Opaque'>

export function Fill(fill: string): Fill {
  return Opaque(fill)
}

export type RectangleMetadata = Opaque<
  {
    fill: Fill
  },
  'RectangleMetadata'
>

export function RectangleMetadata(fill: Fill): RectangleMetadata {
  return Opaque({
    fill
  })
}

export type Rectangle = Opaque<
  {
    uuid: Uuid
    kind: NodeKind.Rectangle
    locked: boolean
    deleted: boolean
    selectedBy: string | null
    lastEditor: string
    position: Position
    dimensions: Dimensions
    rectangleMetadata: RectangleMetadata
    dragging: {
      draggingStartingPositionX: number
      draggingStartingPositionY: number
    } | null
  },
  'Rectangle'
>

export function Rectangle(props: {
  uuid: Uuid
  locked: boolean
  deleted: boolean
  selectedBy: string | null
  lastEditor: string
  position: Position
  dimensions: Dimensions
  rectangleMetadata: RectangleMetadata
  dragging: {
    draggingStartingPositionX: number
    draggingStartingPositionY: number
  } | null
}): Rectangle {
  return Opaque({
    uuid: props.uuid,
    kind: NodeKind.Rectangle,
    locked: props.locked,
    deleted: props.deleted,
    selectedBy: props.selectedBy,
    lastEditor: props.lastEditor,
    position: props.position,
    dimensions: props.dimensions,
    rectangleMetadata: props.rectangleMetadata,
    dragging: props.dragging
  })
}

interface CreateRectangleProps {
  uuid: string
  fill: Fill
  position: Position
  dimensions: Dimensions
  clientUuid: string
  correlationUuid: string
}

export function createRectangleFactory(
  props: CreateRectangleProps
): RectangleCreated {
  const rectangle = Rectangle({
    uuid: Uuid(props.uuid),
    locked: false,
    deleted: false,
    selectedBy: null,
    lastEditor: props.clientUuid,
    position: props.position,
    dimensions: props.dimensions,
    rectangleMetadata: RectangleMetadata(props.fill),
    dragging: null
  })

  return {
    type: DomainEventType.RectangleCreated,
    payload: rectangle,
    headers: {
      correlationUuid: props.correlationUuid
    }
  }
}

export type ImageMetadata = Opaque<
  {
    url: string
    width: number
    height: number
  },
  'ImageMetadata'
>

export function ImageMetadata(props: {
  url: string
  width: number
  height: number
}): ImageMetadata {
  return Opaque(props)
}

export type Image = Opaque<
  {
    uuid: Uuid
    kind: NodeKind.Image
    locked: boolean
    deleted: boolean
    selectedBy: string | null
    lastEditor: string
    position: Position
    dimensions: Dimensions
    imageMetadata: ImageMetadata
    dragging: {
      draggingStartingPositionX: number
      draggingStartingPositionY: number
    } | null
  },
  'Image'
>

export function Image(props: {
  uuid: Uuid
  locked: boolean
  deleted: boolean
  selectedBy: string | null
  lastEditor: string
  position: Position
  dimensions: Dimensions
  imageMetadata: ImageMetadata
  dragging: {
    draggingStartingPositionX: number
    draggingStartingPositionY: number
  } | null
}): Image {
  return Opaque({
    uuid: props.uuid,
    kind: NodeKind.Image,
    locked: props.locked,
    deleted: props.deleted,
    selectedBy: props.selectedBy,
    lastEditor: props.lastEditor,
    position: props.position,
    dimensions: props.dimensions,
    imageMetadata: props.imageMetadata,
    dragging: props.dragging
  })
}

interface CreateImageProps {
  uuid: string
  url: string
  position: Position
  dimensions: Dimensions
  clientUuid: string
  correlationUuid: string
}

export function createImageFactory(props: CreateImageProps): ImageCreated {
  const image = Image({
    uuid: Uuid(props.uuid),
    locked: false,
    deleted: false,
    selectedBy: null,
    lastEditor: props.clientUuid,
    position: props.position,
    dimensions: props.dimensions,
    imageMetadata: ImageMetadata({
      url: props.url,
      width: props.dimensions.width,
      height: props.dimensions.height
    }),
    dragging: null
  })

  return new ImageCreated(image, { correlationUuid: props.correlationUuid })
}

export type TextMetadata = Opaque<
  {
    font: string
    fontSize: number
    context: string
  },
  'TextMetadata'
>

export type Text = Opaque<
  {
    uuid: Uuid
    locked: boolean
    deleted: boolean
    selectedBy: string | null
    lastEditor: string
    kind: NodeKind.Text
    position: Position
    dimensions: Dimensions
    textMetadata: TextMetadata
    dragging: {
      draggingStartingPositionX: number
      draggingStartingPositionY: number
    } | null
  },
  'Text'
>

export type Node = Rectangle | Image | Text

export type CommittedCommand<C extends UndoableDomainCommand, S> = {
  currentSelection: Uuid[]
  command: C
  historySnapshot: S
}

export interface ConnectedClient {
  uuid: string
  name: string
  color: string
  cursor: Position
  undoStack: CommittedCommand<UndoableDomainCommand, unknown>[]
  redoStack: CommittedCommand<UndoableDomainCommand, unknown>[]
}

export type DomainState = {
  connections: Record<string, ConnectedClient>
  nodes: Record<Uuid, Node>
}
