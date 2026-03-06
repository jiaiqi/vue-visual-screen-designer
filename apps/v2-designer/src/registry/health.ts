import type { Graph } from '@antv/x6'
import { REGISTERED_EDGE_SHAPES } from '@/registry/edges'
import { CUSTOM_NODE_SHAPES } from '@/registry/shapes'

export interface RegistryHealthCheckResult {
  missingNodeShapes: string[]
  missingEdgeShapes: string[]
}

export function runGraphRegistryHealthCheck(graph: Graph): RegistryHealthCheckResult {
  const missingNodeShapes: string[] = []
  const missingEdgeShapes: string[] = []

  CUSTOM_NODE_SHAPES.forEach((shape) => {
    try {
      graph.createNode({ shape })
    } catch {
      missingNodeShapes.push(shape)
    }
  })

  REGISTERED_EDGE_SHAPES.forEach((shape) => {
    try {
      graph.createEdge({ shape })
    } catch {
      missingEdgeShapes.push(shape)
    }
  })

  return {
    missingNodeShapes,
    missingEdgeShapes,
  }
}
