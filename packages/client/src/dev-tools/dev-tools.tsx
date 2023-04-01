import { DomainEvent, DomainEventType } from '@shared/domain'
import { useEffect, useState } from 'react'
import { JsonViewer } from '@textea/json-viewer'
import { BsBug } from 'react-icons/bs'
import { $domainStream } from '../ws/use-ws'

export const COLLECT_DATA = true

export function DevTools(props: { open: boolean; onClose: () => void }) {
  const { open, onClose } = props

  const [events, setEvents] = useState<DomainEvent[]>([])

  useEffect(() => {
    if (!COLLECT_DATA) {
      return
    }

    const subscription = $domainStream.subscribe((event) => {
      if (event.type == DomainEventType.ClientCursorMoved) {
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
