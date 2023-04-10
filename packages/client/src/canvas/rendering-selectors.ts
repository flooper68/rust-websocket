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

  const draggingOffset =
    client != null ? state.session.clientDragging[client.uuid].dragging : null

  return {
    left: left + (draggingOffset?.left ?? 0),
    top: top + (draggingOffset?.top ?? 0),
    width: right - left,
    height: bottom - top,
    color: client.color
  }
}

export const RenderingSelectors = {
  getClientBoundingBox
}
