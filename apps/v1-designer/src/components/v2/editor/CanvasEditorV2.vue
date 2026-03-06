<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useGraphV2 } from '@/composables/v2/useGraphV2'
import { useAutoSave } from '@/composables/v2/useAutoSave'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import SketchRulerV2 from './SketchRulerV2.vue'

const canvasStore = useCanvasStoreV2()
const { initGraph, applyCanvasConfig, getGraph } = useGraphV2()
const autoSave = useAutoSave()

const canvasRef = ref<HTMLElement>()
const wrapperRef = ref<HTMLElement>()
const scrollWrapperRef = ref<HTMLElement>()

// 画布相关尺寸与状态
const scale = ref(1)
const startX = ref(0)
const startY = ref(0)
const thick = 20
const wrapperWidth = ref(1000)
const wrapperHeight = ref(800)

const state = reactive({
  showRuler: true,
  showReferLine: true,
  lockLine: false,
  lines: {
    h: [],
    v: []
  }
})

const handleResize = () => {
  if (wrapperRef.value) {
    wrapperWidth.value = wrapperRef.value.clientWidth
    wrapperHeight.value = wrapperRef.value.clientHeight
  }
}

// --- 外部缩放逻辑 ---
const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    // 计算缩放比例
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.1, Math.min(5, canvasStore.viewport.zoom + delta))
    canvasStore.setZoom(parseFloat(newZoom.toFixed(2)))
  }
}

// 监听全局缩放变化
watch(() => canvasStore.viewport.zoom, (val) => {
  scale.value = val
  updateRulerPos()
})

onMounted(async () => {
  if (!canvasRef.value) return

  handleResize()
  window.addEventListener('resize', handleResize)

  // 初始化 Graph
  initGraph(canvasRef.value)

  // 尝试恢复上次保存的数据
  const saved = await autoSave.restore()
  const graph = getGraph()
  if (saved && graph) {
    try {
      if (saved.graphData) {
        graph.fromJSON(saved.graphData as Record<string, unknown>)
      }
      if (saved.canvasConfig) {
        canvasStore.updateConfig(saved.canvasConfig as Record<string, unknown>)
        applyCanvasConfig()
      }
    } catch (e) {
      console.warn('[CanvasEditorV2] 恢复数据失败:', e)
    }
  }

  if (graph) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoSave.mount(graph, canvasStore.config as any)

    // 重写坐标转换，解决 CSS 外部缩放导致的托拽偏移
    // @ts-expect-error - 重写方法需忽略类型检查
    graph.clientToLocal = (arg1: any, arg2?: number) => {
      let clientX = 0
      let clientY = 0

      if (typeof arg1 === 'object' && arg1 !== null) {
        clientX = arg1.clientX || 0
        clientY = arg1.clientY || 0
      } else {
        clientX = Number(arg1) || 0
        clientY = Number(arg2) || 0
      }

      const rect = canvasRef.value ? canvasRef.value.getBoundingClientRect() : { left: 0, top: 0 }
      const s = scale.value || canvasStore.viewport.zoom || 1

      return {
        x: (clientX - rect.left) / s,
        y: (clientY - rect.top) / s
      }
    }
  }

  // 初始化缩放同步
  scale.value = canvasStore.viewport.zoom

  // 初始化滚动位置：使画布 (0,0) 靠近左上角
  // 留出 40px 的边距
  if (scrollWrapperRef.value) {
    const initialPadding = 200 // 对应的 margin
    const offset = 40 // 期望的视觉留白
    scrollWrapperRef.value.scrollLeft = (initialPadding - offset) * scale.value
    scrollWrapperRef.value.scrollTop = (initialPadding - offset) * scale.value
  }

  updateRulerPos()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 同步标尺坐标计算 (外部缩放模式下简化)
const updateRulerPos = () => {
  if (!scrollWrapperRef.value) return
  const scrollLeft = scrollWrapperRef.value.scrollLeft
  const scrollTop = scrollWrapperRef.value.scrollTop
  const padding = 200 // 减小后的 margin

  // 正确公式：(屏幕位移 / 当前缩放) - 逻辑偏移
  startX.value = (scrollLeft / scale.value) - padding
  startY.value = (scrollTop / scale.value) - padding
}

const handleScroll = () => {
  updateRulerPos()
}

// 监听画布配置变化
watch(() => canvasStore.config, () => {
  applyCanvasConfig()
}, { deep: true })
</script>

<template>
  <div class="canvas-editor-v2-wrapper" ref="wrapperRef">
    <!-- 1. 背景层 -->
    <div class="canvas-background-grid" />

    <!-- 2. 封装后的标尺组件 -->
    <SketchRulerV2 v-model:lines="state.lines" v-model:lockLine="state.lockLine"
      v-model:showReferLine="state.showReferLine" :showRuler="state.showRuler" :thick="thick" :scale="scale"
      :startX="startX" :startY="startY" :width="wrapperWidth" :height="wrapperHeight"
      :canvasWidth="canvasStore.config.width" :canvasHeight="canvasStore.config.height" />

    <!-- 3. 画布滚动区域 (外部缩放与平移容器) -->
    <div class="scroll-wrapper" ref="scrollWrapperRef" @scroll="handleScroll" @wheel="handleWheel" :style="{
      position: 'absolute',
      top: (state.showRuler ? thick : 0) + 'px',
      left: (state.showRuler ? thick : 0) + 'px',
      width: state.showRuler ? `calc(100% - ${thick}px)` : '100%',
      height: state.showRuler ? `calc(100% - ${thick}px)` : '100%',
      overflow: 'auto',
      zIndex: 1,
    }">
      <div class="canvas-content-wrapper" :style="{
        position: 'relative',
        width: 'fit-content',
        height: 'fit-content',
        transform: `scale(${scale})`,
        transformOrigin: '0 0'
      }">
        <div ref="canvasRef" class="canvas-editor-v2-inner" :style="{
          width: canvasStore.config.width + 'px',
          height: canvasStore.config.height + 'px',
          position: 'relative',
          margin: '200px',
          outline: '1px solid rgba(14, 165, 233, 0.5)',
        }" />
      </div>
    </div>

    <!-- 4. 自动保存状态指示器 -->
    <div class="save-indicator" v-if="autoSave.isSaving.value">
      <span class="save-dot" />
      <span>保存中…</span>
    </div>
    <div class="save-indicator saved" v-else-if="autoSave.lastSavedAt.value">
      <span class="save-dot saved-dot" />
      <span>已保存</span>
    </div>
  </div>
</template>

<style scoped>
.canvas-editor-v2-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-secondary, #0f172a);
}

.canvas-background-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(45deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.02) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.02) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  pointer-events: none;
}

.scroll-wrapper {
  background-color: transparent;
}

/* 禁用 X6 内部交互后的平滑滚动 */
.scroll-wrapper {
  scroll-behavior: auto;
}

.canvas-editor-v2-inner {
  box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.2), 0 25px 60px -10px rgba(0, 0, 0, 0.8);
}

.save-indicator {
  position: fixed;
  bottom: 16px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.6);
  background: rgba(15, 23, 42, 0.8);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(51, 65, 85, 0.5);
  backdrop-filter: blur(8px);
  z-index: 100;
}

.save-indicator.saved {
  color: rgba(34, 197, 94, 0.7);
}

.save-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(248, 113, 19, 0.8);
  animation: pulse 1s ease-in-out infinite;
}

.saved-dot {
  background: rgba(34, 197, 94, 0.8);
  animation: none;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}
</style>
