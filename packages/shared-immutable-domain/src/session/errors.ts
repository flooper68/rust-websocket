import { ClientUuid } from './types.js'

export enum SessionErrorType {
  ClientAlreadyExists = 'ClientAlreadyExists',
  ClientIsNotConnected = 'ClientIsNotConnected',
  ClientIsAlreadyDragging = 'ClientIsAlreadyDragging',
  ClientIsNotDragging = 'ClientIsNotDragging'
}

export class ClientAlreadyExists extends Error {
  readonly type = SessionErrorType.ClientAlreadyExists
  constructor(readonly uuid: ClientUuid) {
    super(`Client with uuid ${uuid} already exists.`)
  }
}

export class ClientIsNotConnected extends Error {
  readonly type = SessionErrorType.ClientIsNotConnected
  constructor(readonly uuid: ClientUuid) {
    super(`Client with uuid ${uuid} is not connected.`)
  }
}

export class ClientIsAlreadyDragging extends Error {
  readonly type = SessionErrorType.ClientIsAlreadyDragging
  constructor(readonly uuid: ClientUuid) {
    super(`Client with uuid ${uuid} is already dragging.`)
  }
}

export class ClientIsNotDragging extends Error {
  readonly type = SessionErrorType.ClientIsNotDragging
  constructor(readonly uuid: ClientUuid) {
    super(`Client with uuid ${uuid} is not dragging.`)
  }
}

export type SessionError =
  | ClientAlreadyExists
  | ClientIsNotConnected
  | ClientIsAlreadyDragging
  | ClientIsNotDragging
