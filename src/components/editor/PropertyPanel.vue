<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Cell } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import CanvasProperties from './properties/CanvasProperties.vue'
import NodeProperties from './properties/NodeProperties.vue'
import LayerPanel from './LayerPanel.vue'
import { PanelRightClose, PanelRight, Layers, Settings } from 'lucide-vue-next'

const editorStore = useEditorStore()
const activeCell = ref<Cell | null>(null)

const isCollapsed = computed(() => editorStore.isPropertyPanelCollapsed)

const activeTab = ref<'properties' | 'layers'>('properties')

const toggleCollapse = () => {
  editorStore.togglePropertyPanel()
}

watch(() => editorStore.graph, (graph, oldGraph, onCleanup) => {
  if (!graph) {
    activeCell.value = null
    return
  }

  const updateSelection = () => {
    try {
      const cells = graph.getSelectedCells()
      if (cells.length === 1) {
        activeCell.value = cells[0]!
        if (activeTab.value === 'layers') {
          activeTab.value = 'properties'
        }
      } else {
        activeCell.value = null
      }
    } catch (e) {
      console.error('选区更新崩溃:', e)
    }
  }

  graph.on('selection:changed', updateSelection)
  graph.on('node:resized', () => activeCell.value && syncDataFromCell(activeCell.value as Cell))
  graph.on('node:moved', () => activeCell.value && syncDataFromCell(activeCell.value as Cell))

  onCleanup(() => {
    graph.off('selection:changed', updateSelection)
    graph.off('node:resized')
    graph.off('node:moved')
  })
})

const syncDataFromCell = (cell: Cell) => {
  const data = cell.getData() as Record<string, unknown>
  const pos = cell.isNode() ? cell.getPosition() : { x: 0, y: 0 }
  const size = cell.isNode() ? cell.getSize() : { width: 0, height: 0 }

  formData.value = {
    ...formData.value,
    ...data,
    x: pos.x,
    y: pos.y,
    width: size.width,
    height: size.height,
    isLocked: !!(data.isLocked as boolean),
    isGroup: !!(data.isGroup as boolean),
    groupId: (data.groupId as string) || '',
    chartId: (data.chartId as string) || '',
    chartOption: (data.chartOption as Record<string, unknown>) || null,
    animationType: (data.animationType as string) || 'none',
    animationSpeed: (data.animationSpeed as number) || 1,
    animationColor: (data.animationColor as string) || '#38bdf8',
    animationDirection: (data.animationDirection as string) || 'normal',
    animationDuration: (data.animationDuration as number) || 2,
    animationDelay: (data.animationDelay as number) || 0,
    animationIteration: (data.animationIteration as string) || 'infinite',
    flowSpeed: (data.flowSpeed as number) || 1,
    flowReverse: (data.flowReverse as boolean) || false,
  }
}

const formData = ref({
  text: '',
  textColor: '#94a3b8',
  fontSize: 14,
  fill: '#1e293b',
  stroke: '#475569',
  rx: 8,
  width: 100,
  height: 60,
  x: 0,
  y: 0,
  isLocked: false,
  isGroup: false,
  groupId: '',
  chartId: '',
  chartOption: null as Record<string, unknown> | null,
  animationType: 'none',
  animationSpeed: 1,
  animationColor: '#38bdf8',
  animationDirection: 'normal',
  animationDuration: 2,
  animationDelay: 0,
  animationIteration: 'infinite',
  flowSpeed: 1,
  flowReverse: false,
})

const defaultFormData = { ...formData.value }

function handleUpdate(key: string, value: unknown) {
  if (!activeCell.value) return
  const cell = activeCell.value

  // @ts-expect-error dynamic key assignment
  formData.value[key] = value

  try {
    switch (key) {
      case 'text':
        cell.attr('text/text', value as string)
        if (cell.isEdge()) {
          const labels = cell.getLabels()
          if (labels.length > 0) cell.setLabelAt(0, { attrs: { text: { text: value as string } } })
          else cell.appendLabel({ attrs: { text: { text: value as string } } })
        }
        break
      case 'textColor': cell.attr('text/fill', value as string); break
      case 'fontSize': cell.attr('text/fontSize', value as number); break
      case 'fill': if (cell.isNode()) cell.attr('body/fill', value as string); break
      case 'stroke':
        if (cell.isNode()) cell.attr('body/stroke', value as string)
        if (cell.isEdge()) cell.attr('line/stroke', value as string)
        break
      case 'rx': if (cell.isNode()) { cell.attr('body/rx', value as number); cell.attr('body/ry', value as number); } break
      case 'width':
      case 'height':
        if (cell.isNode()) {
          const size = cell.getSize()
          cell.resize(key === 'width' ? (value as number) : size.width, key === 'height' ? (value as number) : size.height)
        }
        break
      case 'x':
      case 'y':
        if (cell.isNode()) {
          const pos = cell.getPosition()
          cell.position(key === 'x' ? (value as number) : pos.x, key === 'y' ? (value as number) : pos.y)
        }
        break
      default:
        cell.setData({ [key]: value }, { overwrite: false })
        if (cell.shape === 'fluid-pipe' && (key === 'flowSpeed' || key === 'flowReverse')) {
          const speed = key === 'flowSpeed' ? (value as number) : formData.value.flowSpeed
          const reverse = key === 'flowReverse' ? (value as boolean) : formData.value.flowReverse
          cell.attr('fluid/style/animation', speed > 0 ? `dash-flow ${speed}s linear infinite ${reverse ? 'reverse' : 'normal'}` : 'none')
        }
        if (cell.shape === 'image' && key === 'imageUrl') {
          cell.attr('image/xlink:href', value as string)
        }
        break
    }
  } catch (e) {
    console.error('更新属性崩溃:', e)
  }
}

