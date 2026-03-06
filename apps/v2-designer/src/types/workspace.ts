export type AppStatusV2 = 'draft' | 'testing' | 'online' | 'archived'
export type PageStatusV2 = 'draft' | 'published'

export interface AppEntityV2 {
  id: string
  name: string
  description: string
  owner: string
  status: AppStatusV2
  tags: string[]
  themeColor: string
  homePageId: string | null
  createdAt: string
  updatedAt: string
}

export interface PageEntityV2 {
  id: string
  appId: string
  name: string
  path: string
  status: PageStatusV2
  order: number
  isHome: boolean
  createdAt: string
  updatedAt: string
  canvasConfig: Record<string, unknown>
  graphData: Record<string, unknown>
}

export interface ReleaseEntityV2 {
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

export interface WorkspaceSnapshotV2 {
  apps: AppEntityV2[]
  pages: PageEntityV2[]
  releases: ReleaseEntityV2[]
  activeAppId: string | null
  activePageId: string | null
}
