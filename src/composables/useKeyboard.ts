import * as fabric from 'fabric'
import { useEditorStore } from '@/stores/editor'
import { useSelectionStore } from '@/stores/selection'
import { onMounted, onUnmounted } from 'vue'

export function useKeyboard() {
  const editorStore = useEditorStore()
  const selectionStore = useSelectionStore()

  // 内部防抖锁：防止长按连续触发时产生的死循环
  let clipboard: fabric.Object | null = null

  function handleKeyDown(e: KeyboardEvent) {
    if (!editorStore.canvas) return

    // 焦点在输入框内部时不触发画布全局快捷键（排除 input/textarea 或 contenteditable 元素）
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const { key, ctrlKey, metaKey, shiftKey } = e
    const isCtrl = ctrlKey || metaKey

    // [1] 删除选中对象 (Delete / Backspace)
    if (key === 'Delete' || key === 'Backspace') {
      deleteSelectedObjects()
      e.preventDefault()
      return
    }

    // [2] 复制 (Ctrl + C)
    if (isCtrl && key.toLowerCase() === 'c') {
      copySelectedObjects()
      e.preventDefault()
      return
    }

    // [3] 粘贴 (Ctrl + V)
    if (isCtrl && key.toLowerCase() === 'v') {
      pasteSelectedObjects()
      e.preventDefault()
      return
    }

    // [4] 方向键微调 (上下左右)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      moveSelectedObjects(key, shiftKey)
      e.preventDefault()
      e.preventDefault()
      return
    }

    // [5] 锁定 (Ctrl + L)
    if (isCtrl && key.toLowerCase() === 'l') {
      toggleLockSelectedObjects()
      e.preventDefault()
      return
    }
  }

  function toggleLockSelectedObjects() {
    const canvas = editorStore.canvas
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        const isLocked = !(obj as any).locked
        obj.set({
          locked: isLocked,
          selectable: !isLocked,
          evented: true,
          hasControls: !isLocked,
          lockMovementX: isLocked,
          lockMovementY: isLocked,
          lockRotation: isLocked,
          lockScalingX: isLocked,
          lockScalingY: isLocked
        } as any)
      })
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      canvas.fire('after:render')
    }
  }

  function deleteSelectedObjects() {
    const canvas = editorStore.canvas
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 0) {
      canvas.discardActiveObject()
      activeObjects.forEach(obj => {
        canvas.remove(obj)
      })
      canvas.requestRenderAll()
      // 主动清理选中 Store
      selectionStore.clearSelection()
    }
  }

  async function copySelectedObjects() {
    const canvas = editorStore.canvas
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      // Fabric 对象的异步深度克隆
      clipboard = await activeObject.clone()
    }
  }

  async function pasteSelectedObjects() {
    const canvas = editorStore.canvas
    if (!canvas || !clipboard) return

    // 从内存中克隆一份以待添加到画布
    let clonedObj = await clipboard.clone()

    canvas.discardActiveObject()
    clonedObj.set({
      left: (clonedObj.left || 0) + 20, // 粘贴向右偏移 20px
      top: (clonedObj.top || 0) + 20,    // 粘贴向下偏移 20px
      evented: true,
    })

    if (clonedObj.type === 'activeSelection') {
      // 如果粘贴的是多选组合，恢复到 canvas 并重新设为 activeSelection
      (clonedObj as any).canvas = canvas;
      (clonedObj as any).forEachObject((obj: fabric.Object) => {
        canvas.add(obj)
      });
      clonedObj.setCoords()
    } else {
      canvas.add(clonedObj)
    }

    // 重新放回剪贴板，供下一次叠加级粘贴使用 (由于新对象的地址已脱离引用)
    clipboard = clonedObj

    canvas.setActiveObject(clonedObj)
    canvas.requestRenderAll()
    // 派发创建钩子给外部历史监听器
    canvas.fire('object:added', { target: clonedObj })
  }

  function moveSelectedObjects(key: string, isShiftPressed: boolean) {
    const canvas = editorStore.canvas
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject) return

    const STEP = isShiftPressed ? 10 : 1 // Shift按下时微调增为10px
    let xOffset = 0
    let yOffset = 0

    switch (key) {
      case 'ArrowUp':
        yOffset = -STEP
        break
      case 'ArrowDown':
        yOffset = STEP
        break
      case 'ArrowLeft':
        xOffset = -STEP
        break
      case 'ArrowRight':
        xOffset = STEP
        break
    }

    activeObject.set({
      left: (activeObject.left || 0) + xOffset,
      top: (activeObject.top || 0) + yOffset
    })

    activeObject.setCoords()
    canvas.requestRenderAll()
    // 触发修改事件（可用于属性计算）
    canvas.fire('object:modified', { target: activeObject })
  }

  function setupKeyboard() {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }

  // 组件生命周期代理：如果在单个组件 setup 里调用
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    setupKeyboard
  }
}
