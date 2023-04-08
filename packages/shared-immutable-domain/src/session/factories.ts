import {
  ClientUuid,
  ConnectedClient,
  ClientColor,
  ClientName
} from './types.js'

interface ConnectedClientFactoryProps {
  uuid: ClientUuid
  color: ClientColor
  name: ClientName
}

export type ConnectedClientFactory = (
  props: ConnectedClientFactoryProps
) => ConnectedClient

const createConnectedClient: ConnectedClientFactory = (props) => {
  return {
    uuid: props.uuid,
    color: props.color,
    name: props.name,
    cursor: {
      left: 0,
      top: 0
    },
    dragging: null,
    undoStack: [],
    redoStack: [],
    selection: []
  }
}

export const SessionFactories = {
  createConnectedClient
}
