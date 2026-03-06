import { describe, expect, it } from 'vitest'
import { EDGE_PRESETS, isSupportedEdgeShape, REGISTERED_EDGE_SHAPES } from '@/registry/edges'

describe('edge registry', () => {
  it('includes baseline edge shape presets', () => {
    expect(EDGE_PRESETS.length).toBeGreaterThan(5)
    expect(EDGE_PRESETS.some((item) => item.value === 'water-flow')).toBe(true)
    expect(EDGE_PRESETS.some((item) => item.value === 'fluid-pipe')).toBe(true)
    expect(EDGE_PRESETS.some((item) => item.value === 'edge')).toBe(true)
  })

  it('filters built-in edge from registered custom edge list', () => {
    expect(REGISTERED_EDGE_SHAPES.includes('edge')).toBe(false)
    expect(REGISTERED_EDGE_SHAPES.includes('electric-flow')).toBe(true)
  })

  it('checks whether edge shape is supported', () => {
    expect(isSupportedEdgeShape('water-flow')).toBe(true)
    expect(isSupportedEdgeShape('edge')).toBe(true)
    expect(isSupportedEdgeShape('not-exists')).toBe(false)
  })
})
