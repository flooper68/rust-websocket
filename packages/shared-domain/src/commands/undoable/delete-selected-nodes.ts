// import { NodeDeleted, NodeRestored } from '../../events/events.js'
// import { DomainSelectors } from '../../projections/selectors.js'
// import { DeleteSelectedNodes, DomainCommandType } from '../commands.js'
// import { CommandFactory } from '../core/undo-redo-core.js'

// export const deleteSelectedNodes =
//   CommandFactory.createUndoableHandler<DeleteSelectedNodes>(
//     DomainCommandType.DeleteSelectedNodes
//   )
//     .snapshotState(() => {})
//     .redo(({ command, state }) => {
//       const selection = DomainSelectors.getUnlockedActiveSelection(
//         command.payload.clientUuid,
//         state
//       )

//       return selection.map((node) => {
//         return new NodeDeleted(
//           {
//             uuid: node.uuid,
//             clientUuid: command.payload.clientUuid
//           },
//           command.headers
//         )
//       })
//     })
//     .undo(({ command, state }) => {
//       const selection = DomainSelectors.getUnlockedActiveSelection(
//         command.payload.clientUuid,
//         state
//       )

//       return selection.map((node) => {
//         return new NodeRestored(
//           {
//             uuid: node.uuid,
//             clientUuid: command.payload.clientUuid
//           },
//           command.headers
//         )
//       })
//     })

export const TODO = {}
