import { ResultValidationError } from '../common/result'
import { ClientUuid, NodeUuid } from './domain-types'

export enum DomainErrorType {
  DomainStateNotInitialized = 'DomainStateNotInitialized',
  DimensionNotPositive = 'DimensionNotPositive',
  ClientAlreadyConnected = 'ClientAlreadyConnected',
  ClientNotConnected = 'ClientNotConnected',
  NodeAlreadyExists = 'NodeAlreadyExists',
  NodeDoesNotExist = 'NodeDoesNotExist',
  NodeIsNotActive = 'NodeIsNotActive',
  NoteIsSelectedByOtherClient = 'NoteIsSelected'
}

export class DomainStateNotInitialized extends Error {
  readonly type = DomainErrorType.DomainStateNotInitialized
  constructor() {
    super('Domain state is not initialized. You can not perform any commands.')
  }
}

export class ClientAlreadyConnected extends Error {
  readonly type = DomainErrorType.ClientAlreadyConnected
  constructor(readonly uuid: ClientUuid) {
    super(`Client ${uuid} is already connected.`)
  }
}

export class ClientNotConnected extends Error {
  readonly type = DomainErrorType.ClientNotConnected
  constructor(readonly uuid: ClientUuid) {
    super(`Client ${uuid} is not connected.`)
  }
}

export class NodeAlreadyExists extends Error {
  readonly type = DomainErrorType.NodeAlreadyExists
  constructor(readonly uuid: NodeUuid) {
    super(`Node ${uuid} already exists.`)
  }
}

export class NodeDoesNotExist extends Error {
  readonly type = DomainErrorType.NodeDoesNotExist
  constructor(readonly uuid: NodeUuid) {
    super(`Node ${uuid} does not exist.`)
  }
}

export class NodeIsNotActive extends Error {
  readonly type = DomainErrorType.NodeIsNotActive
  constructor(readonly uuid: NodeUuid) {
    super(`Node ${uuid} is not active.`)
  }
}

export class NodeIsSelectedByOtherClient extends Error {
  readonly type = DomainErrorType.NoteIsSelectedByOtherClient
  constructor(readonly uuid: NodeUuid, readonly clientUuid: ClientUuid) {
    super(`Node ${uuid} is already selected by client ${clientUuid}.`)
  }
}

export type DomainError =
  | ClientAlreadyConnected
  | ClientNotConnected
  | NodeAlreadyExists
  | NodeDoesNotExist
  | NodeIsNotActive
  | NodeIsSelectedByOtherClient
  | ResultValidationError<
      NodeDoesNotExist | NodeIsNotActive | NodeIsSelectedByOtherClient
    >
