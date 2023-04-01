import { v4 } from 'uuid'
import {
  buildDomain,
  DisconnectClient,
  DomainCommandType,
  createInitialState,
  type DomainCommand,
  type DomainEvent,
  DomainEventType,
  InitialStateSent
} from '@shared/domain'
import { Subject } from 'rxjs'
import { WebSocketServer } from 'ws'

const PORT = 6464

const session = buildDomain()

session.initialize({
  connections: {},
  nodes: createInitialState()
})

const wss = new WebSocketServer({
  port: PORT
})

const $commandStream = new Subject<DomainCommand>()

$commandStream.subscribe((e) => setImmediate(() => session.dispatch(e)))

function createCommandMessage(command: DomainCommand) {
  return JSON.stringify({
    messageType: 'command',
    payload: command
  })
}

function createEventMessage(event: DomainEvent | InitialStateSent) {
  return JSON.stringify({
    messageType: 'event',
    payload: event
  })
}

function parseCommandMessage(message: unknown) {
  console.log(`Parsing message: ${message}.`)
  try {
    const parsed = JSON.parse(`${message}`) as {
      messageType: string
      payload: DomainCommand
    }
    if (parsed.messageType === 'command') {
      console.log(`Returning payload of command ${parsed.messageType}.`)
      return parsed.payload
    }

    console.log(`Message ${parsed.messageType} is not a command.`)
    return null
  } catch (e) {
    console.log(`Error parsing message: ${e}.`)
    return null
  }
}

wss.on('listening', () => {
  console.log(`Listening on port ${PORT}.`)
})

wss.on('connection', function connection(ws) {
  console.log(`Connection established.`)

  let clientUuid: string | null = null

  ws.on('message', function message(data) {
    const command = parseCommandMessage(data)

    if (command == null) {
      return
    }

    console.log(`Received command: ${command.type}.`)

    if (
      clientUuid == null &&
      command.type === DomainCommandType.ConnectClient
    ) {
      console.log(`Setting client UUID to ${command.payload.uuid}.`)
      clientUuid = command.payload.uuid
    }

    setTimeout(() => {
      $commandStream.next(command)
    }, 20)
  })

  const commandSub = $commandStream.subscribe((command) => {
    console.log(`Emitting command: ${command.type} to client ${clientUuid}.`)
    ws.send(createCommandMessage(command))
  })

  const eventSub = session.$domainStream.subscribe((event) => {
    console.log(`Emitting event: ${event.type} to client ${clientUuid}.`)

    if (
      event.type === DomainEventType.ClientConnected &&
      clientUuid === event.payload.uuid
    ) {
      console.log(`Emitting initial state to client ${clientUuid}.`)
      ws.send(
        createEventMessage(new InitialStateSent(session.getSessionState()))
      )
    }

    ws.send(createEventMessage(event))
  })

  ws.on('close', () => {
    if (clientUuid) {
      $commandStream.next(
        new DisconnectClient(
          { uuid: clientUuid },
          {
            correlationUuid: v4()
          }
        )
      )
    }

    console.log(`Connection closed.`)
    commandSub.unsubscribe()
    eventSub.unsubscribe()
  })
})
