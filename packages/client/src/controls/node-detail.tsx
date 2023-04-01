import {
  DeleteSelectedNodes,
  DomainEvent,
  DomainEventType,
  DomainSelectors,
  LockSelectedNodes,
  Node,
  NodeKind,
  SetSelectedRectanglesFill,
  UnlockSelectedNode
} from '@shared/domain'
import { useCallback, useEffect, useState } from 'react'
import { FaLock, FaTrashAlt, FaUnlock } from 'react-icons/fa'
import { v4 } from 'uuid'
import {
  $domainStream,
  CLIENT_UUID,
  dispatch,
  getSessionState
} from '../ws/use-ws'

function deleteNodes() {
  dispatch(
    new DeleteSelectedNodes(
      { clientUuid: CLIENT_UUID },
      {
        correlationUuid: v4()
      }
    )
  )
}

function lockNodes() {
  dispatch(
    new LockSelectedNodes(
      { clientUuid: CLIENT_UUID },
      {
        correlationUuid: v4()
      }
    )
  )
}

function unlockNodes() {
  dispatch(
    new UnlockSelectedNode(
      { clientUuid: CLIENT_UUID },
      {
        correlationUuid: v4()
      }
    )
  )
}

function setSelectedRectanglesFill(fill: string) {
  dispatch(
    new SetSelectedRectanglesFill(
      { fill, clientUuid: CLIENT_UUID },
      {
        correlationUuid: v4()
      }
    )
  )
}

export function NodeDetail() {
  const [assets, setAssets] = useState<Node[]>([])

  const handleEvent = useCallback((event: DomainEvent) => {
    switch (event.type) {
      case DomainEventType.RectangleCreated:
      case DomainEventType.ImageCreated:
      case DomainEventType.NodeDeleted:
      case DomainEventType.NodeUnlocked:
      case DomainEventType.NodeLocked:
      case DomainEventType.NodeSelected:
      case DomainEventType.NodeDeselected:
      case DomainEventType.RectangleFillSet: {
        setAssets(
          DomainSelectors.getActiveSelection(CLIENT_UUID, getSessionState())
        )
        break
      }
      case DomainEventType.ClientCommandAddedToHistory:
      case DomainEventType.LastClientCommandRedone:
      case DomainEventType.LastClientCommandRedoSkipped:
      case DomainEventType.LastClientCommandUndone:
      case DomainEventType.LastClientCommandUndoSkipped:
      case DomainEventType.ClientConnected:
      case DomainEventType.ClientDisconnected:
      case DomainEventType.NodeMoved:
      case DomainEventType.NodePositionSet:
      case DomainEventType.PositionDraggingStarted:
      case DomainEventType.NodeRestored:
      case DomainEventType.ClientCursorMoved: {
        break
      }
      default: {
        const check: never = event
        throw new Error('Unhandled event: ' + check)
      }
    }
  }, [])

  useEffect(() => {
    const sub = $domainStream.subscribe(handleEvent)

    return () => {
      sub.unsubscribe()
    }
  }, [])

  if (assets.length === 0) return null

  return (
    <div className="selection-panel shadow">
      <div>
        <h3>Node</h3>
        <div className="control-row">
          <button
            className="icon-btn outlined"
            onClick={lockNodes}
            data-toggled={assets.some((node) => node.locked) ? 'true' : 'false'}
          >
            <FaLock />
          </button>
          <button
            className="icon-btn outlined"
            onClick={unlockNodes}
            data-toggled={
              assets.some((node) => !node.locked) ? 'true' : 'false'
            }
          >
            <FaUnlock />
          </button>
          <button
            className="icon-btn outlined"
            disabled={assets.some((asset) => asset.locked)}
          >
            <FaTrashAlt onClick={deleteNodes} />
          </button>
        </div>
      </div>
      {assets.every((node) => node.kind === NodeKind.Rectangle) && (
        <div>
          <h3>Rectangle</h3>
          <div className="control-row">
            <input
              type="color"
              disabled={assets.some((asset) => asset.locked)}
              value={assets.reduce((memo, value, index) => {
                if (value.kind !== NodeKind.Rectangle) {
                  return memo
                }

                if (index === 0) {
                  return value.rectangleMetadata.fill
                }
                if (value.rectangleMetadata.fill === memo) {
                  return memo
                }

                return '#000000'
              }, '#000000')}
              onChange={(e) => {
                setSelectedRectanglesFill(e.target.value)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
