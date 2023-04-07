import { NodeUuid } from './types'

export enum DocumentErrorType {
  NodeAlreadyExist = 'NodeAlreadyExist',
  NodeDoesNotExist = 'NodeDoesNotExist',
  NodeIsNotRectangle = 'NodeIsNotRectangle',
  NodeIsNotImage = 'NodeIsNotImage',
  NodeIsNotActive = 'NodeIsNotActive',
  NodeIsAlreadyDeleted = 'NodeIsAlreadyDeleted',
  NodeIsNotLocked = 'NodeIsNotLocked'
}

export class NodeAlreadyExist extends Error {
  readonly type = DocumentErrorType.NodeAlreadyExist
  constructor(readonly uuid: NodeUuid) {
    super(`Node with uuid ${uuid} already exists.`)
  }
}

export class NodeDoesNotExist extends Error {
  readonly type = DocumentErrorType.NodeDoesNotExist
  constructor(readonly uuid: NodeUuid) {
    super(`Node with uuid ${uuid} does not exist.`)
  }
}

export class NodeIsNotRectangle extends Error {
  readonly type = DocumentErrorType.NodeIsNotRectangle
  constructor(readonly uuid: NodeUuid) {
    super(`Node with uuid ${uuid} is not a rectangle.`)
  }
}

export class NodeIsNotImage extends Error {
  readonly type = DocumentErrorType.NodeIsNotImage
  constructor(readonly uuid: NodeUuid) {
    super(`Node with uuid ${uuid} is not an image.`)
  }
}

export class NodeIsNotActive extends Error {
  readonly type = DocumentErrorType.NodeIsNotActive
  constructor(readonly uuid: NodeUuid) {
    super(`Node with uuid ${uuid} is not active.`)
  }
}

export class NodeIsAlreadyDeleted extends Error {
  readonly type = DocumentErrorType.NodeIsAlreadyDeleted
  constructor(readonly uuid: NodeUuid) {
    super(`Node with uuid ${uuid} is already deleted.`)
  }
}

export class NodeIsNotLocked extends Error {
  readonly type = DocumentErrorType.NodeIsNotLocked
  constructor(readonly uuid: NodeUuid) {
    super(`Node with uuid ${uuid} is not locked.`)
  }
}

export type DocumentError =
  | NodeAlreadyExist
  | NodeDoesNotExist
  | NodeIsNotRectangle
  | NodeIsNotImage
  | NodeIsNotActive
  | NodeIsNotLocked
