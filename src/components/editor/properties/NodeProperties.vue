<script setup lang="ts">
import { ref, watch, onUnmounted, markRaw } from 'vue'
import { Cell, Edge, Node } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import IconPickerDialog from '../IconPickerDialog.vue'
import {
  NForm, NFormItem, NInput, NInputNumber, NColorPicker,
  NSwitch, NSelect, NSlider, NDivider, NGrid, NGridItem,
  NButton, NTabs, NTabPane, NText, NIcon, NDynamicInput,
  NCollapse, NCollapseItem, NTooltip
} from 'naive-ui'
import {
  Type, Palette, Move, Image as ImageIcon, Layers,
  Play, Share2, Trash2, Plus, Eye, Lock, Unlock,
  RotateCcw, SlidersHorizontal
} from 'lucide-vue-next'

const editorStore = useEditorStore()
const activeCell = ref<Cell | null>(null)

const Icons = {
  Type: markRaw(Type),
  Palette: markRaw(Palette),
  Move: markRaw(Move),
  ImageIcon: markRaw(ImageIcon),
  Layers: markRaw(Layers),
  Play: markRaw(Play),
  Share2: markRaw(Share2),
  Trash2: markRaw(Trash2),
  Plus: markRaw(Plus),
  Eye: markRaw(Eye),
  Lock: markRaw(Lock),
  Unlock: markRaw(Unlock),
  RotateCcw: markRaw(RotateCcw),
  SlidersHorizontal: markRaw(SlidersHorizontal),
}

const presetColors = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#64748b',
]

const defaultFormData = {
  text: '',
  fill: '#1e293b',
  stroke: '#3b82f6',
  width: 120,
  height: 60,
  x: 0,
  y: 0,
  rx: 4,
  fontSize: 14,
  textColor: '#e2e8f0',
  edgeShape: 'edge',
  iconName: '',
  progressValue: 50,
  progressColor: '#3b82f6',
  progressBgColor: '#1e293b',
  showProgressText: true,
  numberValue: 0,
  numberFormat: 'none',
  decimalPlaces: 0,
  useGrouping: true,
  animateRoll: true,
  flowSpeed: 1,
  flowReverse: false,
  imageUrl: '',
  animationType: 'none',
  animationDuration: 1,
  animationReverse: false,
  entranceType: 'none',
  exitType: 'none',
  sourceMarker: false,
  targetMarker: false,
  states: [] as { value: string | number, url: string, label: string }[],
  currentStatus: '' as string | number,
  isLocked: false,
  isGroup: false,
  groupId: '',
  chartId: '',
  chartOption: null as Record<string, unknown> | null,
}

const formData = ref({
  id: '',
  text: '',
  fill: '#1e293b',
  stroke: '#3b82f6',
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  rx: 4,
  fontSize: 14,
  textColor: '#e2e8f0',
  edgeShape: 'edge',
  iconName: '',
  progressValue: 50,
  progressColor: '#3b82f6',
  progressBgColor: '#1e293b',
  showProgressText: true,
  numberValue: 0,
  numberFormat: 'none',
  decimalPlaces: 0,
  useGrouping: true,
  animateRoll: true,
  flowSpeed: 1,
  flowReverse: false,
  imageUrl: '',
  animationType: 'none',
  animationDuration: 1,
  animationReverse: false,
  entranceType: 'none',
  exitType: 'none',
  sourceMarker: false,
  targetMarker: false,
  states: [] as { value: string | number, url: string, label: string }[],
  currentStatus: '' as string | number,
  isLocked: false,
  isGroup: false,
  groupId: '',
  chartId: '',
  chartOption: null as Record<string, unknown> | null,
})

const showIconPicker = ref(false)

const sliderModes = ref<Record<string, boolean>>({
  width: false,
  height: false,
  fontSize: false,
  rx: false,
})

const getStoredCollapseNames = (): string[] => {
  try {
    const stored = localStorage.getItem('node-properties-collapse-state')
    return stored ? JSON.parse(stored) : ['basic', 'appearance', 'geometry']
  } catch {
    return ['basic', 'appearance', 'geometry']
  }
}

const collapseNames = ref<string[]>(getStoredCollapseNames())

