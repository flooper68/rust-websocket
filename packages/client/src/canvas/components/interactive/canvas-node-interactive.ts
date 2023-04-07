import { SelectNodes, AddNodeToSelection } from '@shared/immutable-domain'
import { DisplayObject } from 'pixi.js'
import { WsClient, CLIENT_UUID } from '../../../client/ws-client'
import { CanvasComponent, InteractiveComponent } from '../../core/core-types'

export class CanvasNodeInteractive implements InteractiveComponent {
  readonly zIndex = 10
  readonly ignoreHitTestForMove = false

  constructor(
    private readonly _displayObject: DisplayObject,
    private readonly _canvasComponent: CanvasComponent,
    private readonly _client: WsClient
  ) {}

  canHit() {
    return true
  }

  contains(x: number, y: number) {
    return this._displayObject.getBounds().contains(x, y)
  }

  onHitTarget() {
    this._displayObject.alpha = 0.5
    this._canvasComponent.render()
  }

  onHitTargetLeave() {
    this._displayObject.alpha = 1
    this._canvasComponent.render()
  }

  onMove() {}

  onClick(shiftKey: boolean) {
    if (shiftKey) {
      this._client.dispatch(
        new AddNodeToSelection({
          clientUuid: CLIENT_UUID,
          node: this._canvasComponent.uuid
        })
      )
    } else {
      this._client.dispatch(
        new SelectNodes({
          clientUuid: CLIENT_UUID,
          nodes: [this._canvasComponent.uuid]
        })
      )
    }
  }
}
