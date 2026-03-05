<script setup lang="ts">
/**
 * v2 属性面板：直接复用 v1 的 PropertyPanel 组件体系
 * 差异仅在于 LayerPanelV2 中使用 editorStoreV2
 */
import { ref, watch, computed } from 'vue'
import { Cell } from '@antv/x6'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import CanvasProperties from '../../../components/editor/properties/CanvasProperties.vue'
import NodeProperties from '../../../components/editor/properties/NodeProperties.vue'
import LayerPanelV2 from './LayerPanelV2.vue'
import { PanelRightClose, PanelRight, Layers, Settings } from 'lucide-vue-next'

const editorStore = useEditorStoreV2()
const canvasStore = useCanvasStoreV2()

// 当前选中的 Cell（用于决定显示节点属性还是画布属性）
const activeCell = ref<Cell | null>(null)
const activeTab = ref<'properties' | 'layers'>('properties')

const isCollapsed = computed(() => editorStore.isPropertyPanelCollapsed)

watch(() => editorStore.graph, (graph, _, onCleanup) => {
  if (!graph) { activeCell.value = null; return }

  const updateSelection = () => {
    const cells = graph.getSelectedCells()
    activeCell.value = cells.length === 1 ? (cells[0] ?? null) : null
    if (activeCell.value) activeTab.value = 'properties'
  }

  graph.on('selection:changed', updateSelection)
  onCleanup(() => graph.off('selection:changed', updateSelection))
})

// 使 CanvasProperties 适配 canvasStoreV2 的接口
// 通过注入 provide 方式或直接传 props
void canvasStore
</script>

<template>
  <div
    class="property-panel-v2"
    :style="{ width: isCollapsed ? '24px' : '300px' }"
  >
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
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'properties' }"
          @click="activeTab = 'properties'"
        >
          <Settings class="w-3.5 h-3.5" />
          属性
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'layers' }"
          @click="activeTab = 'layers'"
        >
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
          <NodeProperties v-if="activeCell" :cell="activeCell" />
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
  background: var(--color-bg-primary, #020617);
  border-left: 1px solid rgba(51, 65, 85, 0.5);
  transition: width 0.3s ease;
  flex-shrink: 0;
  overflow: hidden;
}

.collapse-trigger {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-trigger button {
  padding: 6px;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.15s;
}

.collapse-trigger button:hover {
  background: rgba(51, 65, 85, 0.4);
  color: #94a3b8;
}

.panel-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  flex-shrink: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: #64748b;
  background: transparent;
  transition: all 0.15s;
}

.tab-btn:hover {
  color: #94a3b8;
}

.tab-btn.active {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
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
</style>
