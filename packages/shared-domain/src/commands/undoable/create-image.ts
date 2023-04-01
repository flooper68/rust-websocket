// import {
//   NodeDeleted,
//   NodeDeselected,
//   NodeSelected
// } from '../../events/events.js'
// import { DomainSelectors } from '../../projections/selectors.js'
// import {
//   createImageFactory,
//   Dimensions,
//   Position
// } from '../../domain/domain-types.js'
// import { CreateImage, DomainCommandType } from '../commands.js'
// import { CommandFactory } from '../core/undo-redo-core.js'

// export const createImage = CommandFactory.createUndoableHandler<CreateImage>(
//   DomainCommandType.CreateImage
// )
//   .snapshotState(() => {})
//   .redo(({ command, state }) => {
//     const imageCreated = createImageFactory({
//       uuid: command.payload.uuid,
//       position: Position(command.payload.left, command.payload.top),
//       dimensions: Dimensions(command.payload.width, command.payload.height),
//       url: command.payload.url,
//       clientUuid: command.payload.clientUuid,
//       correlationUuid: command.headers.correlationUuid
//     })

//     const selection = DomainSelectors.getSelection(
//       command.payload.clientUuid,
//       state
//     )

//     const deselectedEvents = selection.map((node) => {
//       return new NodeDeselected(
//         {
//           uuid: node.uuid,
//           clientUuid: command.payload.clientUuid
//         },
//         command.headers
//       )
//     })

//     const nodeSelected = new NodeSelected(
//       {
//         uuid: command.payload.uuid,
//         clientUuid: command.payload.clientUuid
//       },
//       command.headers
//     )

//     return [imageCreated, ...deselectedEvents, nodeSelected]
//   })
//   .undo(({ command }) => {
//     return [
//       new NodeDeleted(
//         {
//           uuid: command.payload.uuid,
//           clientUuid: command.payload.clientUuid
//         },
//         command.headers
//       )
//     ]
//   })

export const TODO = {}
