// import {
//   NodeDeleted,
//   NodeDeselected,
//   NodeSelected
// } from '../../events/events.js'
// import { DomainSelectors } from '../../projections/selectors.js'
// import {
//   createRectangleFactory,
//   Dimensions,
//   Fill,
//   Position
// } from '../../domain/domain-types.js'
// import { CreateRectangle, DomainCommandType } from '../commands.js'
// import { CommandFactory } from '../core/undo-redo-core.js'

// export const createRectangle =
//   CommandFactory.createUndoableHandler<CreateRectangle>(
//     DomainCommandType.CreateRectangle
//   )
//     .snapshotState(() => {})
//     .redo(({ command, state }) => {
//       const rectangleCreated = createRectangleFactory({
//         uuid: command.payload.uuid,
//         position: Position(command.payload.left, command.payload.top),
//         dimensions: Dimensions(command.payload.width, command.payload.height),
//         fill: Fill(command.payload.fill),
//         clientUuid: command.payload.clientUuid,
//         correlationUuid: command.headers.correlationUuid
//       })

//       const selection = DomainSelectors.getSelection(
//         command.payload.clientUuid,
//         state
//       )

//       const deselectedEvents = selection.map((node) => {
//         return new NodeDeselected(
//           {
//             uuid: node.uuid,
//             clientUuid: command.payload.clientUuid
//           },
//           command.headers
//         )
//       })

//       const nodeSelected = new NodeSelected(
//         {
//           uuid: rectangleCreated.payload.uuid,
//           clientUuid: command.payload.clientUuid
//         },
//         command.headers
//       )

//       return [rectangleCreated, ...deselectedEvents, nodeSelected]
//     })
//     .undo(({ command }) => {
//       return [
//         new NodeDeleted(
//           {
//             uuid: command.payload.uuid,
//             clientUuid: command.payload.clientUuid
//           },
//           command.headers
//         )
//       ]
//     })

export const TODO = {}
