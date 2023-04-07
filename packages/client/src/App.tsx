import { useEffect, useState } from 'react'

import { TopControl } from './controls/top-control'
import { WsClient } from './client/ws-client'
import { DevTools } from './dev-tools/dev-tools'
import { Canvas } from './canvas/canvas'
import { NodeDetail } from './controls/node-detail'

const wsClient = new WsClient()

export function App() {
  const [open, setOpen] = useState(false)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const sub = wsClient.connectionStream$.subscribe((connected) => {
      setConnected(connected)
    })

    return () => {
      sub.unsubscribe()
    }
  }, [])

  if (!connected) {
    return <div>Connecting...</div>
  }

  return (
    <>
      <Canvas client={wsClient} />
      <TopControl openDevTools={() => setOpen(true)} client={wsClient} />
      <NodeDetail client={wsClient} />
      <DevTools open={open} onClose={() => setOpen(false)} client={wsClient} />
    </>
  )
}
