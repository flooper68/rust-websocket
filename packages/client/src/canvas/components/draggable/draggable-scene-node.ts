import { DomainSelectors } from '@shared/domain'
import { DraggableComponent } from '../../core/core-types'

export class DraggableSceneNode implements DraggableComponent {
  constructor(public readonly uuid: string) {}

  canDrag() {
    // return DomainSelectors.isClientSelectionLocked(this.uuid, getSessionState())
    return true
  }

  onDraggingStarted() {
    console.warn(`Not implemented yet`)
  }

  onDraggingProgress(diffX: number, diffY: number) {
    console.warn(`Not implemented yet`)
  }

  onDraggingFinished(diffX: number, diffY: number) {
    console.warn(`Not implemented yet`)
  }
}
