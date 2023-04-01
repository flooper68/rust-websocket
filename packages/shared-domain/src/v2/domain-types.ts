import { Opaque } from '../common/opaque.js'
import { None, Option, Some } from '../common/option.js'
import { Result } from '../common/result'
import { DomainErrorType } from './errors.js'
import { DomainEvent } from './events.js'

export type NodeUuid = Opaque<string, 'NodeUuid'>

export function NodeUuid(value: string): NodeUuid {
  return Opaque(value)
}

export type ClientUuid = Opaque<string, 'ClientUuid'>

export function ClientUuid(value: string): ClientUuid {
  return Opaque(value)
}

export type DimensionValue = Opaque<number, 'DimensionValue '>

export class DimensionNotPositive extends Error {
  readonly type = DomainErrorType.DimensionNotPositive
  constructor(readonly dimension: number) {
    super(
      `Dimension ${dimension} is not positive, it needs to be greater than 0.`
    )
  }
}

export function DimensionValue(
  value: number
): Result<DimensionNotPositive, DimensionValue> {
  if (value <= 0) {
    return Result.Err(new DimensionNotPositive(value))
  }

  return Result.Ok(Opaque(value))
}

export type PositionValue = Opaque<number, 'PositionValue'>

export function PositionValue(value: number): PositionValue {
  return Opaque(value)
}

export type ImageUrl = Opaque<string, 'ImageUrl'>

export function ImageUrl(value: string): ImageUrl {
  return Opaque(value)
}

export type FontSize = Opaque<number, 'FontSize'>

export function FontSize(value: number): FontSize {
  return Opaque(value)
}

export type TextContent = Opaque<string, 'TextContent'>

export function TextContent(value: string): TextContent {
  return Opaque(value)
}

export type ClientColor = Opaque<string, 'ClientColor'>

export function ClientColor(value: string): ClientColor {
  return Opaque(value)
}

export type ClientName = Opaque<string, 'ClientName'>

export function ClientName(value: string): ClientName {
  return Opaque(value)
}

export enum TextFont {
  Arial = 'Arial',
  Helvetica = 'Helvetica',
  Times = 'Times'
}

export interface Position {
  left: PositionValue
  top: PositionValue
}

export interface Dimensions {
  width: DimensionValue
  height: DimensionValue
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

export interface BaseNode {
  locked: boolean
  deleted: boolean
  selectedBy: Option<ClientUuid>
  lastEditor: ClientUuid
}

export interface RectangleMetadata {
  fill: Fill
}

export interface Rectangle {
  uuid: NodeUuid
  kind: NodeKind.Rectangle
  base: BaseNode
  position: Position
  dimensions: Dimensions
  rectangleMetadata: RectangleMetadata
}

export interface ImageMetadata {
  url: ImageUrl
  width: DimensionValue
  height: DimensionValue
}

export interface Image {
  uuid: NodeUuid
  kind: NodeKind.Image
  base: BaseNode
  position: Position
  dimensions: Dimensions
  imageMetadata: ImageMetadata
}

export interface TextMetadata {
  font: TextFont
  fontSize: FontSize
  content: TextContent
}

export interface Text {
  uuid: NodeUuid
  kind: NodeKind.Text
  base: BaseNode
  position: Position
  dimensions: Dimensions
  textMetadata: TextMetadata
}

export type Node = Rectangle | Image | Text

export type ActiveNode = Node & { deleted: false }

export function isNodeActive(node: Node): node is ActiveNode {
  return !node.base.deleted
}

export type DeletedNode = Node & { deleted: true }

export function isNodeSelected<C extends ClientUuid>(
  node: Node,
  clientUuid: C
): node is ClientSelectedNode<C> {
  return node.base.selectedBy.compare(Option.Some(clientUuid))
}

export type ClientSelectedNode<C extends ClientUuid> = Node & {
  selectedBy: Some<C>
}

export type UnselectedNode = Node & { selectedBy: None<ClientUuid> }

export function isNodeUnselected(node: Node): node is UnselectedNode {
  return node.base.selectedBy.isNone()
}

export type ActiveClientSelection<C extends ClientUuid> =
  ClientSelectedNode<C>[]

export interface CommittedCommand {
  selection: NodeUuid[]
  redoEvents: DomainEvent[]
  undoEvents: DomainEvent[]
}

export interface ConnectedClient {
  uuid: ClientUuid
  name: ClientName
  color: ClientColor
  cursor: Position
  undoStack: CommittedCommand[]
  redoStack: CommittedCommand[]
}

export type DomainState = {
  connections: Record<ClientUuid, ConnectedClient>
  nodes: Record<NodeUuid, Node>
}
