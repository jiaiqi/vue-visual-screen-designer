<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { MiniMap } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import { Map, MapPin } from 'lucide-vue-next'

const editorStore = useEditorStore()

const minimapContainer = ref<HTMLDivElement>()
const showMinimap = ref(editorStore.showMinimap)

let minimapInstance: MiniMap | null = null

const initMinimap = async () => {
  const graph = editorStore.graph
  if (!graph || !minimapContainer.value) return

  if (minimapInstance) {
    minimapInstance.dispose()
    minimapInstance = null
  }

  minimapInstance = new MiniMap({
    container: minimapContainer.value,
    width: 200,
    height: 160,
    padding: 10,
    scalable: true,
    minScale: 0.01,
    maxScale: 16,
    graphOptions: {
      background: {
        color: '#0f172a'
      },
      grid: false,
      embedding: false,
      connecting: {
        anchor: 'center',
        connectionPoint: 'anchor'
      }
    }
  })

  graph.use(minimapInstance)
}

const disposeMinimap = () => {
  if (minimapInstance) {
    minimapInstance.dispose()
    minimapInstance = null
  }
}

const toggleMinimap = () => {
  editorStore.toggleMinimap()
  showMinimap.value = editorStore.showMinimap
}

onMounted(async () => {
  await nextTick()

  if (editorStore.graph && showMinimap.value) {
    setTimeout(() => {
      initMinimap()
    }, 600)
  }
})

watch(() => editorStore.graph, async (newGraph) => {
  disposeMinimap()
  if (newGraph && showMinimap.value) {
    await nextTick()
    setTimeout(() => {
      initMinimap()
    }, 100)
  }
})

watch(showMinimap, async (show) => {
  if (show && editorStore.graph) {
    await nextTick()
    setTimeout(() => {
      initMinimap()
    }, 100)
  } else {
    disposeMinimap()
  }
})

onUnmounted(() => {
  disposeMinimap()
})
</script>

<template>
  <div class="minimap-wrapper">
    <button
      class="minimap-toggle-btn"
      @click="toggleMinimap"
      :title="showMinimap ? '隐藏小地图' : '显示小地图'"
    >
      <MapPin v-if="showMinimap" class="w-4 h-4" />
      <Map v-else class="w-4 h-4" />
    </button>

    <div
      v-if="showMinimap"
      class="minimap-container"
    >
      <div class="minimap-header">
        <Map class="w-3 h-3" />
        <span>小地图导航</span>
      </div>
      <div ref="minimapContainer" class="minimap-canvas-wrapper"></div>
    </div>
  </div>
</template>

<style scoped>
.minimap-wrapper {
  position: absolute;
  z-index: 100;
  right: 16px;
  bottom: 16px;
}

.minimap-toggle-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.minimap-toggle-btn:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border-color: var(--color-accent-sky);
}

.minimap-container {
  position: absolute;
  right: 0;
  bottom: 46px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.minimap-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: var(--color-bg-tertiary);
  border-bottom: 1px solid var(--color-border-primary);
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 500;
}

.minimap-canvas-wrapper {
  padding: 0;
}

.minimap-canvas-wrapper :deep(canvas) {
  display: block;
  cursor: crosshair;
}

.minimap-canvas-wrapper :deep(.x6-widget-minimap-viewport) {
  border: 2px dashed #38bdf8 !important;
  background-color: rgba(56, 189, 248, 0.1) !important;
}

.minimap-canvas-wrapper :deep(.x6-widget-minimap-viewport:hover) {
  background-color: rgba(56, 189, 248, 0.2) !important;
}
</style>
