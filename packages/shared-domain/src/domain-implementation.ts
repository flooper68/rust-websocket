import { Subject } from 'rxjs'
import { DomainCommand, DomainCommandType } from './commands/commands.js'
import { UndoRedoSystemFactory } from './commands/core/undo-redo-core.js'
import { CommandDefinition } from './commands/undo-redo.js'
import { DomainState } from './domain/domain-types.js'
import { DomainEvent } from './events/events.js'
import { startMeasurement } from './measure.js'

export function buildDomain() {
  const $commandBus = new Subject<DomainCommand>()
  const $domainStream = new Subject<DomainEvent>()

  const UndoRedoSystem = UndoRedoSystemFactory.create(
    CommandDefinition,
    $domainStream
  )

  function initialize(state: DomainState) {
    UndoRedoSystem.initialize(state)
  }

  function dispatch(command: DomainCommand) {
    $commandBus.next(command)
  }

  $commandBus.subscribe((command) => {
    const measure = startMeasurement(`Handling command ${command.type}`)

    switch (command.type) {
      case DomainCommandType.UndoLastClientCommand: {
        UndoRedoSystem.undoLastClientCommand(command)
        break
      }
      case DomainCommandType.RedoLastClientCommand: {
        UndoRedoSystem.redoLastClientCommand(command)
        break
      }
      case DomainCommandType.UnlockSelectedNode: {
        // UndoRedoSystem.handle(command)
      }
      // default: {
      //   UndoRedoSystem.handle(command)
      // }
    }

    measure()
  })

  return {
    $domainStream: $domainStream.asObservable(),
    dispatch,
    getSessionState() {
      return UndoRedoSystem.getState()
    },
    initialize
  }
}
