import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as fabric from 'fabric'
import { useEditorStore } from '@/stores/editor'

export function useRuler(canvas: fabric.Canvas | null) {
  const editorStore = useEditorStore()

  const hRulerRef = ref<HTMLCanvasElement>()
  const vRulerRef = ref<HTMLCanvasElement>()

  const RULER_THICKNESS = 20
  const MARKER_COLOR = '#888'
  const TEXT_COLOR = '#666'
  const BG_COLOR = '#f8f8f8'
  const FONT = '10px sans-serif'

  let hCtx: CanvasRenderingContext2D | null = null
  let vCtx: CanvasRenderingContext2D | null = null

  function initRuler(hCanvas: HTMLCanvasElement, vCanvas: HTMLCanvasElement) {
    hRulerRef.value = hCanvas
    vRulerRef.value = vCanvas

    hCtx = hCanvas.getContext('2d')
    vCtx = vCanvas.getContext('2d')

    resizeRulers()
    renderRulers()
  }

  function resizeRulers() {
    if (!hRulerRef.value || !vRulerRef.value || !canvas) return
    const width = canvas.getWidth()
    const height = canvas.getHeight()

    // 处理高分屏模糊问题
    const dpr = window.devicePixelRatio || 1

    hRulerRef.value.width = width * dpr
    hRulerRef.value.height = RULER_THICKNESS * dpr
    hRulerRef.value.style.width = width + 'px'
    hRulerRef.value.style.height = RULER_THICKNESS + 'px'

    vRulerRef.value.width = RULER_THICKNESS * dpr
    vRulerRef.value.height = height * dpr
    vRulerRef.value.style.width = RULER_THICKNESS + 'px'
    vRulerRef.value.style.height = height + 'px'

    if (hCtx) hCtx.scale(dpr, dpr)
    if (vCtx) vCtx.scale(dpr, dpr)
  }

  function renderRulers() {
    if (!hCtx || !vCtx || !canvas || !editorStore.config.showRuler) return

    const vpt = canvas.viewportTransform
    if (!vpt) return

    const zoom = canvas.getZoom()
    const panX = vpt[4]
    const panY = vpt[5]

    const width = canvas.getWidth()
    const height = canvas.getHeight()

    // 基础清理
    hCtx.clearRect(0, 0, width, RULER_THICKNESS)
    hCtx.fillStyle = BG_COLOR
    hCtx.fillRect(0, 0, width, RULER_THICKNESS)

    vCtx.clearRect(0, 0, RULER_THICKNESS, height)
    vCtx.fillStyle = BG_COLOR
    vCtx.fillRect(0, 0, RULER_THICKNESS, height)

    hCtx.fillStyle = TEXT_COLOR
    hCtx.strokeStyle = MARKER_COLOR
    hCtx.font = FONT
    hCtx.textAlign = 'left'
    hCtx.textBaseline = 'top'
    hCtx.lineWidth = 1

    vCtx.fillStyle = TEXT_COLOR
    vCtx.strokeStyle = MARKER_COLOR
    vCtx.font = FONT
    vCtx.textAlign = 'center'
    vCtx.textBaseline = 'middle'
    vCtx.lineWidth = 1

    // 确定刻度的跨度，根据缩放级别自适应
    let step = 100 // 默认世界坐标 100
    if (zoom > 5) step = 10
    else if (zoom > 2) step = 20
    else if (zoom < 0.2) step = 500
    else if (zoom < 0.5) step = 200

    // 绘制水平横向标尺
    const startX = -panX / zoom
    const endX = startX + width / zoom

    // 对齐到最近的整 step 点
    const drawStartX = Math.floor(startX / step) * step

    hCtx.beginPath()
    for (let x = drawStartX; x <= endX; x += step) {
      const screenX = x * zoom + panX
      // 画主刻度和文字
      hCtx.moveTo(screenX, RULER_THICKNESS - 15)
      hCtx.lineTo(screenX, RULER_THICKNESS)
      hCtx.fillText(String(x), screenX + 2, 2)

      // 画小刻度 (十等分)
      const subStep = step / 10
      for (let j = 1; j < 10; j++) {
        const subScreenX = (x + j * subStep) * zoom + panX
        const markerH = j === 5 ? 8 : 4
        hCtx.moveTo(subScreenX, RULER_THICKNESS - markerH)
        hCtx.lineTo(subScreenX, RULER_THICKNESS)
      }
    }
    hCtx.stroke()

    // 绘制垂直纵向标尺
    const startY = -panY / zoom
    const endY = startY + height / zoom
    const drawStartY = Math.floor(startY / step) * step

    vCtx.beginPath()
    for (let y = drawStartY; y <= endY; y += step) {
      const screenY = y * zoom + panY

      vCtx.moveTo(RULER_THICKNESS - 15, screenY)
      vCtx.lineTo(RULER_THICKNESS, screenY)

      // 垂直文字绘制需要旋转坐标系
      vCtx.save()
      vCtx.translate(8, screenY + 2)
      vCtx.rotate(-Math.PI / 2)
      vCtx.fillText(String(y), 0, 0)
      vCtx.restore()

      const subStep = step / 10
      for (let j = 1; j < 10; j++) {
        const subScreenY = (y + j * subStep) * zoom + panY
        const markerW = j === 5 ? 8 : 4
        vCtx.moveTo(RULER_THICKNESS - markerW, subScreenY)
        vCtx.lineTo(RULER_THICKNESS, subScreenY)
      }
    }
    vCtx.stroke()

    // 加个边框
    hCtx.strokeStyle = '#e2e8f0'
    hCtx.beginPath()
    hCtx.moveTo(0, RULER_THICKNESS)
    hCtx.lineTo(width, RULER_THICKNESS)
    hCtx.stroke()

    vCtx.strokeStyle = '#e2e8f0'
    vCtx.beginPath()
    vCtx.moveTo(RULER_THICKNESS, 0)
    vCtx.lineTo(RULER_THICKNESS, height)
    vCtx.stroke()
  }

  function mountRulerEvents() {
    if (!canvas) return
    canvas.on('mouse:move', renderRulers) // 其实只需要在缩放和平移时重绘
    canvas.on('mouse:wheel', renderRulers)
    canvas.on('mouse:up', renderRulers)

    const handleResize = () => {
      resizeRulers()
      renderRulers()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      canvas?.off('mouse:move', renderRulers)
      canvas?.off('mouse:wheel', renderRulers)
      canvas?.off('mouse:up', renderRulers)
      window.removeEventListener('resize', handleResize)
    }
  }

  return {
    hRulerRef,
    vRulerRef,
    initRuler,
    renderRulers,
    mountRulerEvents
  }
}
