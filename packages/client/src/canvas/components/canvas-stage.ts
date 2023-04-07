import { Container } from 'pixi.js'
import { WsClient } from '../../client/ws-client'
import { DraggableCanvasStage } from './draggable/draggable-canvas-stage'
import { CanvasStageInteractive } from './interactive/canvas-stage-interactive'

const CANVAS_STAGE_UUID = 'CANVAS_STAGE_UUID'

export class CanvasStage {
  readonly uuid = CANVAS_STAGE_UUID

  readonly interactive: CanvasStageInteractive
  readonly draggable: DraggableCanvasStage

  private constructor(private readonly _stage: Container, client: WsClient) {
    this.interactive = new CanvasStageInteractive(client)
    this.draggable = new DraggableCanvasStage(this._stage)
  }

  static create(stage: Container, client: WsClient) {
    console.log(`Creating CanvasStage component ${CANVAS_STAGE_UUID}.`)

    stage.interactive = true
    stage.sortableChildren = true
    stage.hitArea = {
      contains() {
        return true
      }
    }

    return new CanvasStage(stage, client)
  }

  render() {
    throw new Error('Can not redner CanvasStage, it should never be rendered.')
  }
}
