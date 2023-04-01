import { Container } from 'pixi.js'
import { DraggableCanvasStage } from './draggable/draggable-canvas-stage'
import { CanvasStageInteractive } from './interactive/canvas-stage-interactive'

const CANVAS_STAGE_UUID = 'CANVAS_STAGE_UUID'

export class CanvasStage {
  readonly uuid = CANVAS_STAGE_UUID

  readonly interactive: CanvasStageInteractive
  readonly draggable: DraggableCanvasStage

  private constructor(private readonly _stage: Container) {
    this.interactive = new CanvasStageInteractive()
    this.draggable = new DraggableCanvasStage(this._stage)
  }

  static create(stage: Container) {
    console.log(`Creating CanvasStage component ${CANVAS_STAGE_UUID}.`)

    stage.interactive = true
    stage.sortableChildren = true
    stage.hitArea = {
      contains() {
        return true
      }
    }

    return new CanvasStage(stage)
  }

  render() {
    throw new Error('Can not redner CanvasStage, it should never be rendered.')
  }
}
