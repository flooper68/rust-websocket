import { Container, FederatedPointerEvent, Point } from 'pixi.js'
import { CanvasComponents } from '../components/canvas-components'
import {
  isDraggable,
  isInteractive,
  WithCanvasDraggable,
  WithCanvasInteractive
} from './core-types'

const DRAGGING_THRESHOLD = 5

interface DraggingState {
  lastPoint: Point
  confirmed: boolean
  target: WithCanvasDraggable<unknown>
}

export class CanvasInteractions {
  private _hitTarget: WithCanvasInteractive<unknown> | null = null
  private _pointerDownTarget: WithCanvasInteractive<unknown> | null = null
  private _draggingState: DraggingState | null = null

  constructor(
    private readonly components: Record<string, CanvasComponents>,
    private readonly stage: Container
  ) {}

  private buildFilterInteractive(x: number, y: number) {
    return function filterInteractive<T extends object>(
      node: T
    ): node is WithCanvasInteractive<T> {
      if (!isInteractive(node)) {
        return false
      }

      return node.interactive.canHit() && node.interactive.contains(x, y)
    }
  }

  private getHitTargets(
    x: number,
    y: number
  ): WithCanvasInteractive<unknown>[] {
    return Object.values(this.components)
      .filter(this.buildFilterInteractive(x, y))
      .sort((a, b) => {
        return a.interactive.zIndex - b.interactive.zIndex
      })
  }

  private getIgnoreHitTestForMoveTargets() {
    return Object.values(this.components).filter(
      <T extends object>(c: T): c is WithCanvasInteractive<T> => {
        return isInteractive(c) && c.interactive.ignoreHitTestForMove
      }
    )
  }

  private getTopTarget(x: number, y: number): WithCanvasInteractive<unknown> {
    const sortedTargets = this.getHitTargets(x, y)

    return sortedTargets[sortedTargets.length - 1]
  }

  private handleHitTarget(topTarget: WithCanvasInteractive<unknown>) {
    if (this._hitTarget !== topTarget) {
      this._hitTarget?.interactive.onHitTargetLeave()
    }

    this._hitTarget = topTarget
    this._hitTarget?.interactive.onHitTarget()
  }

  private onPointerDown(e: FederatedPointerEvent) {
    this._pointerDownTarget = this.getTopTarget(e.global.x, e.global.y)

    if (
      this._pointerDownTarget != null &&
      isDraggable(this._pointerDownTarget)
    ) {
      if (!this._pointerDownTarget.draggable.canDrag()) {
        console.log(`Target can not drag right now.`)
        return
      }

      console.log(`Dragging started.`)

      this._draggingState = {
        lastPoint: e.global.clone(),
        confirmed: false,
        target: this._pointerDownTarget
      }
    }
  }

  private onPointerMove(e: FederatedPointerEvent) {
    const targetsIgnoringHitTest = this.getIgnoreHitTestForMoveTargets()

    targetsIgnoringHitTest.forEach((target) => {
      target.interactive.onMove(
        e.global.x - this.stage.position.x,
        e.global.y - this.stage.position.y
      )
    })

    const topTarget = this.getTopTarget(e.global.x, e.global.y)

    this.handleHitTarget(topTarget)

    if (isInteractive(topTarget)) {
      topTarget.interactive.onMove(
        e.global.x - this.stage.position.x,
        e.global.y - this.stage.position.y
      )
    }

    if (this._draggingState == null) {
      return
    }

    if (this._draggingState.confirmed) {
      this._draggingState.target.draggable.onDraggingProgress(
        e.global.x - this._draggingState.lastPoint.x,
        e.global.y - this._draggingState.lastPoint.y
      )
      this._draggingState.lastPoint = e.global.clone()
    } else if (
      Math.abs(e.global.x - this._draggingState.lastPoint.x) >
        DRAGGING_THRESHOLD ||
      Math.abs(e.global.y - this._draggingState.lastPoint.y) >
        DRAGGING_THRESHOLD
    ) {
      console.log(`Dragging confirmed`)
      this._draggingState.target.draggable.onDraggingStarted()
      this._draggingState.confirmed = true
      this._draggingState.lastPoint = e.global.clone()
    }
  }

  private onPointerUp(e: FederatedPointerEvent) {
    if (this._draggingState != null && this._draggingState.confirmed) {
      this._draggingState.target.draggable.onDraggingFinished(
        e.global.x - this._draggingState.lastPoint.x,
        e.global.y - this._draggingState.lastPoint.y
      )
    } else {
      const currentTopTarget = this.getTopTarget(e.global.x, e.global.y)

      const clickedTarget =
        this._pointerDownTarget === currentTopTarget ? currentTopTarget : null

      if (clickedTarget != null)
        clickedTarget.interactive.onClick(e.nativeEvent.shiftKey)
    }

    this._pointerDownTarget = null
    this._draggingState = null
  }

  private onPointerLeave() {
    this._draggingState = null
    this._pointerDownTarget = null
  }

  initialize() {
    this.stage.on('pointerdown', (e) => {
      this.onPointerDown(e)
    })

    this.stage.on('pointermove', (e) => {
      this.onPointerMove(e)
    })

    this.stage.on('pointerup', (e) => {
      this.onPointerUp(e)
    })

    this.stage.on('pointerleave', (e) => {
      this.onPointerLeave()
    })
  }
}
