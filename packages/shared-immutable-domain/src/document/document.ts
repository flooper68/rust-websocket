import { Subject } from 'rxjs'
import { DocumentReducer } from './reducer.js'
import { DocumentEvent, DocumentState } from './types.js'

export class Document {
  private _state: DocumentState
  private _subject$ = new Subject<DocumentEvent>()

  public eventStream$ = this._subject$.asObservable()

  constructor(initialState: DocumentState) {
    this._state = initialState
  }

  private _dispatch(event: DocumentEvent) {
    this._state = DocumentReducer.reduce(event, this._state)
    this._subject$.next(event)
  }

  getState() {
    return this._state
  }

  getNode(uuid: string) {
    return this._state.nodes[uuid]
  }

  commitEvent(event: DocumentEvent) {
    this._dispatch(event)
  }
}
