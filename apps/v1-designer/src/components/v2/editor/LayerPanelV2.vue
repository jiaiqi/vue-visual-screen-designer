<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Cell, Node } from '@antv/x6'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import {
  Eye, EyeOff, Lock, Unlock, GripVertical,
  Square, Minus, Layers, Component,
  Image as ImageIcon, Activity, Database, Cpu,
  AlignLeft, Hash, MoveHorizontal, Type
} from 'lucide-vue-next'

interface LayerItem {
  id: string
  cell: Cell
  shape: string
  label: string
  visible: boolean
  locked: boolean
  isNode: boolean
  zIndex: number
}

const editorStore = useEditorStoreV2()
const layers = ref<LayerItem[]>([])
const selectedCellId = ref<string | null>(null)
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const shapeIconMap: Record<string, any> = {
  'rect': Square, 'circle': Component, 'path': MoveHorizontal,
  'text': Type, 'image': ImageIcon, 'icon-node': Component,
  'progress-node': AlignLeft, 'digital-node': Hash,
  'cooling-fan': Cpu, 'storage-tank': Database,
  'chart-node': Activity,
}

const getLayerLabel = (cell: Cell): string => {
  if (cell.isNode()) {
    const node = cell as Node
    const data = node.getData() || {}
    if (data.label) return data.label as string
    if (data.iconName) return data.iconName as string
    const labels: Record<string, string> = {
      'rect': '矩形', 'circle': '圆形', 'text': '文本',
      'image': '图片', 'icon-node': '图标',
      'progress-node': '进度条', 'digital-node': '数字看板',
      'chart-node': '图表', 'table-basic': '表格',
      'list-rank': '排行榜', 'countdown': '倒计时',
    }
    return labels[node.shape] || '图元'
  }
  return '连线'
}

const getIcon = (cell: Cell) => {
  if (!cell.isNode()) return Minus
  return shapeIconMap[(cell as Node).shape] || Square
}

const getColor = (cell: Cell): string => {
  if (cell.isNode()) {
    const data = (cell as Node).getData() || {}
    if (data.color) return data.color as string
    const attrs = (cell as Node).getAttrs()
    if (attrs?.body?.stroke) return attrs.body.stroke as string
  }
  return '#64748b'
}

const buildLayers = (): LayerItem[] => {
  const graph = editorStore.graph
  if (!graph) return []
  return graph.getCells()
    .filter(c => !c.isEdge())
    .map(cell => ({
      id: cell.id,
      cell,
      shape: cell.isNode() ? (cell as Node).shape : 'edge',
      label: getLayerLabel(cell),
      visible: cell.isVisible(),
      locked: !!(cell.isNode() && (cell as Node).getData()?.isLocked),
      isNode: cell.isNode(),
      zIndex: cell.getZIndex() || 0,
    }))
    .sort((a, b) => b.zIndex - a.zIndex)
}

const updateLayers = () => { layers.value = buildLayers() }

watch(() => editorStore.graph, (graph, _, onCleanup) => {
  if (!graph) { layers.value = []; return }
  updateLayers()
  graph.on('cell:added', updateLayers)
  graph.on('cell:removed', updateLayers)
  graph.on('cell:change:zIndex', updateLayers)
  graph.on('selection:changed', () => {
    const cells = graph.getSelectedCells()
    selectedCellId.value = cells.length === 1 ? cells[0]!.id : null
  })
  onCleanup(() => {
    if (!graph.disposed) {
      graph.off('cell:added', updateLayers)
      graph.off('cell:removed', updateLayers)
      graph.off('cell:change:zIndex', updateLayers)
    }
  })
}, { immediate: true })

const selectLayer = (layer: LayerItem) => {
  editorStore.graph?.resetSelection()
  editorStore.graph?.select(layer.cell)
  selectedCellId.value = layer.id
}

const toggleVisibility = (layer: LayerItem, e: MouseEvent) => {
  e.stopPropagation()
  layer.cell.setVisible(!layer.visible)
  layer.visible = !layer.visible
}

const toggleLock = (layer: LayerItem, e: MouseEvent) => {
  e.stopPropagation()
  if (!layer.isNode) return
  const node = layer.cell as Node
  const data = node.getData() || {}
  const newLocked = !layer.locked
  node.setData({ ...data, isLocked: newLocked }, { overwrite: false })
  layer.locked = newLocked
}

