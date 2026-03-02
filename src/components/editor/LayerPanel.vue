<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Cell, Node } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  GripVertical,
  Square,
  Circle,
  Triangle,
  Type,
  Image as ImageIcon,
  Minus,
  Database,
  Server,
  Cpu,
  Cloud,
  Monitor,
  HardDrive,
  Wifi,
  Activity,
  Terminal,
  Shield,
  AlignLeft,
  Hash,
  MoveHorizontal,
  Layers,
  Component
} from 'lucide-vue-next'

interface LayerItem {
  id: string
  cell: Cell | any
  shape: string
  label: string
  visible: boolean
  locked: boolean
  isNode: boolean
  zIndex: number
}

const editorStore = useEditorStore()
const layers = ref<LayerItem[]>([])
const selectedCellId = ref<string | null>(null)
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const shapeIconMap: Record<string, any> = {
  'rect': Square,
  'circle': Circle,
  'triangle': Triangle,
  'polygon': Triangle,
  'path': MoveHorizontal,
  'text': Type,
  'image': ImageIcon,
  'icon-node': Component,
  'progress-node': AlignLeft,
  'digital-node': Hash,
  'cooling-fan': Cpu,
  'storage-tank': Database,
}

const iconNameMap: Record<string, any> = {
  'Database': Database,
  'Server': Server,
  'Cpu': Cpu,
  'Cloud': Cloud,
  'Monitor': Monitor,
  'HardDrive': HardDrive,
  'Wifi': Wifi,
  'Activity': Activity,
  'Terminal': Terminal,
  'Shield': Shield,
}

const getLayerLabel = (cell: Cell): string => {
  if (cell.isNode()) {
    const node = cell as Node
    const data = node.getData() || {}
    
    if (data.label) return data.label
    if (data.iconName) return data.iconName
    if (node.shape === 'icon-node' && data.iconName) {
      return data.iconName
    }
    
    const shapeLabels: Record<string, string> = {
      'rect': '矩形',
      'circle': '圆形',
      'triangle': '三角形',
      'polygon': '多边形',
      'path': '路径',
      'text': '文本',
      'image': '图片',
      'icon-node': '图标',
      'progress-node': '进度条',
      'digital-node': '数字看板',
      'cooling-fan': '冷却风扇',
      'storage-tank': '储罐',
    }
    
    return shapeLabels[node.shape] || '图元'
  } else {
    return '连线'
  }
}

const getLayerIcon = (cell: Cell): any => {
  if (cell.isNode()) {
    const node = cell as Node
    const data = node.getData() || {}
    
    if (node.shape === 'icon-node' && data.iconName) {
      return iconNameMap[data.iconName] || Component
    }
    
    return shapeIconMap[node.shape] || Square
  }
  return Minus
}

const getLayerColor = (cell: Cell): string => {
  if (cell.isNode()) {
    const node = cell as Node
    const data = node.getData() || {}
    
    if (data.color) return data.color
    if (data.progressColor) return data.progressColor
    if (data.textColor) return data.textColor
    
    const attrs = node.getAttrs()
    if (attrs?.body?.stroke) return attrs.body.stroke as string
  }
  return '#64748b'
}

const isNodeLocked = (node: Node): boolean => {
  const data = node.getData() || {}
  return !!data.isLocked
}

const buildLayers = (): LayerItem[] => {
  const graph = editorStore.graph
  if (!graph) return []
  
  const cells = graph.getCells()
  
  return cells
    .filter(cell => !cell.isEdge())
    .map(cell => {
      const isNodeCell = cell.isNode()
      const node = isNodeCell ? (cell as Node) : null
      
      return {
        id: cell.id,
        cell,
        shape: isNodeCell ? (cell as Node).shape : 'edge',
        label: getLayerLabel(cell),
        visible: cell.isVisible(),
        locked: node ? isNodeLocked(node) : false,
        isNode: isNodeCell,
        zIndex: cell.getZIndex() || 0
      }
    })
    .sort((a, b) => b.zIndex - a.zIndex)
}

const updateLayers = () => {
  layers.value = buildLayers()
}

const handleCellAdded = () => {
  updateLayers()
}

const handleCellRemoved = () => {
  updateLayers()
}

const handleSelectionChanged = () => {
  const graph = editorStore.graph
  if (!graph) return
  
  const cells = graph.getSelectedCells()
  if (cells.length === 1 && cells[0]) {
    selectedCellId.value = cells[0].id
  } else {
    selectedCellId.value = null
  }
}

const selectLayer = (layer: LayerItem) => {
  const graph = editorStore.graph
  if (!graph) return
  
  graph.resetSelection()
  graph.select(layer.cell)
  selectedCellId.value = layer.id
}

const toggleVisibility = (layer: LayerItem, event: MouseEvent) => {
  event.stopPropagation()
  
  const newVisible = !layer.visible
  layer.cell.setVisible(newVisible)
  layer.visible = newVisible
  
  if (!newVisible) {
    layer.cell.setAttrs({
      body: { opacity: 0.3 }
    })
  } else {
    layer.cell.setAttrs({
      body: { opacity: 1 }
    })
  }
}

const toggleLock = (layer: LayerItem, event: MouseEvent) => {
  event.stopPropagation()
  
  if (!layer.isNode) return
  
  const node = layer.cell as Node
  const newLocked = !layer.locked
  
  const currentData = node.getData() || {}
  
  if (newLocked) {
    node.setData({ ...currentData, isLocked: true }, { overwrite: false })
    node.attr('body/strokeDasharray', '5,5')
  } else {
    const updatedData = { ...currentData }
    delete updatedData.isLocked
    node.setData(updatedData, { overwrite: true })
    node.attr('body/strokeDasharray', null)
  }
  
  layer.locked = newLocked
}

