import { DomainState } from '../domain/domain-types.js'

export const InitialStateSentType = 'InitialStateSent'

export class InitialStateSent {
  readonly type = InitialStateSentType
  constructor(public readonly payload: DomainState) {}
}
