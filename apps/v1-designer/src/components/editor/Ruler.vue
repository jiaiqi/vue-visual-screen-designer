<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()

const hRulerCanvas = ref<HTMLCanvasElement>()
const vRulerCanvas = ref<HTMLCanvasElement>()

const RULER_THICKNESS = 20

const showRuler = computed(() => editorStore.canvasConfig.showRuler)

function renderRulers() {
  const graph = editorStore.graph
  if (!graph || !hRulerCanvas.value || !vRulerCanvas.value || !showRuler.value) return

  const container = graph.container
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight
  const dpr = window.devicePixelRatio || 1

  const hCtx = hRulerCanvas.value.getContext('2d')
  const vCtx = vRulerCanvas.value.getContext('2d')

  if (!hCtx || !vCtx) return

  hRulerCanvas.value.width = width * dpr
  hRulerCanvas.value.height = RULER_THICKNESS * dpr
  hRulerCanvas.value.style.width = width + 'px'
  hRulerCanvas.value.style.height = RULER_THICKNESS + 'px'

  vRulerCanvas.value.width = RULER_THICKNESS * dpr
  vRulerCanvas.value.height = height * dpr
  vRulerCanvas.value.style.width = RULER_THICKNESS + 'px'
  vRulerCanvas.value.style.height = height + 'px'

  hCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  vCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const zoom = graph.zoom()
  const translate = graph.translate()
  const tx = translate.tx
  const ty = translate.ty

  const bgColor = 'rgba(15, 23, 42, 0.95)'
  const markerColor = '#475569'
  const textColor = '#94a3b8'
  const fontSize = 9

  hCtx.clearRect(0, 0, width, RULER_THICKNESS)
  hCtx.fillStyle = bgColor
  hCtx.fillRect(0, 0, width, RULER_THICKNESS)

  vCtx.clearRect(0, 0, RULER_THICKNESS, height)
  vCtx.fillStyle = bgColor
  vCtx.fillRect(0, 0, RULER_THICKNESS, height)

  hCtx.fillStyle = textColor
  hCtx.strokeStyle = markerColor
  hCtx.font = `${fontSize}px sans-serif`
  hCtx.textAlign = 'left'
  hCtx.textBaseline = 'top'
  hCtx.lineWidth = 1

  vCtx.fillStyle = textColor
  vCtx.strokeStyle = markerColor
  vCtx.font = `${fontSize}px sans-serif`
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
      hCtx.moveTo(screenX, RULER_THICKNESS - 12)
      hCtx.lineTo(screenX, RULER_THICKNESS)

      const label = formatNumber(x)
      hCtx.fillText(label, screenX + 3, 3)
    }

    const subStep = step / 10
    for (let j = 1; j < 10; j++) {
      const subScreenX = (x + j * subStep) * zoom + tx
      if (subScreenX >= 0 && subScreenX <= width) {
        const markerH = j === 5 ? 7 : 4
        hCtx.moveTo(subScreenX, RULER_THICKNESS - markerH)
        hCtx.lineTo(subScreenX, RULER_THICKNESS)
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
      vCtx.moveTo(RULER_THICKNESS - 12, screenY)
      vCtx.lineTo(RULER_THICKNESS, screenY)

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
        vCtx.moveTo(RULER_THICKNESS - markerW, subScreenY)
        vCtx.lineTo(RULER_THICKNESS, subScreenY)
      }
    }
  }
  vCtx.stroke()

  hCtx.strokeStyle = '#334155'
  hCtx.beginPath()
  hCtx.moveTo(0, RULER_THICKNESS - 0.5)
  hCtx.lineTo(width, RULER_THICKNESS - 0.5)
  hCtx.stroke()

  vCtx.strokeStyle = '#334155'
  vCtx.beginPath()
  vCtx.moveTo(RULER_THICKNESS - 0.5, 0)
  vCtx.lineTo(RULER_THICKNESS - 0.5, height)
  vCtx.stroke()
}

function formatNumber(num: number): string {
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return String(num)
}

let cleanupFns: (() => void)[] = []

function bindEvents() {
  const graph = editorStore.graph
  if (!graph) return

  const onScale = () => renderRulers()
  const onTranslate = () => renderRulers()
  const onResize = () => renderRulers()

  graph.on('scale', onScale)
  graph.on('translate', onTranslate)
  window.addEventListener('resize', onResize)

  cleanupFns = [
    () => graph.off('scale', onScale),
    () => graph.off('translate', onTranslate),
    () => window.removeEventListener('resize', onResize)
  ]
}

function unbindEvents() {
  cleanupFns.forEach(fn => fn())
  cleanupFns = []
}

onMounted(() => {
  setTimeout(() => {
    if (editorStore.graph && showRuler.value) {
      renderRulers()
      bindEvents()
    }
  }, 600)
})

watch(showRuler, (show) => {
  if (show && editorStore.graph) {
    setTimeout(() => {
      renderRulers()
      bindEvents()
    }, 100)
  } else {
    unbindEvents()
  }
})

watch(() => editorStore.graph, (newGraph) => {
  unbindEvents()
  if (newGraph && showRuler.value) {
    setTimeout(() => {
      renderRulers()
      bindEvents()
    }, 100)
  }
})
</script>

<template>
  <div v-if="showRuler" class="ruler-container">
    <canvas ref="hRulerCanvas" class="ruler-h" />
    <canvas ref="vRulerCanvas" class="ruler-v" />
    <div class="ruler-corner" />
  </div>
</template>

<style scoped>
.ruler-container {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

.ruler-h {
  position: absolute;
  top: 0;
  left: 20px;
  height: 20px;
}

.ruler-v {
  position: absolute;
  top: 20px;
  left: 0;
  width: 20px;
}

.ruler-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  background: rgba(15, 23, 42, 0.95);
  border-right: 1px solid #334155;
  border-bottom: 1px solid #334155;
}
</style>
