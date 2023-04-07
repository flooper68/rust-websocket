import { ClientUuid } from './types.js'

export enum SessionErrorType {
  ClientAlreadyExists = 'ClientAlreadyExists',
  ClientIsNotConnected = 'ClientIsNotConnected'
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

export type SessionError = ClientAlreadyExists | ClientIsNotConnected
