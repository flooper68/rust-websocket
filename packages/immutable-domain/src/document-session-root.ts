import { match } from 'ts-pattern'
import {
  DocumentSessionCommand,
  DocumentSessionCommands,
  DocumentSessionCommandType
} from './commands'
import { DocumentReducer } from './document/reducer'
import {
  DocumentEvent,
  DocumentEventType,
  DocumentState
} from './document/types'
import { SessionReducer } from './session/reducer'
import { SessionEvent, SessionState } from './session/types'

export type RootEvent = SessionEvent | DocumentEvent

export interface DocumentSession {
  session: SessionState
  document: DocumentState
}

export class DocumentSessionRoot {
  private _documentState: DocumentState = { nodes: {} }
  private _sessionState: SessionState = { clients: {} }

  private _dispatchEvent = (events: RootEvent[]) => {
    const documentState = this._documentState
    const sessionState = this._sessionState

    try {
      for (const event of events) {
        console.log(`Reducing event: ${event.type}`)

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
    } catch (e) {
      console.log(
        `There was an error reducing DomainRoot events: ${e}, rolling back changes.`
      )

      this._documentState = documentState
      this._sessionState = sessionState
    }
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
