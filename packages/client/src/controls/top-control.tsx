import { v4 } from 'uuid'
import { useEffect, useState } from 'react'
import { BsBoundingBoxCircles, BsBug } from 'react-icons/bs'
import { FaUndo, FaRedo, FaImage } from 'react-icons/fa'

import {
  CreateRectangle,
  CreateImage,
  DomainSelectors,
  ConnectedClient,
  DomainEventType,
  UndoLastClientCommand,
  RedoLastClientCommand,
  Uuid
} from '@shared/domain'
import { $domainStream, dispatch, getSessionState } from '../ws/use-ws'
import { CLIENT_UUID } from '../ws/use-ws'
import { COLLECT_DATA } from '../dev-tools/dev-tools'

function createRectangle() {
  dispatch(
    new CreateRectangle(
      {
        uuid: Uuid(v4()),
        left: 10,
        top: 10,
        width: 100,
        height: 80,
        fill: '#00ee00',
        clientUuid: CLIENT_UUID
      },
      {
        correlationUuid: v4()
      }
    )
  )
}

function createImage() {
  dispatch(
    new CreateImage(
      {
        uuid: Uuid(v4()),
        left: 10,
        top: 10,
        width: 599 / 4,
        height: 564 / 4,
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/The_death.png/564px-The_death.png',
        clientUuid: CLIENT_UUID
      },
      {
        correlationUuid: v4()
      }
    )
  )
}

function undo() {
  dispatch(
    new UndoLastClientCommand(
      {
        clientUuid: CLIENT_UUID
      },
      {
        correlationUuid: v4()
      }
    )
  )
}

function redo() {
  dispatch(
    new RedoLastClientCommand(
      {
        clientUuid: CLIENT_UUID
      },
      {
        correlationUuid: v4()
      }
    )
  )
}

export function TopControl(props: { openDevTools: () => void }) {
  const { openDevTools } = props

  const [connectedClients, setConnectedClients] = useState<ConnectedClient[]>(
    []
  )

  useEffect(() => {
    const sub = $domainStream.subscribe((event) => {
      switch (event.type) {
        case DomainEventType.ClientConnected:
        case DomainEventType.ClientDisconnected: {
          setConnectedClients(
            DomainSelectors.getConnectedClients(getSessionState())
          )
        }
      }
    })

    return () => sub.unsubscribe()
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
