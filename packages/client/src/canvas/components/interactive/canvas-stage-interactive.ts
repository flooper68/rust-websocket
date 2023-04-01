import { DeselectAll, MoveClientCursor } from '@shared/domain'
import { v4 } from 'uuid'
import { CLIENT_UUID, dispatch } from '../../../ws/use-ws'
import { InteractiveComponent } from '../../core/core-types'

export class CanvasStageInteractive implements InteractiveComponent {
  readonly zIndex = 0
  readonly ignoreHitTestForMove = true

  canHit() {
    return true
  }

  contains() {
    return true
  }

  onHitTarget() {}

  onHitTargetLeave() {}

  onClick() {
    dispatch(
      new DeselectAll(
        { clientUuid: CLIENT_UUID },
        {
          correlationUuid: v4()
        }
      )
    )
  }

  onMove(x: number, y: number) {
    dispatch(
      new MoveClientCursor(
        {
          clientUuid: CLIENT_UUID,
          left: x,
          top: y
        },
        {
          correlationUuid: v4()
        }
      )
    )
  }
}
