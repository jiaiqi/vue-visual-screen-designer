import { describe, expect, it } from 'vitest'
import { x6ToSchemaV2 } from '@vue-visual-screen/v2-shared'

describe('schema-preview adapter', () => {
  it('converts x6 json to preview schema with nodes and edges', () => {
    const graphJson = {
      nodes: [
        {
          id: 'n1',
          shape: 'rect',
          position: { x: 10, y: 20 },
          size: { width: 100, height: 80 },
          attrs: { body: { fill: '#111', stroke: '#222' } },
        },
        {
          id: 'n2',
          shape: 'circle',
          position: { x: 300, y: 100 },
          size: { width: 60, height: 60 },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: { cell: 'n1' },
          target: { cell: 'n2' },
          attrs: { line: { stroke: '#38bdf8', strokeWidth: 3 } },
        },
      ],
    }

    const schema = x6ToSchemaV2(graphJson, {
      width: 1920,
      height: 1080,
      backgroundColor: '#0f172a',
    })

    expect(schema.version).toBe('2.1')
    expect(schema.nodes).toHaveLength(2)
    expect(schema.edges).toHaveLength(1)
    expect(schema.nodes[0]?.style.borderColor).toBe('#222')
    expect(schema.edges[0]?.source).toBe('n1')
    expect(schema.edges[0]?.target).toBe('n2')
  })
})
