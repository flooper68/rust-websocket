import { NodeKind, NodeStatus } from '@shared/immutable-domain'
import { Container, Graphics } from 'pixi.js'
import { WsClient } from '../../client/ws-client'

import { DraggableSceneNode } from './draggable/draggable-scene-node'
import { CanvasNodeInteractive } from './interactive/canvas-node-interactive'
import { parseHexColor } from './parse-hex-color'

function getRectangleOrFail(uuid: string, client: WsClient) {
  const node = client.getState().document.nodes[uuid]

  if (!node) {
    throw new Error(
      `Can not render CanvasRectangle, node ${uuid} does not exist!`
    )
  }

  if (node.kind !== NodeKind.Rectangle) {
    throw new Error(
      `Can not render CanvasRectangle, node ${uuid} is not an image!`
    )
  }

  return node
}

export class CanvasRectangle {
  readonly draggable: DraggableSceneNode
  readonly interactive: CanvasNodeInteractive

  private constructor(
    public readonly uuid: string,
    private readonly _graphics: Graphics,
    private readonly _client: WsClient
  ) {
    this.interactive = new CanvasNodeInteractive(_graphics, this, _client)
    this.draggable = new DraggableSceneNode(this.uuid, _client)
  }

  static create(uuid: string, stage: Container, client: WsClient) {
    console.log(`Creating CanvasRectangle component ${uuid}.`)

    const rectangle = new Graphics()
    rectangle.cursor = 'pointer'
    rectangle.interactive = true
    rectangle.zIndex = 10
    rectangle.beginFill(0xffffff)
    rectangle.drawRoundedRect(0, 0, 100, 100, 2)
    rectangle.endFill()

    stage.addChild(rectangle)

    const component = new CanvasRectangle(uuid, rectangle, client)
    component.render()

    return component
  }

  render() {
    const rectangle = getRectangleOrFail(this.uuid, this._client)

    const client = Object.values(
      this._client.getState().session.selections
    ).find((selection) => selection.selection.includes(this.uuid))

    const draggingOffset =
      client != null
        ? this._client.getState().session.clientDragging[client.uuid].dragging
        : null

    if (rectangle.status == NodeStatus.Deleted) {
      this._graphics.visible = false
      return
    }

    const color = parseHexColor(rectangle.fill)

    this._graphics.visible = true
    this._graphics.tint = color
    this._graphics.width = rectangle.width
    this._graphics.height = rectangle.height
    this._graphics.position.x = rectangle.left + (draggingOffset?.left ?? 0)
    this._graphics.position.y = rectangle.top + (draggingOffset?.top ?? 0)
  }
}
