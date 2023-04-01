export function isInteractive<T extends object>(
  value: T
): value is WithCanvasInteractive<T> {
  return 'interactive' in value
}

export function isDraggable<T extends object>(
  value: T
): value is WithCanvasDraggable<T> {
  return 'draggable' in value
}

export interface CanvasComponent {
  uuid: string
  render(): void
}

export interface DraggableComponent {
  canDrag(): boolean
  onDraggingStarted(): void
  onDraggingProgress(diffX: number, diffY: number): void
  onDraggingFinished(diffX: number, diffY: number): void
}

export type WithCanvasDraggable<T> = T & {
  draggable: DraggableComponent
}

export interface InteractiveComponent {
  zIndex: number
  ignoreHitTestForMove: boolean
  contains(x: number, y: number): boolean
  canHit(): boolean
  onHitTarget(): void
  onHitTargetLeave(): void
  onClick(shiftKey: boolean): void
  onMove(x: number, y: number): void
}

export type WithCanvasInteractive<T> = T & {
  interactive: InteractiveComponent
}
