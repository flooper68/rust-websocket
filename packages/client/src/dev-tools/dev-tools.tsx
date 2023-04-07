import { useEffect, useState } from 'react'
import { JsonViewer } from '@textea/json-viewer'
import { BsBug } from 'react-icons/bs'
import {
  DocumentSessionEvent,
  SessionEventType
} from '@shared/immutable-domain'
import { WsClient } from '../client/ws-client'

export const COLLECT_DATA = true

export function DevTools(props: {
  open: boolean
  onClose: () => void
  client: WsClient
}) {
  const { open, onClose, client } = props

  const [events, setEvents] = useState<DocumentSessionEvent[]>([])

  useEffect(() => {
    if (!COLLECT_DATA) {
      return
    }
    const subscription = client.domainStream$.subscribe((event) => {
      if (event.type == SessionEventType.ClientCursorMoved) {
        return
      }
      setEvents((events) => [event, ...events].slice(0, 1000))
    })
    return () => subscription.unsubscribe()
  })

  return (
    <>
      {COLLECT_DATA && open && (
        <div className="dev-tools-container shadow">
          <h2>Dev Tools</h2>
          <button className="icon-btn dev-tools-close" onClick={onClose}>
            <BsBug />
          </button>
          <h4>Domain Events</h4>
          <ul>
            {events.map((event, index) => (
              <li key={index} className="event-row">
                <span>{event.type}</span>
                <div>
                  <JsonViewer value={event} defaultInspectDepth={0} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
