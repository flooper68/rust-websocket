import { Graphics } from 'pixi.js'
import { InteractiveComponent } from '../../core/core-types'

export class BoundingBoxInteractive implements InteractiveComponent {
  readonly zIndex = 10000
  readonly ignoreHitTestForMove = false

  constructor(private readonly graphics: Graphics) {}

  canHit() {
    return this.graphics.visible
  }

  contains(x: number, y: number) {
    return this.graphics.getBounds().contains(x, y)
  }

  onHitTarget() {}

  onHitTargetLeave() {}

  onMove() {}

  onClick() {}
}
