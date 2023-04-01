import {
  ClientColor,
  ClientName,
  ClientUuid,
  NodeUuid,
  PositionValue
} from './domain-types'

export enum DomainCommandType {
  ConnectClient = 'ConnectClient',
  DisconnectClient = 'DisconnectClient',
  MoveClientCursor = 'MoveClientCursor',
  // StartDragging = 'StartDragging',
  // DragSelection = 'DragSelection',
  // StopDragging = 'StopDragging',
  CreateRectangle = 'CreateRectangle',
  // CreateImage = 'CreateImage',
  SelectNodes = 'SelectNode',
  // DeselectAll = 'DeselectAll',
  // AddNodeToSelection = 'AddNodeToSelection',
  // DeleteSelectedNodes = 'DeleteSelectedNodes',
  // LockSelectedNodes = 'LockSelectedNodes',
  // UnlockSelectedNode = 'UnlockSelectedNode',
  // SetSelectedRectanglesFill = 'SetSelectedRectanglesFill',
  UndoLastClientCommand = 'UndoLastClientCommand',
  RedoLastClientCommand = 'RedoLastClientCommand'
}

type CommandHeaders = { correlationUuid: string }

export class ConnectClient {
  readonly type = DomainCommandType.ConnectClient
  constructor(
    public payload: {
      readonly uuid: ClientUuid
      readonly name: ClientName
      readonly color: ClientColor
    },
    public readonly headers: CommandHeaders
  ) {}
}

export class DisconnectClient {
  readonly type = DomainCommandType.DisconnectClient
  constructor(
    public payload: {
      readonly uuid: ClientUuid
    },
    public readonly headers: CommandHeaders
  ) {}
}

export class MoveClientCursor {
  readonly type = DomainCommandType.MoveClientCursor
  constructor(
    public payload: {
      readonly uuid: ClientUuid
      readonly left: PositionValue
      readonly top: PositionValue
    },
    public readonly headers: CommandHeaders
  ) {}
}

// export class StartDragging {
//   readonly type = DomainCommandType.StartDragging
//   constructor(
//     public payload: {
//       readonly clientUuid: string
//     },
//     public readonly headers: { correlationUuid: string }
//   ) {}
// }

// export class DragSelection {
//   readonly type = DomainCommandType.DragSelection
//   constructor(
//     public payload: {
//       readonly diffLeft: number
//       readonly diffTop: number
//       readonly clientUuid: string
//     },
//     public readonly headers: { correlationUuid: string }
//   ) {}
// }

// export class StopDragging {
//   readonly type = DomainCommandType.StopDragging
//   constructor(
//     public payload: {
//       readonly diffLeft: number
//       readonly diffTop: number
//       readonly clientUuid: string
//     },
//     public readonly headers: { correlationUuid: string }
//   ) {}
// }

// export class CreateImage {
//   readonly type = DomainCommandType.CreateImage
//   constructor(
//     public payload: {
//       readonly uuid: Uuid
//       readonly url: string
//       readonly left: number
//       readonly top: number
//       readonly width: number
//       readonly height: number
//       clientUuid: string
//     },
//     public readonly headers: { correlationUuid: string }
//   ) {}
// }

export class CreateRectangle {
  readonly type = DomainCommandType.CreateRectangle
  constructor(
    public payload: {
      readonly uuid: NodeUuid
      readonly clientUuid: ClientUuid
    },
    public readonly headers: CommandHeaders
  ) {}
}

export class SelectNodes {
  readonly type = DomainCommandType.SelectNodes
  constructor(
    public payload: {
      readonly nodes: NodeUuid[]
      readonly clientUuid: ClientUuid
    },
    public readonly headers: CommandHeaders
  ) {}
}

// export class DeselectAll {
//   readonly type = DomainCommandType.DeselectAll
//   constructor(
//     public payload: {
//       readonly clientUuid: string
//     },
//     public readonly headers: CommandHeaders
//   ) {}
// }

// export class AddNodeToSelection {
//   readonly type = DomainCommandType.AddNodeToSelection
//   constructor(
//     public readonly payload: { uuid: string; clientUuid: string },
//     public readonly headers: CommandHeaders
//   ) {}
// }

// export class DeleteSelectedNodes {
//   readonly type = DomainCommandType.DeleteSelectedNodes
//   constructor(
//     public payload: {
//       readonly clientUuid: string
//     },
//     public readonly headers: CommandHeaders
//   ) {}
// }

// export class LockSelectedNodes {
//   readonly type = DomainCommandType.LockSelectedNodes
//   constructor(
//     public payload: {
//       readonly clientUuid: string
//     },
//     public readonly headers: CommandHeaders
//   ) {}
// }

// export class UnlockSelectedNode {
//   readonly type = DomainCommandType.UnlockSelectedNode
//   constructor(
//     public payload: {
//       readonly clientUuid: string
//     },
//     public readonly headers: CommandHeaders
//   ) {}
// }

// export class SetSelectedRectanglesFill {
//   readonly type = DomainCommandType.SetSelectedRectanglesFill
//   constructor(
//     public payload: {
//       readonly fill: string
//       readonly clientUuid: string
//     },
//     public readonly headers: CommandHeaders
//   ) {}
// }

export class UndoLastClientCommand {
  readonly type = DomainCommandType.UndoLastClientCommand
  constructor(
    public payload: {
      readonly uuid: ClientUuid
    },
    public readonly headers: CommandHeaders
  ) {}
}

export class RedoLastClientCommand {
  readonly type = DomainCommandType.RedoLastClientCommand
  constructor(
    public payload: {
      readonly uuid: ClientUuid
    },
    public readonly headers: CommandHeaders
  ) {}
}

export const UndoableDomainCommand = [DomainCommandType.CreateRectangle]

export type UndoableDomainCommand = CreateRectangle
// | DeleteSelectedNodes
// | StopDragging
// | SetSelectedRectanglesFill
// | CreateImage
// | LockSelectedNodes
// | UnlockSelectedNode

export type OneTimeDomainCommand =
  | ConnectClient
  | DisconnectClient
  | MoveClientCursor
  | SelectNodes
  // | StartDragging
  // | DeselectAll
  // | AddNodeToSelection
  | UndoLastClientCommand
  | RedoLastClientCommand
// | DragSelection

export type DomainCommand = UndoableDomainCommand | OneTimeDomainCommand
