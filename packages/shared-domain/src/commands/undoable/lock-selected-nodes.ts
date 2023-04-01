// import { NodeLocked, NodeUnlocked } from '../../events/events.js'
// import { DomainSelectors } from '../../projections/selectors.js'
// import { DomainCommandType, LockSelectedNodes } from '../commands.js'
// import { CommandFactory } from '../core/undo-redo-core.js'

// export const lockSelectedNodes =
//   CommandFactory.createUndoableHandler<LockSelectedNodes>(
//     DomainCommandType.LockSelectedNodes
//   )
//     .snapshotState(() => {})
//     .redo(({ command, state }) => {
//       const selection = DomainSelectors.getActiveSelection(
//         command.payload.clientUuid,
//         state
//       )

//       return selection.map((node) => {
//         return new NodeLocked(
//           { uuid: node.uuid, clientUuid: command.payload.clientUuid },
//           command.headers
//         )
//       })
//     })
//     .undo(({ command, state }) => {
//       const selection = DomainSelectors.getActiveSelection(
//         command.payload.clientUuid,
//         state
//       )

//       return selection.map((node) => {
//         return new NodeUnlocked(
//           {
//             uuid: node.uuid,
//             clientUuid: command.payload.clientUuid
//           },
//           command.headers
//         )
//       })
//     })

export const TODO = {}
