interface X6Node {
  id: string
  shape: string
  position?: { x?: number; y?: number }
  size?: { width?: number; height?: number }
  angle?: number
  zIndex?: number
  attrs?: Record<string, unknown>
  data?: Record<string, unknown>
}

interface X6Edge {
  id: string
  source?: string | { cell?: string; port?: string }
  target?: string | { cell?: string; port?: string }
  attrs?: Record<string, unknown>
}

interface X6GraphJson {
  cells?: Array<X6Node | X6Edge>
  nodes?: X6Node[]
  edges?: X6Edge[]
}

interface PreviewSchema {
  version: '2.1'
  canvas: {
    width: number
    height: number
    background: string
  }
  nodes: Array<{
    id: string
    type: string
    layout: { x: number; y: number; width: number; height: number; zIndex: number }
    style: { background: string; borderColor: string }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    style: { stroke: string; strokeWidth: number; strokeDasharray?: string }
  }>
}

function splitCells(json: X6GraphJson): { nodes: X6Node[]; edges: X6Edge[] } {
  if (Array.isArray(json.nodes) && Array.isArray(json.edges)) {
    return { nodes: json.nodes, edges: json.edges }
  }

  const cells = Array.isArray(json.cells) ? json.cells : []
  const nodes: X6Node[] = []
  const edges: X6Edge[] = []

  cells.forEach((cell) => {
    if ('shape' in cell && 'position' in cell) {
      nodes.push(cell as X6Node)
      return
    }

    if ('source' in cell || 'target' in cell) {
      edges.push(cell as X6Edge)
    }
  })

  return { nodes, edges }
}

function getCellId(value: X6Edge['source'] | X6Edge['target']): string {
  if (typeof value === 'string') return value
  return value?.cell || ''
}

export function x6ToPreviewSchema(
  graphJson: Record<string, unknown>,
  canvasConfig: {
    width: number
    height: number
    backgroundColor: string
  },
): PreviewSchema {
  const { nodes, edges } = splitCells(graphJson as X6GraphJson)

  return {
    version: '2.1',
    canvas: {
      width: canvasConfig.width,
      height: canvasConfig.height,
      background: canvasConfig.backgroundColor,
    },
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.shape,
      layout: {
        x: node.position?.x ?? 0,
        y: node.position?.y ?? 0,
        width: node.size?.width ?? 100,
        height: node.size?.height ?? 60,
        zIndex: node.zIndex ?? 0,
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

export type { PreviewSchema }
