import {
  CreateImage,
  CreateRectangle,
  DeleteSelection,
  DocumentSessionCommandType,
  SetRectangleSelectionFill
} from './commands.js'
import { NodeFactories } from './document/factories.js'
import {
  ImageCreated,
  isRectangle,
  NodeDeleted,
  NodeFillSet,
  NodeRestored,
  Rectangle,
  RectangleCreated
} from './document/types.js'
import { LockingSystem } from './locking-system.js'
import { UndoRedoSystem } from './undo-redo.js'

export class CommandsNew {
  private _undoRedoSystem: UndoRedoSystem
  private _lockingSystem: LockingSystem

  constructor(undoRedoSystem: UndoRedoSystem, lockingSystem: LockingSystem) {
    this._undoRedoSystem = undoRedoSystem
    this._lockingSystem = lockingSystem
  }

  private _createRectangle(command: CreateRectangle) {
    const rectangle = NodeFactories.createRectangle({
      uuid: command.payload.uuid,
      fill: command.payload.fill,
      left: command.payload.left,
      top: command.payload.top
    })

    const redoEvents = [new RectangleCreated(rectangle)]

    const undoEvents = [new NodeDeleted({ uuid: rectangle.uuid })]

    this._undoRedoSystem.commit({
      redoEvents,
      undoEvents
    })(command)
  }

  private _createImage(command: CreateImage) {
    const image = NodeFactories.createImage({
      uuid: command.payload.uuid,
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/The_death.png/564px-The_death.png',
      imageWidth: 100,
      imageHeight: 100,
      left: command.payload.left,
      top: command.payload.top
    })

    const redoEvents = [new ImageCreated(image)]

    const undoEvents = [new NodeDeleted({ uuid: image.uuid })]

    this._undoRedoSystem.commit({
      redoEvents,
      undoEvents
    })(command)
  }

  private _deleteSelection(command: DeleteSelection) {
    this._lockingSystem.commitUndoableLockableCommand((activeSelection) => {
      const redoEvents = [
        ...activeSelection.map((node) => {
          return new NodeDeleted({ uuid: node.uuid })
        })
      ]

      const undoEvents = [
        ...activeSelection.map((node) => {
          return new NodeRestored({ uuid: node.uuid })
        })
      ]

      return {
        redoEvents,
        undoEvents
      }
    }, command)
  }

  private _setRectangleSelectionFill(command: SetRectangleSelectionFill) {
    this._lockingSystem.commitUndoableLockableCommand((activeSelection) => {
      if (activeSelection.some((node) => !isRectangle(node))) {
        throw new Error('Only rectangles can be filled')
      }

      const rectangleSelection = activeSelection as Rectangle[]

      const redoEvents = [
        ...rectangleSelection.map((node) => {
          return new NodeFillSet({
            uuid: node.uuid,
            fill: command.payload.fill
          })
        })
      ]

      const undoEvents = [
        ...rectangleSelection.map((node) => {
          return new NodeFillSet({
            uuid: node.uuid,
            fill: node.fill
          })
        })
      ]

      return {
        redoEvents,
        undoEvents
      }
    }, command)
  }

  dispatch(
    command:
      | CreateRectangle
      | DeleteSelection
      | CreateImage
      | SetRectangleSelectionFill
  ) {
    switch (command.type) {
      case DocumentSessionCommandType.CreateRectangle: {
        return this._createRectangle(command)
      }
      case DocumentSessionCommandType.CreateImage: {
        return this._createImage(command)
      }
      case DocumentSessionCommandType.DeleteSelection: {
        return this._deleteSelection(command)
      }
      case DocumentSessionCommandType.SetRectangleSelectionFill: {
        return this._setRectangleSelectionFill(command)
      }
      default: {
        const exhaustiveCheck: never = command
        throw new Error(`Unhandled command type ${exhaustiveCheck}`)
      }
    }
  }
}
