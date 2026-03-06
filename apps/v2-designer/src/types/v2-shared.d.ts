declare module '@vue-visual-screen/v2-shared' {
  export interface SchemaNode {
    id: string
    type: string
    layout: {
      x: number
      y: number
      width: number
      height: number
      zIndex: number
    }
    style: {
      background: string
      borderColor: string
    }
  }

  export interface SchemaEdge {
    id: string
    source: string
    target: string
    style: {
      stroke: string
      strokeWidth: number
      strokeDasharray?: string
    }
  }

  export interface SchemaV2 {
    version: '2.1'
    canvas: {
      width: number
      height: number
      background: string
    }
    nodes: SchemaNode[]
    edges: SchemaEdge[]
  }

  export function x6ToSchemaV2(
    graphJson: Record<string, unknown>,
    canvasConfig: { width: number; height: number; backgroundColor: string },
  ): SchemaV2

  export function schemaV2ToX6(schema: SchemaV2): {
    nodes: Array<Record<string, unknown>>
    edges: Array<Record<string, unknown>>
  }
}
