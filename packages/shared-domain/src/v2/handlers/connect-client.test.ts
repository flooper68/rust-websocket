import { Domain } from '../domain'
import { describe, expect, it } from 'vitest'
import { ConnectClient } from '../commands'
import { ClientColor, ClientName, ClientUuid } from '../domain-types'
import { DomainEvent, DomainEventType } from '../events'
import { noop } from 'rxjs'

const getCommand = () => {
  return new ConnectClient(
    {
      uuid: ClientUuid('123'),
      name: ClientName('John'),
      color: ClientColor('red')
    },
    {
      correlationUuid: '123'
    }
  )
}

describe('connectClient Command', () => {
  it('should add a new client to the state', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {},
      nodes: {}
    })

    domain.handle(command)

    expect(domain.getState().connections[command.payload.uuid]).toMatchObject({
      uuid: command.payload.uuid
    })
  })

  it('should emit ClientConnected', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {},
      nodes: {}
    })

    const events: DomainEvent[] = []

    const sub = domain.getObservable().subscribe((event) => {
      events.push(event)
    })

    domain.handle(command)

    sub.unsubscribe()

    expect(events).toHaveLength(1)
    expect(events[0]?.type).toBe(DomainEventType.ClientConnected)
  })
})
