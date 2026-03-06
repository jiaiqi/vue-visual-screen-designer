import type { WorkspaceSnapshotDto } from '@vue-visual-screen/v2-shared'
import type { WorkspaceApi } from '../WorkspaceApi'
import {
  clearWorkspaceSnapshot,
  loadWorkspaceSnapshot,
  saveWorkspaceSnapshot,
} from '@/repositories/workspaceRepository'

export class LocalForageAdapter implements WorkspaceApi {
  async loadSnapshot(): Promise<WorkspaceSnapshotDto | null> {
    return await loadWorkspaceSnapshot()
  }

  async saveSnapshot(snapshot: WorkspaceSnapshotDto): Promise<void> {
    await saveWorkspaceSnapshot(snapshot)
  }

  async clearSnapshot(): Promise<void> {
    await clearWorkspaceSnapshot()
  }
}
