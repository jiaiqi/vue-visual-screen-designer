<script setup lang="ts">
/**
 * v2 属性面板：直接复用 v1 的 PropertyPanel 组件体系
 * 差异仅在于 LayerPanelV2 中使用 editorStoreV2
 */
import { ref, watch, computed } from 'vue'
import { Cell } from '@antv/x6'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import CanvasProperties from './properties/CanvasPropertiesV2.vue'
import NodeProperties from './properties/NodePropertiesV2.vue'
import EdgePropertiesV2 from './properties/EdgePropertiesV2.vue'
import LayerPanelV2 from './LayerPanelV2.vue'
import { PanelRightClose, PanelRight, Layers, Settings } from 'lucide-vue-next'

const editorStore = useEditorStoreV2()
const canvasStore = useCanvasStoreV2()

// 当前选中的 Cell（用于决定显示节点属性还是画布属性）
const activeCell = ref<Cell | null>(null)
const activeTab = ref<'properties' | 'layers'>('properties')

const isCollapsed = computed(() => editorStore.isPropertyPanelCollapsed)

watch(() => editorStore.graph, (graph, _, onCleanup) => {
  if (!graph) {
    activeCell.value = null
    return
  }

  const updateSelection = () => {
    const cells = graph.getSelectedCells()
    activeCell.value = cells.length === 1 ? (cells[0] ?? null) : null
    if (activeCell.value) {
      activeTab.value = 'properties'
    }
  }

  // 初始化或由于 graph 切换需要同步一次
  updateSelection()

  graph.on('selection:changed', updateSelection)
  onCleanup(() => {
    graph.off('selection:changed', updateSelection)
  })
}, { immediate: true })

// 使 CanvasProperties 适配 canvasStoreV2 的接口
// 通过注入 provide 方式或直接传 props
void canvasStore
</script>

<template>
  <div class="property-panel-v2" :style="{ width: isCollapsed ? '24px' : '300px' }">
    <!-- 折叠状态 -->
    <div v-if="isCollapsed" class="collapse-trigger">
      <button @click="editorStore.togglePropertyPanel()" title="展开属性面板">
        <PanelRight class="w-4 h-4" />
      </button>
    </div>

    <!-- 展开状态 -->
    <template v-else>
      <!-- Tab 切换 -->
      <div class="panel-tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'properties' }" @click="activeTab = 'properties'">
          <Settings class="w-3.5 h-3.5" />
          属性
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'layers' }" @click="activeTab = 'layers'">
          <Layers class="w-3.5 h-3.5" />
          图层
        </button>
        <button class="collapse-btn" @click="editorStore.togglePropertyPanel()" title="折叠">
          <PanelRightClose class="w-4 h-4" />
        </button>
      </div>

      <!-- 内容区 -->
      <div class="panel-content">
        <template v-if="activeTab === 'properties'">
          <NodeProperties v-if="activeCell && activeCell.isNode()" :cell="activeCell" />
          <EdgePropertiesV2 v-else-if="activeCell && activeCell.isEdge()" :edge="activeCell" />
          <CanvasProperties v-else />
        </template>
        <LayerPanelV2 v-else />
      </div>
    </template>
  </div>
</template>

<style scoped>
.property-panel-v2 {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(2, 6, 23, 0.7);
  /* 半透明呈现毛玻璃 */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-left: 1px solid var(--color-border-secondary);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.2);
}

.collapse-trigger {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-trigger button {
  padding: 8px;
  border-radius: 8px;
  color: var(--color-text-muted);
  cursor: pointer;
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapse-trigger button:hover {
  background: rgba(51, 65, 85, 0.6);
  border-color: rgba(71, 85, 105, 0.5);
  color: var(--color-text-primary);
  transform: scale(1.05);
  /* 添加微缩放动画 */
  box-shadow: 0 0 10px rgba(100, 116, 139, 0.2);
}

.panel-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border-primary);
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.4);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  background: transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-btn:hover {
  color: var(--color-text-secondary);
  background: rgba(51, 65, 85, 0.3);
}

.tab-btn.active {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
  color: var(--color-accent-emerald);
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.1);
}

.collapse-btn {
  margin-left: auto;
  padding: 5px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: #475569;
  background: transparent;
  transition: all 0.15s;
}

.collapse-btn:hover {
  color: #94a3b8;
  background: rgba(51, 65, 85, 0.4);
}

.panel-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 全局接管内部所有 Naive UI 的输入框为等宽字体 (Fira Code) */
:deep(.n-input .n-input__input-el),
:deep(.n-input-number .n-input__input-el),
:deep(.n-base-selection-input) {
  font-family: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
}
</style>
