import { NodeKind, NodeStatus } from '@shared/immutable-domain'
import { Container, Sprite, Texture } from 'pixi.js'
import { WsClient } from '../../client/ws-client'

import { DraggableSceneNode } from './draggable/draggable-scene-node'
import { CanvasNodeInteractive } from './interactive/canvas-node-interactive'

function getImageOrFail(uuid: string, client: WsClient) {
  const node = client.getState().document.nodes[uuid]

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
    public readonly uuid: string,
    private readonly _sprite: Sprite,
    private readonly _client: WsClient
  ) {
    this.interactive = new CanvasNodeInteractive(_sprite, this)
    this.draggable = new DraggableSceneNode(this.uuid)
  }

  static create(uuid: string, stage: Container, client: WsClient) {
    console.log(`Creating CanvasImage component ${uuid}.`)
    const node = getImageOrFail(uuid, client)

    const texture = Texture.from(node.url)

    const image = new Sprite(texture)
    image.cursor = 'pointer'
    image.interactive = true
    image.zIndex = 10

    stage.addChild(image)

    const component = new CanvasImage(uuid, image, client)
    component.render()

    return component
  }

  render() {
    const image = getImageOrFail(this.uuid, this._client)

    console.log(`Rendering CanvasImage ${this.uuid}.`, image)

    if (image.status === NodeStatus.Deleted) {
      this._sprite.visible = false
      return
    }

    this._sprite.visible = true

    this._sprite.position.x = image.left
    this._sprite.position.y = image.top
    this._sprite.width = image.width
    this._sprite.height = image.height
  }
}
