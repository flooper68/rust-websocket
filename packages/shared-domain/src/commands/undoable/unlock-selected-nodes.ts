// import { UnlockeSelectionActions } from '../../domain/actions.js'
// import {
//   buildIsNodeSelected,
//   ClientUuid,
//   isNodeActive,
//   isNodeLocked,
//   isNodeUnlocked
// } from '../../domain/node.js'
// import { SelectionSelectors } from '../../projections/selection-projection.js'
// import { DomainCommandType, UnlockSelectedNode } from '../commands.js'
// import { CommandFactory } from '../core/undo-redo-core.js'

// export const unlockSelectedNodes = CommandFactory.createUndoableHandler<
//   UnlockSelectedNode<ClientUuid>
// >(DomainCommandType.UnlockSelectedNode)
//   .snapshotState(({ currentSelection }) => {
//     return currentSelection
//       .filter((node) => isNodeActive(node) && isNodeUnlocked(node))
//       .map((node) => ({
//         uuid: node.uuid
//       }))
//   })
//   .redo(({ command, currentSelection, historySnapshot }) => {
//     const unlockedActiveNodes = historySnapshot.map((node) => {
//       const currentNode = currentSelection.find(
//         (currentNode) => currentNode.uuid === node.uuid
//       )

//       if (currentNode == null) {
//         throw new Error(
//           `Node ${node.uuid} is not found in current selection, only selected nodes can be modified during undo/redo of a command.`
//         )
//       }

//       if (!isNodeActive(currentNode)) {
//         throw new Error(
//           `Node ${node.uuid} is not active, only active nodes can be modified during undo/redo of a command.`
//         )
//       }

//       if (!isNodeLocked(currentNode)) {
//         throw new Error(
//           `Node ${node.uuid} is not unlocked, only unlocked nodes can be modified during undo/redo of a command.`
//         )
//       }

//       return currentNode
//     })

//     return UnlockeSelectionActions.unlock(unlockedActiveNodes, {
//       clientUuid: command.payload.clientUuid,
//       correlationUuid: command.headers.correlationUuid
//     })
//   })
//   .undo(({ command, currentSelection, historySnapshot }) => {
//     const unlockedActiveNodes = historySnapshot.map((node) => {
//       const currentNode = currentSelection.find(
//         (currentNode) => currentNode.uuid === node.uuid
//       )

//       if (currentNode == null) {
//         throw new Error(
//           `Node ${node.uuid} is not found in current selection, only selected nodes can be modified during undo/redo of a command.`
//         )
//       }

//       if (!isNodeActive(currentNode)) {
//         throw new Error(
//           `Node ${node.uuid} is not active, only active nodes can be modified during undo/redo of a command.`
//         )
//       }

//       if (!isNodeLocked(currentNode)) {
//         throw new Error(
//           `Node ${node.uuid} is not unlocked, only unlocked nodes can be modified during undo/redo of a command.`
//         )
//       }

//       return currentNode
//     })

//     return UnlockeSelectionActions.unlock(unlockedActiveNodes, {
//       clientUuid: command.payload.clientUuid,
//       correlationUuid: command.headers.correlationUuid
//     })
//   })

export const TODO = {}
