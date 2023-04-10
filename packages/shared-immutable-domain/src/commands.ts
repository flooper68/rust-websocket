import { Fill, ImageUrl, NodeUuid, PositionValue } from './document/types.js'
import { ClientColor, ClientName, ClientUuid } from './session/types.js'

export enum DocumentSessionCommandType {
  LockSelection = 'LockSelection',
  UnlockSelection = 'UnlockSelection',
  DeleteSelection = 'DeleteSelection',
  SetRectangleSelectionFill = 'SetRectangleSelectionFill',
  SetImageSelectionUrl = 'SetImageSelectionUrl',
  ConnectClient = 'ConnectClient',
  DisconnectClient = 'DisconnectClient',
  MoveClientCursor = 'MoveClientCursor',
  CreateRectangle = 'CreateRectangle',
  CreateImage = 'CreateImage',
  SelectNodes = 'SelectNodes',
  AddNodeToSelection = 'NodeAddedToSelection',
  StartDragging = 'StartDragging',
  FinishDragging = 'FinishDragging',
  MoveDragging = 'MoveDragging',
  UndoClientCommand = 'UndoClientCommand',
  RedoClientCommand = 'RedoClientCommand'
}

export class LockSelection {
  readonly type = DocumentSessionCommandType.LockSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class UnlockSelection {
  readonly type = DocumentSessionCommandType.UnlockSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class DeleteSelection {
  readonly type = DocumentSessionCommandType.DeleteSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class SetRectangleSelectionFill {
  readonly type = DocumentSessionCommandType.SetRectangleSelectionFill
  constructor(
    public payload: {
      clientUuid: ClientUuid
      fill: Fill
    }
  ) {}
}

export class SetImageSelectionUrl {
  readonly type = DocumentSessionCommandType.SetImageSelectionUrl
  constructor(
    public payload: {
      clientUuid: ClientUuid
      url: ImageUrl
    }
  ) {}
}

export class ConnectClient {
  readonly type = DocumentSessionCommandType.ConnectClient
  constructor(
    public payload: {
      clientUuid: ClientUuid
      color: ClientColor
      name: ClientName
    }
  ) {}
}

export class DisconnectClient {
  readonly type = DocumentSessionCommandType.DisconnectClient
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class MoveClientCursor {
  readonly type = DocumentSessionCommandType.MoveClientCursor
  constructor(
    public payload: {
      clientUuid: ClientUuid
      left: PositionValue
      top: PositionValue
    }
  ) {}
}

export class CreateRectangle {
  readonly type = DocumentSessionCommandType.CreateRectangle
  constructor(
    public payload: {
      clientUuid: ClientUuid
      uuid: NodeUuid
      fill: Fill
      left: PositionValue
      top: PositionValue
    }
  ) {}
}

export class CreateImage {
  readonly type = DocumentSessionCommandType.CreateImage
  constructor(
    public payload: {
      clientUuid: ClientUuid
      uuid: NodeUuid
      left: PositionValue
      top: PositionValue
    }
  ) {}
}

export class SelectNodes {
  readonly type = DocumentSessionCommandType.SelectNodes
  constructor(
    public payload: {
      clientUuid: ClientUuid
      nodes: NodeUuid[]
    }
  ) {}
}

export class AddNodeToSelection {
  readonly type = DocumentSessionCommandType.AddNodeToSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
      node: NodeUuid
    }
  ) {}
}

export class StartDragging {
  readonly type = DocumentSessionCommandType.StartDragging
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class FinishDragging {
  readonly type = DocumentSessionCommandType.FinishDragging
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class MoveDragging {
  readonly type = DocumentSessionCommandType.MoveDragging
  constructor(
    public payload: {
      clientUuid: ClientUuid
      diffLeft: PositionValue
      diffTop: PositionValue
    }
  ) {}
}

export class UndoClientCommand {
  readonly type = DocumentSessionCommandType.UndoClientCommand
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class RedoClientCommand {
  readonly type = DocumentSessionCommandType.RedoClientCommand
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export type DocumentSessionCommand =
  | LockSelection
  | UnlockSelection
  | DeleteSelection
  | SetRectangleSelectionFill
  | SetImageSelectionUrl
  | ConnectClient
  | DisconnectClient
  | MoveClientCursor
  | CreateImage
  | CreateRectangle
  | SelectNodes
  | AddNodeToSelection
  | StartDragging
  | FinishDragging
  | MoveDragging
  | UndoClientCommand
  | RedoClientCommand
