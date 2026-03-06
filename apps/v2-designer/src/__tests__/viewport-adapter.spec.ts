import { describe, expect, it } from 'vitest'
import {
  canvasToClientPoint,
  clientToCanvasPoint,
  computeRulerStart,
  normalizeScale,
} from '@/utils/viewport-adapter'

describe('viewport-adapter', () => {
  it('normalizes invalid scales to 1', () => {
    expect(normalizeScale(0)).toBe(1)
    expect(normalizeScale(-1)).toBe(1)
    expect(normalizeScale(Number.NaN)).toBe(1)
    expect(normalizeScale(2)).toBe(2)
  })

  it('converts client point to canvas point with scale', () => {
    const result = clientToCanvasPoint(250, 180, {
      rect: { left: 50, top: 20 },
      scale: 2,
    })

    expect(result).toEqual({ x: 100, y: 80 })
  })

  it('converts canvas point to client point with scale', () => {
    const result = canvasToClientPoint(100, 80, {
      rect: { left: 50, top: 20 },
      scale: 2,
    })

    expect(result).toEqual({ x: 250, y: 180 })
  })

  it('computes ruler start from scroll offset', () => {
    expect(computeRulerStart(300, 1.5, 200)).toBe(0)
  })
})
