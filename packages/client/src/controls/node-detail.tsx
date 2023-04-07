import {
  DeleteSelection,
  DocumentEventType,
  DocumentSessionEvent,
  LockSelection,
  Node,
  NodeKind,
  NodeStatus,
  SessionEventType,
  SessionSelectors,
  SetRectangleSelectionFill,
  UnlockSelection
} from '@shared/immutable-domain'
import { useCallback, useEffect, useState } from 'react'
import { FaLock, FaTrashAlt, FaUnlock } from 'react-icons/fa'
import { CLIENT_UUID, WsClient } from '../client/ws-client'

export function NodeDetail(props: { client: WsClient }) {
  const { client } = props

  const [assets, setAssets] = useState<Node[]>([])

  const handleEvent = useCallback((event: DocumentSessionEvent) => {
    switch (event.type) {
      case DocumentEventType.NodeLocked:
      case DocumentEventType.NodeUnlocked:
      case DocumentEventType.NodeDeleted:
      case DocumentEventType.NodeFillSet:
      case DocumentEventType.NodeUrlSet:
      case SessionEventType.NodesSelected: {
        setAssets(
          SessionSelectors.getClientSelection(CLIENT_UUID, client.getState())
        )
        break
      }
    }
  }, [])

  const lockNodes = useCallback(() => {
    client.dispatch(
      new LockSelection({
        clientUuid: CLIENT_UUID
      })
    )
  }, [client])

  const unlockNodes = useCallback(() => {
    client.dispatch(
      new UnlockSelection({
        clientUuid: CLIENT_UUID
      })
    )
  }, [client])

  const deleteNodes = useCallback(() => {
    client.dispatch(
      new DeleteSelection({
        clientUuid: CLIENT_UUID
      })
    )
  }, [client])

  const setSelectedRectanglesFill = useCallback((fill: string) => {
    client.dispatch(
      new SetRectangleSelectionFill({
        clientUuid: CLIENT_UUID,
        fill
      })
    )
  }, [])

  useEffect(() => {
    const sub = client.domainStream$.subscribe(handleEvent)

    return () => {
      sub.unsubscribe()
    }
  }, [client])

  if (assets.length === 0) return null

  return (
    <div className="selection-panel shadow">
      <div>
        <h3>Node</h3>
        <div className="control-row">
          <button
            className="icon-btn outlined"
            onClick={lockNodes}
            data-toggled={
              assets.some((node) => node.status === NodeStatus.Locked)
                ? 'true'
                : 'false'
            }
          >
            <FaLock />
          </button>
          <button
            className="icon-btn outlined"
            onClick={unlockNodes}
            data-toggled={
              assets.some((node) => node.status !== NodeStatus.Locked)
                ? 'true'
                : 'false'
            }
          >
            <FaUnlock />
          </button>
          <button
            className="icon-btn outlined"
            disabled={assets.some((node) => node.status === NodeStatus.Locked)}
            onClick={deleteNodes}
          >
            <FaTrashAlt />
          </button>
        </div>
      </div>
      {assets.every((node) => node.kind === NodeKind.Rectangle) && (
        <div>
          <h3>Rectangle</h3>
          <div className="control-row">
            <input
              type="color"
              disabled={assets.some(
                (asset) => asset.status === NodeStatus.Locked
              )}
              value={assets.reduce((memo, value, index) => {
                if (value.kind !== NodeKind.Rectangle) {
                  return memo
                }

                if (index === 0) {
                  return value.fill
                }
                if (value.fill === memo) {
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
