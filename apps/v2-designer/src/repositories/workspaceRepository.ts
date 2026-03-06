import localforage from 'localforage'
import type { WorkspaceSnapshotV2 } from '@/types/workspace'

const WORKSPACE_KEY = 'v2-workspace-snapshot'

const workspaceStore = localforage.createInstance({
  name: 'vue-visual-screen-designer',
  storeName: 'workspace_v2',
  description: 'v2 应用、页面与发布记录',
})

export async function loadWorkspaceSnapshot(): Promise<WorkspaceSnapshotV2 | null> {
  const raw = await workspaceStore.getItem<WorkspaceSnapshotV2>(WORKSPACE_KEY)
  if (!raw)
    return null
  return JSON.parse(JSON.stringify(raw)) as WorkspaceSnapshotV2
}

export async function saveWorkspaceSnapshot(snapshot: WorkspaceSnapshotV2): Promise<void> {
  // IndexedDB 无法直接克隆 Vue Proxy，先转为纯 JSON 对象再写入
  const plain = JSON.parse(JSON.stringify(snapshot)) as WorkspaceSnapshotV2
  await workspaceStore.setItem(WORKSPACE_KEY, plain)
}

export async function clearWorkspaceSnapshot(): Promise<void> {
  await workspaceStore.removeItem(WORKSPACE_KEY)
}
