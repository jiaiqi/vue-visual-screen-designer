<script setup lang="ts">
/**
 * v2 节点属性面板
 * 适配 useEditorStoreV2 和 useCanvasStoreV2
 */
import { ref, watch, markRaw, computed } from 'vue'
import { Cell, Node } from '@antv/x6'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import IconPickerDialog from '../../../editor/IconPickerDialog.vue'
import PortConfigPanel from '../../../editor/properties/PortConfigPanel.vue'
import {
  NForm, NFormItem, NInput, NInputNumber, NColorPicker,
  NSwitch, NSelect, NSlider, NDivider, NGrid, NGridItem,
  NButton, NTabs, NTabPane, NText, NIcon, NDynamicInput,
  NCollapse, NCollapseItem, NTooltip
} from 'naive-ui'
import {
  Type, Palette, ImageIcon, Layers,
  Play, Share2, Trash2, Plus, Eye, Lock, Unlock,
  RotateCcw, SlidersHorizontal
} from 'lucide-vue-next'
import { formatValueWithUnit } from '@/utils/coordinate-transform'

const props = defineProps<{
  cell: Cell
}>()

const editorStore = useEditorStoreV2()
const canvasStore = useCanvasStoreV2()

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
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#64748b',
]

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
  imageUrl: '',
  animationType: 'none',
  animationDuration: 1,
  animationReverse: false,
  animationDirection: 'normal',
  animationDelay: 0,
  animationIteration: 'infinite',
  isLocked: false,
  chartId: '',
  chartOption: null as any,
  states: [] as any[],
  currentStatus: '' as string | number,
})

const sliderModes = ref<Record<string, boolean>>({
  width: false,
  height: false,
  fontSize: false,
  rx: false,
})

const canvasConfig = computed(() => canvasStore.config)
const unit = ref<'px' | 'percent'>('px')

const displayX = computed(() => formatValueWithUnit(formData.value.x, canvasConfig.value.width, unit.value))
const displayY = computed(() => formatValueWithUnit(formData.value.y, canvasConfig.value.height, unit.value))

function syncDataFromCell(cell: Cell) {
  if (!cell) return
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
  formData.value.animationDirection = data.animationDirection || 'normal'
  formData.value.animationDelay = Number(data.animationDelay || 0)
  formData.value.animationIteration = data.animationIteration || 'infinite'
  formData.value.isLocked = !!data.isLocked
  formData.value.states = Array.isArray(data.states) ? data.states : []
  formData.value.currentStatus = data.currentStatus ?? ''

  if (cell.shape === 'chart-node') {
    formData.value.chartId = data.chartId || ''
    formData.value.chartOption = data.chartOption || null
  }
}

watch(() => props.cell, (newCell) => {
  if (newCell) syncDataFromCell(newCell)
}, { immediate: true })

watch(() => props.cell, (cell, _, onCleanup) => {
  if (!cell) return
  const handleUpdate = () => syncDataFromCell(cell)
  cell.on('change:position', handleUpdate)
  cell.on('change:size', handleUpdate)
  cell.on('change:attrs', handleUpdate)
  cell.on('change:data', handleUpdate)
  onCleanup(() => {
    cell.off('change:position', handleUpdate)
    cell.off('change:size', handleUpdate)
    cell.off('change:attrs', handleUpdate)
    cell.off('change:data', handleUpdate)
  })
}, { immediate: true })

function handleUpdate(key: string, value: any) {
  if (!props.cell) return
  const cell = props.cell

  // @ts-ignore
  formData.value[key] = value

  switch (key) {
    case 'text': cell.attr('text/text', value); break
    case 'textColor': cell.attr('text/fill', value); break
    case 'fontSize': cell.attr('text/fontSize', value); break
    case 'fill': if (cell.isNode()) cell.attr('body/fill', value); break
    case 'stroke':
      if (cell.isNode()) cell.attr('body/stroke', value)
      break
    case 'rx': if (cell.isNode()) { cell.attr('body/rx', value); cell.attr('body/ry', value); } break
    case 'width':
    case 'height':
      if (cell.isNode()) {
        const size = cell.getSize()
        cell.resize(key === 'width' ? value : size.width, key === 'height' ? value : size.height)
      }
      break
    case 'x':
    case 'y':
      if (cell.isNode()) {
        const pos = cell.getPosition()
        cell.position(key === 'x' ? value : pos.x, key === 'y' ? value : pos.y)
      }
      break
    case 'isLocked':
      if (cell.isNode()) {
        cell.setData({ isLocked: value }, { overwrite: false })
      }
      break
    case 'imageUrl':
      if (cell.shape === 'image') cell.attr('image/xlink:href', value); break
    default:
      cell.setData({ [key]: value }, { overwrite: false })
  }
}

