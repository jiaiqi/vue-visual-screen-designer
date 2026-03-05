import { ref, watch } from 'vue'
import type { Graph } from '@antv/x6'
import localforage from 'localforage'

const AUTO_SAVE_KEY = 'v2_canvas_autosave'
const AUTO_SAVE_DELAY = 2000 // 2秒防抖

// localforage 实例（隔离存储）
const store = localforage.createInstance({
  name: 'vue-visual-screen-designer',
  storeName: 'auto_save',
})

export interface AutoSaveData {
  version: string
  timestamp: number
  canvasConfig: Record<string, unknown>
  graphData: Record<string, unknown>
}

/**
 * v2 自动保存 Composable
 * 使用 localforage 实现持久化，防抖 2 秒保存一次
 */
export function useAutoSave() {
  const isSaving = ref(false)
  const lastSavedAt = ref<Date | null>(null)
  const hasSavedData = ref(false)

  let saveTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 立即保存画布数据
   */
  async function saveNow(graph: Graph, canvasConfig: Record<string, unknown>) {
    if (!graph) return

    isSaving.value = true
    try {
      const data: AutoSaveData = {
        version: '2.0.0',
        timestamp: Date.now(),
        canvasConfig,
        graphData: graph.toJSON() as Record<string, unknown>,
      }
      await store.setItem(AUTO_SAVE_KEY, data)
      lastSavedAt.value = new Date()
      hasSavedData.value = true
    } catch (e) {
      console.error('[AutoSave] 保存失败:', e)
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 防抖保存（调用后 2 秒执行，期间重复调用会重置计时器）
   */
  function scheduleSave(graph: Graph, canvasConfig: Record<string, unknown>) {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveNow(graph, canvasConfig)
    }, AUTO_SAVE_DELAY)
  }

  /**
   * 从本地恢复画布数据
   */
  async function restore(): Promise<AutoSaveData | null> {
    try {
      const data = await store.getItem<AutoSaveData>(AUTO_SAVE_KEY)
      if (data && data.graphData) {
        hasSavedData.value = true
        return data
      }
    } catch (e) {
      console.error('[AutoSave] 恢复失败:', e)
    }
    return null
  }

  /**
   * 清除自动保存数据
   */
  async function clearSave() {
    try {
      await store.removeItem(AUTO_SAVE_KEY)
      hasSavedData.value = false
      lastSavedAt.value = null
    } catch (e) {
      console.error('[AutoSave] 清除失败:', e)
    }
  }

  /**
   * 检查是否存在已保存数据
   */
  async function checkHasSavedData(): Promise<boolean> {
    try {
      const data = await store.getItem<AutoSaveData>(AUTO_SAVE_KEY)
      hasSavedData.value = !!(data && data.graphData)
      return hasSavedData.value
    } catch {
      return false
    }
  }

  /**
   * 挂载图形事件，自动在变更时触发防抖保存
   */
  function mount(graph: Graph, canvasConfigRef: { value: Record<string, unknown> }) {
    const triggerSave = () => scheduleSave(graph, canvasConfigRef.value)

    graph.on('cell:added', triggerSave)
    graph.on('cell:removed', triggerSave)
    graph.on('cell:changed', triggerSave)
    graph.on('node:moved', triggerSave)
    graph.on('node:resized', triggerSave)

    // 监听 canvasConfig 变化
    watch(canvasConfigRef, triggerSave, { deep: true })

    return () => {
      if (saveTimer) clearTimeout(saveTimer)
      graph.off('cell:added', triggerSave)
      graph.off('cell:removed', triggerSave)
      graph.off('cell:changed', triggerSave)
      graph.off('node:moved', triggerSave)
      graph.off('node:resized', triggerSave)
    }
  }

  return {
    isSaving,
    lastSavedAt,
    hasSavedData,
    saveNow,
    scheduleSave,
    restore,
    clearSave,
    checkHasSavedData,
    mount,
  }
}
