import { Option } from '../common/option'
import {
  ActiveNode,
  ClientColor,
  ClientName,
  ActiveClientSelection,
  ClientUuid,
  CommittedCommand,
  ConnectedClient,
  DimensionValue,
  Fill,
  NodeKind,
  NodeUuid,
  PositionValue,
  Rectangle,
  UnselectedNode,
  ClientSelectedNode
} from './domain-types'

export const ConnectedClientActions = {
  create(props: {
    uuid: ClientUuid
    name: ClientName
    color: ClientColor
  }): ConnectedClient {
    return {
      uuid: props.uuid,
      name: props.name,
      color: props.color,
      cursor: { left: PositionValue(0), top: PositionValue(0) },
      undoStack: [],
      redoStack: []
    }
  },
  moveCursor(
    props: { left: PositionValue; top: PositionValue },
    client: ConnectedClient
  ) {
    client.cursor.left = props.left
    client.cursor.top = props.top
  },
  addCommandToHistory(command: CommittedCommand, client: ConnectedClient) {
    client.undoStack.push(command)
    client.redoStack = []
  },
  undoCommand(client: ConnectedClient) {
    const lastCommand = client.undoStack.pop()

    if (lastCommand != null) {
      client.redoStack.push(lastCommand)
    }
  },
  redoCommand(client: ConnectedClient) {
    const lastCommand = client.redoStack.pop()

    if (lastCommand != null) {
      client.undoStack.push(lastCommand)
    }
  }
}

export const RectangleActions = {
  create(props: { uuid: NodeUuid; clientUuid: ClientUuid }): Rectangle {
    return {
      uuid: props.uuid,
      kind: NodeKind.Rectangle,
      base: {
        locked: false,
        deleted: false,
        lastEditor: ClientUuid(props.clientUuid),
        selectedBy: Option.Some(ClientUuid(props.clientUuid))
      },
      position: {
        left: PositionValue(0),
        top: PositionValue(0)
      },
      dimensions: {
        width: DimensionValue(100).unwrap(),
        height: DimensionValue(100).unwrap()
      },
      rectangleMetadata: {
        fill: Fill('red')
      }
    }
  }
}

export const NodeActions = {
  delete(rectangle: ActiveNode) {
    rectangle.base.deleted = true
  }
}

export const SelectionActions = {
  selectNodes<C extends ClientUuid>(
    props: { clientUuid: C; nodes: (UnselectedNode | ClientSelectedNode<C>)[] },
    clientSelection: ActiveClientSelection<C>
  ) {
    clientSelection.forEach((node) => {
      node.base.selectedBy = Option.None()
    })

    props.nodes.forEach((node) => {
      node.base.selectedBy = Option.Some(props.clientUuid)
    })
  },
  deselect<C extends ClientUuid>(clientSelection: ActiveClientSelection<C>) {
    clientSelection.forEach((node) => {
      node.base.selectedBy = Option.None()
    })
  }
}
