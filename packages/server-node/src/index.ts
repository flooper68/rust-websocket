import {
  DisconnectClient,
  DocumentSessionCommand,
  DocumentSessionCommandType,
  DocumentSessionRoot,
  SessionEventType,
  DocumentSessionState
} from '@shared/immutable-domain'
import { Subject } from 'rxjs'
import { WebSocketServer } from 'ws'

const PORT = 6464

const documentSessionRoot = new DocumentSessionRoot()

const wss = new WebSocketServer({
  port: PORT
})

const $commandStream = new Subject<DocumentSessionCommand>()

$commandStream.subscribe((e) => {
  setImmediate(() => {
    console.log(`Dispatching command: ${e.type}.`)
    documentSessionRoot.dispatch(e)
  })
})

console.log(`Domain listens to command stream.`)

function createCommandMessage(command: DocumentSessionCommand) {
  return JSON.stringify({
    messageType: 'command',
    payload: command
  })
}

function createInitialStateMessage(event: DocumentSessionState) {
  return JSON.stringify({
    messageType: 'initialState',
    payload: event
  })
}

function parseCommandMessage(message: unknown) {
  try {
    const parsed = JSON.parse(`${message}`) as {
      messageType: string
      payload: DocumentSessionCommand
    }
    if (parsed.messageType === 'command') {
      return parsed.payload
    }

    console.warn(`Message ${parsed.messageType} is not a command.`)
    return null
  } catch (e) {
    console.error(`Error parsing message: ${e}.`)
    return null
  }
}

wss.on('listening', () => {
  console.log(`Listening on port ${PORT}.`)
})

wss.on('connection', function connection(ws) {
  console.log(`Connection established.`)

  let clientUuid: string | null = null

  ws.on('message', function message(data: string) {
    const command = parseCommandMessage(data)

    if (command == null) {
      return
    }

    console.log(`Received command: ${command.type}.`)

    if (
      clientUuid == null &&
      command.type === DocumentSessionCommandType.ConnectClient
    ) {
      console.log(`Setting client UUID to ${command.payload.clientUuid}.`)
      clientUuid = command.payload.clientUuid
    }

    $commandStream.next(command)
  })

  const commandSub = $commandStream.subscribe((command) => {
    console.log(`Emitting command: ${command.type} to client ${clientUuid}.`)
    ws.send(createCommandMessage(command))
  })

  const eventSub = documentSessionRoot.domainStream$.subscribe((event) => {
    console.log(`Emitting event: ${event.type} to client ${clientUuid}.`)

    if (
      event.type === SessionEventType.ClientConnected &&
      clientUuid === event.payload.uuid
    ) {
      console.log(`Emitting initial state to client ${clientUuid}.`)
      ws.send(createInitialStateMessage(documentSessionRoot.getState()))
    }
  })

  ws.on('close', () => {
    if (clientUuid != null) {
      $commandStream.next(new DisconnectClient({ clientUuid }))
    }

    console.log(`Connection closed.`)
    commandSub.unsubscribe()
    eventSub.unsubscribe()
  })
})
