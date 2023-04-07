import { useCallback } from 'react'
import { BsBoundingBoxCircles, BsBug } from 'react-icons/bs'
import { FaImage, FaRedo, FaUndo } from 'react-icons/fa'
import { v4 } from 'uuid'

import { CreateImage, CreateRectangle } from '@shared/immutable-domain'
import { CLIENT_UUID, WsClient } from '../client/ws-client'
import { COLLECT_DATA } from '../dev-tools/dev-tools'
import { getRandomColor } from '@shared/common'

export function TopControl(props: {
  openDevTools: () => void
  client: WsClient
}) {
  const { openDevTools, client } = props

  const undo = useCallback(() => {
    console.warn(`Not implemented`)
  }, [])

  const redo = useCallback(() => {
    console.warn(`Not implemented`)
  }, [])

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
  }, [])

  return (
    <div className="top-panel">
      <div className="top-panel-controls top-panel-section shadow">
        <button className="icon-btn" onClick={undo}>
          <FaUndo />
        </button>
        <button className="icon-btn" onClick={redo}>
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
