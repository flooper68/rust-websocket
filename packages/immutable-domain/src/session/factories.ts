import { ClientUuid, ConnectedClient } from './types'

interface ConnectedClientFactoryProps {
  uuid: ClientUuid
}

export type ConnectedClientFactory = (
  props: ConnectedClientFactoryProps
) => ConnectedClient

const createConnectedClient: ConnectedClientFactory = (props) => {
  return {
    uuid: props.uuid,
    cursor: {
      left: 0,
      top: 0
    },
    undoStack: [],
    redoStack: [],
    selection: []
  }
}

export const SessionFactories = {
  createConnectedClient
}
