import {
  DomainSelectors,
  DragSelection,
  SelectNode,
  StartDragging,
  StopDragging
} from '@shared/domain'
import { v4 } from 'uuid'
import { CLIENT_UUID, dispatch, getSessionState } from '../../../ws/use-ws'
import { DraggableComponent } from '../../core/core-types'

export class DraggableSceneNode implements DraggableComponent {
  constructor(public readonly uuid: string) {}

  canDrag() {
    return DomainSelectors.isClientSelectionLocked(this.uuid, getSessionState())
  }

  onDraggingStarted() {
    dispatch(
      new SelectNode(
        {
          uuid: this.uuid,
          clientUuid: CLIENT_UUID
        },
        {
          correlationUuid: v4()
        }
      )
    )
    dispatch(
      new StartDragging(
        {
          clientUuid: CLIENT_UUID
        },
        {
          correlationUuid: v4()
        }
      )
    )
  }

  onDraggingProgress(diffX: number, diffY: number) {
    dispatch(
      new DragSelection(
        {
          diffLeft: diffX,
          diffTop: diffY,
          clientUuid: CLIENT_UUID
        },
        {
          correlationUuid: v4()
        }
      )
    )
  }

  onDraggingFinished(diffX: number, diffY: number) {
    dispatch(
      new StopDragging(
        {
          diffLeft: diffX,
          diffTop: diffY,
          clientUuid: CLIENT_UUID
        },
        {
          correlationUuid: v4()
        }
      )
    )
  }
}
