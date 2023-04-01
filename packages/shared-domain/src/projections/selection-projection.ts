import { DomainState } from '../domain/domain-types.js'
import {
  ActiveSelection,
  ActiveLockedSelection,
  buildIsNodeSelected,
  isNodeActive,
  isNodeLocked,
  ActiveUnlockedSelection,
  isNodeUnlocked
} from '../domain/node.js'

function getActiveSelection<C extends string>(
  clientUuid: C,
  state: DomainState
): ActiveSelection<C> {
  return Object.values(state.nodes)
    .filter(buildIsNodeSelected(clientUuid))
    .filter(isNodeActive)
}

function getLockedActiveSelection<C extends string>(
  clientUuid: C,
  state: DomainState
): ActiveLockedSelection<C> {
  return getActiveSelection(clientUuid, state).filter(isNodeLocked)
}

function getUnlockedActiveSelection<C extends string>(
  clientUuid: C,
  state: DomainState
): ActiveUnlockedSelection<C> {
  return getActiveSelection(clientUuid, state).filter(isNodeUnlocked)
}

export const SelectionSelectors = {
  getActiveSelection,
  getLockedActiveSelection,
  getUnlockedActiveSelection
}
