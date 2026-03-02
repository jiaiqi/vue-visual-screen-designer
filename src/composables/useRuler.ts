import { ref, onUnmounted, watch, type Ref } from 'vue'
import type { Graph } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'

export interface RulerConfig {
  thickness: number
  bgColor: string
  markerColor: string
  textColor: string
  fontSize: number
}

const DEFAULT_CONFIG: RulerConfig = {
  thickness: 20,
  bgColor: 'rgba(15, 23, 42, 0.95)',
  markerColor: '#475569',
  textColor: '#94a3b8',
  fontSize: 9
}

export function useRuler(graphRef: Ref<Graph | null>) {
  const editorStore = useEditorStore()

  const hRulerRef = ref<HTMLCanvasElement>()
  const vRulerRef = ref<HTMLCanvasElement>()

  const config = { ...DEFAULT_CONFIG }

  let hCtx: CanvasRenderingContext2D | null = null
  let vCtx: CanvasRenderingContext2D | null = null
  let cleanupFns: (() => void)[] = []

  function initRuler(hCanvas: HTMLCanvasElement, vCanvas: HTMLCanvasElement) {
    hRulerRef.value = hCanvas
    vRulerRef.value = vCanvas

    hCtx = hCanvas.getContext('2d')
    vCtx = vCanvas.getContext('2d')

    resizeRulers()
    renderRulers()
    bindEvents()
  }

  function resizeRulers() {
    if (!hRulerRef.value || !vRulerRef.value || !graphRef.value) return

    const graph = graphRef.value
    const container = graph.container
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight
    const dpr = window.devicePixelRatio || 1

    hRulerRef.value.width = width * dpr
    hRulerRef.value.height = config.thickness * dpr
    hRulerRef.value.style.width = width + 'px'
    hRulerRef.value.style.height = config.thickness + 'px'

    vRulerRef.value.width = config.thickness * dpr
    vRulerRef.value.height = height * dpr
    vRulerRef.value.style.width = config.thickness + 'px'
    vRulerRef.value.style.height = height + 'px'

    if (hCtx) {
      hCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    if (vCtx) {
      vCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }

  function renderRulers() {
    if (!hCtx || !vCtx || !graphRef.value || !editorStore.canvasConfig.showRuler) return

    const graph = graphRef.value
    const container = graph.container
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    const zoom = graph.zoom()
    const translate = graph.translate()
    const tx = translate.tx
    const ty = translate.ty

    hCtx.clearRect(0, 0, width, config.thickness)
    hCtx.fillStyle = config.bgColor
    hCtx.fillRect(0, 0, width, config.thickness)

    vCtx.clearRect(0, 0, config.thickness, height)
    vCtx.fillStyle = config.bgColor
    vCtx.fillRect(0, 0, config.thickness, height)

    hCtx.fillStyle = config.textColor
    hCtx.strokeStyle = config.markerColor
    hCtx.font = `${config.fontSize}px sans-serif`
    hCtx.textAlign = 'left'
    hCtx.textBaseline = 'top'
    hCtx.lineWidth = 1

    vCtx.fillStyle = config.textColor
    vCtx.strokeStyle = config.markerColor
    vCtx.font = `${config.fontSize}px sans-serif`
    vCtx.textAlign = 'center'
    vCtx.textBaseline = 'middle'
    vCtx.lineWidth = 1

    let step = 100
    if (zoom > 5) step = 10
    else if (zoom > 2) step = 20
    else if (zoom > 1) step = 50
    else if (zoom < 0.2) step = 500
    else if (zoom < 0.5) step = 200

    const startX = -tx / zoom
    const endX = startX + width / zoom
    const drawStartX = Math.floor(startX / step) * step

    hCtx.beginPath()
    for (let x = drawStartX; x <= endX; x += step) {
      const screenX = x * zoom + tx

      if (screenX >= 0 && screenX <= width) {
        hCtx.moveTo(screenX, config.thickness - 12)
        hCtx.lineTo(screenX, config.thickness)

        const label = formatNumber(x)
        hCtx.fillText(label, screenX + 3, 3)
      }

      const subStep = step / 10
      for (let j = 1; j < 10; j++) {
        const subScreenX = (x + j * subStep) * zoom + tx
        if (subScreenX >= 0 && subScreenX <= width) {
          const markerH = j === 5 ? 7 : 4
          hCtx.moveTo(subScreenX, config.thickness - markerH)
          hCtx.lineTo(subScreenX, config.thickness)
        }
      }
    }
    hCtx.stroke()

    const startY = -ty / zoom
    const endY = startY + height / zoom
    const drawStartY = Math.floor(startY / step) * step

    vCtx.beginPath()
    for (let y = drawStartY; y <= endY; y += step) {
      const screenY = y * zoom + ty

      if (screenY >= 0 && screenY <= height) {
        vCtx.moveTo(config.thickness - 12, screenY)
        vCtx.lineTo(config.thickness, screenY)

        const label = formatNumber(y)
        vCtx.save()
        vCtx.translate(10, screenY + 3)
        vCtx.rotate(-Math.PI / 2)
        vCtx.fillText(label, 0, 0)
        vCtx.restore()
      }

      const subStep = step / 10
      for (let j = 1; j < 10; j++) {
        const subScreenY = (y + j * subStep) * zoom + ty
        if (subScreenY >= 0 && subScreenY <= height) {
          const markerW = j === 5 ? 7 : 4
          vCtx.moveTo(config.thickness - markerW, subScreenY)
          vCtx.lineTo(config.thickness, subScreenY)
        }
      }
    }
    vCtx.stroke()

    hCtx.strokeStyle = '#334155'
    hCtx.beginPath()
    hCtx.moveTo(0, config.thickness - 0.5)
    hCtx.lineTo(width, config.thickness - 0.5)
    hCtx.stroke()

    vCtx.strokeStyle = '#334155'
    vCtx.beginPath()
    vCtx.moveTo(config.thickness - 0.5, 0)
    vCtx.lineTo(config.thickness - 0.5, height)
    vCtx.stroke()
  }

  function formatNumber(num: number): string {
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return String(num)
  }

  function bindEvents() {
    if (!graphRef.value) return

    const graph = graphRef.value

    const onScale = () => {
      renderRulers()
    }

    const onTranslate = () => {
      renderRulers()
    }

    const onResize = () => {
      resizeRulers()
      renderRulers()
    }

    graph.on('scale', onScale)
    graph.on('translate', onTranslate)
    window.addEventListener('resize', onResize)

    cleanupFns = [
      () => graph.off('scale', onScale),
      () => graph.off('translate', onTranslate),
      () => window.removeEventListener('resize', onResize)
    ]
  }

  function destroy() {
    cleanupFns.forEach(fn => fn())
    cleanupFns = []
  }

  watch(() => editorStore.canvasConfig.showRuler, (show) => {
    if (show) {
      resizeRulers()
      renderRulers()
    }
  })

  watch(graphRef, (newGraph, oldGraph) => {
    if (oldGraph) {
      destroy()
    }
    if (newGraph && hRulerRef.value && vRulerRef.value) {
      resizeRulers()
      renderRulers()
      bindEvents()
    }
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    hRulerRef,
    vRulerRef,
    initRuler,
    renderRulers,
    resizeRulers,
    config
  }
}
