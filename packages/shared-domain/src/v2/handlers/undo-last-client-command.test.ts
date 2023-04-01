import { noop } from 'rxjs'
import { describe, expect, it } from 'vitest'
import { CreateRectangle, UndoLastClientCommand } from '../commands'
import { Domain } from '../domain'
import { ClientUuid, NodeUuid } from '../domain-types'
import { DomainErrorType } from '../errors'
import { DomainEvent, DomainEventType } from '../events'
import { getConnectedClientFixture } from '../fixtures'

const getCreateRectangleCommand = () => {
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

const getLastClientUndoCommand = () => {
  return new UndoLastClientCommand(
    {
      uuid: ClientUuid('123')
    },
    {
      correlationUuid: '123'
    }
  )
}

describe('undoLastClient Command', () => {
  it('should emit undo events from the last command', () => {
    const createCommand = getCreateRectangleCommand()
    const undoCommand = getLastClientUndoCommand()

    const domain = new Domain(noop)

    const events: DomainEvent[] = []

    domain.initialize({
      connections: {
        [createCommand.payload.uuid]: getConnectedClientFixture({
          uuid: createCommand.payload.clientUuid
        })
      },
      nodes: {}
    })

    domain.handle(createCommand)

    const sub = domain.getObservable().subscribe((event) => {
      events.push(event)
    })

    const result = domain.handle(undoCommand)

    sub.unsubscribe()

    expect(result.isOk()).toBe(true)
    expect(events.length).toBe(1)
    expect(events[0]?.type).toBe(DomainEventType.LastClientCommandUndone)
    expect(
      domain.getState().nodes[createCommand.payload.uuid]?.base.deleted
    ).toBe(true)
  })

  it('should be noop if there is no command to undo', () => {
    const undoCommand = getLastClientUndoCommand()

    const domain = new Domain(noop)

    const events: DomainEvent[] = []

    domain.initialize({
      connections: {
        [undoCommand.payload.uuid]: getConnectedClientFixture({
          uuid: undoCommand.payload.uuid
        })
      },
      nodes: {}
    })

    const sub = domain.getObservable().subscribe((event) => {
      events.push(event)
    })

    const result = domain.handle(undoCommand)

    sub.unsubscribe()

    expect(result.isOk()).toBe(true)
    expect(events.length).toBe(0)
  })

  it('should return ClientNotConnected for nonexisting connection', () => {
    const undoCommand = getLastClientUndoCommand()

    const domain = new Domain(noop)

    domain.initialize({
      connections: {},
      nodes: {}
    })

    const result = domain.handle(undoCommand)

    expect(result.unwrapErr().type).toBe(DomainErrorType.ClientNotConnected)
  })
})
