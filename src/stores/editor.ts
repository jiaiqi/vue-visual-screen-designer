import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import * as fabric from 'fabric'

interface EditorState {
  mode: 'select' | 'draw' | 'pan' | 'edit'
  currentTool: string
  canvas: fabric.Canvas | null
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
    canvas: null,
    config: {
      gridSize: 20,
      showGrid: true,
      snapToGrid: true,
      showRuler: true
    }
  }),
  actions: {
    initCanvas(canvasInstance: fabric.Canvas) {
      // 关键优化：使用 markRaw 强制剥离响应式，防止大型实体导致性能灾难
      this.canvas = markRaw(canvasInstance)
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
    }
  }
})
