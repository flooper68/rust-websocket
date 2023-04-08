import { DocumentEvent, NodeUuid, PositionValue } from '../document/types.js'

export type ClientUuid = string

export type ClientColor = string

export type ClientName = string

export interface CommittedCommand {
  redoEvents: DocumentEvent[]
  undoEvents: DocumentEvent[]
}

export interface ConnectedClient {
  uuid: ClientUuid
  color: ClientColor
  name: ClientName
  cursor: {
    left: PositionValue
    top: PositionValue
  }
  undoStack: CommittedCommand[]
  redoStack: CommittedCommand[]
  selection: NodeUuid[]
  dragging: {
    left: PositionValue
    top: PositionValue
  } | null
}

export enum SessionEventType {
  ClientConnected = 'ClientConnected',
  ClientDisconnected = 'ClientDisconnected',
  ClientCursorMoved = 'ClientCursorMoved',
  NodesSelected = 'NodeSelected',
  DraggingStarted = 'DraggingStarted',
  DraggingMoved = 'DraggingMoved',
  DraggingFinished = 'DraggingStopped'
}

export class ClientConnected {
  readonly type = SessionEventType.ClientConnected
  constructor(public readonly payload: ConnectedClient) {}
}

export class ClientDisconnected {
  readonly type = SessionEventType.ClientDisconnected
  constructor(public readonly payload: ConnectedClient) {}
}

export class ClientCursorMoved {
  readonly type = SessionEventType.ClientCursorMoved
  constructor(
    public readonly payload: {
      clientUuid: ClientUuid
      left: PositionValue
      top: PositionValue
    }
  ) {}
}

export class NodesSelected {
  readonly type = SessionEventType.NodesSelected
  constructor(
    public readonly payload: { nodes: NodeUuid[]; clientUuid: ClientUuid }
  ) {}
}

export class DraggingStarted {
  readonly type = SessionEventType.DraggingStarted
  constructor(public readonly payload: { clientUuid: ClientUuid }) {}
}

export class DraggingMoved {
  readonly type = SessionEventType.DraggingMoved
  constructor(
    public readonly payload: {
      clientUuid: ClientUuid
      diffLeft: PositionValue
      diffTop: PositionValue
    }
  ) {}
}

export class DraggingFinished {
  readonly type = SessionEventType.DraggingFinished
  constructor(public readonly payload: { clientUuid: ClientUuid }) {}
}

export type SessionEvent =
  | ClientConnected
  | ClientDisconnected
  | ClientCursorMoved
  | NodesSelected
  | DraggingStarted
  | DraggingMoved
  | DraggingFinished

export interface SessionState {
  clients: Record<ClientUuid, ConnectedClient>
}
