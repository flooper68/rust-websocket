import { ClientUuid, DocumentSessionEvent, SessionEvent } from './session/types'

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

type Handler<T extends string, C extends Command<T>> = (c: C) => {
  events: DocumentSessionEvent[]
}

type UndoableHandler<T extends string, C extends UndoableCommand<T>> = (
  c: C
) => {
  redoEvents: DocumentSessionEvent[]
  undoEvents: DocumentSessionEvent[]
  transientEvents: SessionEvent[]
}

export class UndoRedoSystem<R> {
  constructor(
    private readonly _handlers: Record<
      string,
      | Handler<string, Command<string>>
      | UndoableHandler<string, UndoableCommand<string>>
    > = {}
  ) {}

  dispatch(command: R): void {
    const handler = this._handlers[(command as Command<string>).type]

    if (handler == null) {
      throw new Error('Unknown command')
    }

    handler(command as UndoableCommand<string>)
  }
}

export class UndoRedoBuilder<R extends Record<string, unknown> = {}> {
  readonly _handlers: Record<
    string,
    | UndoableHandler<string, UndoableCommand<string>>
    | Handler<string, Command<string>>
  > = {}

  constructor() {}

  undoableCommand<T extends string, C extends UndoableCommand<T>>(
    type: T,
    handler: UndoableHandler<T, C>
  ) {
    this._handlers[type] = handler as UndoableHandler<
      string,
      UndoableCommand<string>
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

const test = new UndoRedoBuilder()
  .command('normal', (c: { type: 'normal'; payload: { c: 'c' } }) => {
    return { events: [] }
  })
  .undoableCommand(
    'test1',
    (_: { type: 'test1'; payload: { a: 'a'; clientUuid: ClientUuid } }) => {
      return {
        redoEvents: [],
        undoEvents: [],
        transientEvents: []
      }
    }
  )
  .undoableCommand(
    'test2',
    (_: { type: 'test2'; payload: { b: 'b'; clientUuid: ClientUuid } }) => {
      return {
        redoEvents: [],
        undoEvents: [],
        transientEvents: []
      }
    }
  )
  .build()

//   .undoableCommand('test2', (c: { type: 'test2' }) => {})
//   .build()
