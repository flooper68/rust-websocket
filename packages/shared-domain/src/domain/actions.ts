import { NodeLocked, NodeUnlocked } from '../events/events.js'
import {
  ActiveNodeActions as ActiveNodeActionsType,
  SelectionActions as SelectionActionsType
} from './node.js'

export const ActiveNodeActions: ActiveNodeActionsType = {
  unlock(node, context) {
    return new NodeUnlocked(
      { uuid: node.uuid, clientUuid: context.clientUuid },
      { correlationUuid: context.correlationUuid }
    )
  },
  lock(node, context) {
    return new NodeLocked(
      { uuid: node.uuid, clientUuid: context.clientUuid },
      { correlationUuid: context.correlationUuid }
    )
  }
}

export const UnlockeSelectionActions: SelectionActionsType = {
  unlock(selection, context) {
    return selection.map((node) => ActiveNodeActions.unlock(node, context))
  },
  lock(selection, context) {
    return selection.map((node) => ActiveNodeActions.lock(node, context))
  }
}
