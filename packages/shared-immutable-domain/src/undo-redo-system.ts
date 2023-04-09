import {
  RedoClientCommand,
  UndoClientCommand,
  CommandContext,
  DocumentSessionCommandType
} from './commands.js'
import { isNodeEvent } from './document/types.js'
import { SessionSelectors } from './selectors.js'
import {
  ClientCommandAddedToHistory,
  ClientUuid,
  DocumentSessionEvent,
  LastClientCommandRedone,
  LastClientCommandRedoSkipped,
  LastClientCommandUndone,
  LastClientCommandUndoSkipped,
  NodesEdited,
  NodesSelected,
  SessionEvent
} from './session/types.js'

interface Command<T extends string> {
  type: T
  payload: unknown
}

interface UndoableCommand<T extends string> {
  type: T
  payload: {
    clientUuid: ClientUuid
  }
}

type Handler<T extends string, C extends Command<T>> = (
  c: C,
  context: CommandContext
) => {
  events: DocumentSessionEvent[]
}

type UndoableHandler<T extends string, C extends UndoableCommand<T>> = (
  c: C,
  context: CommandContext
) => {
  redoEvents: DocumentSessionEvent[]
  undoEvents: DocumentSessionEvent[]
  transientEvents: SessionEvent[]
}

function isUndoClientCommand(
  command: Command<string>
): command is UndoClientCommand {
  return command.type === DocumentSessionCommandType.UndoClientCommand
}

function isRedoClientCommand(
  command: Command<string>
): command is RedoClientCommand {
  return command.type === DocumentSessionCommandType.RedoClientCommand
}

function buildUndoableCommand<
  C extends { payload: { clientUuid: ClientUuid } }
>(
  handler: (
    command: C,
    context: CommandContext
  ) => {
    undoEvents: DocumentSessionEvent[]
    redoEvents: DocumentSessionEvent[]
    transientEvents: SessionEvent[]
  }
) {
  return (command: C, context: CommandContext) => {
    const { redoEvents, undoEvents, transientEvents } = handler(
      command,
      context
    )

    const events = [...transientEvents, ...redoEvents]

    context.dispatch(events)

    const updatedClient = SessionSelectors.getConnectedClient(
      command.payload.clientUuid,
      context.getState().session
    )

    if (updatedClient == null) {
      throw new Error('Client not connected')
    }

    const editedNodes = redoEvents
      .filter(isNodeEvent)
      .map((e) => e.payload.uuid)

    context.dispatch([
      new NodesEdited({
        clientUuid: command.payload.clientUuid,
        nodes: editedNodes
      }),
      new ClientCommandAddedToHistory({
        clientUuid: command.payload.clientUuid,
        command: {
          undoEvents,
          redoEvents,
          selection: editedNodes
        }
      })
    ])
  }
}

function undoClientCommand(
  command: UndoClientCommand,
  context: CommandContext
) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const lastCommand = client.undoStack[client.undoStack.length - 1]

  if (lastCommand == null) {
    throw new Error('No command to undo')
  }

  for (const node of lastCommand.selection) {
    const nodeEditor = context.getState().session.nodeEditors[node]

    const editedByOtherUser =
      nodeEditor != null && nodeEditor !== command.payload.clientUuid

    const seletedByOtherUser = Object.values(
      context.getState().session.clients
    ).some(
      (client) =>
        client.uuid !== command.payload.clientUuid &&
        client.selection.includes(node)
    )

    if (seletedByOtherUser || editedByOtherUser) {
      context.dispatch([
        new LastClientCommandUndoSkipped({
          clientUuid: command.payload.clientUuid
        })
      ])
      return
    }
  }

  const events = [
    new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: lastCommand.selection
    }),
    ...lastCommand.undoEvents,
    new LastClientCommandUndone({
      clientUuid: command.payload.clientUuid
    })
  ]

  context.dispatch(events)
}

function redoClientCommand(
  command: RedoClientCommand,
  context: CommandContext
) {
  const client = SessionSelectors.getConnectedClient(
    command.payload.clientUuid,
    context.getState().session
  )

  if (client == null) {
    throw new Error('Client not connected')
  }

  const lastCommand = client.redoStack[client.redoStack.length - 1]

  if (lastCommand == null) {
    throw new Error('No command to redo')
  }

  for (const node of lastCommand.selection) {
    const nodeEditor = context.getState().session.nodeEditors[node]

    const editedByOtherUser =
      nodeEditor != null && nodeEditor !== command.payload.clientUuid

    const seletedByOtherUser = Object.values(
      context.getState().session.clients
    ).some(
      (client) =>
        client.uuid !== command.payload.clientUuid &&
        client.selection.includes(node)
    )

    if (seletedByOtherUser || editedByOtherUser) {
      context.dispatch([
        new LastClientCommandRedoSkipped({
          clientUuid: command.payload.clientUuid
        })
      ])
      return
    }
  }

  const events = [
    new NodesSelected({
      clientUuid: command.payload.clientUuid,
      nodes: lastCommand.selection
    }),
    ...lastCommand.redoEvents,
    new LastClientCommandRedone({
      clientUuid: command.payload.clientUuid
    })
  ]

  context.dispatch(events)
}

export class UndoRedoSystem<R> {
  constructor(
    private readonly _handlers: Record<
      string,
      | Handler<string, Command<string>>
      | UndoableHandler<string, UndoableCommand<string>>
    > = {}
  ) {}

  dispatch(
    command: R | RedoClientCommand | UndoClientCommand,
    context: CommandContext
  ): void {
    const typed_command = command as UndoableCommand<string>

    if (isUndoClientCommand(typed_command)) {
      undoClientCommand(typed_command, context)
      return
    }

    if (isRedoClientCommand(typed_command)) {
      redoClientCommand(typed_command, context)
      return
    }

    const handler = this._handlers[typed_command.type]

    if (handler == null) {
      throw new Error('Unknown command')
    }

    handler(typed_command, context)
  }
}

export class UndoRedoBuilder<R extends Record<string, unknown> = {}> {
  readonly _handlers: Record<string, Handler<string, Command<string>>> = {}

  constructor() {}

  undoableCommand<T extends string, C extends UndoableCommand<T>>(
    type: T,
    handler: UndoableHandler<T, C>
  ) {
    this._handlers[type] = buildUndoableCommand(handler) as Handler<
      string,
      Command<string>
    >
    return this as unknown as UndoRedoBuilder<R & { [K in T]: C }>
  }

  command<T extends string, C extends Command<T>>(
    type: T,
    handler: Handler<T, C>
  ) {
    this._handlers[type] = handler as Handler<string, Command<string>>
    return this as unknown as UndoRedoBuilder<R & { [K in T]: C }>
  }

  build() {
    return new UndoRedoSystem<R[keyof R]>(this._handlers)
  }
}
