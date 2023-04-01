import { DomainState, DomainSelectors } from '@shared/domain'

export interface BoundingBoxRectangle {
  left: number
  top: number
  width: number
  height: number
  color: string
}

function getBoundingBoxes(state: DomainState) {
  const clients = DomainSelectors.getConnectedClients(state)

  return clients.map((client) => {
    const selectedNodes = DomainSelectors.getActiveSelection(client.uuid, state)

    if (selectedNodes.length === 0) {
      return {
        clientUuid: client.uuid,
        draw: false
      } as const
    }

    const left =
      Math.min(...selectedNodes.map((node) => node.position.left)) - 2
    const top = Math.min(...selectedNodes.map((node) => node.position.top)) - 2
    const right =
      Math.max(
        ...selectedNodes.map(
          (node) => node.position.left + node.dimensions.width
        )
      ) + 2
    const bottom =
      Math.max(
        ...selectedNodes.map(
          (node) => node.position.top + node.dimensions.height
        )
      ) + 2

    return {
      left,
      top,
      width: right - left,
      height: bottom - top,
      color: client.color,
      clientUuid: client.uuid,
      draw: true
    } as const
  })
}

function getClientBoundingBox(
  clientUuid: string,
  state: DomainState
): BoundingBoxRectangle | null {
  const client = DomainSelectors.getClient(clientUuid, state)

  if (client == null) {
    return null
  }

  const selectedNodes = DomainSelectors.getActiveSelection(client.uuid, state)

  if (selectedNodes.length === 0) {
    return null
  }

  const left = Math.min(...selectedNodes.map((node) => node.position.left))
  const top = Math.min(...selectedNodes.map((node) => node.position.top))
  const right = Math.max(
    ...selectedNodes.map((node) => node.position.left + node.dimensions.width)
  )
  const bottom = Math.max(
    ...selectedNodes.map((node) => node.position.top + node.dimensions.height)
  )

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
    color: client.color
  }
}

export const RenderingSelectors = {
  getBoundingBoxes,
  getClientBoundingBox
}
