import { MoveClientCursor } from '@shared/immutable-domain'
import { v4 } from 'uuid'
import { CLIENT_UUID, WsClient } from '../../../client/ws-client'
import { InteractiveComponent } from '../../core/core-types'

export class CanvasStageInteractive implements InteractiveComponent {
  readonly zIndex = 0
  readonly ignoreHitTestForMove = true

  constructor(private readonly _client: WsClient) {}

  canHit() {
    return true
  }

  contains() {
    return true
  }

  onHitTarget() {}

  onHitTargetLeave() {}

  onClick() {
    console.warn(`Not implemented yet`)
  }

  onMove(x: number, y: number) {
    this._client.dispatch(
      new MoveClientCursor({
        clientUuid: CLIENT_UUID,
        left: x,
        top: y
      })
    )
  }
}
