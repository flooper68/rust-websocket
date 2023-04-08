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

function getClientBoundingBox(
  clientUuid: string,
  state: DocumentSessionState
): BoundingBoxRectangle | null {
  const client = state.session.clients[clientUuid]

  if (client == null) {
    return null
  }

  const selectedNodes = SessionSelectors.getClientNotDeletedSelection(
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

  const draggingOffset = client.dragging ?? { left: 0, top: 0 }

  return {
    left: left + draggingOffset.left,
    top: top + draggingOffset.top,
    width: right - left,
    height: bottom - top,
    color: client.color
  }
}

export const RenderingSelectors = {
  getClientBoundingBox
}
