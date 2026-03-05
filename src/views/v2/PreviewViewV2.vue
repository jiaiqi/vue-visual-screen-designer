<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCanvasStoreV2, type ScaleMode } from '@/stores/v2/canvasStoreV2'
import { useScaleAdapter } from '@/composables/v2/useScaleAdapter'
import { useRouter } from 'vue-router'
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-vue-next'
import { useGraphV2 } from '@/composables/v2/useGraphV2'

const router = useRouter()
const canvasStore = useCanvasStoreV2()
const { initGraph, getGraph } = useGraphV2()

const previewContainerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

const { canvasWidth, canvasHeight } = {
  canvasWidth: canvasStore.config.width,
  canvasHeight: canvasStore.config.height,
}

const scaleMode = computed(() => canvasStore.config.previewScaleMode as ScaleMode)

const { containerRef, scale, transformStyle, updateContainerSize } = useScaleAdapter({
  canvasWidth,
  canvasHeight,
  mode: scaleMode.value,
})

onMounted(async () => {
  // 将 containerRef 绑定到预览容器
  if (previewContainerRef.value) {
    containerRef.value = previewContainerRef.value
    updateContainerSize()
  }

  if (!canvasRef.value) return
  initGraph(canvasRef.value)

  // 恢复预览数据
  const graph = getGraph()
  if (graph) {
    // 优先从 v2 自动保存恢复，其次从 v2 预览数据
    const v2PreviewData = localStorage.getItem('v2_preview_graph_data')
    if (v2PreviewData) {
      try {
        graph.fromJSON(JSON.parse(v2PreviewData))
      } catch (e) {
        console.warn('[PreviewV2] 恢复预览数据失败:', e)
      }
    }
  }

  // 全屏变化监听
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen()
  } else {
    await document.exitFullscreen()
  }
}

const goBack = () => {
  router.push('/v2')
}
</script>

<template>
  <div class="preview-view-v2">
    <!-- 预览控制栏 -->
    <div class="preview-controls">
      <button class="ctrl-btn" @click="goBack" title="返回编辑器">
        <ArrowLeft class="w-4 h-4" />
        <span>返回编辑</span>
      </button>

      <div class="preview-info">
        <span class="canvas-size">{{ canvasStore.config.width }} × {{ canvasStore.config.height }}</span>
        <span class="scale-info" v-if="scale !== null">{{ Math.round((scale ?? 1) * 100) }}%</span>
      </div>

      <button class="ctrl-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏预览'">
        <Minimize2 v-if="isFullscreen" class="w-4 h-4" />
        <Maximize2 v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- 预览容器（CSS Scale 自适应） -->
    <div class="preview-stage" ref="previewContainerRef">
      <!-- 固定尺寸画布 -->
      <div
        class="preview-canvas"
        :style="{
          ...transformStyle,
          width: canvasStore.config.width + 'px',
          height: canvasStore.config.height + 'px',
        }"
      >
        <div
          ref="canvasRef"
          :style="{
            width: canvasStore.config.width + 'px',
            height: canvasStore.config.height + 'px',
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-view-v2 {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
}

.preview-controls {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(2, 6, 23, 0.95);
  border-bottom: 1px solid rgba(51, 65, 85, 0.4);
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.canvas-size {
  font-size: 12px;
  font-family: monospace;
  color: #64748b;
}

.scale-info {
  font-size: 12px;
  font-family: monospace;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.ctrl-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(51, 65, 85, 0.5);
  background: rgba(30, 41, 59, 0.5);
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.ctrl-btn:hover {
  background: rgba(51, 65, 85, 0.7);
  color: #e2e8f0;
}

.preview-stage {
  flex: 1;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at center, rgba(14, 165, 233, 0.03) 0%, transparent 70%),
    #000;
}

.preview-canvas {
  position: absolute;
}
</style>
