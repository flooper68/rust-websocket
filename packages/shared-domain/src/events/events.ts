import { UndoableDomainCommand } from '../commands/commands.js'
import {
  CommittedCommand,
  Fill,
  Image,
  Position,
  Rectangle,
  Uuid
} from '../domain/domain-types.js'

export enum DomainEventType {
  ClientConnected = 'ClientConnected',
  ClientDisconnected = 'ClientDisconnected',
  ClientCursorMoved = 'ClientCursorMoved',
  ClientCommandAddedToHistory = 'ClientActionHandled',
  LastClientCommandUndone = 'LastClientCommandUndone',
  LastClientCommandUndoSkipped = 'LastClientCommandUndoSkipped',
  LastClientCommandRedone = 'LastClientCommandRedone',
  LastClientCommandRedoSkipped = 'LastClientCommandRedoSkipped',
  RectangleCreated = 'RectangleCreated',
  ImageCreated = 'ImageCreated',
  NodeSelected = 'NodeSelected',
  NodeDeselected = 'NodeDeselected',
  NodeMoved = 'NodeMoved',
  PositionDraggingStarted = 'PositionDraggingStarted',
  NodePositionSet = 'NodePositionSet',
  NodeDeleted = 'NodeDeleted',
  NodeRestored = 'NodeRestored',
  NodeLocked = 'NodeLocked',
  NodeUnlocked = 'NodeUnlocked',
  RectangleFillSet = 'RectangleFillSet'
}

export class ClientConnected {
  readonly type = DomainEventType.ClientConnected
  constructor(
    public readonly payload: { uuid: string; name: string; color: string },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class ClientDisconnected {
  readonly type = DomainEventType.ClientDisconnected
  constructor(
    public readonly payload: { uuid: string },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class ClientCommandAddedToHistory {
  readonly type = DomainEventType.ClientCommandAddedToHistory
  constructor(
    public readonly payload: {
      command: CommittedCommand<UndoableDomainCommand, unknown>
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class LastClientCommandUndone {
  readonly type = DomainEventType.LastClientCommandUndone
  constructor(
    public readonly payload: {
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class LastClientCommandUndoSkipped {
  readonly type = DomainEventType.LastClientCommandUndoSkipped
  constructor(
    public readonly payload: {
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class LastClientCommandRedone {
  readonly type = DomainEventType.LastClientCommandRedone
  constructor(
    public readonly payload: {
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class LastClientCommandRedoSkipped {
  readonly type = DomainEventType.LastClientCommandRedoSkipped
  constructor(
    public readonly payload: {
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class ClientCursorMoved {
  readonly type = DomainEventType.ClientCursorMoved
  constructor(
    public readonly payload: { clientUuid: string; left: number; top: number },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class RectangleCreated {
  readonly type = DomainEventType.RectangleCreated
  constructor(
    public readonly payload: Rectangle,
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class ImageCreated {
  readonly type = DomainEventType.ImageCreated
  constructor(
    public readonly payload: Image,
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class PositionDraggingStarted {
  readonly type = DomainEventType.PositionDraggingStarted
  constructor(
    public readonly payload: {
      uuid: Uuid
      positionX: number
      positionY: number
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class NodeMoved {
  readonly type = DomainEventType.NodeMoved
  constructor(
    public readonly payload: {
      uuid: Uuid
      positionDiff: Position
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class NodePositionSet {
  readonly type = DomainEventType.NodePositionSet
  constructor(
    public readonly payload: {
      uuid: Uuid
      position: Position
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class NodeSelected {
  readonly type = DomainEventType.NodeSelected
  constructor(
    public readonly payload: {
      uuid: Uuid
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class NodeDeselected {
  readonly type = DomainEventType.NodeDeselected
  constructor(
    public readonly payload: {
      uuid: Uuid
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class NodeDeleted {
  readonly type = DomainEventType.NodeDeleted
  constructor(
    public readonly payload: { uuid: Uuid; clientUuid: string },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class NodeRestored {
  readonly type = DomainEventType.NodeRestored
  constructor(
    public readonly payload: { uuid: Uuid; clientUuid: string },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class NodeLocked {
  readonly type = DomainEventType.NodeLocked
  constructor(
    public readonly payload: { uuid: Uuid; clientUuid: string },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class NodeUnlocked {
  readonly type = DomainEventType.NodeUnlocked
  constructor(
    public readonly payload: { uuid: Uuid; clientUuid: string },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export class RectangleFillSet {
  readonly type = DomainEventType.RectangleFillSet
  constructor(
    public readonly payload: {
      uuid: Uuid
      fill: Fill
      clientUuid: string
    },
    public readonly headers: { correlationUuid: string }
  ) {}
}

export type DomainEvent =
  | ClientCommandAddedToHistory
  | LastClientCommandRedone
  | LastClientCommandRedoSkipped
  | LastClientCommandUndone
  | LastClientCommandUndoSkipped
  | ClientConnected
  | ClientDisconnected
  | ClientCursorMoved
  | RectangleCreated
  | NodeSelected
  | NodeDeselected
  | NodeDeleted
  | NodeRestored
  | NodeLocked
  | NodeUnlocked
  | ImageCreated
  | RectangleFillSet
  | NodeMoved
  | NodePositionSet
  | PositionDraggingStarted
