import { startMeasurement } from '@shared/domain/src/measure'
import {
  DocumentEventType,
  DocumentSessionState,
  NodeKind,
  NodeStatus,
  SessionEventType
} from '@shared/immutable-domain'
import { Application, settings as PIXISettings } from 'pixi.js'
import { useEffect, useRef } from 'react'
import { WsClient } from '../client/ws-client'
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

function createApplication(canvasContainer: HTMLElement, client: WsClient) {
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

  function initialize(state: DocumentSessionState) {
    console.log(`Initializing renderer with state:`, state)

    createStage()

    Object.values(state.session.clients).forEach((client) => {
      createCursor(client.uuid)
      createBoundingBox(client.uuid)
    })

    Object.values(state.document.nodes).forEach((node) => {
      if (node.status === NodeStatus.Deleted) {
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
    addComponent(CanvasStage.create(app.stage, client))
  }

  function createImage(uuid: string) {
    addComponent(CanvasImage.create(uuid, app.stage, client))
  }

  function createRectangle(uuid: string) {
    addComponent(CanvasRectangle.create(uuid, app.stage, client))
  }

  function createCursor(clientUuid: string) {
    addComponent(CanvasCursor.create(clientUuid, app.stage, client))
  }

  function createBoundingBox(clientUuid: string) {
    addComponent(CanvasBoundingBox.create(clientUuid, app.stage, client))
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

  function renderNode(uuid: string) {
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

let canvasInitialized = false

export function Canvas(props: { client: WsClient }) {
  const { client } = props

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

    const app = createApplication(canvasRef.current, client)

    client.domainStream$.subscribe((event) => {
      const measure = startMeasurement(`Rendering event ${event.type}`)

      switch (event.type) {
        case DocumentEventType.RectangleCreated: {
          app.createRectangle(event.payload.uuid)
          break
        }
        case DocumentEventType.ImageCreated: {
          app.createImage(event.payload.uuid)
          break
        }
        case SessionEventType.ClientConnected: {
          app.createCursor(event.payload.uuid)
          app.createBoundingBox(event.payload.uuid)
          break
        }
        case SessionEventType.ClientCursorMoved: {
          app.renderClientCursor(event.payload.clientUuid)
          break
        }
        case SessionEventType.ClientDisconnected: {
          app.renderClientCursor(event.payload.uuid)
          app.renderClientBoundingBox(event.payload.uuid)
          break
        }
        case SessionEventType.DraggingFinished:
        case SessionEventType.DraggingStarted:
        case SessionEventType.DraggingMoved:
        case SessionEventType.NodesSelected: {
          app.renderClientBoundingBox(event.payload.clientUuid)

          const connectedClient =
            client.getState().session.clients[event.payload.clientUuid]
          const selectedNodes = connectedClient.selection

          selectedNodes.forEach((nodeUuid) => {
            app.renderNode(nodeUuid)
          })
          break
        }
        case DocumentEventType.NodeDeleted: {
          const selection = Object.values(
            client.getState().session.clients
          ).find((c) => c.selection.includes(event.payload.uuid))

          if (selection != null) {
            app.renderClientBoundingBox(selection.uuid)
          }
          app.renderNode(event.payload.uuid)
          break
        }
        case DocumentEventType.NodeFillSet:
        case DocumentEventType.NodeUrlSet:
        case DocumentEventType.NodeMoved: {
          app.renderNode(event.payload.uuid)
          break
        }
        case DocumentEventType.NodeLocked:
        case DocumentEventType.NodeUnlocked:
        case SessionEventType.ClientCommandAddedToHistory:
        case SessionEventType.LastClientCommandRedone:
        case SessionEventType.LastClientCommandUndone: {
          break
        }
        default: {
          const check: never = event
          throw new Error(`Unhandled event ${check}.`)
        }
      }
      measure()
    })

    app.initialize(client.getState())

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
