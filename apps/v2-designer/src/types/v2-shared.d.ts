declare module '@vue-visual-screen/v2-shared' {
  export type AppStatusDto = 'draft' | 'testing' | 'online' | 'archived'
  export type PageStatusDto = 'draft' | 'published'

  export interface AppDto {
    id: string
    name: string
    description: string
    owner: string
    status: AppStatusDto
    tags: string[]
    themeColor: string
    homePageId: string | null
    createdAt: string
    updatedAt: string
  }

  export interface PageDto {
    id: string
    appId: string
    name: string
    path: string
    status: PageStatusDto
    order: number
    isHome: boolean
    createdAt: string
    updatedAt: string
    canvasConfig: Record<string, unknown>
    graphData: Record<string, unknown>
  }

  export interface ReleaseDto {
    id: string
    appId: string
    pageId: string
    version: string
    note: string
    createdAt: string
    schema: unknown
    canvasConfig: Record<string, unknown>
    graphData: Record<string, unknown>
  }

  export interface WorkspaceSnapshotDto {
    apps: AppDto[]
    pages: PageDto[]
    releases: ReleaseDto[]
    activeAppId: string | null
    activePageId: string | null
  }

  export interface SaveWorkspaceSnapshotRequestDto {
    snapshot: WorkspaceSnapshotDto
  }

  export interface WorkspaceSnapshotResponseDto {
    snapshot: WorkspaceSnapshotDto | null
  }

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
