import { noop } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { ConnectClient, DisconnectClient } from './commands'
import { Domain } from './domain'
import { ClientColor, ClientName, ClientUuid } from './domain-types'
import { DomainErrorType } from './errors'

describe('Domain', () => {
  it('should mark domain as not initialized as default', () => {
    const domain = new Domain(noop)

    const result = domain.handle(
      new DisconnectClient(
        {
          uuid: ClientUuid('123')
        },
        {
          correlationUuid: '123'
        }
      )
    )

    expect(result.unwrapErr().type).toBe(
      DomainErrorType.DomainStateNotInitialized
    )
  })

  it('should call onError callback on command handling error', () => {
    const mock = vi.fn()
    const domain = new Domain(mock)

    domain.handle(
      new DisconnectClient(
        {
          uuid: ClientUuid('123')
        },
        {
          correlationUuid: '123'
        }
      )
    )

    expect(mock).toBeCalledTimes(1)
  })

  it('initialize should enable command handling', () => {
    const domain = new Domain(noop)

    domain.initialize({
      connections: {},
      nodes: {}
    })

    const result = domain.handle(
      new ConnectClient(
        {
          uuid: ClientUuid('123'),
          name: ClientName('John Doe'),
          color: ClientColor('#000000')
        },
        {
          correlationUuid: '123'
        }
      )
    )

    expect(result.isOk()).toBe(true)
  })

  it('command error should mark Domain as not initialized', () => {
    const domain = new Domain(noop)

    domain.initialize({
      connections: {},
      nodes: {}
    })

    domain.handle(
      new DisconnectClient(
        {
          uuid: ClientUuid('123')
        },
        {
          correlationUuid: '123'
        }
      )
    )

    const result = domain.handle(
      new ConnectClient(
        {
          uuid: ClientUuid('123'),
          name: ClientName('John Doe'),
          color: ClientColor('#000000')
        },
        {
          correlationUuid: '123'
        }
      )
    )

    expect(result.unwrapErr().type).toBe(
      DomainErrorType.DomainStateNotInitialized
    )
  })
})
