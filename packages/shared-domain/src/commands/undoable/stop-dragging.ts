// import { StopDragging, DomainCommandType } from '../commands.js'
// import { Position } from '../../domain/domain-types.js'
// import { NodePositionSet } from '../../events/events.js'
// import { DomainSelectors } from '../../projections/selectors.js'
// import { CommandFactory } from '../core/undo-redo-core.js'

// export const stopDragging = CommandFactory.createUndoableHandler<StopDragging>(
//   DomainCommandType.StopDragging
// )
//   .snapshotState(({ state, command }) => {
//     const selection = DomainSelectors.getUnlockedActiveSelection(
//       command.payload.clientUuid,
//       state
//     )

//     return selection.map((node) => {
//       if (!node.dragging) throw new Error('Node is not being dragged.')

//       return {
//         uuid: node.uuid,
//         redoLeft: node.position.left + command.payload.diffLeft,
//         redoTop: node.position.top + command.payload.diffTop,
//         undoLeft: node.dragging.draggingStartingPositionX,
//         undoTop: node.dragging.draggingStartingPositionY
//       }
//     })
//   })
//   .redo(({ command, state, historySnapshot }) => {
//     const selection = DomainSelectors.getUnlockedActiveSelection(
//       command.payload.clientUuid,
//       state
//     )

//     return selection.map((node) => {
//       const previousPosition = historySnapshot.find((position) => position.uuid)

//       if (!previousPosition) throw new Error('Previous position not found')

//       return new NodePositionSet(
//         {
//           uuid: node.uuid,
//           position: Position(
//             previousPosition.redoLeft,
//             previousPosition.redoTop
//           ),
//           clientUuid: command.payload.clientUuid
//         },
//         command.headers
//       )
//     })
//   })
//   .undo(({ command, state, historySnapshot }) => {
//     const selection = DomainSelectors.getUnlockedActiveSelection(
//       command.payload.clientUuid,
//       state
//     )

//     return selection.map((node) => {
//       const dragging = node.dragging

//       const previousPosition = historySnapshot.find((position) => position.uuid)

//       if (!dragging) throw new Error('Node is not being dragged')

//       if (!previousPosition) throw new Error('Previous position not found')

//       return new NodePositionSet(
//         {
//           uuid: node.uuid,
//           position: Position(
//             previousPosition.undoLeft,
//             previousPosition.undoTop
//           ),
//           clientUuid: command.payload.clientUuid
//         },
//         command.headers
//       )
//     })
//   })

export const TODO = {}
