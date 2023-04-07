import { MoveClientCursor, SelectNodes } from '@shared/immutable-domain'
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
    this._client.dispatch(
      new SelectNodes({
        clientUuid: CLIENT_UUID,
        nodes: []
      })
    )
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
