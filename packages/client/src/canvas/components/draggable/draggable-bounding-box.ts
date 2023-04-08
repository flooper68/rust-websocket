import {
  FinishDragging,
  MoveDragging,
  SessionSelectors,
  StartDragging
} from '@shared/immutable-domain'
import { CLIENT_UUID, WsClient } from '../../../client/ws-client'
import { DraggableComponent } from '../../core/core-types'

export class DraggableBoundingBox implements DraggableComponent {
  constructor(
    public readonly uuid: string,
    private readonly _client: WsClient
  ) {}

  canDrag() {
    return (
      !SessionSelectors.isClientSelectionLocked(
        this.uuid,
        this._client.getState()
      ) && this.uuid === CLIENT_UUID
    )
  }

  onDraggingStarted() {
    this._client.dispatch(
      new StartDragging({
        clientUuid: CLIENT_UUID
      })
    )
  }

  onDraggingProgress(diffX: number, diffY: number) {
    this._client.dispatch(
      new MoveDragging({
        clientUuid: CLIENT_UUID,
        diffLeft: diffX,
        diffTop: diffY
      })
    )
  }

  onDraggingFinished() {
    this._client.dispatch(
      new FinishDragging({
        clientUuid: CLIENT_UUID
      })
    )
  }
}
