import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import type { Graph } from '@antv/x6'

interface EditorState {
  mode: 'select' | 'draw' | 'pan' | 'edit'
  currentTool: string
  // 使用 X6 的 Graph 实例替代原来的 fabric.Canvas
  graph: Graph | null
  config: {
    gridSize: number
    showGrid: boolean
    snapToGrid: boolean
    showRuler: boolean
  }
}

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => ({
    mode: 'select',
    currentTool: 'select',
    graph: null,
    config: {
      gridSize: 20,
      showGrid: true,
      snapToGrid: true,
      showRuler: true
    }
  }),
  actions: {
    initGraph(graphInstance: Graph) {
      // 使用 markRaw 绕过 Vue Proxy 监控，提高图形界面性能
      this.graph = markRaw(graphInstance)
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
    updateConfig(partialConfig: Partial<EditorState['config']>) {
      this.config = { ...this.config, ...partialConfig }

      // 同步给 X6
      if (this.graph) {
        if (partialConfig.showGrid !== undefined) {
          partialConfig.showGrid ? this.graph.showGrid() : this.graph.hideGrid()
        }
        if (partialConfig.gridSize !== undefined) {
          this.graph.setGridSize(partialConfig.gridSize)
        }
      }
    }
  }
})
