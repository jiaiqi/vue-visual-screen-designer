import type {
  SaveWorkspaceSnapshotRequestDto,
  WorkspaceSnapshotDto,
  WorkspaceSnapshotResponseDto,
} from '@vue-visual-screen/v2-shared'
import type { WorkspaceApi } from '../WorkspaceApi'

function resolveBaseUrl() {
  return (import.meta.env.VITE_WORKSPACE_API_BASE as string | undefined) || '/api/workspace'
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `HTTP ${response.status}`)
  }
  return await response.json() as T
}

export class HttpAdapter implements WorkspaceApi {
  private readonly baseUrl = resolveBaseUrl()

  async loadSnapshot(): Promise<WorkspaceSnapshotDto | null> {
    const response = await fetch(`${this.baseUrl}/snapshot`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    const data = await parseJson<WorkspaceSnapshotResponseDto>(response)
    return data.snapshot
  }

  async saveSnapshot(snapshot: WorkspaceSnapshotDto): Promise<void> {
    const payload: SaveWorkspaceSnapshotRequestDto = { snapshot }
    const response = await fetch(`${this.baseUrl}/snapshot`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
    await parseJson<WorkspaceSnapshotResponseDto>(response)
  }

  async clearSnapshot(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/snapshot`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok && response.status !== 404) {
      const body = await response.text()
      throw new Error(body || `HTTP ${response.status}`)
    }
  }
}
