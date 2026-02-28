import { ref, onUnmounted } from 'vue'
import * as fabric from 'fabric'
import { useEditorStore } from '@/stores/editor'
import { useSelectionStore } from '@/stores/selection'
import { useGridLayer } from './useGridLayer'

export function useCanvas() {
  const canvasRef = ref<HTMLCanvasElement>()
  const editorStore = useEditorStore()
  const selectionStore = useSelectionStore()

  let canvas: fabric.Canvas | null = null

  const initCanvas = (el: HTMLCanvasElement) => {
    if (canvas) return

    canvas = new fabric.Canvas(el, {
      width: window.innerWidth - 300, // 侧边栏宽度
      height: window.innerHeight - 48, // 头部高度
      preserveObjectStacking: true, // 确保选中时层级不会错乱
      selection: true,
      backgroundColor: '#f5f5f5' // 暂定底色
    })

    editorStore.initCanvas(canvas)

    const { setupGridSystem } = useGridLayer(canvas)
    setupGridSystem()

    setupGlobalEvents()
    setupCanvasEvents(canvas)
  }

  const setupCanvasEvents = (cvs: fabric.Canvas) => {
    // 注册全局选择事件投递到 Store 包裹一层 markRaw
    cvs.on('selection:created', (opt: any) => {
      selectionStore.setSelection(opt.selected || [])
    })

    cvs.on('selection:updated', (opt: any) => {
      selectionStore.setSelection(opt.selected || [])
    })

    cvs.on('selection:cleared', () => {
      selectionStore.clearSelection()
    })

    // 同步对象级属性变化，供外部响应 (比如被拖拽后要在右侧即时刷新坐标)
    cvs.on('object:modified', () => {
      // 触发一次虚拟的选择刷新，让使用 selectedObjects 的计算属性或侦听器工作
      const current = cvs.getActiveObjects()
      if (current.length > 0) {
        selectionStore.setSelection(current)
      }
    })

    // 滚轮缩放
    cvs.on('mouse:wheel', function (opt: any) {
      const delta = opt.e.deltaY
      let zoom = cvs.getZoom()
      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.05) zoom = 0.05

      cvs.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    // 拖拽平移 (支持中键或 Pan 模式)
    let isDragging = false
    let lastPosX = 0
    let lastPosY = 0

    cvs.on('mouse:down', function (opt: any) {
      const e = opt.e
      const isPanMode = editorStore.mode === 'pan'
      // 鼠标中键 (button === 1) 或 alt 键 或 pan 操作模式
      if (e.button === 1 || e.altKey === true || isPanMode) {
        isDragging = true
        cvs.selection = false // 拖拽时禁用多选框
        lastPosX = e.clientX
        lastPosY = e.clientY

        if (isPanMode && opt.target) {
          // 在 pan 模式下点到物体也不允许它被选中拖走
          opt.target.set('selectable', false)
          cvs.discardActiveObject()
        }
      } else {
        // 重置所有对象的可选状态 (在 select 模式下)
        if (editorStore.mode === 'select') {
          cvs.getObjects().forEach((o: any) => o.set('selectable', true))
        }
      }
    })

    cvs.on('mouse:move', function (opt: any) {
      if (isDragging) {
        const e = opt.e
        const vpt = cvs.viewportTransform
        if (!vpt) return

        vpt[4] += e.clientX - lastPosX
        vpt[5] += e.clientY - lastPosY
        cvs.requestRenderAll()

        lastPosX = e.clientX
        lastPosY = e.clientY
      }
    })

    cvs.on('mouse:up', function () {
      if (!cvs.viewportTransform) return
      cvs.setViewportTransform(cvs.viewportTransform)
      isDragging = false
      cvs.selection = true
    })
  }

  const setupGlobalEvents = () => {
    const handleResize = () => {
      if (!canvas) return
      requestAnimationFrame(() => {
        canvas?.setDimensions({
          width: window.innerWidth - 300,
          height: window.innerHeight - 48
        })
        canvas?.requestRenderAll()
      })
    }

    window.addEventListener('resize', handleResize)

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (canvas) {
        canvas.dispose()
      }
    })
  }

  return {
    canvasRef,
    initCanvas,
    getCanvas: () => canvas
  }
}
