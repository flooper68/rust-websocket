import { DomainState, Uuid } from '../domain/domain-types'

function isCommandInvalid(
  selection: Uuid[],
  clientUuid: string,
  state: DomainState
) {
  return selection.some((uuid) => {
    const currentNode = state.nodes[uuid]

    const wasEdited = currentNode?.lastEditor !== clientUuid

    const isSelectedByOtherUser =
      currentNode?.selectedBy !== clientUuid && currentNode?.selectedBy != null

    if (wasEdited) console.log(`Can't undo, node ${uuid} edited by other user.`)

    if (isSelectedByOtherUser)
      console.log(`Can't undo, node ${uuid} is selected by other user.`)

    return wasEdited || isSelectedByOtherUser
  })
}

export const UndoRedoSelectors = { isCommandInvalid }
