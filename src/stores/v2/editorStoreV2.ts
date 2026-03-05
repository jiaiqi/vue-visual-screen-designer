import { defineStore } from 'pinia'
import { ref, computed, markRaw } from 'vue'
import type { Graph, Node, Edge, Cell } from '@antv/x6'
import { useCanvasStoreV2 } from './canvasStoreV2'

/**
 * 编辑器模式
 */
export type EditorMode = 'select' | 'pan' | 'connect'

/**
 * 选中的元素类型
 */
export type SelectionType = 'none' | 'node' | 'edge' | 'multiple'

/**
 * 历史记录项
 */
export interface HistoryItem {
  type: 'undo' | 'redo'
  timestamp: number
  description: string
}

/**
 * 编辑器 Store V2
 * 管理编辑器状态、选择、历史记录等
 */
export const useEditorStoreV2 = defineStore('editorV2', () => {
  // ==================== State ====================

  /**
   * X6 Graph 实例
   */
  const graph = ref<Graph | null>(null)

  /**
   * 编辑器模式
   */
  const mode = ref<EditorMode>('select')

  /**
   * 选中的元素 ID 列表
   */
  const selectedIds = ref<string[]>([])

  /**
   * 悬停的元素 ID
   */
  const hoveredId = ref<string | null>(null)

  /**
   * 是否显示小地图
   */
  const showMinimap = ref(false)

  /**
   * 工具栏是否折叠
   */
  const isToolbarCollapsed = ref(false)

  /**
   * 属性面板是否折叠
   */
  const isPropertyPanelCollapsed = ref(false)

  /**
   * 是否正在连接
   */
  const isConnecting = ref(false)

  /**
   * 当前工具
   */
  const currentTool = ref<string>('select')

  // ==================== Getters ====================

  /**
   * 当前选中的节点
   */
  const selectedNodes = computed(() => {
    if (!graph.value) return []
    return selectedIds.value
      .map(id => graph.value!.getCellById(id))
      .filter((cell): cell is Node => cell?.isNode() ?? false)
  })

  /**
   * 当前选中的边
   */
  const selectedEdges = computed(() => {
    if (!graph.value) return []
    return selectedIds.value
      .map(id => graph.value!.getCellById(id))
      .filter((cell): cell is Edge => cell?.isEdge() ?? false)
  })

  /**
   * 选中类型
   */
  const selectionType = computed<SelectionType>(() => {
    const nodes = selectedNodes.value
    const edges = selectedEdges.value
    if (nodes.length === 0 && edges.length === 0) return 'none'
    if (nodes.length === 1 && edges.length === 0) return 'node'
    if (edges.length === 1 && nodes.length === 0) return 'edge'
    return 'multiple'
  })

  /**
   * 是否有选中元素
   */
  const hasSelection = computed(() => selectedIds.value.length > 0)

  /**
   * 是否可以撤销
   */
  const canUndo = computed(() => {
    return graph.value?.canUndo() ?? false
  })

  /**
   * 是否可以重做
   */
  const canRedo = computed(() => {
    return graph.value?.canRedo() ?? false
  })

  // ==================== Actions ====================

  /**
   * 初始化 Graph 实例
   */
  function initGraph(graphInstance: Graph | null) {
    graph.value = graphInstance ? markRaw(graphInstance) : null
  }

  /**
   * 设置编辑器模式
   */
  function setMode(newMode: EditorMode) {
    mode.value = newMode
  }

  /**
   * 设置当前工具
   */
  function setTool(tool: string) {
    currentTool.value = tool
    // 根据工具设置模式
    if (tool === 'pan') {
      setMode('pan')
    } else if (tool === 'connect') {
      setMode('connect')
    } else {
      setMode('select')
    }
  }

  /**
   * 选中元素
   */
  function select(ids: string | string[]) {
    const idList = Array.isArray(ids) ? ids : [ids]
    selectedIds.value = idList
    // 同步到 Graph
    if (graph.value) {
      graph.value.cleanSelection()
      const cells = idList
        .map(id => graph.value!.getCellById(id))
        .filter((cell): cell is Cell => cell !== null)
      if (cells.length > 0) {
        graph.value.select(cells)
      }
    }
  }

  /**
   * 添加选中
   */
  function addToSelection(ids: string | string[]) {
    const idList = Array.isArray(ids) ? ids : [ids]
    const newIds = [...new Set([...selectedIds.value, ...idList])]
    selectedIds.value = newIds
    // 同步到 Graph
    if (graph.value) {
      const cells = idList
        .map(id => graph.value!.getCellById(id))
        .filter((cell): cell is Cell => cell !== null)
      if (cells.length > 0) {
        cells.forEach(cell => graph.value!.select(cell))
      }
    }
  }

  /**
   * 取消选中
   */
  function deselect(ids?: string | string[]) {
    if (!ids) {
      selectedIds.value = []
      graph.value?.cleanSelection()
    } else {
      const idList = Array.isArray(ids) ? ids : [ids]
      selectedIds.value = selectedIds.value.filter(id => !idList.includes(id))
      // 同步到 Graph
      if (graph.value) {
        const cells = idList
          .map(id => graph.value!.getCellById(id))
          .filter((cell): cell is Cell => cell !== null)
        cells.forEach(cell => graph.value!.unselect(cell))
      }
    }
  }

  /**
   * 全选
   */
  function selectAll() {
    if (!graph.value) return
    const cells = graph.value.getCells()
    select(cells.map(c => c.id))
  }

  /**
   * 删除选中元素
   */
  function deleteSelected() {
    if (!graph.value || selectedIds.value.length === 0) return
    const cells = selectedIds.value
      .map(id => graph.value!.getCellById(id))
      .filter((cell): cell is Cell => cell !== null)
    graph.value.removeCells(cells)
    selectedIds.value = []
  }

  /**
   * 设置悬停元素
   */
  function setHovered(id: string | null) {
    hoveredId.value = id
  }

  /**
   * 切换小地图
   */
  function toggleMinimap() {
    showMinimap.value = !showMinimap.value
  }

  /**
   * 切换工具栏折叠
   */
  function toggleToolbar() {
    isToolbarCollapsed.value = !isToolbarCollapsed.value
  }

  /**
   * 切换属性面板折叠
   */
  function togglePropertyPanel() {
    isPropertyPanelCollapsed.value = !isPropertyPanelCollapsed.value
  }

  /**
   * 撤销
   */
  function undo() {
    if (graph.value?.canUndo()) {
      graph.value.undo()
    }
  }

  /**
   * 重做
   */
  function redo() {
    if (graph.value?.canRedo()) {
      graph.value.redo()
    }
  }

  /**
   * 复制选中元素
   */
  function copy() {
    if (!graph.value || selectedIds.value.length === 0) return false
    const cells = selectedIds.value
      .map(id => graph.value!.getCellById(id))
      .filter((cell): cell is Cell => cell !== null)
    if (cells.length > 0) {
      graph.value.copy(cells)
      return true
    }
    return false
  }

  /**
   * 粘贴
   */
  function paste(offset = { x: 30, y: 30 }) {
    if (!graph.value || graph.value.isClipboardEmpty()) return []
    const cells = graph.value.paste({ offset })
    // 选中新粘贴的元素
    select(cells.map(c => c.id))
    return cells
  }

  /**
   * 清空画布
   */
  function clearCanvas() {
    if (!graph.value) return
    graph.value.clearCells()
    selectedIds.value = []
  }

  /**
   * 导出画布数据
   */
  function exportData() {
    if (!graph.value) return null
    return graph.value.toJSON()
  }

  /**
   * 导入画布数据
   */
  function importData(data: any) {
    if (!graph.value) return
    graph.value.fromJSON(data)
    selectedIds.value = []
  }

  return {
    // State
    graph,
    mode,
    selectedIds,
    hoveredId,
    showMinimap,
    isToolbarCollapsed,
    isPropertyPanelCollapsed,
    isConnecting,
    currentTool,

    // Getters
    selectedNodes,
    selectedEdges,
    selectionType,
    hasSelection,
    canUndo,
    canRedo,

    // Actions
    initGraph,
    setMode,
    setTool,
    select,
    addToSelection,
    deselect,
    selectAll,
    deleteSelected,
    setHovered,
    toggleMinimap,
    toggleToolbar,
    togglePropertyPanel,
    undo,
    redo,
    copy,
    paste,
    clearCanvas,
    exportData,
    importData,
  }
})