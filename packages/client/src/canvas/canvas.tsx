import { DomainEventType, DomainState, NodeKind, Uuid } from '@shared/domain'
import { startMeasurement } from '@shared/domain/src/measure'
import { Application, settings as PIXISettings } from 'pixi.js'
import { useEffect, useRef } from 'react'
import { $domainStream, getSessionState } from '../ws/use-ws'
import { connectClient } from '../ws/use-ws'
import {
  CanvasBoundingBox,
  getBoundingBoxUuid
} from './components/canvas-bounding-box'
import { CanvasComponents } from './components/canvas-components'
import { CanvasCursor, getClientCursorUuid } from './components/canvas-cursor'
import { CanvasImage } from './components/canvas-image'
import { CanvasRectangle } from './components/canvas-rectangle'
import { CanvasStage } from './components/canvas-stage'
import { CanvasInteractions } from './core/canvas-interactions'

function createApplication(canvasContainer: HTMLElement) {
  const app = new Application({
    antialias: false,
    resolution: 5,
    autoDensity: true,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAlpha: 0
  })

  PIXISettings.RESOLUTION = 5

  canvasContainer.appendChild(app.view as any)
  app.stage.position.set(app.screen.width / 2, app.screen.height / 2)

  const canvasComponents: Record<string, CanvasComponents> = {}

  function addComponent(component: CanvasComponents) {
    canvasComponents[component.uuid] = component
  }

  const interactions = new CanvasInteractions(canvasComponents, app.stage)

  function initialize(state: DomainState) {
    console.log(`Initializing renderer with state:`, state)

    createStage()

    Object.values(state.connections).forEach((client) => {
      createCursor(client.uuid)
      createBoundingBox(client.uuid)
    })

    Object.values(state.nodes).forEach((node) => {
      if (node.deleted) {
        return
      }
      switch (node.kind) {
        case NodeKind.Rectangle: {
          createRectangle(node.uuid)
          break
        }
        case NodeKind.Image: {
          createImage(node.uuid)
          break
        }
        case NodeKind.Text: {
          console.error('Text not supported yet')
          break
        }
        default: {
          const _exhaustiveCheck: never = node
          throw new Error('Unexpected node: ' + _exhaustiveCheck)
        }
      }
    })

    interactions.initialize()
  }

  function zoomIn() {
    app.stage.pivot.set(
      app.stage.width / 2 + app.stage.position.x * app.stage.scale.x,
      app.stage.height / 2 + app.stage.position.y * app.stage.scale.y
    )
    app.stage.position.x = (app.stage.width / 2) * app.stage.scale.x
    app.stage.position.y = (app.stage.height / 2) * app.stage.scale.y
    app.stage.scale.set(app.stage.scale.x + 0.1, app.stage.scale.y + 0.1)
  }

  function zoomOut() {
    app.stage.pivot.set(
      app.stage.width / 2 + app.stage.position.x,
      app.stage.height / 2 + app.stage.position.y
    )
    app.stage.position.x = app.stage.width / 2
    app.stage.position.y = app.stage.height / 2
    app.stage.scale.set(app.stage.scale.x - 0.1, app.stage.scale.y - 0.1)
  }

  function createStage() {
    addComponent(CanvasStage.create(app.stage))
  }

  function createImage(uuid: Uuid) {
    addComponent(CanvasImage.create(uuid, app.stage))
  }

  function createRectangle(uuid: Uuid) {
    addComponent(CanvasRectangle.create(uuid, app.stage))
  }

  function createCursor(clientUuid: string) {
    addComponent(CanvasCursor.create(clientUuid, app.stage))
  }

  function createBoundingBox(clientUuid: string) {
    addComponent(CanvasBoundingBox.create(clientUuid, app.stage))
  }

  function renderComponent(uuid: string) {
    const component = canvasComponents[uuid]

    if (component == null) {
      throw new Error(
        `Can not render canvas component ${uuid}, no component found!`
      )
    }

    component.render()
  }

  function renderNode(uuid: Uuid) {
    renderComponent(uuid)
  }

  function renderClientCursor(clientUuid: string) {
    renderComponent(getClientCursorUuid(clientUuid))
  }

  function renderClientBoundingBox(clientUuid: string) {
    renderComponent(getBoundingBoxUuid(clientUuid))
  }

  return {
    initialize,
    createRectangle,
    createImage,
    createCursor,
    createBoundingBox,
    renderNode,
    renderClientCursor,
    renderClientBoundingBox,
    zoomIn,
    zoomOut
  }
}

export type ApplicationClient = ReturnType<typeof createApplication>

let canvasInitialized = false

export function Canvas() {
  const canvasRef = useRef<null | HTMLDivElement>(null)

  useEffect(() => {
    if (canvasRef.current == null) {
      return
    }

    if (canvasInitialized) {
      return
    }

    canvasInitialized = true

    console.log(`Initializing canvas.`)

    const app = createApplication(canvasRef.current)

    $domainStream.subscribe((event) => {
      const measure = startMeasurement(`Rendering event ${event.type}`)

      switch (event.type) {
        case DomainEventType.RectangleCreated: {
          app.createRectangle(event.payload.uuid)
          break
        }
        case DomainEventType.ImageCreated: {
          app.createImage(event.payload.uuid)
          break
        }
        case DomainEventType.ClientConnected: {
          app.createCursor(event.payload.uuid)
          app.createBoundingBox(event.payload.uuid)
          break
        }
        case DomainEventType.ClientCursorMoved: {
          app.renderClientCursor(event.payload.clientUuid)
          break
        }
        case DomainEventType.ClientDisconnected: {
          app.renderClientCursor(event.payload.uuid)
          app.renderClientBoundingBox(event.payload.uuid)
          break
        }
        case DomainEventType.NodeDeselected:
        case DomainEventType.NodeSelected: {
          app.renderClientBoundingBox(event.payload.clientUuid)
          break
        }
        case DomainEventType.NodeDeleted:
        case DomainEventType.NodePositionSet:
        case DomainEventType.NodeMoved: {
          app.renderClientBoundingBox(event.payload.clientUuid)
          app.renderNode(event.payload.uuid)
          break
        }

        case DomainEventType.NodeRestored:
        case DomainEventType.RectangleFillSet: {
          app.renderNode(event.payload.uuid)
          break
        }
        case DomainEventType.ClientCommandAddedToHistory:
        case DomainEventType.LastClientCommandRedone:
        case DomainEventType.LastClientCommandRedoSkipped:
        case DomainEventType.LastClientCommandUndone:
        case DomainEventType.LastClientCommandUndoSkipped:
        case DomainEventType.PositionDraggingStarted:
        case DomainEventType.NodeLocked:
        case DomainEventType.NodeUnlocked: {
          break
        }
        default: {
          const check: never = event
          throw new Error(`Unhandled event ${check}.`)
        }
      }
      measure()
    })

    connectClient()?.then(() => {
      app.initialize(getSessionState())
    })

    console.log(`Canvas initialized.`)
  }, [])

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'grid',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      ref={canvasRef}
    />
  )
}