function handleUpdateAnimation(key: string, value: unknown) {
  if (!activeCell.value) return
  const cell = activeCell.value

  // @ts-expect-error dynamic key assignment
  formData.value[key] = value

  const duration = formData.value.animationDuration
  const delay = formData.value.animationDelay
  const iteration = formData.value.animationIteration
  const direction = formData.value.animationDirection

  cell.setData({
    animationType: formData.value.animationType,
    animationSpeed: formData.value.animationSpeed,
    animationColor: formData.value.animationColor,
    animationDirection: direction,
    animationDuration: duration,
    animationDelay: delay,
    animationIteration: iteration,
  }, { overwrite: false })

  if (formData.value.animationType === 'none') {
    cell.attr('body/style/animation', 'none')
  } else {
    // 注册动画
    const animType = formData.value.animationType as string

    // 确保动画已注册
    let style = document.getElementById(`anim-style-${animType}`)
    if (!style) {
      // 动态创建动画关键帧
      style = document.createElement('style')
      style.id = `anim-style-${animType}`
      document.head.appendChild(style)
    }

    const iterations = iteration === 'infinite' ? 'infinite' : iteration
    cell.attr('body/style/animation', `node-anim-${animType} ${duration}s ease ${delay}s ${iterations} ${direction} both`)
  }
}

function updateChartOption(path: string, value: unknown) {
  if (!activeCell.value || activeCell.value.shape !== 'chart-node') return

  const keys = path.split('.')
  const newOption = JSON.parse(JSON.stringify(formData.value.chartOption || {}))

  let current: Record<string, unknown> = newOption
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!
    if (!current[key]) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }
  const lastKey = keys[keys.length - 1]!
  current[lastKey] = value

  formData.value.chartOption = newOption
  activeCell.value.setData({ chartOption: newOption }, { overwrite: false })
}

function refreshChart() {
  if (!activeCell.value || activeCell.value.shape !== 'chart-node') return

  const option = formData.value.chartOption
  if (option) {
    activeCell.value.setData({ chartOption: JSON.parse(JSON.stringify(option)) }, { overwrite: false })
  }
}

function handleResetToDefault() {
  if (!activeCell.value) return

  const cell = activeCell.value
  const pos = cell.isNode() ? cell.getPosition() : { x: 0, y: 0 }
  const size = cell.isNode() ? cell.getSize() : { width: 0, height: 0 }

  formData.value = {
    ...defaultFormData,
    x: pos.x,
    y: pos.y,
    width: size.width,
    height: size.height,
  }

  cell.attr('text/text', '')
  cell.attr('text/fill', '#94a3b8')
  cell.attr('text/fontSize', 14)
  if (cell.isNode()) {
    cell.attr('body/fill', '#1e293b')
    cell.attr('body/stroke', '#475569')
    cell.attr('body/rx', 8)
  }
}
</script>

<template>
  <div
    class="property-panel flex flex-col transition-all duration-300 ease-in-out"
    :style="{ width: isCollapsed ? '24px' : '300px' }"
  >
    <!-- 折叠状态 -->
    <div v-if="isCollapsed" class="flex-1 flex items-center justify-center">
      <button @click="toggleCollapse"
        class="p-1.5 rounded-md hover:bg-[var(--color-bg-tertiary)] transition-colors"
        title="展开属性面板">
        <PanelRight class="w-4 h-4" style="color: var(--color-text-muted);" />
      </button>
    </div>

    <!-- 展开状态 -->
    <template v-else>
      <!-- 标签页切换 -->
      <div class="flex items-center gap-1 px-3 py-2 border-b border-[var(--color-border-primary)]">
        <button
          @click="activeTab = 'properties'"
          :class="[
            'px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5',
            activeTab === 'properties'
              ? 'bg-[var(--color-accent-sky)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          ]"
        >
          <Settings class="w-3.5 h-3.5" />
          属性
        </button>
        <button
          @click="activeTab = 'layers'"
          :class="[
            'px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5',
            activeTab === 'layers'
              ? 'bg-[var(--color-accent-sky)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          ]"
        >
          <Layers class="w-3.5 h-3.5" />
          图层
        </button>
        <button @click="toggleCollapse"
          class="ml-auto p-1.5 rounded-md hover:bg-[var(--color-bg-tertiary)] transition-colors"
          title="折叠属性面板">
          <PanelRightClose class="w-4 h-4" style="color: var(--color-text-muted);" />
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-hidden relative">
        <Transition name="fade-slide" mode="out-in">
          <template v-if="activeTab === 'properties'">
            <NodeProperties v-if="activeCell" :cell="activeCell" />
            <CanvasProperties v-else />
          </template>
          <LayerPanel v-else />
        </Transition>
      </div>
    </template>
  </div>
</template>

<style scoped>
.property-panel {
  background-color: var(--color-bg-secondary);
  border-left: 1px solid var(--color-border-primary);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
