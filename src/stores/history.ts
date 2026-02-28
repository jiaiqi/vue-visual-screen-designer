import { defineStore } from 'pinia'
import { markRaw } from 'vue'

export interface Command {
  name: string
  execute(): void
  undo(): void
  redo(): void
}

interface HistoryState {
  undoStack: any[]
  redoStack: any[]
  maxSize: number
  isExecuting: boolean
}

export const useHistoryStore = defineStore('history', {
  state: (): HistoryState => ({
    undoStack: [],
    redoStack: [],
    maxSize: 50,
    isExecuting: false
  }),
  getters: {
    canUndo: (state) => state.undoStack.length > 0,
    canRedo: (state) => state.redoStack.length > 0
  },
  actions: {
    // 这里故意忽略复杂的 MacroCommand 与 Command，留着骨架
    push(item: any) {
      if (this.isExecuting) return

      this.undoStack.push(item)
      this.redoStack = []

      if (this.undoStack.length > this.maxSize) {
        this.undoStack.shift()
      }
    },
    undo() {
      // Undo logic pending
    },
    redo() {
      // Redo logic pending
    },
    clear() {
      this.undoStack = []
      this.redoStack = []
    }
  }
})
