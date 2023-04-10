import {
  DocumentSessionCommandType,
  LockSelection,
  UnlockSelection
} from '../commands.js'
import { Document } from '../document/document.js'
import {
  DocumentEvent,
  isActiveNode,
  Node,
  NodeLocked,
  NodeUnlocked
} from '../document/types.js'
import { SelectionSystem } from './selection-system.js'
import { ClientUuid } from './types.js'
import { UndoRedoSystem } from './undo-redo-system.js'

export class LockingSystem {
  private _selectionSystem: SelectionSystem
  private _undoRedoSystem: UndoRedoSystem
  private _document: Document

  constructor(
    selectionSystem: SelectionSystem,
    document: Document,
    undoRedoSystem: UndoRedoSystem
  ) {
    this._selectionSystem = selectionSystem
    this._document = document
    this._undoRedoSystem = undoRedoSystem
  }

  private _lockSelection(command: LockSelection) {
    const activeSelection = this._selectionSystem.getClientSelection(
      command.payload.clientUuid
    )

    const redoEvents = activeSelection.selection.map((uuid) => {
      return new NodeLocked({ uuid })
    })

    const undoEvents = activeSelection.selection.map((uuid) => {
      return new NodeUnlocked({ uuid })
    })

    this._undoRedoSystem.commit({
      redoEvents,
      undoEvents
    })(command)
  }

  private _unlockSelection(command: UnlockSelection) {
    const lockedSelection = this._selectionSystem.getClientSelection(
      command.payload.clientUuid
    )

    const redoEvents = lockedSelection.selection.map((uuid) => {
      return new NodeUnlocked({ uuid })
    })

    const undoEvents = lockedSelection.selection.map((uuid) => {
      return new NodeLocked({ uuid })
    })

    this._undoRedoSystem.commit({
      redoEvents,
      undoEvents
    })(command)
  }

  dispatch(command: LockSelection | UnlockSelection) {
    switch (command.type) {
      case DocumentSessionCommandType.LockSelection:
        return this._lockSelection(command)
      case DocumentSessionCommandType.UnlockSelection:
        return this._unlockSelection(command)
      default: {
        const exhaustiveCheck: never = command
        throw new Error(`Unhandled command type ${exhaustiveCheck}`)
      }
    }
  }

  commitUndoableLockableCommand<
    C extends { payload: { clientUuid: ClientUuid } }
  >(
    handler: (activeSelection: Node[]) => {
      undoEvents: DocumentEvent[]
      redoEvents: DocumentEvent[]
    },
    command: C
  ) {
    const clientSelection = this._selectionSystem.getClientSelection(
      command.payload.clientUuid
    )

    const activeSelection = clientSelection.selection.map((nodeUuid) => {
      const node = this._document.getNode(nodeUuid)

      if (node == null) {
        throw new Error(`Node ${nodeUuid} does not exist`)
      }

      return node
    })

    if (activeSelection.some((node) => !isActiveNode(node))) {
      throw new Error(
        'Cannot perform command, selection contains Deleted or Locked nodes'
      )
    }

    const result = handler(activeSelection)

    this._undoRedoSystem.commit(result)(command)
  }

  commitLockableCommand<C extends { payload: { clientUuid: ClientUuid } }>(
    handler: (command: C, context: { activeSelection: Node[] }) => void,
    command: C
  ) {
    const clientSelection = this._selectionSystem.getClientSelection(
      command.payload.clientUuid
    )

    const activeSelection = clientSelection.selection.map((nodeUuid) => {
      const node = this._document.getNode(nodeUuid)

      if (node == null) {
        throw new Error(`Node ${nodeUuid} does not exist`)
      }

      return node
    })

    if (activeSelection.some((node) => !isActiveNode(node))) {
      throw new Error(
        'Cannot perform command, selection contains Deleted or Locked nodes'
      )
    }

    handler(command, {
      activeSelection
    })
  }
}
