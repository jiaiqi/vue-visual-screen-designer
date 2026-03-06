import { defineStore } from 'pinia'
import * as fabric from 'fabric'
import { markRaw } from 'vue'

interface HistoryState {
  undoStack: string[]
  redoStack: string[]
  maxSize: number
  isExecuting: boolean
  canvasPtr: fabric.Canvas | null
}

export const useHistoryStore = defineStore('history', {
  state: (): HistoryState => ({
    undoStack: [],
    redoStack: [],
    maxSize: 50,
    isExecuting: false,
    canvasPtr: null
  }),
  getters: {
    canUndo: (state) => state.undoStack.length > 1, // 堆栈里至少有一个原始状态加上当前状态才准触发撤销
    canRedo: (state) => state.redoStack.length > 0
  },
  actions: {
    init(canvas: fabric.Canvas) {
      this.canvasPtr = markRaw(canvas)
      this.clear()
      this.save() // 保存初始空白态
    },

    // 生成快照并压入栈中
    save() {
      if (this.isExecuting || !this.canvasPtr) return

      const jsonStr = JSON.stringify(this.canvasPtr.toJSON())

      // 如果和最新的一样则不重复压栈
      if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === jsonStr) {
        return
      }

      this.undoStack.push(jsonStr)
      this.redoStack = [] // 一旦有了新动作，清空重做队列

      if (this.undoStack.length > this.maxSize) {
        this.undoStack.shift()
      }
    },

    async undo() {
      if (!this.canUndo || !this.canvasPtr) return

      this.isExecuting = true
      // 弹出当前状态到重做栈
      const currentState = this.undoStack.pop()!
      this.redoStack.push(currentState)

      // 获取前一个状态并加载
      const previousState = this.undoStack[this.undoStack.length - 1]
      if (previousState) {
        await this.loadSnapshot(previousState)
      }
      this.isExecuting = false
    },

    async redo() {
      if (!this.canRedo || !this.canvasPtr) return

      this.isExecuting = true
      // 从重做栈弹出恢复到撤销栈
      const nextState = this.redoStack.pop()!
      this.undoStack.push(nextState)

      await this.loadSnapshot(nextState)
      this.isExecuting = false
    },

    clear() {
      this.undoStack = []
      this.redoStack = []
    },

    loadSnapshot(jsonStr: string): Promise<void> {
      return new Promise((resolve) => {
        if (!this.canvasPtr) return resolve()
        this.canvasPtr.loadFromJSON(jsonStr, () => {
          this.canvasPtr!.requestRenderAll()
          // 需要同时清空由于状态强制覆盖导致的丢失的激活包围框
          this.canvasPtr!.discardActiveObject()
          resolve()
        })
      })
    }
  }
})
