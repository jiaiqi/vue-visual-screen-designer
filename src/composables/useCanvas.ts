import { ref, onUnmounted } from 'vue'
import * as fabric from 'fabric'
import { useEditorStore } from '@/stores/editor'
import { useSelectionStore } from '@/stores/selection'
import { useHistoryStore } from '@/stores/history'
import { useGridLayer } from './useGridLayer'
import { useAlignmentGuides } from './useAlignmentGuides'

export function useCanvas() {
  const canvasRef = ref<HTMLCanvasElement>()
  const editorStore = useEditorStore()
  const selectionStore = useSelectionStore()
  const historyStore = useHistoryStore()

  let canvas: fabric.Canvas | null = null
  let isSpacePressed = false

  // 监听空格与 Ctrl 键以切换鼠标样式
  const handleSpaceKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !isSpacePressed) {
      isSpacePressed = true
      if (canvas) {
        canvas.defaultCursor = 'grab'
        canvas.hoverCursor = 'grab'
        canvas.requestRenderAll()
      }
      const target = e.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault()
      }
    }
    // 监听 Ctrl 状态
    if (e.ctrlKey && canvas) {
      canvas.defaultCursor = 'zoom-in'
      canvas.requestRenderAll()
    }
  }

  const handleSpaceKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed = false
      if (canvas) {
        canvas.defaultCursor = 'default'
        canvas.hoverCursor = 'move'
        canvas.requestRenderAll()
      }
    }
    // 释放 Ctrl
    if (!e.ctrlKey && canvas && !isSpacePressed) {
      canvas.defaultCursor = 'default'
      canvas.requestRenderAll()
    }
  }

  const initCanvas = (el: HTMLCanvasElement) => {
    if (canvas) return

    canvas = new fabric.Canvas(el, {
      width: window.innerWidth - 300, // 侧边栏宽度
      height: window.innerHeight - 48, // 头部高度
      preserveObjectStacking: true, // 确保选中时层级不会错乱
      selection: true,
      backgroundColor: '#f5f5f5', // 暂定底色
      enableRetinaCanvas: true, // 开启 Retina 高清适配
      renderOnAddRemove: true,
      imageSmoothingEnabled: true // 开启图像平滑
    })

    editorStore.initCanvas(canvas)
    historyStore.init(canvas)

    const { setupGridSystem } = useGridLayer(canvas)
    setupGridSystem()

    const { setup: setupAlignment } = useAlignmentGuides(canvas)
    setupAlignment()

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

    // 同步对象级属性变化，供外部响应
    cvs.on('object:moving', (opt: any) => {
      // 网格强吸附逻辑 (可选开启，目前默认对齐到 gridSize)
      const gridSize = editorStore.config.gridSize || 10
      const target = opt.target

      // 只有在没有触发智能参考线吸附（或作为补充）时，可以进行网格取整
      // 注意：如果 useAlignmentGuides 已经 set 了位置，这里会基于那个位置再微调
      target.set({
        left: Math.round(target.left / gridSize) * gridSize,
        top: Math.round(target.top / gridSize) * gridSize
      })
    })

    cvs.on('object:modified', () => {
      // 触发一次虚拟的选择刷新，让使用 selectedObjects 的计算属性或侦听器工作
      const current = cvs.getActiveObjects()
      if (current.length > 0) {
        selectionStore.setSelection(current)
      }
      historyStore.save()
    })

    // 捕获添减对象动作挂载历史
    cvs.on('object:added', () => {
      if (!historyStore.isExecuting) historyStore.save()
    })

    cvs.on('object:removed', () => {
      if (!historyStore.isExecuting) historyStore.save()
    })

    // 滚轮缩放：仅在按住 Ctrl 时触发
    cvs.on('mouse:wheel', function (opt: any) {
      if (!opt.e.ctrlKey) return // 没按 Ctrl 时走原生滚动(如果有的话)

      const delta = opt.e.deltaY
      let zoom = cvs.getZoom()
      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.05) zoom = 0.05

      cvs.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    let isDragging = false
    let lastPosX = 0
    let lastPosY = 0

    window.addEventListener('keydown', handleSpaceKeyDown)
    window.addEventListener('keyup', handleSpaceKeyUp)

    cvs.on('mouse:down', function (opt: any) {
      const e = opt.e
      const isPanMode = editorStore.mode === 'pan'
      // 鼠标中键 (button === 1) 或 alt 键 或 pan 操作模式 或 空格键按住
      if (e.button === 1 || e.altKey === true || isPanMode || isSpacePressed) {
        isDragging = true
        cvs.selection = false // 拖拽时禁用多选框
        cvs.defaultCursor = 'grabbing'
        cvs.requestRenderAll()
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

    cvs.on('mouse:up', function (opt: any) {
      if (!cvs.viewportTransform) return
      cvs.setViewportTransform(cvs.viewportTransform)
      isDragging = false
      cvs.selection = true
      // 抬起后恢复 grab 或依据 Ctrl 状态恢复 zoom-in 或 default
      if (isSpacePressed) {
        cvs.defaultCursor = 'grab'
      } else if (opt.e && opt.e.ctrlKey) {
        cvs.defaultCursor = 'zoom-in'
      } else {
        cvs.defaultCursor = 'default'
      }
      cvs.requestRenderAll()
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
      window.removeEventListener('keydown', handleSpaceKeyDown)
      window.removeEventListener('keyup', handleSpaceKeyUp)
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
