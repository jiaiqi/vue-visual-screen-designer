<script setup lang="ts">
import { ref, watch, onUnmounted, markRaw } from 'vue'
import { Cell, Edge } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import IconPickerDialog from '../IconPickerDialog.vue'
import {
  NForm, NFormItem, NInput, NInputNumber, NColorPicker,
  NSwitch, NSelect, NSlider, NDivider, NGrid, NGridItem,
  NButton, NTabs, NTabPane, NSpace, NText, NIcon, NDynamicInput
} from 'naive-ui'
import {
  Type, Palette, Move, Image as ImageIcon, Layers,
  Play, Share2, Trash2, Plus, Eye
} from 'lucide-vue-next'

const editorStore = useEditorStore()
const activeCell = ref<Cell | null>(null)

// 图标加固
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
  Eye: markRaw(Eye)
}

// 响应式表单数据
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
})

const showIconPicker = ref(false)

// 监听画布的选区变动
watch(() => editorStore.graph, (graph) => {
  if (!graph) return

  const updateSelection = () => {
    try {
      const cells = graph.getSelectedCells()
      if (cells.length === 1) {
        activeCell.value = cells[0]
        syncDataFromCell(cells[0])
      } else {
        activeCell.value = null
      }
    } catch (e) {
      console.error('选区更新崩溃:', e)
    }
  }

  graph.on('selection:changed', updateSelection)
  graph.on('node:resized', () => activeCell.value && syncDataFromCell(activeCell.value))
  graph.on('node:moved', () => activeCell.value && syncDataFromCell(activeCell.value))

  // 初始化立即执行一次
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

function handleUpdate(key: string, value: any) {
  if (!activeCell.value) return
  const cell = activeCell.value

  // @ts-ignore
  formData.value[key] = value

  try {
    switch (key) {
      case 'text':
        cell.attr('text/text', value)
        if (cell.isEdge()) {
          const labels = cell.getLabels()
          if (labels.length > 0) cell.setLabelAt(0, { attrs: { text: { text: value } } })
          else cell.appendLabel({ attrs: { text: { text: value } } })
        }
        break
      case 'textColor': cell.attr('text/fill', value); break
      case 'fontSize': cell.attr('text/fontSize', value); break
      case 'fill': if (cell.isNode()) cell.attr('body/fill', value); break
      case 'stroke':
        if (cell.isNode()) cell.attr('body/stroke', value)
        if (cell.isEdge()) cell.attr('line/stroke', value)
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
      default:
        cell.setData({ [key]: value }, { overwrite: false })
        if (cell.shape === 'fluid-pipe' && (key === 'flowSpeed' || key === 'flowReverse')) {
          const speed = key === 'flowSpeed' ? value : formData.value.flowSpeed
          const reverse = key === 'flowReverse' ? value : formData.value.flowReverse
          cell.attr('fluid/style/animation', speed > 0 ? `dash-flow ${speed}s linear infinite ${reverse ? 'reverse' : 'normal'}` : 'none')
        }
        if (cell.shape === 'image' && key === 'imageUrl') {
          cell.attr('image/xlink:href', value)
        }
    }
  } catch (err) {
    console.error('更新图元失败:', err)
  }
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
</script>

<template>
  <div v-if="activeCell" class="node-properties h-full flex flex-col">
    <n-tabs type="line" justify-content="space-evenly" size="small" class="shrink-0 bg-slate-900 border-b border-slate-800">
      <n-tab-pane name="style" tab="基础样式">
        <div class="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          <n-form label-placement="top" size="small">
            <template v-if="activeCell">
              <!-- 基础标识 -->
              <div class="section-header">基础标识</div>
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
                    <n-input-number :value="formData.fontSize" @update:value="v => handleUpdate('fontSize', v)" :min="8" :show-button="false" />
                  </n-form-item>
                </n-grid-item>
                <n-grid-item>
                  <n-form-item label="文字颜色">
                    <n-color-picker :value="formData.textColor" @update:value="v => handleUpdate('textColor', v)" />
                  </n-form-item>
                </n-grid-item>
              </n-grid>

              <!-- 特有逻辑：图标 -->
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

              <!-- 特有逻辑：图片与多状态 -->
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

              <n-divider />

              <!-- 图形外观 -->
              <div class="section-header">外观详情</div>
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

              <n-grid :cols="2" :x-gap="12" v-if="activeCell.isNode()">
                <n-grid-item>
                  <n-form-item label="圆角 (rx)">
                    <n-input-number :value="formData.rx" @update:value="v => handleUpdate('rx', v)" :min="0" :show-button="false" />
                  </n-form-item>
                </n-grid-item>
              </n-grid>

              <n-divider />

              <!-- 几何位置 -->
              <div class="section-header">几何位置</div>
              <n-grid :cols="2" :x-gap="12" :y-gap="8" v-if="activeCell.isNode()">
                <n-grid-item><n-form-item label="宽度 (W)"><n-input-number :value="formData.width" @update:value="v => handleUpdate('width', v)" :show-button="false" /></n-form-item></n-grid-item>
                <n-grid-item><n-form-item label="高度 (H)"><n-input-number :value="formData.height" @update:value="v => handleUpdate('height', v)" :show-button="false" /></n-form-item></n-grid-item>
                <n-grid-item><n-form-item label="X 坐标"><n-input-number :value="formData.x" @update:value="v => handleUpdate('x', v)" :show-button="false" /></n-form-item></n-grid-item>
                <n-grid-item><n-form-item label="Y 坐标"><n-input-number :value="formData.y" @update:value="v => handleUpdate('y', v)" :show-button="false" /></n-form-item></n-grid-item>
              </n-grid>
            </template>
          </n-form>
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
/* ... 保持原有样式不变 ... */
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
</style>
