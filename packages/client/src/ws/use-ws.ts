import {
  buildDomain,
  ConnectClient,
  createInitialState,
  DomainCommand,
  DomainEvent,
  InitialStateSent,
  InitialStateSentType
} from '@shared/domain'
import { Subject } from 'rxjs'
import { v4 } from 'uuid'

export const CLIENT_UUID = v4()

const USE_LOCAL = false
const address = `ws://localhost:6464`

const session = buildDomain()
let initializedState = false
let onInitialize = () => {}

let client: WebSocket

function sendWsCommand(command: DomainCommand) {
  console.log(`Sending ws command.`, command)
  client.send(
    JSON.stringify({
      messageType: 'command',
      payload: command
    })
  )
}

export function dispatch(command: DomainCommand) {
  if (USE_LOCAL) {
    session.dispatch(command)
  } else {
    sendWsCommand(command)
  }
}

export const $domainStream = session.$domainStream
export const getSessionState = session.getSessionState
export const $wsCommandStream = new Subject<DomainCommand>()

$wsCommandStream.subscribe((command) => {
  if (initializedState) {
    session.dispatch(command)
  }
})

function getRandomColor() {
  const colors = [
    '#000000',
    '#0000FF',
    '#00FF00',
    '#00FFFF',
    '#FF0000',
    '#FF00FF',
    '#FFFF00',
    '#FFFFFF'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

function getRandomFunnyName() {
  const names = [
    'Hans',
    'Fritz',
    'Klaus',
    'Walter',
    'Dieter',
    'Otto',
    'Heinz',
    'Karl',
    'Hugo',
    'Friedrich',
    'Gustav',
    'Rudolf',
    'Ernst',
    'Kurt',
    'Ferdinand',
    'Wolfgang',
    'Gottfried',
    'Theodor',
    'Erich',
    'Hermann ',
    'Wilhelm'
  ]
  return names[Math.floor(Math.random() * names.length)]
}

export function connectClient() {
  console.log(`Connecting client.`, CLIENT_UUID)
  if (USE_LOCAL) {
    initializedState = true
    session.initialize({
      connections: {},
      nodes: createInitialState()
    })
    return Promise.resolve()
  }
  return new Promise<void>((res) => {
    function requestConnect() {
      if (client.readyState === WebSocket.OPEN) {
        sendWsCommand(
          new ConnectClient(
            {
              uuid: CLIENT_UUID,
              color: getRandomColor(),
              name: getRandomFunnyName()
            },
            {
              correlationUuid: v4()
            }
          )
        )

        onInitialize = res
      } else {
        setTimeout(requestConnect, 100)
      }
    }

    requestConnect()
  })
}

function setupWs() {
  client = new WebSocket(address)

  function onMessage(message: MessageEvent<string>) {
    const event = JSON.parse(message.data) as
      | {
          messageType: 'event'
          payload: DomainEvent | InitialStateSent
        }
      | {
          messageType: 'command'
          payload: DomainCommand
        }

    if (event.messageType === 'command') {
      console.log(`Received ws command`, event)
      $wsCommandStream.next(event.payload)
      return
    } else {
      console.log(`Received ws event`, event)
      if (event.payload.type === InitialStateSentType) {
        initializedState = true
        session.initialize(event.payload.payload)
        onInitialize()
      }
    }
  }

  function onConnected() {
    console.log(`Ws Connected`)
    client.onmessage = onMessage
  }

  function onDisconnected() {
    console.log(`Ws Disconnected`)
  }

  client.onopen = onConnected
  client.onclose = onDisconnected
}

if (!USE_LOCAL) {
  setupWs()
}
