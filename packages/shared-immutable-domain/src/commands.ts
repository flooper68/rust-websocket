import { NodeFactories } from './document/factories.js'
import {
  Fill,
  ImageCreated,
  ImageUrl,
  NodeDeleted,
  NodeFillSet,
  NodeLocked,
  NodeMoved,
  NodeUnlocked,
  NodeUrlSet,
  NodeUuid,
  PositionValue,
  RectangleCreated
} from './document/types.js'
import {
  DocumentSessionEvent,
  DocumentSessionState
} from './document-session-root.js'
import { SessionSelectors } from './selectors.js'
import { SessionFactories } from './session/factories.js'
import {
  ClientConnected,
  ClientCursorMoved,
  ClientDisconnected,
  ClientUuid,
  NodesSelected
} from './session/types.js'

export enum DocumentSessionCommandType {
  LockSelection = 'LockSelection',
  UnlockSelection = 'UnlockSelection',
  MoveSelection = 'MoveSelection',
  DeleteSelection = 'DeleteSelection',
  SetRectangleSelectionFill = 'SetRectangleSelectionFill',
  SetImageSelectionUrl = 'SetImageSelectionUrl',
  ConnectClient = 'ConnectClient',
  DisconnectClient = 'DisconnectClient',
  MoveClientCursor = 'MoveClientCursor',
  CreateRectangle = 'CreateRectangle',
  CreateImage = 'CreateImage'
}

export class LockSelection {
  readonly type = DocumentSessionCommandType.LockSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class UnlockSelection {
  readonly type = DocumentSessionCommandType.UnlockSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class MoveSelection {
  readonly type = DocumentSessionCommandType.MoveSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
      left: PositionValue
      top: PositionValue
    }
  ) {}
}

