import { Container, Graphics } from 'pixi.js'
import { WsClient } from '../../client/ws-client'
import { RenderingSelectors } from '../rendering-selectors'
import { DraggableBoundingBox } from './draggable/draggable-bounding-box'
import { BoundingBoxInteractive } from './interactive/bounding-box-interactive'
import { parseHexColor } from './parse-hex-color'

const OVERLAP = 2

export function getBoundingBoxUuid(clientUuid: string) {
  return `bounding-box-${clientUuid}`
}

function parseClientUuidUuid(uuid: string) {
  return uuid.replace('bounding-box-', '')
}

export class CanvasBoundingBox {
  readonly interactive: BoundingBoxInteractive
  readonly draggable: DraggableBoundingBox

  private constructor(
    public readonly uuid: string,
    private readonly _graphics: Graphics,
    private readonly _client: WsClient
  ) {
    this.interactive = new BoundingBoxInteractive(this._graphics)
    this.draggable = new DraggableBoundingBox(parseClientUuidUuid(this.uuid))
  }

  static create(clientUuid: string, stage: Container, client: WsClient) {
    console.log(`Creating CanvasBoundingBox component ${clientUuid}.`)

    const rectangle = new Graphics()
    rectangle.cursor = 'pointer'
    rectangle.interactive = true
    rectangle.zIndex = 10000

    rectangle.lineStyle({
      width: 0,
      color: 0xffffff,
      alpha: 1
    })
    rectangle.beginFill(0xffffff)
    rectangle.drawRoundedRect(0, 0, 100, 100, 1)
    rectangle.alpha = 0.2
    rectangle.endFill()

    stage.addChild(rectangle)

    const component = new CanvasBoundingBox(
      getBoundingBoxUuid(clientUuid),
      rectangle,
      client
    )
    component.render()

    return component
  }

  render() {
    const boundingBox = RenderingSelectors.getClientBoundingBox(
      parseClientUuidUuid(this.uuid),
      this._client.getState()
    )

    console.log(`Rendering CanvasBoundingBox ${this.uuid}.`, boundingBox)

    if (boundingBox == null) {
      this._graphics.visible = false
      return
    }

    const color = parseHexColor(boundingBox.color)

    this._graphics.visible = true
    this._graphics.tint = color
    this._graphics.width = boundingBox.width + 2 * OVERLAP
    this._graphics.height = boundingBox.height + 2 * OVERLAP
    this._graphics.position.x = boundingBox.left - OVERLAP
    this._graphics.position.y = boundingBox.top - OVERLAP
  }
}
