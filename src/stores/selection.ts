import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import * as fabric from 'fabric'

interface SelectionState {
  // 同样使用 markRaw 脱水包装的已选择实例对象
  selectedObjects: fabric.Object[]
}

export const useSelectionStore = defineStore('selection', {
  state: (): SelectionState => ({
    selectedObjects: []
  }),
  actions: {
    setSelection(objects: fabric.Object[]) {
      // 遍历包装
      this.selectedObjects = objects.map(obj => markRaw(obj))
    },
    clearSelection() {
      this.selectedObjects = []
    },
    // 支持按需扩展基于序列化数据的选择对象树，方便脱敏对接 UI
  }
})