export class DeleteSelection {
  readonly type = DocumentSessionCommandType.DeleteSelection
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class SetRectangleSelectionFill {
  readonly type = DocumentSessionCommandType.SetRectangleSelectionFill
  constructor(
    public payload: {
      clientUuid: ClientUuid
      fill: Fill
    }
  ) {}
}

export class SetImageSelectionUrl {
  readonly type = DocumentSessionCommandType.SetImageSelectionUrl
  constructor(
    public payload: {
      clientUuid: ClientUuid
      url: ImageUrl
    }
  ) {}
}

export class ConnectClient {
  readonly type = DocumentSessionCommandType.ConnectClient
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class DisconnectClient {
  readonly type = DocumentSessionCommandType.DisconnectClient
  constructor(
    public payload: {
      clientUuid: ClientUuid
    }
  ) {}
}

export class MoveClientCursor {
  readonly type = DocumentSessionCommandType.MoveClientCursor
  constructor(
    public payload: {
      clientUuid: ClientUuid
      left: PositionValue
      top: PositionValue
    }
  ) {}
}

export class CreateRectangle {
  readonly type = DocumentSessionCommandType.CreateRectangle
  constructor(
    public payload: {
      clientUuid: ClientUuid
      uuid: NodeUuid
    }
  ) {}
}

export class CreateImage {
  readonly type = DocumentSessionCommandType.CreateImage
  constructor(
    public payload: {
      clientUuid: ClientUuid
      uuid: NodeUuid
    }
  ) {}
}

export type DocumentSessionCommand =
  | LockSelection
  | UnlockSelection
  | MoveSelection
  | DeleteSelection
  | SetRectangleSelectionFill
  | SetImageSelectionUrl
  | ConnectClient
  | DisconnectClient
  | MoveClientCursor
  | CreateImage
  | CreateRectangle

interface CommandContext {
  state: DocumentSessionState
  dispatch: (event: DocumentSessionEvent[]) => void
}

function lockSelection(command: LockSelection, context: CommandContext) {
  const activeSelection = SessionSelectors.getClientActiveSelection(
    command.payload.clientUuid,
    context.state
  )

  const events = activeSelection.map((node) => {
    return new NodeLocked(node.uuid)
  })

  context.dispatch(events)
}

function unlockSelection(command: UnlockSelection, context: CommandContext) {
  const lockedSelection = SessionSelectors.getClientLockedSelection(
    command.payload.clientUuid,
    context.state
  )

  const events = lockedSelection.map((node) => {
    return new NodeUnlocked(node.uuid)
  })

  context.dispatch(events)
}

function moveSelection(command: MoveSelection, context: CommandContext) {
  const activeSelection = SessionSelectors.getClientActiveSelection(
    command.payload.clientUuid,
    context.state
  )

  const events = activeSelection.map((node) => {
    return new NodeMoved({
      uuid: node.uuid,
      left: command.payload.left,
      top: command.payload.top
    })
  })

  context.dispatch(events)
}

function deleteSelection(command: DeleteSelection, context: CommandContext) {
  const activeSelection = SessionSelectors.getClientActiveSelection(
    command.payload.clientUuid,
    context.state
  )

  const events = activeSelection.map((node) => {
    return new NodeDeleted(node.uuid)
  })

  context.dispatch(events)
}

function setRectangleSelectionFill(
  command: SetRectangleSelectionFill,
  context: CommandContext
) {
  if (
    !SessionSelectors.isOnlyActiveRectangleSelection(
      command.payload.clientUuid,
      context.state
    )
  ) {
    throw new Error('Only rectangles can be filled')
  }

  const activeRectangleSelection =
    SessionSelectors.getClientActiveRectangleSelection(
      command.payload.clientUuid,
      context.state
    )

  const events = activeRectangleSelection.map((node) => {
    return new NodeFillSet({ uuid: node.uuid, fill: command.payload.fill })
  })

  context.dispatch(events)
}

function setImageSelectionUrl(
  command: SetImageSelectionUrl,
  context: CommandContext
) {
  if (
    !SessionSelectors.isOnlyActiveImageSelection(
      command.payload.clientUuid,
      context.state
    )
  ) {
    throw new Error('Only images can have url set')
  }

  const activeImageSelection = SessionSelectors.getClientActiveImageSelection(
    command.payload.clientUuid,
    context.state
  )

  const events = activeImageSelection.map((node) => {
    return new NodeUrlSet({ uuid: node.uuid, url: command.payload.url })
  })

  context.dispatch(events)
}

function connectClient(command: ConnectClient, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.state.session
  )

  if (client != null) {
    throw new Error('Client already connected')
  }

  const newClient = SessionFactories.createConnectedClient({
    uuid: command.payload.clientUuid
  })

  const events = [new ClientConnected(newClient)]

  context.dispatch(events)
}

function disconnectClient(command: DisconnectClient, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.state.session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [new ClientDisconnected(client)]

  context.dispatch(events)
}

function moveClientCursor(command: MoveClientCursor, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.state.session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const events = [new ClientCursorMoved(command.payload)]

  context.dispatch(events)
}

function createRectangle(command: CreateRectangle, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.state.session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const rectangle = NodeFactories.createRectangle({
    uuid: command.payload.uuid,
    fill: 'red'
  })

  const events = [
    new RectangleCreated(rectangle),
    new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: [rectangle.uuid]
    })
  ]

  context.dispatch(events)
}

function createImage(command: CreateImage, context: CommandContext) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.state.session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const image = NodeFactories.createImage({
    uuid: command.payload.uuid,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/The_death.png/564px-The_death.png',
    imageWidth: 100,
    imageHeight: 100
  })

  const events = [
    new ImageCreated(image),
    new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: [image.uuid]
    })
  ]

  context.dispatch(events)
}

export const DocumentSessionCommands = {
  lockSelection,
  unlockSelection,
  moveSelection,
  deleteSelection,
  setRectangleSelectionFill,
  setImageSelectionUrl,
  connectClient,
  disconnectClient,
  moveClientCursor,
  createRectangle,
  createImage
}
