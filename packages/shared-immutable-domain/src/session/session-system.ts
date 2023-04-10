import { Subject } from 'rxjs'
import {
  ConnectClient,
  DisconnectClient,
  DocumentSessionCommandType,
  MoveClientCursor
} from '../commands.js'
import { ClientAlreadyExists, ClientIsNotConnected } from './errors.js'
import { SessionFactories } from './factories.js'
import { ClientColor, ClientName, ClientUuid } from './types.js'

export interface SessionConnectedClient {
  uuid: ClientUuid
  color: ClientColor
  name: ClientName
  cursor: {
    left: number
    top: number
  }
}

interface SessionSystemState {
  clients: Record<ClientUuid, SessionConnectedClient>
}

export enum SessionSystemEventType {
  ClientConnected = 'ClientConnected',
  ClientDisconnected = 'ClientDisconnected',
  ClientCursorMoved = 'ClientCursorMoved'
}

export class ClientConnected {
  readonly type = SessionSystemEventType.ClientConnected
  constructor(public readonly payload: SessionConnectedClient) {}
}

export class ClientDisconnected {
  readonly type = SessionSystemEventType.ClientDisconnected
  constructor(
    public readonly payload: {
      uuid: ClientUuid
    }
  ) {}
}

export class ClientCursorMoved {
  readonly type = SessionSystemEventType.ClientCursorMoved
  constructor(
    public readonly payload: {
      clientUuid: ClientUuid
      left: number
      top: number
    }
  ) {}
}

export type SessionSystemEvent =
  | ClientConnected
  | ClientDisconnected
  | ClientCursorMoved

function reduce(
  event: SessionSystemEvent,
  state: SessionSystemState
): SessionSystemState {
  switch (event.type) {
    case SessionSystemEventType.ClientConnected: {
      const client = state.clients[event.payload.uuid]

      if (client != null) {
        throw new ClientAlreadyExists(event.payload.uuid)
      }

      return {
        ...state,
        clients: {
          ...state.clients,
          [event.payload.uuid]: event.payload
        }
      }
    }
    case SessionSystemEventType.ClientDisconnected: {
      const client = state.clients[event.payload.uuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.uuid)
      }

      const updatedClients = {
        ...state.clients
      }

      delete updatedClients[event.payload.uuid]

      return {
        ...state,
        clients: updatedClients
      }
    }
    case SessionSystemEventType.ClientCursorMoved: {
      const client = state.clients[event.payload.clientUuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }

      const updatedClient = {
        ...client,
        cursor: {
          left: event.payload.left,
          top: event.payload.top
        }
      }

      return {
        ...state,
        clients: {
          ...state.clients,
          [event.payload.clientUuid]: updatedClient
        }
      }
    }
    default: {
      const exhaustiveCheck: never = event
      throw new Error(`Unhandled event type ${exhaustiveCheck}`)
    }
  }
}

export class SessionSystem {
  private _sessionState: SessionSystemState
  private _subject$ = new Subject<SessionSystemEvent>()

  public eventStream$ = this._subject$.asObservable()

  constructor(initialState: SessionSystemState) {
    this._sessionState = initialState
  }

  private _dispatch(event: SessionSystemEvent) {
    this._sessionState = reduce(event, this._sessionState)
    this._subject$.next(event)
  }

  private _connectClient(command: ConnectClient) {
    const newClient = SessionFactories.createConnectedClient({
      uuid: command.payload.clientUuid,
      color: command.payload.color,
      name: command.payload.name
    })

    const event = new ClientConnected(newClient)

    this._dispatch(event)
  }

  private _disconnectClient(command: DisconnectClient) {
    const event = new ClientDisconnected({
      uuid: command.payload.clientUuid
    })

    this._dispatch(event)
  }

  private _moveClientCursor(command: MoveClientCursor) {
    const event = new ClientCursorMoved(command.payload)

    this._dispatch(event)
  }

  getState() {
    return this._sessionState
  }

  getConnectedClient(clientUuid: ClientUuid) {
    return this._sessionState.clients[clientUuid]
  }

  getConnectedClients() {
    return Object.values(this._sessionState.clients)
  }

  isClientConnected(clientUuid: ClientUuid) {
    return this._sessionState.clients[clientUuid] != null
  }

  dispatch(command: ConnectClient | DisconnectClient | MoveClientCursor) {
    switch (command.type) {
      case DocumentSessionCommandType.ConnectClient:
        return this._connectClient(command)
      case DocumentSessionCommandType.DisconnectClient:
        return this._disconnectClient(command)
      case DocumentSessionCommandType.MoveClientCursor:
        return this._moveClientCursor(command)
      default: {
        const exhaustiveCheck: never = command
        throw new Error(`Unhandled command type ${exhaustiveCheck}`)
      }
    }
  }
}
