export type NodeUuid = string

export type DimensionValue = number

export type PositionValue = number

export type Fill = string

export type ImageUrl = string

export enum NodeKind {
  Rectangle = 'Rectangle',
  Image = 'Image'
}

export enum NodeStatus {
  Active = 'Active',
  Deleted = 'Deleted',
  Locked = 'Locked'
}

interface NodeBase {
  uuid: NodeUuid
  left: PositionValue
  top: PositionValue
  width: DimensionValue
  height: DimensionValue
}

interface BaseRectangle extends NodeBase {
  kind: NodeKind.Rectangle
  fill: Fill
}

export interface DeletedRectangle extends BaseRectangle {
  status: NodeStatus.Deleted
}

export interface LockedRectangle extends BaseRectangle {
  status: NodeStatus.Locked
}

export interface ActiveRectangle extends BaseRectangle {
  status: NodeStatus.Active
}

export type Rectangle = ActiveRectangle | LockedRectangle | DeletedRectangle

export function isRectangle(node: Node): node is Rectangle {
  return node.kind === NodeKind.Rectangle
}

interface BaseImage extends NodeBase {
  kind: NodeKind.Image
  url: ImageUrl
  imageWidth: DimensionValue
  imageHeight: DimensionValue
}

export interface DeletedImage extends BaseImage {
  status: NodeStatus.Deleted
}

export interface LockedImage extends BaseImage {
  status: NodeStatus.Locked
}

export interface ActiveImage extends BaseImage {
  status: NodeStatus.Active
}

export type Image = ActiveImage | LockedImage | DeletedImage

export function isImage(node: Node): node is Image {
  return node.kind === NodeKind.Image
}

export type ActiveNode = ActiveImage | ActiveRectangle

export function isActiveNode(node: Node): node is ActiveNode {
  return node.status === NodeStatus.Active
}

export type LockedNode = LockedImage | LockedRectangle

export function isNodeLocked(node: Node): node is LockedNode {
  return node.status === NodeStatus.Locked
}

export type DeletedNode = DeletedImage | DeletedRectangle

export function isNodeDeleted(node: Node): node is DeletedNode {
  return node.status === NodeStatus.Deleted
}

export type Node = Rectangle | Image

export enum DocumentEventType {
  RectangleCreated = 'RectangleCreated',
  ImageCreated = 'ImageCreated',
  NodeDeleted = 'NodeDeleted',
  NodeLocked = 'NodeLocked',
  NodeUnlocked = 'NodeUnlocked',
  NodeMoved = 'NodeMoved',
  NodeUrlSet = 'NodeUrlSet',
  NodeFillSet = 'NodeFillSet'
}

export class RectangleCreated {
  readonly type = DocumentEventType.RectangleCreated
  constructor(readonly payload: Rectangle) {}
}

export class ImageCreated {
  readonly type = DocumentEventType.ImageCreated
  constructor(readonly payload: Image) {}
}

export class NodeDeleted {
  readonly type = DocumentEventType.NodeDeleted
  constructor(readonly payload: { uuid: NodeUuid }) {}
}

export class NodeLocked {
  readonly type = DocumentEventType.NodeLocked
  constructor(readonly payload: NodeUuid) {}
}

export class NodeUnlocked {
  readonly type = DocumentEventType.NodeUnlocked
  constructor(readonly payload: NodeUuid) {}
}

export class NodeMoved {
  readonly type = DocumentEventType.NodeMoved
  constructor(
    readonly payload: {
      uuid: NodeUuid
      left: PositionValue
      top: PositionValue
    }
  ) {}
}

export class NodeUrlSet {
  readonly type = DocumentEventType.NodeUrlSet
  constructor(readonly payload: { uuid: NodeUuid; readonly url: ImageUrl }) {}
}

export class NodeFillSet {
  readonly type = DocumentEventType.NodeFillSet
  constructor(readonly payload: { uuid: NodeUuid; readonly fill: Fill }) {}
}

export type DocumentEvent =
  | RectangleCreated
  | ImageCreated
  | NodeDeleted
  | NodeLocked
  | NodeUnlocked
  | NodeMoved
  | NodeUrlSet
  | NodeFillSet

export interface DocumentState {
  nodes: Record<NodeUuid, Node>
}
