import {
  DocumentSessionEvent,
  Node,
  NodeStatus,
  SessionEventType,
  SessionSelectors
} from '@shared/immutable-domain'
import { useCallback, useEffect, useState } from 'react'
import { FaLock, FaTrashAlt, FaUnlock } from 'react-icons/fa'
import { CLIENT_UUID, WsClient } from '../client/ws-client'

export function NodeDetail(props: { client: WsClient }) {
  const { client } = props

  const [assets, setAssets] = useState<Node[]>([])

  const handleEvent = useCallback((event: DocumentSessionEvent) => {
    switch (event.type) {
      case SessionEventType.NodesSelected: {
        setAssets(
          SessionSelectors.getClientActiveSelection(
            CLIENT_UUID,
            client.getState()
          )
        )
        break
      }
    }
  }, [])

  const lockNodes = useCallback(() => {
    console.warn(`Not implemented`)
  }, [])

  const unlockNodes = useCallback(() => {
    console.warn(`Not implemented`)
  }, [])

  const deleteNodes = useCallback(() => {
    console.warn(`Not implemented`)
  }, [])

  const setSelectedRectanglesFill = useCallback(() => {
    console.warn(`Not implemented`)
  }, [])

  useEffect(() => {
    const sub = client.domainStream$.subscribe(handleEvent)

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
          >
            <FaTrashAlt onClick={deleteNodes} />
          </button>
        </div>
      </div>
      {/* {assets.every((node) => node.kind === NodeKind.Rectangle) && (
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
                setSelectedRectanglesFill()
              }}
            />
          </div>
        </div>
      )} */}
    </div>
  )
}
