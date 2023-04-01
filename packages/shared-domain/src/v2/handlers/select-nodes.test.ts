import { noop } from 'rxjs'
import { describe, expect, it } from 'vitest'
import { Option } from '../../common/option'
import { isValidationError } from '../../common/result'
import { SelectNodes } from '../commands'
import { Domain } from '../domain'
import { ClientUuid, NodeUuid } from '../domain-types'
import { DomainErrorType } from '../errors'
import { getConnectedClientFixture, getRectangleFixture } from '../fixtures'

const nodeUuid1 = NodeUuid('node-uuid-1')
const nodeUuid2 = NodeUuid('node-uuid-2')

const clientUuid1 = ClientUuid('client-uuid-1')
const clientUuid2 = ClientUuid('client-uuid-2')

const getCommand = () => {
  return new SelectNodes(
    {
      nodes: [nodeUuid1, nodeUuid2],
      clientUuid: clientUuid1
    },
    {
      correlationUuid: '123'
    }
  )
}

describe('selectNodes Command', () => {
  it('should select given nodes', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [command.payload.clientUuid]: getConnectedClientFixture({
          uuid: command.payload.clientUuid
        })
      },
      nodes: {
        [nodeUuid1]: getRectangleFixture({
          uuid: nodeUuid1
        }),
        [nodeUuid2]: getRectangleFixture({
          uuid: nodeUuid2
        })
      }
    })

    const result = domain.handle(command)

    expect(result.isOk()).toBe(true)
    expect(domain.getState().nodes[nodeUuid1]?.base.selectedBy).toEqual(
      Option.Some(command.payload.clientUuid)
    )
    expect(domain.getState().nodes[nodeUuid2]?.base.selectedBy).toEqual(
      Option.Some(command.payload.clientUuid)
    )
  })

  it('should select given nodes, even if previously selected by the same client', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [command.payload.clientUuid]: getConnectedClientFixture({
          uuid: command.payload.clientUuid
        })
      },
      nodes: {
        [nodeUuid1]: getRectangleFixture({
          uuid: nodeUuid1
        }),
        [nodeUuid2]: getRectangleFixture({
          uuid: nodeUuid2,
          selectedBy: Option.Some(clientUuid1)
        })
      }
    })

    const result = domain.handle(command)

    expect(result.isOk()).toBe(true)
    expect(domain.getState().nodes[nodeUuid1]?.base.selectedBy).toEqual(
      Option.Some(command.payload.clientUuid)
    )
    expect(domain.getState().nodes[nodeUuid2]?.base.selectedBy).toEqual(
      Option.Some(command.payload.clientUuid)
    )
  })

  it('should deselect all other nodes of a client', () => {
    const command = getCommand()
    const domain = new Domain(noop)
    const otherNodeUuid = NodeUuid('other-uuid')

    domain.initialize({
      connections: {
        [command.payload.clientUuid]: getConnectedClientFixture({
          uuid: command.payload.clientUuid
        })
      },
      nodes: {
        [nodeUuid1]: getRectangleFixture({
          uuid: nodeUuid1
        }),
        [nodeUuid2]: getRectangleFixture({
          uuid: nodeUuid2
        }),
        [otherNodeUuid]: getRectangleFixture({
          uuid: otherNodeUuid,
          selectedBy: Option.Some(clientUuid1)
        })
      }
    })

    const result = domain.handle(command)

    expect(result.isOk()).toBe(true)
    expect(domain.getState().nodes[otherNodeUuid]?.base.selectedBy).toEqual(
      Option.None()
    )
  })

  it('should return NodeDoesNotExist if the given node does not exist', () => {
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

    const result = domain.handle(command)

    const error = result.unwrapErr()

    if (!isValidationError(error)) {
      throw new Error('Expected error to be a validation error')
    }

    expect(error.errors[0]?.type).toBe(DomainErrorType.NodeDoesNotExist)
  })

  it('should return NodeIsNotActive if the given node is deleted', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [command.payload.clientUuid]: getConnectedClientFixture({
          uuid: command.payload.clientUuid
        })
      },
      nodes: {
        [nodeUuid1]: getRectangleFixture({
          uuid: nodeUuid1,
          deleted: true
        }),
        [nodeUuid2]: getRectangleFixture({
          uuid: nodeUuid2
        })
      }
    })

    const result = domain.handle(command)

    const error = result.unwrapErr()

    if (!isValidationError(error)) {
      throw new Error('Expected error to be a validation error')
    }

    expect(error.errors[0]?.type).toBe(DomainErrorType.NodeIsNotActive)
  })

  it('should return NodeIsSelected if the given node is already selected by different client', () => {
    const command = getCommand()
    const domain = new Domain(noop)

    domain.initialize({
      connections: {
        [clientUuid1]: getConnectedClientFixture({
          uuid: clientUuid1
        }),
        [clientUuid2]: getConnectedClientFixture({
          uuid: clientUuid2
        })
      },
      nodes: {
        [nodeUuid1]: getRectangleFixture({
          uuid: nodeUuid1,
          selectedBy: Option.Some(clientUuid2)
        }),
        [nodeUuid2]: getRectangleFixture({
          uuid: nodeUuid2
        })
      }
    })

    const result = domain.handle(command)

    const error = result.unwrapErr()

    if (!isValidationError(error)) {
      throw new Error('Expected error to be a validation error')
    }

    expect(error.errors[0]?.type).toBe(
      DomainErrorType.NoteIsSelectedByOtherClient
    )
  })
})
