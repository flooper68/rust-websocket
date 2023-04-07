import { DocumentEvent, NodeUuid, PositionValue } from '../document/types.js'

export type ClientUuid = string

export interface CommittedCommand {
  redoEvents: DocumentEvent[]
  undoEvents: DocumentEvent[]
}

export interface ConnectedClient {
  uuid: ClientUuid
  cursor: {
    left: PositionValue
    top: PositionValue
  }
  undoStack: CommittedCommand[]
  redoStack: CommittedCommand[]
  selection: NodeUuid[]
}

export enum SessionEventType {
  ClientConnected = 'ClientConnected',
  ClientDisconnected = 'ClientDisconnected',
  ClientCursorMoved = 'ClientCursorMoved',
  NodesSelected = 'NodeSelected'
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

export type SessionEvent =
  | ClientConnected
  | ClientDisconnected
  | ClientCursorMoved
  | NodesSelected

export interface SessionState {
  clients: Record<ClientUuid, ConnectedClient>
}
