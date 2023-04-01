import { useState } from 'react'
import { Canvas } from './canvas/canvas'
import { NodeDetail } from './controls/node-detail'
import { TopControl } from './controls/top-control'
import { DevTools } from './dev-tools/dev-tools'

export function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Canvas />
      <TopControl openDevTools={() => setOpen(true)} />
      <NodeDetail />
      <DevTools open={open} onClose={() => setOpen(false)} />
    </>
  )
}
