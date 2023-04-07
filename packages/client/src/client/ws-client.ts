import { getRandomColor } from '@shared/common'
import {
  ConnectClient,
  DocumentSessionCommand,
  DocumentSessionEvent,
  DocumentSessionRoot,
  DocumentSessionState
} from '@shared/immutable-domain'
import { Observable, Subject } from 'rxjs'
import { v4 } from 'uuid'

export const CLIENT_UUID = v4()

export class WsClient {
  private readonly _client = new WebSocket(`ws://localhost:6464`)
  private _documentSessionRoot: DocumentSessionRoot | null = null
  private _domainSubject$ = new Subject<DocumentSessionEvent>()
  private _connectionSubject$ = new Subject<boolean>()

  public domainStream$: Observable<DocumentSessionEvent> =
    this._domainSubject$.asObservable()
  public connectionStream$: Observable<boolean> =
    this._connectionSubject$.asObservable()

  constructor() {
    console.log(`Setting up ws client.`)

    const onMessage = (message: MessageEvent<string>) => {
      const data = JSON.parse(message.data) as
        | {
            messageType: 'initialState'
            payload: DocumentSessionState
          }
        | {
            messageType: 'command'
            payload: DocumentSessionCommand
          }

      if (data.messageType === 'command') {
        if (!this._documentSessionRoot) {
          console.log(
            `Received ws command while not initialized, skipping.`,
            data.payload
          )
          return
        } else {
          console.log(`Received ws command, dispatching.`, data.payload)
          this._documentSessionRoot.dispatch(data.payload)
        }

        return
      } else {
        console.log(`Received initial state, session is ready.`, data.payload)
        this._documentSessionRoot = new DocumentSessionRoot(data.payload)
        this._documentSessionRoot.domainStream$.subscribe((e) => {
          this._domainSubject$.next(e)
        })
        this._connectionSubject$.next(true)
      }
    }

    const onConnected = () => {
      console.log(`Ws Connected`)
      this._client.onmessage = onMessage

      const connectClient = new ConnectClient({
        clientUuid: CLIENT_UUID,
        color: getRandomColor()
      })

      this.dispatch(connectClient)
    }

    const onDisconnected = () => {
      this._connectionSubject$.next(false)
      console.log(`Ws Disconnected`)
    }

    this._client.onopen = onConnected
    this._client.onclose = onDisconnected
  }

  dispatch(command: DocumentSessionCommand) {
    if (this._client.OPEN !== 1) {
      console.warn(`Ws client not connected, skipping command.`, command)
      return
    }

    console.log(`Sending ws command.`, command)

    this._client.send(
      JSON.stringify({
        messageType: 'command',
        payload: command
      })
    )
  }

  getState() {
    if (this._documentSessionRoot == null) {
      throw new Error(`Ws client not yet initialized.`)
    }

    return this._documentSessionRoot.getState()
  }
}
