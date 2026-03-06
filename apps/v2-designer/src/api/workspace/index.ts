import type { WorkspaceApi } from './WorkspaceApi'
import { HttpAdapter } from './adapters/http.adapter'
import { LocalForageAdapter } from './adapters/localforage.adapter'

function resolveMode(): 'local' | 'http' {
  const raw = (import.meta.env.VITE_WORKSPACE_API_MODE as string | undefined)?.trim().toLowerCase()
  return raw === 'http' ? 'http' : 'local'
}

export function createWorkspaceApi(): WorkspaceApi {
  return resolveMode() === 'http' ? new HttpAdapter() : new LocalForageAdapter()
}
