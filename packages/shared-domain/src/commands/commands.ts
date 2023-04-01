import { Uuid } from '../domain/domain-types'

export enum DomainCommandType {
  ConnectClient = 'ConnectClient',
  DisconnectClient = 'DisconnectClient',
  MoveClientCursor = 'MoveClientCursor',
  StartDragging = 'StartDragging',
  DragSelection = 'DragSelection',
  StopDragging = 'StopDragging',
  CreateRectangle = 'CreateRectangle',
  CreateImage = 'CreateImage',
  SelectedNode = 'SelectedNode',
  DeselectAll = 'DeselectAll',
  AddNodeToSelection = 'AddNodeToSelection',
  DeleteSelectedNodes = 'DeleteSelectedNodes',
  LockSelectedNodes = 'LockSelectedNodes',
  UnlockSelectedNode = 'UnlockSelectedNode',
  SetSelectedRectanglesFill = 'SetSelectedRectanglesFill',
  UndoLastClientCommand = 'Undo',
  RedoLastClientCommand = 'Redo'
}

export class ConnectClient {
  readonly type = DomainCommandType.ConnectClient
  constructor(
    public payload: {
      readonly uuid: string
      readonly name: string
      readonly color: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class DisconnectClient {
  readonly type = DomainCommandType.DisconnectClient
  constructor(
    public payload: {
      readonly uuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class MoveClientCursor {
  readonly type = DomainCommandType.MoveClientCursor
  constructor(
    public payload: {
      readonly clientUuid: string
      readonly left: number
      readonly top: number
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class StartDragging {
  readonly type = DomainCommandType.StartDragging
  constructor(
    public payload: {
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class DragSelection {
  readonly type = DomainCommandType.DragSelection
  constructor(
    public payload: {
      readonly diffLeft: number
      readonly diffTop: number
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class StopDragging {
  readonly type = DomainCommandType.StopDragging
  constructor(
    public payload: {
      readonly diffLeft: number
      readonly diffTop: number
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class CreateImage {
  readonly type = DomainCommandType.CreateImage
  constructor(
    public payload: {
      readonly uuid: Uuid
      readonly url: string
      readonly left: number
      readonly top: number
      readonly width: number
      readonly height: number
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class CreateRectangle {
  readonly type = DomainCommandType.CreateRectangle
  constructor(
    public payload: {
      readonly uuid: Uuid
      readonly fill: string
      readonly left: number
      readonly top: number
      readonly width: number
      readonly height: number
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class SelectNode {
  readonly type = DomainCommandType.SelectedNode
  constructor(
    public payload: {
      readonly uuid: string
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class DeselectAll {
  readonly type = DomainCommandType.DeselectAll
  constructor(
    public payload: {
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class AddNodeToSelection {
  readonly type = DomainCommandType.AddNodeToSelection
  constructor(
    public readonly payload: { uuid: string; clientUuid: string },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class DeleteSelectedNodes {
  readonly type = DomainCommandType.DeleteSelectedNodes
  constructor(
    public payload: {
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class LockSelectedNodes {
  readonly type = DomainCommandType.LockSelectedNodes
  constructor(
    public payload: {
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class UnlockSelectedNode {
  readonly type = DomainCommandType.UnlockSelectedNode
  constructor(
    public payload: {
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class SetSelectedRectanglesFill {
  readonly type = DomainCommandType.SetSelectedRectanglesFill
  constructor(
    public payload: {
      readonly fill: string
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class UndoLastClientCommand {
  readonly type = DomainCommandType.UndoLastClientCommand
  constructor(
    public payload: {
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class RedoLastClientCommand {
  readonly type = DomainCommandType.RedoLastClientCommand
  constructor(
    public payload: {
      readonly clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export type UndoableDomainCommand =
  | CreateRectangle
  | DeleteSelectedNodes
  | StopDragging
  | SetSelectedRectanglesFill
  | CreateImage
  | LockSelectedNodes
  | UnlockSelectedNode

export type OneTimeDomainCommand =
  | ConnectClient
  | DisconnectClient
  | MoveClientCursor
  | SelectNode
  | StartDragging
  | DeselectAll
  | AddNodeToSelection
  | UndoLastClientCommand
  | RedoLastClientCommand
  | DragSelection

export type DomainCommand =
  | ConnectClient
  | DisconnectClient
  | MoveClientCursor
  | CreateRectangle
  | SelectNode
  | StartDragging
  | StopDragging
  | DeselectAll
  | AddNodeToSelection
  | DeleteSelectedNodes
  | LockSelectedNodes
  | UnlockSelectedNode
  | CreateImage
  | SetSelectedRectanglesFill
  | UndoLastClientCommand
  | RedoLastClientCommand
  | DragSelection
