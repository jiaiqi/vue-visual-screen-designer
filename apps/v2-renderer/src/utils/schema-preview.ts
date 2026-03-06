export interface PreviewNode {
  id: string
  type: string
  layout: { x: number; y: number; width: number; height: number; zIndex: number }
  style: { background: string; borderColor: string }
}

export interface PreviewEdge {
  id: string
  source: string
  target: string
  style: { stroke: string; strokeWidth: number; strokeDasharray?: string }
}

export interface PreviewSchema {
  version: '2.1'
  canvas: { width: number; height: number; background: string }
  nodes: PreviewNode[]
  edges: PreviewEdge[]
}

interface X6Node {
  id: string
  shape: string
  position?: { x?: number; y?: number }
  size?: { width?: number; height?: number }
  zIndex?: number
  attrs?: Record<string, unknown>
}

interface X6Edge {
  id: string
  source?: string | { cell?: string }
  target?: string | { cell?: string }
  attrs?: Record<string, unknown>
}

function getCellId(value: X6Edge['source'] | X6Edge['target']): string {
  if (typeof value === 'string') return value
  return value?.cell || ''
}

export function x6GraphToPreviewSchema(graphJson: Record<string, unknown>): PreviewSchema {
  const nodes = (Array.isArray((graphJson as { nodes?: unknown[] }).nodes)
    ? (graphJson as { nodes: X6Node[] }).nodes
    : [])
  const edges = (Array.isArray((graphJson as { edges?: unknown[] }).edges)
    ? (graphJson as { edges: X6Edge[] }).edges
    : [])

  return {
    version: '2.1',
    canvas: {
      width: 1920,
      height: 1080,
      background: '#0f172a',
    },
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.shape,
      layout: {
        x: node.position?.x ?? 0,
        y: node.position?.y ?? 0,
        width: node.size?.width ?? 100,
        height: node.size?.height ?? 60,
        zIndex: node.zIndex ?? 1,
      },
      style: {
        background: String((node.attrs?.body as Record<string, unknown> | undefined)?.fill || 'rgba(30,41,59,0.8)'),
        borderColor: String((node.attrs?.body as Record<string, unknown> | undefined)?.stroke || '#3b82f6'),
      },
    })),
    edges: edges
      .map((edge) => ({
        id: edge.id,
        source: getCellId(edge.source),
        target: getCellId(edge.target),
        style: {
          stroke: String((edge.attrs?.line as Record<string, unknown> | undefined)?.stroke || '#38bdf8'),
          strokeWidth: Number((edge.attrs?.line as Record<string, unknown> | undefined)?.strokeWidth || 2),
          strokeDasharray: (edge.attrs?.line as Record<string, unknown> | undefined)?.strokeDasharray
            ? String((edge.attrs?.line as Record<string, unknown>).strokeDasharray)
            : undefined,
        },
      }))
      .filter((edge) => edge.source && edge.target),
  }
}
