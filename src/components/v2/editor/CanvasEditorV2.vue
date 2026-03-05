<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGraphV2 } from '@/composables/v2/useGraphV2'
import { useAutoSave } from '@/composables/v2/useAutoSave'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'

const canvasStore = useCanvasStoreV2()
const { initGraph, applyCanvasConfig, getGraph } = useGraphV2()
const autoSave = useAutoSave()

const canvasRef = ref<HTMLElement>()

onMounted(async () => {
  if (!canvasRef.value) return

  // 初始化 Graph
  initGraph(canvasRef.value)

  // 尝试恢复上次保存的数据
  const saved = await autoSave.restore()
  const graph = getGraph()
  if (saved && graph) {
    try {
      graph.fromJSON(saved.graphData as any)
      // 可选：恢复画布配置
      if (saved.canvasConfig) {
        canvasStore.updateConfig(saved.canvasConfig as any)
        applyCanvasConfig()
      }
    } catch (e) {
      console.warn('[CanvasEditorV2] 恢复数据失败:', e)
    }
  }

  // 挂载自动保存
  if (graph) {
    autoSave.mount(graph, canvasStore.config as any)
  }
})

// 监听画布配置变化，实时应用
watch(() => canvasStore.config, () => {
  applyCanvasConfig()
}, { deep: true })
</script>

<template>
  <!-- 固定尺寸画布容器，外层可滚动/缩放 -->
  <div class="canvas-editor-v2-wrapper">
    <!-- 画布区域：固定 1920×1080，X6 挂载点 -->
    <div
      ref="canvasRef"
      class="canvas-editor-v2-inner"
      :style="{
        width: canvasStore.config.width + 'px',
        height: canvasStore.config.height + 'px',
        position: 'relative',
        flexShrink: 0,
      }"
    />

    <!-- 自动保存状态指示器 -->
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
  overflow: auto;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 40px;
  box-sizing: border-box;
  background: var(--color-bg-secondary, #0f172a);
  /* 棋盘格背景，区分画布区域 */
  background-image:
    linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