watch(collapseNames, (val) => {
  localStorage.setItem('node-properties-collapse-state', JSON.stringify(val))
}, { deep: true })

watch(() => editorStore.graph, (graph) => {
  if (!graph) return

  const updateSelection = () => {
    try {
      const cells = graph.getSelectedCells()
      if (cells.length === 1) {
        const cell = cells[0]!
        activeCell.value = cell
        syncDataFromCell(cell)
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

  updateSelection()

  onUnmounted(() => {
    graph.off('selection:changed', updateSelection)
  })
}, { immediate: true })

function syncDataFromCell(cell: Cell) {
  try {
    if (cell.isNode()) {
      const size = cell.getSize()
      const pos = cell.getPosition()
      formData.value.width = size.width
      formData.value.height = size.height
      formData.value.x = pos.x
      formData.value.y = pos.y
    }

    formData.value.id = cell.id
    formData.value.text = (cell.attr('text/text') as string) || ''
    formData.value.textColor = (cell.attr('text/fill') as string) || '#e2e8f0'
    formData.value.fontSize = Number(cell.attr('text/fontSize') || 14)
    formData.value.fill = (cell.attr('body/fill') as string) || '#1e293b'
    formData.value.stroke = (cell.attr('body/stroke') as string) || '#3b82f6'
    formData.value.rx = Number(cell.attr('body/rx') || 0)

    const data = cell.getData() || {}
    formData.value.iconName = data.iconName || ''
    formData.value.imageUrl = cell.shape === 'image' ? (cell.attr('image/xlink:href') as string) || '' : ''

    if (cell.shape === 'progress-node') {
      formData.value.progressValue = typeof data.progressValue === 'number' ? data.progressValue : 50
      formData.value.progressColor = data.progressColor || '#3b82f6'
      formData.value.progressBgColor = data.progressBgColor || '#1e293b'
      formData.value.showProgressText = data.showProgressText !== false
    }

    if (cell.shape === 'digital-node') {
      formData.value.numberValue = typeof data.numberValue === 'number' ? data.numberValue : 0
      formData.value.numberFormat = data.numberFormat || 'none'
      formData.value.decimalPlaces = typeof data.decimalPlaces === 'number' ? data.decimalPlaces : 0
      formData.value.useGrouping = data.useGrouping !== false
      formData.value.animateRoll = data.animateRoll !== false
    }

    formData.value.animationType = data.animationType || 'none'
    formData.value.animationDuration = Number(data.animationDuration || 1)
    formData.value.animationReverse = !!data.animationReverse
    formData.value.entranceType = data.entranceType || 'none'
    formData.value.exitType = data.exitType || 'none'
    formData.value.states = Array.isArray(data.states) ? data.states : []
    formData.value.currentStatus = data.currentStatus ?? ''
    formData.value.isLocked = !!data.isLocked
    formData.value.isGroup = !!data.isGroup
    formData.value.groupId = data.groupId || ''

    if (cell.shape === 'chart-node') {
      formData.value.chartId = data.chartId || ''
      formData.value.chartOption = data.chartOption || null
    }

    if (cell.isEdge()) {
      formData.value.edgeShape = cell.shape
      formData.value.stroke = (cell.attr('line/stroke') as string) || '#3b82f6'
      formData.value.flowSpeed = data.flowSpeed || 1
      formData.value.flowReverse = !!data.flowReverse
      const attrs = (cell as Edge).attrs || {}
      formData.value.sourceMarker = !!attrs.line?.sourceMarker
      formData.value.targetMarker = !!attrs.line?.targetMarker
    }
  } catch (err) {
    console.error('数据同步崩溃:', err)
  }
}

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
      case 'edgeShape':
        if (cell.isEdge()) {
          const graph = editorStore.graph
          if (!graph) return
          const edge = cell as Edge
          const newEdge = graph.createEdge({
            shape: value,
            source: edge.getSource(),
            target: edge.getTarget(),
            vertices: edge.getVertices(),
            data: edge.getData(),
          })
          graph.addEdge(newEdge)
          graph.removeCell(edge)
          graph.select(newEdge)
        }
        break
      case 'sourceMarker':
      case 'targetMarker':
        if (cell.isEdge()) {
          const isSource = key === 'sourceMarker'
          cell.attr(`line/${isSource ? 'sourceMarker' : 'targetMarker'}`, value ? { name: 'classic', size: 8 } : null)
        }
        break
      case 'isLocked':
      if (cell.isNode()) {
        const node = cell as Node
        if (value) {
          node.setData({
            isLocked: true,
          }, { overwrite: false })
          node.attr('body/style/pointer-events', 'none')
          node.attr('body/strokeDasharray', '3,3')
          node.addTools([
            {
              name: 'button',
              args: {
                x: '100%',
                y: 0,
                offset: { x: -8, y: 8 },
                markup: [
                  {
                    tagName: 'circle',
                    selector: 'bg',
                    attrs: {
                      r: 8,
                      fill: '#1e293b',
                      stroke: '#f59e0b',
                      strokeWidth: 1,
                    },
                  },
                  {
                    tagName: 'text',
                    selector: 'icon',
                    textContent: '🔒',
                    attrs: {
                      'font-size': 10,
                      'text-anchor': 'middle',
                      'dominant-baseline': 'central',
                    },
                  },
                ],
              },
            },
          ])
        } else {
          const currentData = node.getData() || {}
          delete currentData.isLocked
          node.setData(currentData, { overwrite: true })
          node.attr('body/style/pointer-events', 'auto')
          node.attr('body/strokeDasharray', null)
          node.removeTools()
        }
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
    }
  } catch (err) {
    console.error('更新图元失败:', err)
  }
}

function handleResetToDefault() {
  if (!activeCell.value) return
  const cell = activeCell.value

  Object.entries(defaultFormData).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'states' && key !== 'isGroup' && key !== 'groupId') {
      handleUpdate(key, value)
    }
  })

  if (cell.isNode()) {
    cell.resize(defaultFormData.width, defaultFormData.height)
  }
}

