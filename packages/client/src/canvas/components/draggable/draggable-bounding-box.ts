import { v4 } from 'uuid'
import { CLIENT_UUID } from '../../../client/ws-client'
import { DraggableComponent } from '../../core/core-types'

export class DraggableBoundingBox implements DraggableComponent {
  constructor(public readonly uuid: string) {}

  canDrag() {
    // return (
    //   !DomainSelectors.isClientSelectionLocked(this.uuid, getSessionState()) &&
    //   this.uuid === CLIENT_UUID
    // )
    return true
  }

  onDraggingStarted() {
    // dispatch(
    //   new StartDragging(
    //     {
    //       clientUuid: CLIENT_UUID
    //     },
    //     {
    //       correlationUuid: v4()
    //     }
    //   )
    // )
    console.warn(`Not implemented yet`)
  }

  onDraggingProgress(diffX: number, diffY: number) {
    // dispatch(
    //   new DragSelection(
    //     {
    //       diffLeft: diffX,
    //       diffTop: diffY,
    //       clientUuid: CLIENT_UUID
    //     },
    //     {
    //       correlationUuid: v4()
    //     }
    //   )
    // )
    console.warn(`Not implemented yet`)
  }

  onDraggingFinished(diffX: number, diffY: number) {
    // dispatch(
    //   new StopDragging(
    //     {
    //       diffLeft: diffX,
    //       diffTop: diffY,
    //       clientUuid: CLIENT_UUID
    //     },
    //     {
    //       correlationUuid: v4()
    //     }
    //   )
    // )
    console.warn(`Not implemented yet`)
  }
}
