import {
  FinishDragging,
  MoveDragging,
  NodeStatus,
  SelectNodes,
  StartDragging
} from '@shared/immutable-domain'
import { CLIENT_UUID, WsClient } from '../../../client/ws-client'
import { DraggableComponent } from '../../core/core-types'

export class DraggableSceneNode implements DraggableComponent {
  constructor(
    public readonly uuid: string,
    private readonly _client: WsClient
  ) {}

  canDrag() {
    const node = this._client.getState().document.nodes[this.uuid]

    return node.status === NodeStatus.Active
  }

  onDraggingStarted() {
    this._client.dispatch(
      new SelectNodes({
        clientUuid: CLIENT_UUID,
        nodes: [this.uuid]
      })
    )
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
