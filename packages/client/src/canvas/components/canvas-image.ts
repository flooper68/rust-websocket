import { DomainSelectors, NodeKind, Uuid } from '@shared/domain'
import { Container, Sprite, Texture } from 'pixi.js'
import { getSessionState } from '../../ws/use-ws'
import { DraggableSceneNode } from './draggable/draggable-scene-node'
import { CanvasNodeInteractive } from './interactive/canvas-node-interactive'

function getImageOrFail(uuid: Uuid) {
  const node = DomainSelectors.getNode(uuid, getSessionState())

  if (!node) {
    throw new Error(`Can not redner CanvasImage, node ${uuid} does not exist!`)
  }

  if (node.kind !== NodeKind.Image) {
    throw new Error(`Can not redner CanvasImage, node ${uuid} is not an image!`)
  }

  return node
}

export class CanvasImage {
  readonly interactive: CanvasNodeInteractive
  readonly draggable: DraggableSceneNode

  private constructor(
    public readonly uuid: Uuid,
    private readonly sprite: Sprite
  ) {
    this.interactive = new CanvasNodeInteractive(sprite, this)
    this.draggable = new DraggableSceneNode(this.uuid)
  }

  static create(uuid: Uuid, stage: Container) {
    console.log(`Creating CanvasImage component ${uuid}.`)
    const node = getImageOrFail(uuid)

    const texture = Texture.from(node.imageMetadata.url)

    const image = new Sprite(texture)
    image.cursor = 'pointer'
    image.interactive = true
    image.zIndex = 10

    stage.addChild(image)

    const component = new CanvasImage(uuid, image)
    component.render()

    return component
  }

  render() {
    const image = getImageOrFail(this.uuid)

    console.log(`Rendering CanvasImage ${this.uuid}.`, image)

    if (image.deleted) {
      this.sprite.visible = false
      return
    }

    this.sprite.visible = true

    this.sprite.position.x = image.position.left
    this.sprite.position.y = image.position.top
    this.sprite.width = image.dimensions.width
    this.sprite.height = image.dimensions.height
  }
}
