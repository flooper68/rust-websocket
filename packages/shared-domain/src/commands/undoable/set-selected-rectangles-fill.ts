// import { RectangleFillSet } from '../../events/events.js'
// import { DomainSelectors } from '../../projections/selectors.js'
// import { Fill } from '../../domain/domain-types.js'
// import { DomainCommandType, SetSelectedRectanglesFill } from '../commands.js'
// import { CommandFactory } from '../core/undo-redo-core.js'

// export const setSelectedRectanglesFill =
//   CommandFactory.createUndoableHandler<SetSelectedRectanglesFill>(
//     DomainCommandType.SetSelectedRectanglesFill
//   )
//     .snapshotState(({ command, state }) => {
//       const selection = DomainSelectors.getUnlockedActiveRectangleSelection(
//         command.payload.clientUuid,
//         state
//       )

//       return selection.map((node) => {
//         return {
//           uuid: node.uuid,
//           redoFill: command.payload.fill,
//           undoFill: node.rectangleMetadata.fill
//         }
//       })
//     })
//     .redo(({ command, state, historySnapshot }) => {
//       const selection = DomainSelectors.getUnlockedActiveRectangleSelection(
//         command.payload.clientUuid,
//         state
//       )

//       return selection.map((node) => {
//         const storedNode = historySnapshot.find((position) => position.uuid)

//         if (!storedNode) throw new Error('Previous fill not found')

//         return new RectangleFillSet(
//           {
//             uuid: node.uuid,
//             fill: Fill(storedNode.redoFill),
//             clientUuid: command.payload.clientUuid
//           },
//           command.headers
//         )
//       })
//     })
//     .undo(({ command, state, historySnapshot }) => {
//       const selection = DomainSelectors.getUnlockedActiveRectangleSelection(
//         command.payload.clientUuid,
//         state
//       )

//       return selection.map((node) => {
//         const storedNode = historySnapshot.find((position) => position.uuid)

//         if (!storedNode) throw new Error('Previous fill not found')

//         return new RectangleFillSet(
//           {
//             uuid: node.uuid,
//             fill: Fill(storedNode.undoFill),
//             clientUuid: command.payload.clientUuid
//           },
//           command.headers
//         )
//       })
//     })

export const TODO = {}
