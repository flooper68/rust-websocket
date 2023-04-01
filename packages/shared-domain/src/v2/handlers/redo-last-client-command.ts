import { Result } from '../../common/result'
import { RedoLastClientCommand } from '../commands'
import { DomainState } from '../domain-types'
import { ClientNotConnected, DomainError } from '../errors'
import { DomainEvent, LastClientCommandRedone } from '../events'
import { DomainSelectors } from '../selectors'

export function redoLastClientCommand(
  command: RedoLastClientCommand,
  state: Readonly<DomainState>
): Result<DomainError, DomainEvent[]> {
  const client = Result.fromOption(
    DomainSelectors.getClientConnection(command.payload.uuid, state),
    () => new ClientNotConnected(command.payload.uuid)
  )

  return client.map((client) => {
    const lastCommand = DomainSelectors.getLastClientRedoCommand(client)

    return lastCommand.match(
      (lastCommand) => {
        return [
          new LastClientCommandRedone(
            {
              uuid: command.payload.uuid,
              events: lastCommand.redoEvents
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
