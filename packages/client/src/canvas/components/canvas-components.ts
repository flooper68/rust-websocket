import { CanvasBoundingBox } from './canvas-bounding-box'
import { CanvasCursor } from './canvas-cursor'
import { CanvasImage } from './canvas-image'
import { CanvasRectangle } from './canvas-rectangle'
import { CanvasStage } from './canvas-stage'

export type CanvasComponents =
  | CanvasBoundingBox
  | CanvasCursor
  | CanvasImage
  | CanvasRectangle
  | CanvasStage
