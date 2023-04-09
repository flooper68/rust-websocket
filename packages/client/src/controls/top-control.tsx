import { useCallback, useEffect, useState } from 'react'
import { BsBoundingBoxCircles, BsBug } from 'react-icons/bs'
import { FaImage, FaRedo, FaUndo } from 'react-icons/fa'
import { v4 } from 'uuid'

import {
  CreateImage,
  CreateRectangle,
  RedoClientCommand,
  SessionEventType,
  UndoClientCommand
} from '@shared/immutable-domain'
import { CLIENT_UUID, WsClient } from '../client/ws-client'
import { COLLECT_DATA } from '../dev-tools/dev-tools'
import { getRandomColor } from '@shared/common'

export function TopControl(props: {
  openDevTools: () => void
  client: WsClient
}) {
  const { openDevTools, client } = props

  const [undoEnabled, setUndoEnabled] = useState(false)
  const [redoEnabled, setRedoEnabled] = useState(false)

  const undo = useCallback(() => {
    client.dispatch(new UndoClientCommand({ clientUuid: CLIENT_UUID }))
  }, [client])

  const redo = useCallback(() => {
    client.dispatch(new RedoClientCommand({ clientUuid: CLIENT_UUID }))
  }, [client])

  const createRectangle = useCallback(() => {
    client.dispatch(
      new CreateRectangle({
        uuid: v4(),
        clientUuid: CLIENT_UUID,
        fill: getRandomColor()
      })
    )
  }, [client])

  const createImage = useCallback(() => {
    client.dispatch(new CreateImage({ uuid: v4(), clientUuid: CLIENT_UUID }))
  }, [client])

  useEffect(() => {
    const sub = client.domainStream$.subscribe((e) => {
      switch (e.type) {
        case SessionEventType.LastClientCommandUndone:
        case SessionEventType.LastClientCommandUndoSkipped:
        case SessionEventType.LastClientCommandRedone:
        case SessionEventType.LastClientCommandRedoSkipped:
        case SessionEventType.ClientCommandAddedToHistory: {
          const connectedClient = client.getState().session.clients[CLIENT_UUID]

          setUndoEnabled(connectedClient.undoStack.length > 0)
          setRedoEnabled(connectedClient.redoStack.length > 0)
        }
      }
    })

    return () => {
      sub.unsubscribe()
    }
  }, [client])

  return (
    <div className="top-panel">
      <div className="top-panel-controls top-panel-section shadow">
        <button className="icon-btn" onClick={undo} disabled={!undoEnabled}>
          <FaUndo />
        </button>
        <button className="icon-btn" onClick={redo} disabled={!redoEnabled}>
          <FaRedo />
        </button>
        <span className="divider" />
        <button onClick={createRectangle} className="icon-btn">
          <BsBoundingBoxCircles />
        </button>
        <button onClick={createImage} className="icon-btn">
          <FaImage />
        </button>
      </div>

      <div className="top-panel-right top-panel-section shadow">
        {COLLECT_DATA && (
          <button className="icon-btn" onClick={openDevTools}>
            <BsBug />
          </button>
        )}
      </div>
    </div>
  )
}
