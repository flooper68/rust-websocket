import { noop } from 'rxjs'
import { describe, expect, it } from 'vitest'
import { Option } from '../../common/option'
import { CreateRectangle } from '../commands'
import { Domain } from '../domain'
import { ClientUuid, NodeUuid } from '../domain-types'
import { DomainErrorType } from '../errors'
import { DomainEvent, DomainEventType } from '../events'
import { getConnectedClientFixture, getRectangleFixture } from '../fixtures'
import { DomainSelectors } from '../selectors'

const getCommand = () => {
  return new CreateRectangle(
    {
      uuid: NodeUuid('123'),
      clientUuid: ClientUuid('123')
    },
    {
      correlationUuid: '123'
    }
  )
}

describe('createRectangle Command', () => {
  it('should add new rectangle', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [command.payload.clientUuid]: getConnectedClientFixture({
          uuid: command.payload.clientUuid
        })
      },
      nodes: {}
    })

    domain.handle(command)

    expect(domain.getState().nodes[command.payload.uuid]).toBeDefined()
  })

  it('should select new rectangle', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [command.payload.clientUuid]: getConnectedClientFixture({
          uuid: command.payload.clientUuid
        })
      },
      nodes: {}
    })

    domain.handle(command)

    const selection = DomainSelectors.getActiveClientSelection(
      command.payload.clientUuid,
      domain.getState()
    )

    expect(selection.length).toBe(1)
    expect(selection?.[0]?.uuid).toBe(command.payload.uuid)
  })

  it('should select new rectangle', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [command.payload.clientUuid]: getConnectedClientFixture({
          uuid: command.payload.clientUuid
        })
      },
      nodes: {
        [NodeUuid('other-uuid')]: getRectangleFixture({
          uuid: NodeUuid('other-uuid'),
          selectedBy: Option.Some(command.payload.clientUuid)
        })
      }
    })

    domain.handle(command)

    const selection = DomainSelectors.getActiveClientSelection(
      command.payload.clientUuid,
      domain.getState()
    )

    expect(selection.length).toBe(1)
    expect(selection?.[0]?.uuid).toBe(command.payload.uuid)
  })

  it('should emit RectangleCreated and ClientCommandAddedToHistory', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [command.payload.clientUuid]: getConnectedClientFixture({
          uuid: command.payload.clientUuid
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

    expect(events).toHaveLength(2)
    expect(events[0]?.type).toBe(DomainEventType.RectangleCreated)
    expect(events[1]?.type).toBe(DomainEventType.ClientCommandAddedToHistory)
  })

  it('should return NodeAlreadyExists if node already exists', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [command.payload.clientUuid]: getConnectedClientFixture({
          uuid: command.payload.clientUuid
        })
      },
      nodes: {
        [command.payload.uuid]: getRectangleFixture({
          uuid: command.payload.uuid
        })
      }
    })

    const result = domain.handle(command)

    expect(result.unwrapErr().type).toBe(DomainErrorType.NodeAlreadyExists)
  })

  it('should return ClientNotConnected if client is not connected', () => {
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
