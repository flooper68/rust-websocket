import {
  DocumentSessionState,
  SessionSelectors
} from '@shared/immutable-domain'

export interface BoundingBoxRectangle {
  left: number
  top: number
  width: number
  height: number
  color: string
}

function getBoundingBoxes(state: DocumentSessionState) {
  const clients = Object.values(state.session.clients)

  return clients.map((client) => {
    const selectedNodes = SessionSelectors.getClientActiveSelection(
      client.uuid,
      state
    )

    if (selectedNodes.length === 0) {
      return {
        clientUuid: client.uuid,
        draw: false
      } as const
    }

    const left = Math.min(...selectedNodes.map((node) => node.left)) - 2
    const top = Math.min(...selectedNodes.map((node) => node.top)) - 2
    const right =
      Math.max(...selectedNodes.map((node) => node.left + node.width)) + 2
    const bottom =
      Math.max(...selectedNodes.map((node) => node.top + node.height)) + 2

    return {
      left,
      top,
      width: right - left,
      height: bottom - top,
      color: '#ffffff',
      clientUuid: client.uuid,
      draw: true
    } as const
  })
}

function getClientBoundingBox(
  clientUuid: string,
  state: DocumentSessionState
): BoundingBoxRectangle | null {
  const client = state.session.clients[clientUuid]

  if (client == null) {
    return null
  }

  const selectedNodes = SessionSelectors.getClientActiveSelection(
    client.uuid,
    state
  )

  if (selectedNodes.length === 0) {
    return null
  }

  const left = Math.min(...selectedNodes.map((node) => node.left))
  const top = Math.min(...selectedNodes.map((node) => node.top))
  const right = Math.max(...selectedNodes.map((node) => node.left + node.width))
  const bottom = Math.max(
    ...selectedNodes.map((node) => node.top + node.height)
  )

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
    color: '#ffffff'
  }
}

export const RenderingSelectors = {
  getBoundingBoxes,
  getClientBoundingBox
}
