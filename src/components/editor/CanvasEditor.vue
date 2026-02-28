<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useCanvas } from '@/composables/useCanvas'
import { useDragDrop } from '@/composables/useDragDrop'
import { useRuler } from '@/composables/useRuler'
import { useEditorStore } from '@/stores/editor'

const wrapperRef = ref<HTMLElement>()
const hRulerRefLocal = ref<HTMLCanvasElement>()
const vRulerRefLocal = ref<HTMLCanvasElement>()
const { canvasRef, initCanvas, getCanvas } = useCanvas()
const editorStore = useEditorStore()

let cleanupDragDrop: (() => void) | undefined
let cleanupRuler: (() => void) | undefined

onMounted(() => {
  if (canvasRef.value) {
    initCanvas(canvasRef.value)
    const canvasInstance = getCanvas()

    // 初始化拖放侦听
    if (wrapperRef.value) {
      const { setupDragDrop } = useDragDrop(canvasInstance)
      cleanupDragDrop = setupDragDrop(wrapperRef.value)
    }

    // 初始化标尺
    if (hRulerRefLocal.value && vRulerRefLocal.value) {
      const { initRuler, mountRulerEvents, renderRulers } = useRuler(canvasInstance)
      initRuler(hRulerRefLocal.value, vRulerRefLocal.value)
      cleanupRuler = mountRulerEvents()

      // 监听 config 变化强制重绘标尺
      watch(() => editorStore.config.showRuler, () => {
        if (!hRulerRefLocal.value || !vRulerRefLocal.value) return
        hRulerRefLocal.value.style.display = editorStore.config.showRuler ? 'block' : 'none'
        vRulerRefLocal.value.style.display = editorStore.config.showRuler ? 'block' : 'none'
        renderRulers()
      })
    }
  }
})

onUnmounted(() => {
  if (cleanupDragDrop) cleanupDragDrop()
  if (cleanupRuler) cleanupRuler()
})
</script>

<template>
  <div ref="wrapperRef" class="canvas-wrapper w-full h-full flex flex-col items-center justify-center bg-muted/20 relative overflow-hidden">
    <!-- 标尺辅助层 (挂在 fabric canvas 外面) -->
    <div class="absolute inset-0 pointer-events-none z-10">
      <canvas
        ref="hRulerRefLocal"
        class="absolute left-0 top-0 pointer-events-auto cursor-ns-resize"
      />
      <canvas
        ref="vRulerRefLocal"
        class="absolute left-0 top-0 pointer-events-auto cursor-ew-resize"
        style="top: 20px"
      />
      <div
        v-if="editorStore.config.showRuler"
        class="absolute left-0 top-0 w-[20px] h-[20px] bg-[#f8f8f8] border-r border-b border-[#e2e8f0] z-20"
      ></div>
    </div>

    <!-- 主体织物画板实例接缝 -->
    <div class="relative w-full h-full" :class="editorStore.config.showRuler ? 'pl-[20px] pt-[20px]' : ''">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  overflow: hidden; /* Prevent native scrollbars around canvas */
}
</style>
