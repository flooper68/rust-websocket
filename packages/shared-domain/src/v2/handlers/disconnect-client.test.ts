import { noop } from 'rxjs'
import { describe, expect, it } from 'vitest'
import { DisconnectClient } from '../commands'
import { Domain } from '../domain'
import { ClientUuid } from '../domain-types'
import { DomainErrorType } from '../errors'
import { DomainEvent, DomainEventType } from '../events'
import { getConnectedClientFixture } from '../fixtures'

const getCommand = () => {
  return new DisconnectClient(
    {
      uuid: ClientUuid('123')
    },
    {
      correlationUuid: '123'
    }
  )
}

describe('disconnectClient Command', () => {
  it('should remove existing new client from the state', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [command.payload.uuid]: getConnectedClientFixture({
          uuid: command.payload.uuid
        })
      },
      nodes: {}
    })

    domain.handle(command)

    expect(domain.getState().connections[command.payload.uuid]).toBeUndefined()
  })

  it('should emit ClientDisconnected', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [command.payload.uuid]: getConnectedClientFixture({
          uuid: command.payload.uuid
        })
      },
      nodes: {}
    })

    const events: DomainEvent[] = []

    const sub = domain.getObservable().subscribe((event) => {
      events.push(event)
    })

    domain.handle(command)

    sub.unsubscribe()

    expect(events).toHaveLength(1)
    expect(events[0]?.type).toBe(DomainEventType.ClientDisconnected)
  })

  it('should return ClientNotConnected if client does not exist', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {},
      nodes: {}
    })

    const result = domain.handle(command)

    expect(result.unwrapErr().type).toBe(DomainErrorType.ClientNotConnected)
  })
})
