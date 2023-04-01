import { Result } from '../../common/result'
import { UndoLastClientCommand } from '../commands'
import { DomainState } from '../domain-types'
import { ClientNotConnected, DomainError } from '../errors'
import { DomainEvent, LastClientCommandUndone } from '../events'
import { DomainSelectors } from '../selectors'

export function undoLastClientCommand(
  command: UndoLastClientCommand,
  state: Readonly<DomainState>
): Result<DomainError, DomainEvent[]> {
  const client = Result.fromOption(
    DomainSelectors.getClientConnection(command.payload.uuid, state),
    () => new ClientNotConnected(command.payload.uuid)
  )

  return client.map((client) => {
    const lastCommand = DomainSelectors.getLastClientUndoCommand(client)

    return lastCommand.match(
      (lastCommand) => {
        return [
          new LastClientCommandUndone(
            {
              uuid: command.payload.uuid,
              events: lastCommand.undoEvents
            },
            {
              correlationUuid: command.headers.correlationUuid
            }
          )
        ]
      },
      () => {
        return []
      }
    )
  })
}
