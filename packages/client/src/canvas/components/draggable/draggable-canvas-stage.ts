import { Container } from 'pixi.js'
import { DraggableComponent } from '../../core/core-types'

export class DraggableCanvasStage implements DraggableComponent {
  constructor(private readonly _stage: Container) {}

  canDrag() {
    return true
  }

  onDraggingStarted() {}

  onDraggingProgress(diffX: number, diffY: number) {
    this._stage.position.x += diffX
    this._stage.position.y += diffY
  }

  onDraggingFinished() {}
}