const handleDragStart = (event: DragEvent, index: number) => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverIndex.value = index
}

const handleDragLeave = () => {
  dragOverIndex.value = null
}

const handleDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()
  
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    draggedIndex.value = null
    dragOverIndex.value = null
    return
  }
  
  const graph = editorStore.graph
  if (!graph) return
  
  const draggedLayer = layers.value[draggedIndex.value]
  if (!draggedLayer) {
    draggedIndex.value = null
    dragOverIndex.value = null
    return
  }
  
  const sortedLayers = [...layers.value]
  const [removed] = sortedLayers.splice(draggedIndex.value, 1)
  if (!removed) {
    draggedIndex.value = null
    dragOverIndex.value = null
    return
  }
  
  sortedLayers.splice(dropIndex, 0, removed)
  
  sortedLayers.forEach((layer, idx) => {
    const zIndex = sortedLayers.length - idx
    layer.cell.setZIndex(zIndex)
  })
  
  updateLayers()
  
  draggedIndex.value = null
  dragOverIndex.value = null
}

const handleDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

watch(() => editorStore.graph, (graph, oldGraph, onCleanup) => {
  if (!graph) {
    layers.value = []
    return
  }
  
  updateLayers()
  
  graph.on('cell:added', handleCellAdded)
  graph.on('cell:removed', handleCellRemoved)
  graph.on('selection:changed', handleSelectionChanged)
  graph.on('cell:change:zIndex', updateLayers)
  
  onCleanup(() => {
    if (graph && !graph.disposed) {
      graph.off('cell:added', handleCellAdded)
      graph.off('cell:removed', handleCellRemoved)
      graph.off('selection:changed', handleSelectionChanged)
      graph.off('cell:change:zIndex', updateLayers)
    }
  })
}, { immediate: true })

const emptyLayers = computed(() => layers.value.length === 0)
</script>

<template>
  <div class="h-full bg-slate-950 flex flex-col overflow-hidden">
    <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-1 h-3 bg-purple-500 rounded-full"></div>
        <h3 class="text-xs font-bold text-slate-200 tracking-widest uppercase">
          图层管理
        </h3>
      </div>
      <div class="text-[10px] text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
        {{ layers.length }} 个图元
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <div v-if="emptyLayers" class="flex flex-col items-center justify-center h-full text-slate-500 p-6">
        <Layers class="w-12 h-12 mb-3 opacity-30" />
        <p class="text-xs text-center">暂无图层</p>
        <p class="text-[10px] text-slate-600 mt-1">从左侧拖拽图元到画布</p>
      </div>
      
      <div v-else class="p-2 space-y-1">
        <div
          v-for="(layer, index) in layers"
          :key="layer.id"
          class="group relative flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-all duration-150"
          :class="[
            selectedCellId === layer.id
              ? 'bg-sky-500/20 border border-sky-500/40'
              : 'bg-slate-900/50 border border-transparent hover:bg-slate-800/50 hover:border-slate-700/50',
            dragOverIndex === index && draggedIndex !== index ? 'border-t-2 border-t-purple-500' : ''
          ]"
          draggable="true"
          @click="selectLayer(layer)"
          @dragstart="handleDragStart($event, index)"
          @dragover="handleDragOver($event, index)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, index)"
          @dragend="handleDragEnd"
        >
          <div class="flex-shrink-0 cursor-grab opacity-30 hover:opacity-70 transition-opacity">
            <GripVertical class="w-3 h-3 text-slate-400" />
          </div>
          
          <div 
            class="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
            :style="{ backgroundColor: getLayerColor(layer.cell) + '20' }"
          >
            <component 
              :is="getLayerIcon(layer.cell)" 
              class="w-3.5 h-3.5"
              :style="{ color: getLayerColor(layer.cell) }"
            />
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="text-xs text-slate-200 truncate font-medium">
              {{ layer.label }}
            </div>
            <div class="text-[10px] text-slate-500 font-mono truncate">
              {{ layer.shape }}
            </div>
          </div>
          
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="toggleVisibility(layer, $event)"
              class="p-1 rounded hover:bg-slate-700/50 transition-colors"
              :title="layer.visible ? '隐藏图层' : '显示图层'"
            >
              <Eye v-if="layer.visible" class="w-3.5 h-3.5 text-slate-400" />
              <EyeOff v-else class="w-3.5 h-3.5 text-slate-500" />
            </button>
            
            <button
              v-if="layer.isNode"
              @click="toggleLock(layer, $event)"
              class="p-1 rounded hover:bg-slate-700/50 transition-colors"
              :title="layer.locked ? '解锁图层' : '锁定图层'"
            >
              <Lock v-if="layer.locked" class="w-3.5 h-3.5 text-amber-500" />
              <Unlock v-else class="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          
          <div 
            v-if="layer.locked && !layer.visible"
            class="absolute inset-0 bg-slate-900/30 rounded-md pointer-events-none"
          ></div>
        </div>
      </div>
    </div>
    
    <div v-if="!emptyLayers" class="p-3 border-t border-slate-800 bg-slate-950/30 shrink-0">
      <div class="text-[10px] text-slate-500 flex items-center gap-2">
        <GripVertical class="w-3 h-3" />
        <span>拖拽图层调整层级顺序</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
