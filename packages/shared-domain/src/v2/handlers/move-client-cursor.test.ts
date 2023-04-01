import { noop } from 'rxjs'
import { describe, expect, it } from 'vitest'
import { MoveClientCursor } from '../commands'
import { Domain } from '../domain'
import { ClientUuid, PositionValue } from '../domain-types'
import { DomainErrorType } from '../errors'
import { DomainEvent, DomainEventType } from '../events'
import { getConnectedClientFixture } from '../fixtures'

const getCommand = () => {
  return new MoveClientCursor(
    {
      uuid: ClientUuid('123'),
      left: PositionValue(100),
      top: PositionValue(100)
    },
    {
      correlationUuid: '123'
    }
  )
}

describe('moveClientCursor Command', () => {
  it('should move client cursor', () => {
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

    expect(
      domain.getState().connections[command.payload.uuid]?.cursor.left
    ).toBe(100)
    expect(
      domain.getState().connections[command.payload.uuid]?.cursor.top
    ).toBe(100)
  })

  it('should emit ClientCursorMoved', () => {
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
    expect(events[0]?.type).toBe(DomainEventType.ClientCursorMoved)
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
