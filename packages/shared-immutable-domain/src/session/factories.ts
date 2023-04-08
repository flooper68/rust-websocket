import { ClientUuid, ConnectedClient, ClientColor } from './types.js'

interface ConnectedClientFactoryProps {
  uuid: ClientUuid
  color: ClientColor
}

export type ConnectedClientFactory = (
  props: ConnectedClientFactoryProps
) => ConnectedClient

const createConnectedClient: ConnectedClientFactory = (props) => {
  return {
    uuid: props.uuid,
    color: props.color,
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