function updateChartOption(path: string, value: any) {
  if (!props.cell || props.cell.shape !== 'chart-node') return
  const keys = path.split('.')
  const newOption = JSON.parse(JSON.stringify(formData.value.chartOption || {}))
  let current = newOption
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!
    if (!current[key]) current[key] = {}
    current = current[key]
  }
  current[keys[keys.length - 1]!] = value
  formData.value.chartOption = newOption
  props.cell.setData({ chartOption: newOption }, { overwrite: false })
}

const showIconPicker = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerImageUpload() { fileInputRef.value?.click() }
function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !props.cell) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const dataUrl = ev.target?.result as string
    if (dataUrl) handleUpdate('imageUrl', dataUrl)
  }
  reader.readAsDataURL(file)
}

function toggleSliderMode(key: string) {
  sliderModes.value[key] = !sliderModes.value[key]
}
</script>

<template>
  <div v-if="cell" class="node-properties h-full flex flex-col">
    <n-tabs type="line" justify-content="space-evenly" size="small"
      class="shrink-0 bg-slate-900 border-b border-slate-800">
      <n-tab-pane name="style" tab="外观">
        <div class="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          <n-form label-placement="top" size="small">
            <n-collapse :default-expanded-names="['basic', 'appearance', 'geometry']" class="custom-collapse">
              <n-collapse-item title="基础标识" name="basic">
                <n-grid :cols="1" :y-gap="8">
                  <n-grid-item>
                    <n-form-item label="组件 ID">
                      <n-input :value="formData.id" readonly />
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
                      <div class="flex items-center gap-2">
                        <n-input-number v-if="!sliderModes.fontSize" :value="formData.fontSize"
                          @update:value="v => handleUpdate('fontSize', v)" :min="8" :max="72" :show-button="false"
                          class="flex-1" />
                        <n-slider v-else :value="formData.fontSize" @update:value="v => handleUpdate('fontSize', v)"
                          :min="8" :max="72" class="flex-1" />
                        <n-button size="tiny" quaternary @click="toggleSliderMode('fontSize')">
                          <template #icon><n-icon :component="Icons.SlidersHorizontal" /></template>
                        </n-button>
                      </div>
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="文字颜色">
                      <n-color-picker :value="formData.textColor" @update:value="v => handleUpdate('textColor', v)" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>

                <template v-if="cell.shape === 'icon-node'">
                  <n-divider />
                  <div class="section-header">图标挑选</div>
                  <div class="flex items-center gap-2">
                    <n-input :value="formData.iconName" readonly placeholder="未选择" />
                    <n-button size="small" secondary type="primary" @click="showIconPicker = true">挑选</n-button>
                  </div>
                </template>

                <template v-if="cell.shape === 'image'">
                  <n-divider />
                  <div class="section-header">图像设置</div>
                  <n-input :value="formData.imageUrl" @update:value="v => handleUpdate('imageUrl', v)"
                    placeholder="图片 URL" class="mb-2" />
                  <n-button block size="small" secondary @click="triggerImageUpload">上传本地图片</n-button>
                </template>
              </n-collapse-item>

              <n-collapse-item title="外观详情" name="appearance">
                <n-grid :cols="2" :x-gap="12">
                  <n-grid-item>
                    <n-form-item label="填充颜色">
                      <n-color-picker :value="formData.fill" @update:value="v => handleUpdate('fill', v)" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="描边颜色">
                      <n-color-picker :value="formData.stroke" @update:value="v => handleUpdate('stroke', v)" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
                <n-form-item label="圆角 (rx)">
                  <div class="flex items-center gap-2 w-full">
                    <n-slider :value="formData.rx" @update:value="v => handleUpdate('rx', v)" :min="0" :max="100"
                      class="flex-1" />
                    <n-input-number :value="formData.rx" @update:value="v => handleUpdate('rx', v)" :min="0" :max="100"
                      :show-button="false" size="tiny" style="width: 50px" />
                  </div>
                </n-form-item>
              </n-collapse-item>

              <n-collapse-item title="几何位置" name="geometry">
                <n-grid :cols="2" :x-gap="12" :y-gap="8">
                  <n-grid-item>
                    <n-form-item label="宽度 (W)">
                      <n-input-number :value="formData.width" @update:value="v => handleUpdate('width', v)" :min="10"
                        :show-button="false" class="w-full" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="高度 (H)">
                      <n-input-number :value="formData.height" @update:value="v => handleUpdate('height', v)" :min="10"
                        :show-button="false" class="w-full" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="X 坐标">
                      <n-input :value="displayX" readonly placeholder="px" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="Y 坐标">
                      <n-input :value="displayY" readonly placeholder="px" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
                <div class="flex items-center justify-between mt-4 p-2 bg-slate-800/50 rounded">
                  <div class="flex items-center gap-2">
                    <n-icon :component="formData.isLocked ? Icons.Lock : Icons.Unlock"
                      :class="formData.isLocked ? 'text-amber-500' : 'text-slate-400'" />
                    <span class="text-xs text-slate-400">{{ formData.isLocked ? '已锁定位置' : '未锁定位置' }}</span>
                  </div>
                  <n-switch :value="formData.isLocked" @update:value="v => handleUpdate('isLocked', v)" size="small" />
                </div>
              </n-collapse-item>

              <!-- 图表配置 -->
              <template v-if="cell.shape === 'chart-node'">
                <n-collapse-item title="图表配置" name="chart">
                  <n-form-item label="图表标题">
                    <n-input :value="formData.chartOption?.title?.text"
                      @update:value="v => updateChartOption('title.text', v)" />
                  </n-form-item>
                  <n-grid :cols="2" :x-gap="8">
                    <n-grid-item>
                      <n-form-item label="标题颜色">
                        <n-color-picker :value="formData.chartOption?.title?.textStyle?.color"
                          @update:value="v => updateChartOption('title.textStyle.color', v)" />
                      </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                      <n-form-item label="标题字号">
                        <n-input-number :value="formData.chartOption?.title?.textStyle?.fontSize || 14"
                          @update:value="v => updateChartOption('title.textStyle.fontSize', v)" :min="10" :max="40"
                          :show-button="false" />
                      </n-form-item>
                    </n-grid-item>
                  </n-grid>
                </n-collapse-item>
              </template>
            </n-collapse>
          </n-form>
        </div>
      </n-tab-pane>

      <n-tab-pane name="animation" tab="动画">
        <div class="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          <n-form label-placement="top" size="small">
            <n-form-item label="持续动画">
              <n-select :value="formData.animationType" @update:value="v => handleUpdate('animationType', v)" :options="[
                { label: '无', value: 'none' },
                { label: '呼吸', value: 'pulse' },
                { label: '抖动', value: 'shake' },
                { label: '旋转', value: 'rotate' },
              ]" />
            </n-form-item>
            <template v-if="formData.animationType !== 'none'">
              <n-form-item label="持续时间 (s)">
                <n-input-number :value="formData.animationDuration"
                  @update:value="v => handleUpdate('animationDuration', v)" :min="0.1" :step="0.1"
                  :show-button="false" />
              </n-form-item>
              <n-button block secondary type="primary"
                @click="() => editorStore.graph?.trigger('node:play-animation', { node: cell })">
                <template #icon><n-icon :component="Icons.Play" /></template>
                预览动画
              </n-button>
            </template>
          </n-form>
        </div>
      </n-tab-pane>

      <n-tab-pane name="ports" tab="连接桩">
        <PortConfigPanel :node="cell as Node" @update="() => { }" />
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

:deep(.n-collapse-item__content-inner) {
  padding: 12px;
}
</style>
