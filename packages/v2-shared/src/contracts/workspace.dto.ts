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

export interface ListAppsResponseDto {
  items: AppDto[]
}

export interface CreateAppRequestDto {
  name: string
  description?: string
  owner?: string
  tags?: string[]
  themeColor?: string
}

export interface UpdateAppRequestDto {
  name?: string
  description?: string
  owner?: string
  status?: AppStatusDto
  tags?: string[]
  themeColor?: string
  homePageId?: string | null
}

export interface AppResponseDto {
  app: AppDto
}

export interface DeleteAppResponseDto {
  id: string
}

export interface ListPagesResponseDto {
  items: PageDto[]
}

export interface CreatePageRequestDto {
  appId: string
  name: string
  path?: string
}

export interface DuplicatePageRequestDto {
  sourcePageId: string
  name?: string
  path?: string
}

export interface MovePageRequestDto {
  direction: 'up' | 'down'
}

export interface UpdatePageRequestDto {
  name?: string
  path?: string
  status?: PageStatusDto
  order?: number
  isHome?: boolean
}

export interface SavePageSnapshotRequestDto {
  canvasConfig: Record<string, unknown>
  graphData: Record<string, unknown>
}

export interface PageResponseDto {
  page: PageDto
}

export interface DeletePageResponseDto {
  id: string
}

export interface ListReleasesResponseDto {
  items: ReleaseDto[]
}

export interface PublishPageRequestDto {
  pageId: string
  note?: string
}

export interface RollbackReleaseRequestDto {
  releaseId: string
}

export interface ReleaseResponseDto {
  release: ReleaseDto
}
