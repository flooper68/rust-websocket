import { DomainSelectors, NodeKind, Uuid } from '@shared/domain'
import { Container, Graphics } from 'pixi.js'
import { getSessionState } from '../../ws/use-ws'
import { DraggableSceneNode } from './draggable/draggable-scene-node'
import { CanvasNodeInteractive } from './interactive/canvas-node-interactive'
import { parseHexColor } from './parse-hex-color'

function getRectangleOrFail(uuid: Uuid) {
  const node = DomainSelectors.getNode(uuid, getSessionState())

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
    public readonly uuid: Uuid,
    private readonly graphics: Graphics
  ) {
    this.interactive = new CanvasNodeInteractive(graphics, this)
    this.draggable = new DraggableSceneNode(this.uuid)
  }

  static create(uuid: Uuid, stage: Container) {
    console.log(`Creating CanvasRectangle component ${uuid}.`)

    const rectangle = new Graphics()
    rectangle.cursor = 'pointer'
    rectangle.interactive = true
    rectangle.zIndex = 10
    rectangle.beginFill(0xffffff)
    rectangle.drawRoundedRect(0, 0, 100, 100, 2)
    rectangle.endFill()

    stage.addChild(rectangle)

    const component = new CanvasRectangle(uuid, rectangle)
    component.render()

    return component
  }

  render() {
    const rectangle = getRectangleOrFail(this.uuid)

    console.log(`Rendering CanvasRectangle ${this.uuid}.`, rectangle)

    if (rectangle.deleted) {
      this.graphics.visible = false
      return
    }

    const color = parseHexColor(rectangle.rectangleMetadata.fill)

    this.graphics.visible = true
    this.graphics.tint = color
    this.graphics.width = rectangle.dimensions.width
    this.graphics.height = rectangle.dimensions.height
    this.graphics.position.x = rectangle.position.left
    this.graphics.position.y = rectangle.position.top
  }
}