// 拖拽排序
const handleDragStart = (e: DragEvent, idx: number) => {
  draggedIndex.value = idx
  e.dataTransfer && (e.dataTransfer.effectAllowed = 'move')
}
const handleDragOver = (e: DragEvent, idx: number) => {
  e.preventDefault(); dragOverIndex.value = idx
}
const handleDrop = (e: DragEvent, dropIdx: number) => {
  e.preventDefault()
  if (draggedIndex.value === null || draggedIndex.value === dropIdx) {
    draggedIndex.value = null
    dragOverIndex.value = null
    return
  }
  const sorted = [...layers.value]
  const item = sorted.splice(draggedIndex.value, 1)[0]
  if (item) sorted.splice(dropIdx, 0, item)
  sorted.forEach((l, i) => l.cell.setZIndex(sorted.length - i))
  draggedIndex.value = null
  dragOverIndex.value = null
  updateLayers()
}
const handleDragEnd = () => { draggedIndex.value = dragOverIndex.value = null }

const isEmpty = computed(() => layers.value.length === 0)
</script>

<template>
  <div class="layer-panel-v2">
    <div class="panel-header">
      <div class="header-title">
        <div class="accent-bar" />
        <span>图层管理</span>
      </div>
      <span class="count-badge">{{ layers.length }}</span>
    </div>

    <div class="layer-list">
      <div v-if="isEmpty" class="empty-state">
        <Layers class="empty-icon" />
        <p>暂无图层</p>
        <span>从左侧拖拽图元到画布</span>
      </div>

      <div
        v-for="(layer, idx) in layers"
        :key="layer.id"
        class="layer-item"
        :class="{
          selected: selectedCellId === layer.id,
          'drag-over': dragOverIndex === idx && draggedIndex !== idx
        }"
        draggable="true"
        @click="selectLayer(layer)"
        @dragstart="handleDragStart($event, idx)"
        @dragover="handleDragOver($event, idx)"
        @dragleave="dragOverIndex = null"
        @drop="handleDrop($event, idx)"
        @dragend="handleDragEnd"
      >
        <GripVertical class="grip-icon" />
        <div class="item-icon" :style="{ background: getColor(layer.cell) + '20' }">
          <component :is="getIcon(layer.cell)" class="w-3.5 h-3.5" :style="{ color: getColor(layer.cell) }" />
        </div>
        <div class="item-info">
          <div class="item-label">{{ layer.label }}</div>
          <div class="item-shape">{{ layer.shape }}</div>
        </div>
        <div class="item-actions">
          <button @click="toggleVisibility(layer, $event)" :title="layer.visible ? '隐藏' : '显示'">
            <Eye v-if="layer.visible" class="w-3.5 h-3.5" />
            <EyeOff v-else class="w-3.5 h-3.5 opacity-50" />
          </button>
          <button v-if="layer.isNode" @click="toggleLock(layer, $event)" :title="layer.locked ? '解锁' : '锁定'">
            <Lock v-if="layer.locked" class="w-3.5 h-3.5 text-amber-500" />
            <Unlock v-else class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="!isEmpty" class="panel-footer">
      <GripVertical class="w-3 h-3 opacity-40" />
      <span>拖拽调整层级顺序</span>
    </div>
  </div>
</template>

<style scoped>
.layer-panel-v2 {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(2, 6, 23, 0.5);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.4);
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.accent-bar {
  width: 3px;
  height: 12px;
  background: #a855f7;
  border-radius: 2px;
}

.count-badge {
  font-size: 10px;
  color: #64748b;
  background: rgba(51, 65, 85, 0.5);
  padding: 2px 7px;
  border-radius: 4px;
  font-family: monospace;
}

.layer-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.layer-list::-webkit-scrollbar { width: 4px; }
.layer-list::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #475569;
  gap: 6px;
}
.empty-icon { width: 40px; height: 40px; opacity: 0.3; }
.empty-state p { font-size: 12px; }
.empty-state span { font-size: 10px; color: #334155; }

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  margin-bottom: 2px;
}

.layer-item:hover { background: rgba(51, 65, 85, 0.4); }
.layer-item.selected { background: rgba(14, 165, 233, 0.12); border-color: rgba(14, 165, 233, 0.3); }
.layer-item.drag-over { border-top: 2px solid #a855f7; }

.grip-icon { width: 12px; height: 12px; color: #475569; flex-shrink: 0; cursor: grab; }

.item-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-info { flex: 1; min-width: 0; }
.item-label { font-size: 12px; color: #e2e8f0; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-shape { font-size: 10px; color: #475569; font-family: monospace; }

.item-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.layer-item:hover .item-actions { opacity: 1; }

.item-actions button {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px; border: none; cursor: pointer;
  color: #64748b; background: transparent; transition: all 0.15s;
}
.item-actions button:hover { background: rgba(51, 65, 85, 0.5); color: #94a3b8; }

.panel-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-top: 1px solid rgba(51, 65, 85, 0.4);
  font-size: 10px;
  color: #475569;
  flex-shrink: 0;
}
</style>
