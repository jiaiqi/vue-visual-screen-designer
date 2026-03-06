import type { WorkspaceSnapshotDto } from '@vue-visual-screen/v2-shared'

export interface WorkspaceApi {
  loadSnapshot(): Promise<WorkspaceSnapshotDto | null>
  saveSnapshot(snapshot: WorkspaceSnapshotDto): Promise<void>
  clearSnapshot(): Promise<void>
}