function toggleSliderMode(key: string) {
  sliderModes.value[key] = !sliderModes.value[key]
}

const fileInputRef = ref<HTMLInputElement | null>(null)
function triggerImageUpload() { fileInputRef.value?.click() }
function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !activeCell.value) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const dataUrl = ev.target?.result as string
    if (dataUrl) handleUpdate('imageUrl', dataUrl)
  }
  reader.readAsDataURL(file)
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
</script>

<template>
  <div v-if="activeCell" class="node-properties h-full flex flex-col">
    <n-tabs type="line" justify-content="space-evenly" size="small" class="shrink-0 bg-slate-900 border-b border-slate-800">
      <n-tab-pane name="style" tab="基础样式">
        <div class="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          <n-form label-placement="top" size="small">
            <template v-if="activeCell">
              <div v-if="formData.isLocked" class="p-2 mb-4 bg-amber-500/10 border border-amber-500/30 rounded flex items-center gap-2">
                <n-icon :component="Icons.Lock" class="text-amber-500" />
                <span class="text-xs text-amber-400">图元已锁定</span>
              </div>
              <div v-if="formData.isGroup" class="p-2 mb-4 bg-sky-500/10 border border-sky-500/30 rounded flex items-center gap-2">
                <n-icon :component="Icons.Layers" class="text-sky-500" />
                <span class="text-xs text-sky-400">组合图元</span>
              </div>
              <div v-if="formData.groupId" class="p-2 mb-4 bg-slate-500/10 border border-slate-500/30 rounded flex items-center gap-2">
                <n-icon :component="Icons.Layers" class="text-slate-400" />
                <span class="text-xs text-slate-400">属于组合内图元</span>
              </div>

              <n-collapse v-model:expanded-names="collapseNames" class="custom-collapse">
                <n-collapse-item title="基础标识" name="basic">
                  <n-grid :cols="1" :y-gap="8">
                    <n-grid-item>
                      <n-form-item label="组件 ID">
                        <n-input :value="formData.id" readonly placeholder="自动生成" />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="显示文本">
                        <n-input :value="formData.text" @update:value="v => handleUpdate('text', v)" placeholder="输入文本" />
                      </n-form-item>
                    </n-grid-item>
                  </n-grid>

                  <n-grid :cols="2" :x-gap="12">
                    <n-grid-item>
                      <n-form-item label="字体大小">
                        <div class="flex items-center gap-2 w-full">
                          <n-input-number
                            v-if="!sliderModes.fontSize"
                            :value="formData.fontSize"
                            @update:value="v => handleUpdate('fontSize', v)"
                            :min="8"
                            :max="72"
                            :show-button="false"
                            class="flex-1"
                          />
                          <n-slider
                            v-else
                            :value="formData.fontSize"
                            @update:value="v => handleUpdate('fontSize', v)"
                            :min="8"
                            :max="72"
                            :step="1"
                            class="flex-1"
                          />
                          <n-tooltip trigger="hover">
                            <template #trigger>
                              <n-button
                                size="tiny"
                                quaternary
                                :type="sliderModes.fontSize ? 'primary' : 'default'"
                                @click="toggleSliderMode('fontSize')"
                              >
                                <template #icon>
                                  <n-icon :component="Icons.SlidersHorizontal" />
                                </template>
                              </n-button>
                            </template>
                            {{ sliderModes.fontSize ? '切换为输入框' : '切换为滑块' }}
                          </n-tooltip>
                        </div>
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="文字颜色">
                        <div class="w-full">
                          <n-color-picker :value="formData.textColor" @update:value="v => handleUpdate('textColor', v)" />
                          <div class="flex gap-1 mt-2 flex-wrap">
                            <div
                              v-for="color in presetColors"
                              :key="color"
                              class="preset-color-btn"
                              :style="{ backgroundColor: color }"
                              @click="handleUpdate('textColor', color)"
                            />
                          </div>
                        </div>
                      </n-form-item>
                    </n-grid-item>
                  </n-grid>

                  <template v-if="activeCell.shape === 'icon-node'">
                    <n-divider />
                    <div class="section-header">图标挑选</div>
                    <div class="flex items-center gap-2 mb-4">
                      <n-input :value="formData.iconName" @update:value="v => handleUpdate('iconName', v)" placeholder="Icon Name" />
                      <n-button size="small" type="primary" secondary @click="showIconPicker = true">
                        <template #icon><n-icon :component="Icons.ImageIcon" /></template>
                        挑选
                      </n-button>
                    </div>
                  </template>

                  <template v-if="activeCell.shape === 'image'">
                    <n-divider />
                    <div class="section-header">图像设置</div>
                    <n-form-item label="图片 URL">
                      <n-input :value="formData.imageUrl" @update:value="v => handleUpdate('imageUrl', v)" placeholder="https://..." />
                    </n-form-item>
                    <n-button block size="small" secondary @click="triggerImageUpload" class="mb-4">
                      上传本地图片...
                    </n-button>

                    <div class="section-header text-amber-500">多状态映射 (States)</div>
                    <div class="p-2 bg-slate-950/40 rounded border border-slate-800 border-dashed mb-4">
                       <n-text depth="3" style="font-size: 10px; display: block; margin-bottom: 8px;">状态预览模拟</n-text>
                       <n-select size="small" :value="formData.currentStatus" @update:value="v => handleUpdate('currentStatus', v)"
                         :options="[
                           { label: '默认状态', value: '' },
                           ...(Array.isArray(formData.states) ? formData.states : []).map(s => ({ label: s.label || String(s.value), value: s.value }))
                         ]"
                       />
                    </div>

                    <n-dynamic-input
                      v-model:value="formData.states"
                      @update:value="v => handleUpdate('states', v)"
                      :on-create="() => ({ value: '', label: '新状态', url: '' })"
                    >
                      <template #default="{ value }">
                        <div class="flex flex-col gap-2 w-full pr-2">
                           <div class="flex gap-2">
                              <n-input size="tiny" v-model:value="value.value" placeholder="值" style="flex: 1" />
                              <n-input size="tiny" v-model:value="value.label" placeholder="标签" style="flex: 1" />
                           </div>
                           <n-input size="tiny" v-model:value="value.url" placeholder="图片 URL" />
                        </div>
                      </template>
                    </n-dynamic-input>
                  </template>
                </n-collapse-item>

                <n-collapse-item title="外观详情" name="appearance">
                  <n-grid :cols="2" :x-gap="12">
                    <n-grid-item>
                      <n-form-item label="填充颜色">
                        <div class="w-full">
                          <n-color-picker :value="formData.fill" @update:value="v => handleUpdate('fill', v)" />
                          <div class="flex gap-1 mt-2 flex-wrap">
                            <div
                              v-for="color in presetColors"
                              :key="color"
                              class="preset-color-btn"
                              :style="{ backgroundColor: color }"
                              @click="handleUpdate('fill', color)"
                            />
                          </div>
                        </div>
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="描边颜色">
                        <div class="w-full">
                          <n-color-picker :value="formData.stroke" @update:value="v => handleUpdate('stroke', v)" />
                          <div class="flex gap-1 mt-2 flex-wrap">
                            <div
                              v-for="color in presetColors"
                              :key="color"
                              class="preset-color-btn"
                              :style="{ backgroundColor: color }"
                              @click="handleUpdate('stroke', color)"
                            />
                          </div>
                        </div>
                      </n-form-item>
                    </n-grid-item>
                  </n-grid>

                  <n-grid :cols="2" :x-gap="12" v-if="activeCell.isNode()">
                    <n-grid-item>
                      <n-form-item label="圆角 (rx)">
                        <div class="flex items-center gap-2 w-full">
                          <n-input-number
                            v-if="!sliderModes.rx"
                            :value="formData.rx"
                            @update:value="v => handleUpdate('rx', v)"
                            :min="0"
                            :max="100"
                            :show-button="false"
                            class="flex-1"
                          />
                          <n-slider
                            v-else
                            :value="formData.rx"
                            @update:value="v => handleUpdate('rx', v)"
                            :min="0"
                            :max="100"
                            :step="1"
                            class="flex-1"
                          />
                          <n-tooltip trigger="hover">
                            <template #trigger>
                              <n-button
                                size="tiny"
                                quaternary
                                :type="sliderModes.rx ? 'primary' : 'default'"
                                @click="toggleSliderMode('rx')"
                              >
                                <template #icon>
                                  <n-icon :component="Icons.SlidersHorizontal" />
                                </template>
                              </n-button>
                            </template>
                            {{ sliderModes.rx ? '切换为输入框' : '切换为滑块' }}
                          </n-tooltip>
                        </div>
                      </n-form-item>
                    </n-grid-item>
                  </n-grid>
                </n-collapse-item>

                <n-collapse-item title="几何位置" name="geometry">
                  <div v-if="activeCell.isNode() && !formData.isGroup" class="flex items-center justify-between mb-4 p-2 bg-slate-800/50 rounded">
                    <div class="flex items-center gap-2">
                      <n-icon :component="formData.isLocked ? Icons.Lock : Icons.Unlock" :class="formData.isLocked ? 'text-amber-500' : 'text-slate-400'" />
                      <span class="text-xs" :class="formData.isLocked ? 'text-amber-400' : 'text-slate-400'">
                        {{ formData.isLocked ? '已锁定' : '未锁定' }}
                      </span>
                    </div>
                    <n-switch :value="formData.isLocked" @update:value="v => handleUpdate('isLocked', v)" size="small">
                      <template #checked>
                        <n-icon :component="Icons.Lock" />
                      </template>
                      <template #unchecked>
                        <n-icon :component="Icons.Unlock" />
                      </template>
                    </n-switch>
                  </div>

                  <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="activeCell.isNode()">
                    <n-grid-item>
                      <n-form-item label="宽度 (W)">
                        <div class="flex items-center gap-2 w-full">
                          <n-input-number
                            v-if="!sliderModes.width"
                            :value="formData.width"
                            @update:value="v => handleUpdate('width', v)"
                            :min="10"
                            :max="1000"
                            :show-button="false"
                            :disabled="formData.isLocked"
                            class="flex-1"
                          />
                          <n-slider
                            v-else
                            :value="formData.width"
                            @update:value="v => handleUpdate('width', v)"
                            :min="10"
                            :max="500"
                            :step="1"
                            :disabled="formData.isLocked"
                            class="flex-1"
                          />
                          <n-tooltip trigger="hover">
                            <template #trigger>
                              <n-button
                                size="tiny"
                                quaternary
                                :type="sliderModes.width ? 'primary' : 'default'"
                                @click="toggleSliderMode('width')"
                                :disabled="formData.isLocked"
                              >
                                <template #icon>
                                  <n-icon :component="Icons.SlidersHorizontal" />
                                </template>
                              </n-button>
                            </template>
                            {{ sliderModes.width ? '切换为输入框' : '切换为滑块' }}
                          </n-tooltip>
                        </div>
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="高度 (H)">
                        <div class="flex items-center gap-2 w-full">
                          <n-input-number
                            v-if="!sliderModes.height"
                            :value="formData.height"
                            @update:value="v => handleUpdate('height', v)"
                            :min="10"
                            :max="1000"
                            :show-button="false"
                            :disabled="formData.isLocked"
                            class="flex-1"
                          />
                          <n-slider
                            v-else
                            :value="formData.height"
                            @update:value="v => handleUpdate('height', v)"
                            :min="10"
                            :max="500"
                            :step="1"
                            :disabled="formData.isLocked"
                            class="flex-1"
                          />
                          <n-tooltip trigger="hover">
                            <template #trigger>
                              <n-button
                                size="tiny"
                                quaternary
                                :type="sliderModes.height ? 'primary' : 'default'"
                                @click="toggleSliderMode('height')"
                                :disabled="formData.isLocked"
                              >
                                <template #icon>
                                  <n-icon :component="Icons.SlidersHorizontal" />
                                </template>
                              </n-button>
                            </template>
                            {{ sliderModes.height ? '切换为输入框' : '切换为滑块' }}
                          </n-tooltip>
                        </div>
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="X 坐标">
                        <n-input-number :value="formData.x" @update:value="v => handleUpdate('x', v)" :show-button="false" :disabled="formData.isLocked" />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="Y 坐标">
                        <n-input-number :value="formData.y" @update:value="v => handleUpdate('y', v)" :show-button="false" :disabled="formData.isLocked" />
                      </n-form-item>
                    </n-grid-item>
                  </n-grid>
                </n-collapse-item>
              </n-collapse>

              <!-- 图表属性编辑区域 -->
              <template v-if="activeCell.shape === 'chart-node'">
                <n-divider>图表配置</n-divider>
                <div class="p-3 bg-slate-800/50 rounded border border-slate-700">
                  <div class="text-xs text-slate-400 mb-2">图表类型: {{ formData.chartId || '未知' }}</div>
                  <n-form-item label="图表标题">
                    <n-input
                      :value="(formData.chartOption?.title as any)?.text || ''"
                      @update:value="v => updateChartOption('title.text', v)"
                      placeholder="输入图表标题"
                    />
                  </n-form-item>
                  <n-grid :cols="2" :x-gap="12">
                    <n-grid-item>
                      <n-form-item label="标题颜色">
                        <n-color-picker
                          :value="(formData.chartOption?.title as any)?.textStyle?.color || '#94a3b8'"
                          @update:value="v => updateChartOption('title.textStyle.color', v)"
                        />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="标题字号">
                        <n-input-number
                          :value="(formData.chartOption?.title as any)?.textStyle?.fontSize || 14"
                          @update:value="v => updateChartOption('title.textStyle.fontSize', v)"
                          :min="10" :max="24"
                        />
                      </n-form-item>
                    </n-grid-item>
                  </n-grid>
                  <n-button
                    block
                    secondary
                    type="primary"
                    class="mt-3"
                    @click="refreshChart"
                  >
                    刷新图表
                  </n-button>
                </div>
              </template>
            </template>
          </n-form>

          <div class="pt-4 border-t border-slate-800">
            <n-button
              block
              type="warning"
              secondary
              @click="handleResetToDefault"
              :disabled="formData.isLocked"
            >
              <template #icon>
                <n-icon :component="Icons.RotateCcw" />
              </template>
              重置为默认样式
            </n-button>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="action" tab="高级动作">
        <div class="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          <n-form label-placement="top" size="small">
             <div class="section-header">持续动画 (Loop)</div>
             <n-form-item label="动画模式">
               <n-select :value="formData.animationType" @update:value="v => handleUpdate('animationType', v)"
                 :options="[
                   { label: '无动画', value: 'none' },
                   { label: '呼吸', value: 'breath' },
                   { label: '闪烁', value: 'blink' },
                   { label: '移动', value: 'move' },
                   { label: '自旋', value: 'spin' },
                   { label: '浮动', value: 'float' },
                 ]"
               />
             </n-form-item>
             <n-form-item v-if="formData.animationType !== 'none'" label="单次时长 (秒)">
               <n-input-number :value="formData.animationDuration" @update:value="v => handleUpdate('animationDuration', v)" :min="0.1" :step="0.1" :show-button="false" />
             </n-form-item>

             <n-divider />

             <div class="section-header text-emerald-500">进场动画 (Entrance)</div>
             <n-grid :cols="4" :x-gap="8">
               <n-grid-item :span="3">
                 <n-form-item :show-label="false">
                   <n-select :value="formData.entranceType" @update:value="v => handleUpdate('entranceType', v)"
                     :options="[
                       { label: '无', value: 'none' },
                       { label: '渐入', value: 'fade-in' },
                       { label: '缩放进入', value: 'zoom-in' },
                       { label: '顶部飞入', value: 'fly-in-top' },
                       { label: '底部飞入', value: 'fly-in-bottom' },
                     ]"
                   />
                 </n-form-item>
               </n-grid-item>
               <n-grid-item>
                 <n-button block secondary type="success" @click="() => editorStore.graph?.trigger('node:play-entrance', { node: activeCell })">
                   <template #icon><n-icon :component="Icons.Play" /></template>
                 </n-button>
               </n-grid-item>
             </n-grid>

             <div class="section-header text-rose-500 mt-6">退出动画 (Exit)</div>
             <n-grid :cols="4" :x-gap="8">
               <n-grid-item :span="3">
                 <n-form-item :show-label="false">
                   <n-select :value="formData.exitType" @update:value="v => handleUpdate('exitType', v)"
                     :options="[
                       { label: '无', value: 'none' },
                       { label: '渐隐', value: 'fade-out' },
                       { label: '缩放退出', value: 'zoom-out' },
                     ]"
                   />
                 </n-form-item>
               </n-grid-item>
               <n-grid-item>
                 <n-button block secondary type="error" @click="() => editorStore.graph?.trigger('node:play-exit', { node: activeCell })">
                   <template #icon><n-icon :component="Icons.Play" /></template>
                 </n-button>
               </n-grid-item>
             </n-grid>

             <template v-if="activeCell?.isEdge()">
                <n-divider />
                <div class="section-header">流体控制</div>
                <n-form-item label="水流速率 (秒/周期)">
                  <n-input-number :value="formData.flowSpeed" @update:value="v => handleUpdate('flowSpeed', v)" :min="0" :step="0.1" :show-button="false" />
                </n-form-item>
                <div class="flex items-center justify-between mb-2">
                  <n-text depth="3" style="font-size: 12px">流向反转</n-text>
                  <n-switch :value="formData.flowReverse" @update:value="v => handleUpdate('flowReverse', v)" />
                </div>
             </template>
          </n-form>

          <div class="pt-4 border-t border-slate-800">
            <n-button
              block
              type="warning"
              secondary
              @click="handleResetToDefault"
            >
              <template #icon>
                <n-icon :component="Icons.RotateCcw" />
              </template>
              重置为默认样式
            </n-button>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>

    <IconPickerDialog v-model:show="showIconPicker" :current-icon="formData.iconName"
      @select="icon => handleUpdate('iconName', icon)" />

    <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handleImageUpload" />
  </div>
</template>

<style scoped>
.node-properties {
  height: 100%;
  background-color: #0f172a;
}

.section-header {
  font-size: 10px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #1e293b;
}

:deep(.n-form-item-label) {
  font-size: 10px !important;
  font-weight: 700;
  color: #94a3b8 !important;
  padding-bottom: 4px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}

.preset-color-btn {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.preset-color-btn:hover {
  transform: scale(1.15);
  border-color: #fff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.custom-collapse {
  background: transparent;
}

:deep(.n-collapse-item) {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

:deep(.n-collapse-item__header) {
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.n-collapse-item__header:hover) {
  background: rgba(71, 85, 105, 0.2);
}

:deep(.n-collapse-item__content-wrapper) {
  padding: 0 12px 12px;
}

:deep(.n-collapse-item__content-inner) {
  padding-top: 12px;
}

:deep(.n-collapse-item-arrow) {
  transition: transform 0.3s ease;
}

:deep(.n-slider) {
  --n-rail-color: #1e293b;
  --n-fill-color: #3b82f6;
}
</style>
