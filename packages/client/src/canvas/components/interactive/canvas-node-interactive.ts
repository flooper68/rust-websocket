import { AddNodeToSelection, SelectNode } from '@shared/domain'
import { DisplayObject } from 'pixi.js'
import { v4 } from 'uuid'
import { CLIENT_UUID, dispatch } from '../../../ws/use-ws'
import { CanvasComponent, InteractiveComponent } from '../../core/core-types'

export class CanvasNodeInteractive implements InteractiveComponent {
  readonly zIndex = 10
  readonly ignoreHitTestForMove = false

  constructor(
    private readonly _displayObject: DisplayObject,
    private readonly _canvasComponent: CanvasComponent
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
      dispatch(
        new AddNodeToSelection(
          {
            uuid: this._canvasComponent.uuid,
            clientUuid: CLIENT_UUID
          },
          {
            correlationUuid: v4()
          }
        )
      )
    } else {
      dispatch(
        new SelectNode(
          {
            uuid: this._canvasComponent.uuid,
            clientUuid: CLIENT_UUID
          },
          {
            correlationUuid: v4()
          }
        )
      )
    }
  }
}
