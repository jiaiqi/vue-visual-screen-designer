import localforage from 'localforage'
import type { ProjectData } from '@/types/editor'

const STORE_KEY = 'workshop_editor_autosave'

export const storage = localforage.createInstance({
  name: 'WorkshopEditorDB',
  storeName: 'projects',
  description: '存储车间布局工程离线快照'
})

// 防抖包装保存动作，隔绝主线程卡顿
export function useAutoSave() {
  let timer: ReturnType<typeof setTimeout>

  const saveSnapshot = async (data: string | ProjectData) => {
    try {
      if (typeof data === 'string') {
        const json = JSON.parse(data)
        await storage.setItem(STORE_KEY, json)
      } else {
        await storage.setItem(STORE_KEY, data)
      }
    } catch (error) {
      console.error('Failed to autosave project:', error)
    }
  }

  const debouncedSave = (data: string | ProjectData, delay = 2000) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      saveSnapshot(data)
    }, delay)
  }

  const loadSnapshot = async (): Promise<ProjectData | null> => {
    try {
      const data = await storage.getItem<ProjectData>(STORE_KEY)
      return data
    } catch (error) {
      console.error('Failed to load snapshot:', error)
      return null
    }
  }

  return {
    saveSnapshot,
    debouncedSave,
    loadSnapshot,
    clearSnapshot: () => storage.removeItem(STORE_KEY)
  }
}
