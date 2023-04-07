import { Observable, Subject } from 'rxjs'
import { match } from 'ts-pattern'
import {
  DocumentSessionCommand,
  DocumentSessionCommands,
  DocumentSessionCommandType
} from './commands.js'
import { DocumentReducer } from './document/reducer.js'
import {
  DocumentEvent,
  DocumentEventType,
  DocumentState
} from './document/types.js'
import { SessionReducer } from './session/reducer.js'
import { SessionEvent, SessionState } from './session/types.js'

export type DocumentSessionEvent = SessionEvent | DocumentEvent

export interface DocumentSessionState {
  session: SessionState
  document: DocumentState
}

export class DocumentSessionRoot {
  private _documentState: DocumentState
  private _sessionState: SessionState
  private _domainSubject$ = new Subject<DocumentSessionEvent>()

  public domainStream$: Observable<DocumentSessionEvent>

  constructor(
    initialState: {
      session: SessionState
      document: DocumentState
    } = {
      session: { clients: {} },
      document: { nodes: {} }
    }
  ) {
    this._documentState = initialState.document
    this._sessionState = initialState.session
    this.domainStream$ = this._domainSubject$.asObservable()
  }

  private _dispatchEvent = (events: DocumentSessionEvent[]) => {
    const documentState = this._documentState
    const sessionState = this._sessionState

    try {
      for (const event of events) {
        console.log(`Reducing event: ${event.type}.`)

        if (Object.values<string>(DocumentEventType).includes(event.type)) {
          this._documentState = DocumentReducer.reduce(
            event as DocumentEvent,
            this._documentState
          )
        } else {
          this._sessionState = SessionReducer.reduce(
            event as SessionEvent,
            this._sessionState
          )
        }
      }

      events.forEach((event) => {
        this._domainSubject$.next(event)
      })
    } catch (e) {
      console.log(
        `There was an error reducing DomainRoot events: ${e}, rolling back changes.`
      )

      this._documentState = documentState
      this._sessionState = sessionState
    }
  }

  getState(): DocumentSessionState {
    return { session: this._sessionState, document: this._documentState }
  }

  dispatch(command: DocumentSessionCommand) {
    const context = {
      state: { session: this._sessionState, document: this._documentState },
      dispatch: this._dispatchEvent
    }

    match(command)
      .with(
        {
          type: DocumentSessionCommandType.ConnectClient
        },
        (c) => DocumentSessionCommands.connectClient(c, context)
      )
      .with(
        {
          type: DocumentSessionCommandType.CreateImage
        },
        (c) => DocumentSessionCommands.createImage(c, context)
      )
      .with(
        {
          type: DocumentSessionCommandType.CreateRectangle
        },
        (c) => DocumentSessionCommands.createRectangle(c, context)
      )
      .with(
        {
          type: DocumentSessionCommandType.DeleteSelection
        },
        (c) => DocumentSessionCommands.deleteSelection(c, context)
      )
      .with(
        {
          type: DocumentSessionCommandType.DisconnectClient
        },
        (c) => DocumentSessionCommands.disconnectClient(c, context)
      )
      .with(
        {
          type: DocumentSessionCommandType.LockSelection
        },
        (c) => DocumentSessionCommands.lockSelection(c, context)
      )
      .with(
        {
          type: DocumentSessionCommandType.MoveClientCursor
        },
        (c) => DocumentSessionCommands.moveClientCursor(c, context)
      )
      .with(
        {
          type: DocumentSessionCommandType.MoveSelection
        },
        (c) => DocumentSessionCommands.moveSelection(c, context)
      )
      .with(
        {
          type: DocumentSessionCommandType.SetImageSelectionUrl
        },
        (c) => DocumentSessionCommands.setImageSelectionUrl(c, context)
      )
      .with(
        {
          type: DocumentSessionCommandType.SetRectangleSelectionFill
        },
        (c) => DocumentSessionCommands.setRectangleSelectionFill(c, context)
      )
      .with(
        {
          type: DocumentSessionCommandType.UnlockSelection
        },
        (c) => DocumentSessionCommands.unlockSelection(c, context)
      )
      .exhaustive()
  }
}
