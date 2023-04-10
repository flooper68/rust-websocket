import { Subject } from 'rxjs'
import {
  DocumentSessionCommandType,
  FinishDragging,
  MoveDragging,
  StartDragging
} from '../commands.js'
import { NodeMoved, PositionValue } from '../document/types.js'
import { LockingSystem } from './locking-system'
import { SessionSystem, SessionSystemEventType } from './session-system.js'
import {
  ClientIsAlreadyDragging,
  ClientIsNotConnected,
  ClientIsNotDragging
} from './errors.js'
import { ClientUuid } from './types.js'

interface DraggingSystemState {
  clientDragging: Record<
    ClientUuid,
    {
      uuid: ClientUuid
      dragging: { left: PositionValue; top: PositionValue } | null
    }
  >
}

export enum DraggingSystemEventType {
  DraggingStarted = 'DraggingStarted',
  DraggingMoved = 'DraggingMoved',
  DraggingFinished = 'DraggingStopped'
}

export class DraggingStarted {
  readonly type = DraggingSystemEventType.DraggingStarted
  constructor(public readonly payload: { clientUuid: ClientUuid }) {}
}

export class DraggingMoved {
  readonly type = DraggingSystemEventType.DraggingMoved
  constructor(
    public readonly payload: {
      clientUuid: ClientUuid
      diffLeft: PositionValue
      diffTop: PositionValue
    }
  ) {}
}

export class DraggingFinished {
  readonly type = DraggingSystemEventType.DraggingFinished
  constructor(public readonly payload: { clientUuid: ClientUuid }) {}
}

export type DraggingSystemEvent =
  | DraggingStarted
  | DraggingMoved
  | DraggingFinished

function reduce(
  event: DraggingSystemEvent,
  state: DraggingSystemState
): DraggingSystemState {
  switch (event.type) {
    case DraggingSystemEventType.DraggingStarted: {
      const client = state.clientDragging[event.payload.clientUuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }

      if (client.dragging) {
        throw new ClientIsAlreadyDragging(event.payload.clientUuid)
      }

      const updatedClient = {
        ...client,
        dragging: {
          left: 0,
          top: 0
        }
      }

      return {
        ...state,
        clientDragging: {
          ...state.clientDragging,
          [event.payload.clientUuid]: updatedClient
        }
      }
    }
    case DraggingSystemEventType.DraggingMoved: {
      const client = state.clientDragging[event.payload.clientUuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }

      if (client.dragging == null) {
        throw new ClientIsNotDragging(event.payload.clientUuid)
      }

      const updatedClient = {
        ...client,
        dragging: {
          left: client.dragging.left + event.payload.diffLeft,
          top: client.dragging.top + event.payload.diffTop
        }
      }

      return {
        ...state,
        clientDragging: {
          ...state.clientDragging,
          [event.payload.clientUuid]: updatedClient
        }
      }
    }
    case DraggingSystemEventType.DraggingFinished: {
      const client = state.clientDragging[event.payload.clientUuid]

      if (client == null) {
        throw new ClientIsNotConnected(event.payload.clientUuid)
      }

      if (client.dragging == null) {
        throw new ClientIsNotDragging(event.payload.clientUuid)
      }

      const updatedClient = {
        ...client,
        dragging: null
      }

      return {
        ...state,
        clientDragging: {
          ...state.clientDragging,
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

export class DraggingSystem {
  private _state: DraggingSystemState
  private _sessionSystem: SessionSystem
  private _lockingSystem: LockingSystem
  private _subject$ = new Subject<DraggingSystemEvent>()

  public eventStream$ = this._subject$.asObservable()

  constructor(
    initialState: DraggingSystemState,
    sessionSystem: SessionSystem,
    lockingSystem: LockingSystem
  ) {
    this._state = initialState
    this._sessionSystem = sessionSystem
    this._lockingSystem = lockingSystem

    this._sessionSystem.eventStream$.subscribe((event) => {
      switch (event.type) {
        case SessionSystemEventType.ClientConnected:
          this._state.clientDragging[event.payload.uuid] = {
            uuid: event.payload.uuid,
            dragging: null
          }
          break
        case SessionSystemEventType.ClientDisconnected:
          delete this._state.clientDragging[event.payload.uuid]
          break
      }
    })
  }

  private _dispatch(event: DraggingSystemEvent) {
    this._state = reduce(event, this._state)
    this._subject$.next(event)
  }

  private _startDragging(command: StartDragging) {
    this._lockingSystem.commitLockableCommand(() => {
      const event = new DraggingStarted({
        clientUuid: command.payload.clientUuid
      })

      this._dispatch(event)
    }, command)
  }

  private _moveDragging(command: MoveDragging) {
    const event = new DraggingMoved({
      clientUuid: command.payload.clientUuid,
      diffLeft: command.payload.diffLeft,
      diffTop: command.payload.diffTop
    })

    this._dispatch(event)
  }

  private _finishDragging(command: FinishDragging) {
    this._lockingSystem.commitUndoableLockableCommand((activeSelection) => {
      const dragging =
        this._state.clientDragging[command.payload.clientUuid]?.dragging

      if (dragging == null) {
        throw new Error()
      }

      const redoEvents = [
        ...activeSelection.map((node) => {
          return new NodeMoved({
            uuid: node.uuid,
            left: node.left + dragging.left,
            top: node.top + dragging.top
          })
        })
      ]

      const undoEvents = [
        ...activeSelection.map((node) => {
          return new NodeMoved({
            uuid: node.uuid,
            left: node.left,
            top: node.top
          })
        })
      ]

      const event = new DraggingFinished({
        clientUuid: command.payload.clientUuid
      })

      this._dispatch(event)

      return {
        redoEvents,
        undoEvents
      }
    }, command)
  }

  getState() {
    return this._state.clientDragging
  }

  dispatch(command: StartDragging | MoveDragging | FinishDragging) {
    switch (command.type) {
      case DocumentSessionCommandType.StartDragging: {
        return this._startDragging(command)
      }
      case DocumentSessionCommandType.MoveDragging: {
        return this._moveDragging(command)
      }
      case DocumentSessionCommandType.FinishDragging: {
        return this._finishDragging(command)
      }
      default: {
        const exhaustiveCheck: never = command
        throw new Error(`Unhandled command type ${exhaustiveCheck}`)
      }
    }
  }
}
