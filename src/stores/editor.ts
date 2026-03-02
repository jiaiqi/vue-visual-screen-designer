import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import type { Graph } from '@antv/x6'

interface EditorState {
  mode: 'select' | 'draw' | 'pan' | 'edit'
  currentTool: string
  graph: Graph | null
  // 画布全局业务属性
  canvasConfig: {
    name: string
    category: string
    width: number
    height: number
    backgroundColor: string
    backgroundImage: string
    showGrid: boolean
    gridSize: number
    gridColor: string
    snapToGrid: boolean
    theme: 'light' | 'dark'
    // 预览设置
    previewScale: 'auto' | 'width' | 'height' | 'none'
    showScrollbar: boolean
    lockMove: boolean
    lockZoom: boolean
  }
}

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => ({
    mode: 'select',
    currentTool: 'select',
    graph: null,
    canvasConfig: {
      name: '暖通',
      category: '智慧物联',
      width: 1920,
      height: 1080,
      backgroundColor: 'rgba(255, 255, 255, 0)', // 默认透明背景
      backgroundImage: '',
      showGrid: true,
      gridSize: 20,
      gridColor: '#1e293b',
      snapToGrid: true,
      theme: 'dark',
      previewScale: 'auto',
      showScrollbar: false,
      lockMove: false,
      lockZoom: false
    }
  }),
  actions: {
    initGraph(graphInstance: Graph | null) {
      this.graph = graphInstance ? markRaw(graphInstance) : null

      // 初始化配置同步
      if (this.graph) {
        this.applyCanvasConfig()
      }
    },
    setMode(mode: EditorState['mode']) {
      this.mode = mode
    },
    setCurrentTool(tool: string) {
      this.currentTool = tool
      if (['select', 'pan'].includes(tool)) {
        this.setMode(tool as 'select' | 'pan')
      } else {
        this.setMode('draw')
      }
    },
    // 应用画布配置到底层 X6 实例
    applyCanvasConfig() {
      if (!this.graph) return

      const { width, height, backgroundColor, showGrid, gridSize, gridColor } = this.canvasConfig

      // 尺寸
      this.graph.resize(width, height)

      // 背景
      this.graph.drawBackground({
        color: backgroundColor,
      })

      // 网格
      if (showGrid) {
        this.graph.showGrid()
        this.graph.setGridSize(gridSize)
        this.graph.drawGrid({
          type: 'dot',
          args: {
            color: gridColor,
            thickness: 1,
          },
        })
      } else {
        this.graph.hideGrid()
      }
    },
    // 更新画布配置
    updateCanvasConfig(partial: Partial<EditorState['canvasConfig']>) {
      this.canvasConfig = { ...this.canvasConfig, ...partial }
      this.applyCanvasConfig()
    }
  }
})
