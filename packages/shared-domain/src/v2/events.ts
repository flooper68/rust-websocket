import {
  ClientColor,
  ClientName,
  ClientUuid,
  CommittedCommand,
  NodeUuid,
  Position,
  Rectangle
} from './domain-types.js'

export enum DomainEventType {
  ClientConnected = 'ClientConnected',
  ClientDisconnected = 'ClientDisconnected',
  ClientCursorMoved = 'ClientCursorMoved',
  ClientCommandAddedToHistory = 'ClientCommandAddedToHistory',
  LastClientCommandUndone = 'LastClientCommandUndone',
  // LastClientCommandUndoSkipped = 'LastClientCommandUndoSkipped',
  LastClientCommandRedone = 'LastClientCommandRedone',
  // LastClientCommandRedoSkipped = 'LastClientCommandRedoSkipped',
  RectangleCreated = 'RectangleCreated',
  // ImageCreated = 'ImageCreated',
  NodesSelected = 'NodeSelected',
  // NodeDeselected = 'NodeDeselected',
  // NodeMoved = 'NodeMoved',
  // PositionDraggingStarted = 'PositionDraggingStarted',
  // NodePositionSet = 'NodePositionSet',
  NodeDeleted = 'NodeDeleted'
  // NodeRestored = 'NodeRestored',
  // NodeLocked = 'NodeLocked',
  // NodeUnlocked = 'NodeUnlocked',
  // RectangleFillSet = 'RectangleFillSet'
}

interface EventHeaders {
  correlationUuid: string
}

export class ClientConnected {
  readonly type = DomainEventType.ClientConnected
  constructor(
    public readonly payload: {
      uuid: ClientUuid
      name: ClientName
      color: ClientColor
    },
    public readonly headers: EventHeaders
  ) {}
}

export class ClientDisconnected {
  readonly type = DomainEventType.ClientDisconnected
  constructor(
    public readonly payload: { uuid: ClientUuid },
    public readonly headers: EventHeaders
  ) {}
}

export class ClientCursorMoved {
  readonly type = DomainEventType.ClientCursorMoved
  constructor(
    public readonly payload: {
      uuid: ClientUuid
      position: Position
    },
    public readonly headers: EventHeaders
  ) {}
}

export class ClientCommandAddedToHistory {
  readonly type = DomainEventType.ClientCommandAddedToHistory
  constructor(
    public readonly payload: {
      command: CommittedCommand
      clientUuid: ClientUuid
    },
    public readonly headers: EventHeaders
  ) {}
}

export class LastClientCommandUndone {
  readonly type = DomainEventType.LastClientCommandUndone
  constructor(
    public readonly payload: {
      uuid: ClientUuid
      events: DomainEvent[]
    },
    public readonly headers: EventHeaders
  ) {}
}

// export class LastClientCommandUndoSkipped {
//   readonly type = DomainEventType.LastClientCommandUndoSkipped
//   constructor(
//     public readonly payload: {
//       clientUuid: string
//     },
//     public readonly headers: EventHeaders
//   ) {}
// }

export class LastClientCommandRedone {
  readonly type = DomainEventType.LastClientCommandRedone
  constructor(
    public readonly payload: {
      uuid: ClientUuid
      events: DomainEvent[]
    },
    public readonly headers: EventHeaders
  ) {}
}

// export class LastClientCommandRedoSkipped {
//   readonly type = DomainEventType.LastClientCommandRedoSkipped
//   constructor(
//     public readonly payload: {
//       clientUuid: string
//     },
//     public readonly headers: EventHeaders
//   ) {}
// }

export class RectangleCreated {
  readonly type = DomainEventType.RectangleCreated
  constructor(
    public readonly payload: { rectangle: Rectangle; clientUuid: ClientUuid },
    public readonly headers: EventHeaders
  ) {}
}

// export class ImageCreated {
//   readonly type = DomainEventType.ImageCreated
//   constructor(
//     public readonly payload: Image,
//     public readonly headers: EventHeaders
//   ) {}
// }

// export class PositionDraggingStarted {
//   readonly type = DomainEventType.PositionDraggingStarted
//   constructor(
//     public readonly payload: {
//       uuid: Uuid
//       positionX: number
//       positionY: number
//       clientUuid: string
//     },
//     public readonly headers: EventHeaders
//   ) {}
// }

// export class NodeMoved {
//   readonly type = DomainEventType.NodeMoved
//   constructor(
//     public readonly payload: {
//       uuid: Uuid
//       positionDiff: Position
//       clientUuid: string
//     },
//     public readonly headers: EventHeaders
//   ) {}
// }

// export class NodePositionSet {
//   readonly type = DomainEventType.NodePositionSet
//   constructor(
//     public readonly payload: {
//       uuid: Uuid
//       position: Position
//       clientUuid: string
//     },
//     public readonly headers: EventHeaders
//   ) {}
// }

export class NodesSelected {
  readonly type = DomainEventType.NodesSelected
  constructor(
    public readonly payload: {
      nodes: NodeUuid[]
      clientUuid: ClientUuid
    },
    public readonly headers: EventHeaders
  ) {}
}

// export class NodeDeselected {
//   readonly type = DomainEventType.NodeDeselected
//   constructor(
//     public readonly payload: {
//       uuid: Uuid
//       clientUuid: string
//     },
//     public readonly headers: EventHeaders
//   ) {}
// }

export class NodeDeleted {
  readonly type = DomainEventType.NodeDeleted
  constructor(
    public readonly payload: { uuid: NodeUuid },
    public readonly headers: EventHeaders
  ) {}
}

// export class NodeRestored {
//   readonly type = DomainEventType.NodeRestored
//   constructor(
//     public readonly payload: { uuid: Uuid; clientUuid: string },
//     public readonly headers: EventHeaders
//   ) {}
// }

// export class NodeLocked {
//   readonly type = DomainEventType.NodeLocked
//   constructor(
//     public readonly payload: { uuid: Uuid; clientUuid: string },
//     public readonly headers: EventHeaders
//   ) {}
// }

// export class NodeUnlocked {
//   readonly type = DomainEventType.NodeUnlocked
//   constructor(
//     public readonly payload: { uuid: Uuid; clientUuid: string },
//     public readonly headers: EventHeaders
//   ) {}
// }

// export class RectangleFillSet {
//   readonly type = DomainEventType.RectangleFillSet
//   constructor(
//     public readonly payload: {
//       uuid: Uuid
//       fill: Fill
//       clientUuid: string
//     },
//     public readonly headers: EventHeaders
//   ) {}
// }

export type DomainEvent =
  | ClientConnected
  | ClientDisconnected
  | ClientCursorMoved
  | RectangleCreated
  | NodeDeleted
  | ClientCommandAddedToHistory
  | LastClientCommandUndone
  | LastClientCommandRedone
  | NodesSelected
// | LastClientCommandRedoSkipped
// | LastClientCommandUndone
// | LastClientCommandUndoSkipped

//   | RectangleCreated
//   | NodeSelected
//   | NodeDeselected
//   | NodeDeleted
//   | NodeRestored
//   | NodeLocked
//   | NodeUnlocked
//   | ImageCreated
//   | RectangleFillSet
//   | NodeMoved
//   | NodePositionSet
//   | PositionDraggingStarted
