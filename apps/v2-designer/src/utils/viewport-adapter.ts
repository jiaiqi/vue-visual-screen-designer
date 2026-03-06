export interface CanvasPoint {
  x: number
  y: number
}

export interface ViewportTransformInput {
  rect: { left: number; top: number }
  scale: number
}

export function normalizeScale(scale: number): number {
  return Number.isFinite(scale) && scale > 0 ? scale : 1
}

export function clientToCanvasPoint(
  clientX: number,
  clientY: number,
  input: ViewportTransformInput,
): CanvasPoint {
  const s = normalizeScale(input.scale)

  return {
    x: (clientX - input.rect.left) / s,
    y: (clientY - input.rect.top) / s,
  }
}

export function canvasToClientPoint(
  canvasX: number,
  canvasY: number,
  input: ViewportTransformInput,
): CanvasPoint {
  const s = normalizeScale(input.scale)

  return {
    x: canvasX * s + input.rect.left,
    y: canvasY * s + input.rect.top,
  }
}

export function computeRulerStart(scrollOffset: number, scale: number, padding: number): number {
  const s = normalizeScale(scale)
  return scrollOffset / s - padding
}
