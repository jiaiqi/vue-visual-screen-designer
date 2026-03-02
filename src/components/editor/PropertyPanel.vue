<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { Cell, Edge, Node } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import IconPickerDialog from './IconPickerDialog.vue'

const editorStore = useEditorStore()
const activeCell = ref<Cell | null>(null)

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
  rx: 4, // 默认圆角
  fontSize: 14, // 默认字号
  textColor: '#e2e8f0', // 文字颜色
  edgeShape: 'edge', // 连线样式 shape
  iconName: '', // 图标图元特定的标识
  progressValue: 50,
  progressColor: '#3b82f6',
  progressBgColor: '#1e293b',
  showProgressText: true,
  numberValue: 0,
  numberFormat: 'none',
  decimalPlaces: 0,
  useGrouping: true,
  animateRoll: true,
  flowSpeed: 1, // 动画周期 (s)
  flowReverse: false, // 动画反向
  imageUrl: '', // 自定义图片URL
  animationType: 'none', // 动画类型
  animationDuration: 1, // 动画时长
  animationReverse: false, // 动画反向
  entranceType: 'none',   // 进场动画
  exitType: 'none',       // 退出动画
  sourceMarker: false,   // 起始箭头
  targetMarker: false,   // 终点箭头
  // --- 多状态图元配置 ---
  states: [] as { value: string | number, url: string, label: string }[],
  currentStatus: '' as string | number,
})

const showIconPicker = ref(false)

// Tab 切换状态
const activeTab = ref<'style' | 'animate'>('style')

// 监听画布的选区变动
watch(() => editorStore.graph, (graph) => {
  if (!graph) return

  const updateSelection = () => {
    const cells = graph.getSelectedCells()
    if (cells.length === 1) {
      const cell = cells[0] as Cell
      activeCell.value = cell
      syncDataFromCell(cell)
    } else {
      activeCell.value = null
    }
  }

  graph.on('selection:changed', updateSelection)
  graph.on('node:resized', () => activeCell.value && syncDataFromCell(activeCell.value as Cell))
  graph.on('node:moved', () => activeCell.value && syncDataFromCell(activeCell.value as Cell))

  onUnmounted(() => {
    graph.off('selection:changed', updateSelection)
  })
}, { immediate: true })

function syncDataFromCell(cell: Cell) {
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

  if (cell.shape === 'image') {
    formData.value.imageUrl = (cell.attr('image/xlink:href') as string) || ''
  } else {
    formData.value.imageUrl = ''
  }

  if (cell.shape === 'icon-node') {
    formData.value.iconName = cell.getData()?.iconName || 'Image'
  } else {
    formData.value.iconName = ''
  }

  if (cell.shape === 'progress-node') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (cell.getData() || {}) as any
    formData.value.progressValue = typeof data.progressValue === 'number' ? data.progressValue : 50
    formData.value.progressColor = data.progressColor || '#3b82f6'
    formData.value.progressBgColor = data.progressBgColor || '#1e293b'
    formData.value.showProgressText = data.showProgressText !== false
  }

  if (cell.shape === 'digital-node') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (cell.getData() || {}) as any
    formData.value.numberValue = typeof data.numberValue === 'number' ? data.numberValue : 0
    formData.value.numberFormat = data.numberFormat || 'none'
    formData.value.decimalPlaces = typeof data.decimalPlaces === 'number' ? data.decimalPlaces : 0
    formData.value.useGrouping = data.useGrouping !== false
    formData.value.animateRoll = data.animateRoll !== false
  }

  formData.value.animationType = (cell.getData()?.animationType as string) || 'none'
  formData.value.animationDuration = Number(cell.getData()?.animationDuration || 1)
  formData.value.animationReverse = !!cell.getData()?.animationReverse
  formData.value.entranceType = (cell.getData()?.entranceType as string) || 'none'
  formData.value.exitType = (cell.getData()?.exitType as string) || 'none'
  formData.value.states = (cell.getData() as any)?.states || []
  formData.value.currentStatus = (cell.getData() as any)?.currentStatus ?? ''

  if (cell.isEdge()) {
    formData.value.edgeShape = cell.shape
    formData.value.stroke = (cell.attr('line/stroke') as string) || '#3b82f6'

    // 提取流体动画参数
    const animation = cell.attr('fluid/style/animation') as string || ''
    if (animation && animation.includes('dash-flow')) {
      const match = animation.match(/dash-flow ([\d.]+)s/)
      if (match && match[1]) {
        formData.value.flowSpeed = parseFloat(match[1])
      } else {
        formData.value.flowSpeed = 1
      }
      formData.value.flowReverse = animation.includes('reverse')
    }
    formData.value.flowSpeed = cell.getData()?.flowSpeed || 1
    formData.value.flowReverse = !!cell.getData()?.flowReverse

    // 提取箭头状态
    const attrs = (cell as Edge).attrs || {}
    formData.value.sourceMarker = !!attrs.line?.sourceMarker
    formData.value.targetMarker = !!attrs.line?.targetMarker
    formData.value.edgeShape = cell.shape
  }
}

function handleUpdate(key: keyof typeof formData.value, value: any) {
  if (!activeCell.value) return

  const cell = activeCell.value as Cell

  switch (key) {
    case 'text':
      cell.attr('text/text', value as string)
      if (cell.isEdge()) cell.appendLabel({ attrs: { text: { text: value as string } } })
      break
    case 'textColor':
      cell.attr('text/fill', value as string)
      break
    case 'fontSize':
      cell.attr('text/fontSize', Number(value))
      break
    case 'fill':
      if (cell.isNode()) cell.attr('body/fill', value as string)
      break
    case 'stroke':
      if (cell.isNode()) cell.attr('body/stroke', value as string)
      if (cell.isEdge()) cell.attr('line/stroke', value as string)
      break
    case 'rx':
      if (cell.isNode()) {
        cell.attr('body/rx', Number(value))
        cell.attr('body/ry', Number(value)) // 圆角同步
      }
      break
    case 'imageUrl':
      if (cell.isNode() && cell.shape === 'image') {
        cell.attr('image/xlink:href', value as string)
        cell.attr('body/strokeDasharray', null)
        cell.attr('label/text', '')
      }
      break
    case 'iconName':
      if (cell.isNode() && cell.shape === 'icon-node') {
        cell.setData({ iconName: value }, { overwrite: false })
      }
      break
    case 'progressValue':
    case 'progressColor':
    case 'progressBgColor':
    case 'showProgressText':
      if (cell.isNode() && cell.shape === 'progress-node') {
        cell.setData({ [key]: value }, { overwrite: false })
        // 同步修改外观颜色记录（虽然 ProgressNode 自己接管了渲染，但便于与外观面板联动使用）
        if (key === 'progressColor') cell.attr('body/stroke', value as string)
        if (key === 'progressBgColor') cell.attr('body/fill', value as string)
      }
      break
    case 'numberValue':
    case 'numberFormat':
    case 'decimalPlaces':
    case 'useGrouping':
    case 'animateRoll':
      if (cell.isNode() && cell.shape === 'digital-node') {
        cell.setData({ [key]: value }, { overwrite: false })
      }
      break
    case 'animationType':
    case 'animationDuration':
    case 'animationReverse':
    case 'entranceType':
    case 'exitType':
    case 'states':
    case 'currentStatus':
      if (cell.isNode()) {
        cell.setData({
          animationType: formData.value.animationType,
          animationDuration: formData.value.animationDuration,
          animationReverse: formData.value.animationReverse,
          entranceType: formData.value.entranceType,
          exitType: formData.value.exitType,
          states: formData.value.states,
          currentStatus: key === 'currentStatus' ? value : formData.value.currentStatus
        }, { overwrite: false })
      }
      break
    case 'edgeShape':
      if (cell.isEdge()) {
        const edge = cell as Edge
        const graph = editorStore.graph
        if (!graph) return

        // 创建新连线并保留关键数据
        const newEdge = graph.createEdge({
          shape: value as string,
          source: edge.getSource(),
          target: edge.getTarget(),
          vertices: edge.getVertices(),
          router: edge.getRouter(),
          data: edge.getData(),
        })

        graph.addEdge(newEdge)
        graph.removeCell(edge)
        graph.select(newEdge)
        activeCell.value = newEdge
      }
      break
    case 'sourceMarker':
    case 'targetMarker':
      if (cell.isEdge()) {
        const isSource = key === 'sourceMarker'
        const marker = value ? { name: 'classic', size: 8 } : null
        cell.attr(`line/${isSource ? 'sourceMarker' : 'targetMarker'}`, marker)
      }
      break
    case 'flowSpeed':
    case 'flowReverse':
      if (cell.isEdge()) {
        const data = {
          flowSpeed: key === 'flowSpeed' ? Number(value) : formData.value.flowSpeed,
          flowReverse: key === 'flowReverse' ? Boolean(value) : formData.value.flowReverse,
        }
        cell.setData(data, { overwrite: false })

        // 兼容旧的 fluid-pipe 属性驱动
        if (cell.shape === 'fluid-pipe') {
          const animationStr = data.flowSpeed > 0
            ? `dash-flow ${data.flowSpeed}s linear infinite ${data.flowReverse ? 'reverse' : 'normal'}`
            : 'none'
          cell.attr('fluid/style/animation', animationStr)
        }
      }
      break
    case 'width':
    case 'height':
      if (cell.isNode()) {
        const node = cell as Node
        const currentSize = node.getSize()
        node.resize(
          key === 'width' ? Number(value) : currentSize.width,
          key === 'height' ? Number(value) : currentSize.height
        )
      }
      break
    case 'x':
    case 'y':
      if (cell.isNode()) {
        const node = cell as Node
        const currentPos = node.getPosition()
        node.position(
          key === 'x' ? Number(value) : currentPos.x,
          key === 'y' ? Number(value) : currentPos.y
        )
      }
      break
  }
}

const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerImageUpload() {
  fileInputRef.value?.click()
}

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !activeCell.value) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const dataUrl = ev.target?.result as string
    if (dataUrl && activeCell.value?.isNode()) {
      formData.value.imageUrl = dataUrl
      handleUpdate('imageUrl', dataUrl)

      const img = new Image()
      img.onload = () => {
        const aspect = img.width / img.height
        const cell = activeCell.value as Node
        const curSize = cell.getSize()
        let newW = curSize.width
        let newH = curSize.width / aspect
        if (newH > 200) {
          newH = 200
          newW = newH * aspect
        }
        cell.resize(newW, newH)
        syncDataFromCell(cell)
      }
      img.src = dataUrl
    }
  }
  reader.readAsDataURL(file)
}

function addStatusItem() {
  formData.value.states.push({ value: '', url: '', label: '新状态' })
  handleUpdate('states', formData.value.states)
}

function removeStatusItem(index: number) {
  formData.value.states.splice(index, 1)
  handleUpdate('states', formData.value.states)
}

function updateStatusItem() {
  handleUpdate('states', formData.value.states)
}

function handleIconSelected(iconName: string) {
  formData.value.iconName = iconName
  handleUpdate('iconName', iconName)
  showIconPicker.value = false
}
</script>

<template>
  <div class="h-full bg-slate-900 border-l border-slate-800 flex flex-col text-slate-300">
    <div class="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-950/50">
      <div class="w-1 h-3 bg-sky-500 rounded-full"></div>
      <h3 class="text-xs font-bold text-slate-200 tracking-widest uppercase">参数面板</h3>
    </div>

    <div class="flex items-center text-xs tracking-wide bg-slate-900 border-b border-slate-800">
      <button class="flex-1 py-3 font-semibold transition-colors border-b-2"
        :class="activeTab === 'style' ? 'text-sky-400 border-sky-500 bg-slate-800/50' : 'text-slate-500 border-transparent hover:text-slate-300'"
        @click="activeTab = 'style'">
        基础外观设定
      </button>
      <button class="flex-1 py-3 font-semibold transition-colors border-b-2"
        :class="activeTab === 'animate' ? 'text-purple-400 border-purple-500 bg-slate-800/50' : 'text-slate-500 border-transparent hover:text-slate-300'"
        @click="activeTab = 'animate'">
        PPT 动作/流体
      </button>
    </div>

    <div v-if="activeCell" class="p-4 space-y-6 overflow-y-auto custom-scrollbar h-0 flex-1">

      <!-- ============ TAB 1: 视觉与外观 ============ -->
      <div v-show="activeTab === 'style'" class="space-y-6">
        <!-- 基础属性 -->
        <section class="space-y-3">
          <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">基础标识</label>

          <div class="space-y-2">
            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-bold text-slate-400">组件 ID</span>
              <input type="text" :value="formData.id" readonly
                class="w-full bg-slate-950/50 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-500 font-mono focus:outline-none" />
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-bold text-slate-400">显示文本 (Text)</span>
              <input type="text" v-model="formData.text"
                @input="e => handleUpdate('text', (e.target as HTMLInputElement).value)"
                class="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-md px-2.5 py-1.5 text-xs text-slate-200 transition-colors outline-none"
                placeholder="输入节点文本" />
            </div>

            <div class="flex items-center gap-3">
              <div class="flex flex-col gap-1.5 w-1/2">
                <span class="text-[9px] font-bold text-slate-400">字体大小</span>
                <input type="number" :min="8" :max="72" v-model.number="formData.fontSize"
                  @change="e => handleUpdate('fontSize', (e.target as HTMLInputElement).value)"
                  class="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-md px-2.5 py-1.5 text-xs text-slate-200 transition-colors outline-none" />
              </div>
              <div class="flex flex-col gap-1.5 w-1/2">
                <span class="text-[9px] font-bold text-slate-400">文字颜色</span>
                <div class="flex items-center gap-2 relative">
                  <input type="color" v-model="formData.textColor"
                    @input="e => handleUpdate('textColor', (e.target as HTMLInputElement).value)"
                    class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" />
                  <div class="w-6 h-6 rounded border border-slate-600 shadow-inner flex-shrink-0"
                    :style="{ backgroundColor: formData.textColor }"></div>
                  <span class="text-[10px] font-mono text-slate-400">{{ formData.textColor.toUpperCase() }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 专有属性：IconNode -->
        <section class="space-y-3" v-if="activeCell?.shape === 'icon-node'">
          <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">矢量图标控制 (Lucide)</label>
          <div class="flex flex-col gap-2">

            <div class="flex items-center gap-2">
              <div class="flex-1 flex flex-col gap-1.5">
                <span class="text-[9px] font-bold text-slate-400">图标名 (Icon Name)</span>
                <input type="text" v-model="formData.iconName"
                  @input="e => handleUpdate('iconName', (e.target as HTMLInputElement).value)"
                  class="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-md px-2.5 py-1.5 text-xs text-slate-200 transition-colors outline-none"
                  placeholder="例如：Database、Cpu..." />
              </div>
              <button @click="showIconPicker = true"
                class="mt-4 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-md text-xs transition-colors shrink-0"
                title="打开全量图标可视化挑选面板">
                浏览图标库...
              </button>
            </div>

            <span class="text-[9px] text-slate-500">支持全量 <a href="https://lucide.dev/icons" target="_blank"
                class="text-sky-500 hover:underline">Lucide 图标</a>，采用大写驼峰命名 (PascalCase)</span>
          </div>
        </section>

        <!-- 专有属性：ProgressNode -->
        <section class="space-y-3" v-if="activeCell?.shape === 'progress-node'">
          <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">进度指示器设定</label>
          <div class="flex flex-col gap-1.5">
            <span class="text-[9px] font-bold text-slate-400">进度值 ({{ formData.progressValue }}%)</span>
            <input type="range" min="0" max="100" v-model.number="formData.progressValue"
              @input="e => handleUpdate('progressValue', Number((e.target as HTMLInputElement).value))"
              class="w-full accent-sky-500 cursor-pointer" />

            <div class="flex items-center justify-between mt-2">
              <span class="text-[9px] font-bold text-slate-400">显示中心百分比文本</span>
              <input type="checkbox" v-model="formData.showProgressText"
                @change="e => handleUpdate('showProgressText', (e.target as HTMLInputElement).checked)"
                class="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer" />
            </div>

            <div class="grid grid-cols-2 gap-3 mt-2">
              <div class="flex flex-col gap-1.5">
                <span class="text-[9px] font-bold text-slate-400">填充高亮色彩</span>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="formData.progressColor"
                    @input="e => handleUpdate('progressColor', (e.target as HTMLInputElement).value)"
                    class="w-8 h-8 rounded shrink-0 bg-transparent border-0 cursor-pointer p-0" />
                  <span class="text-[9px] font-mono text-slate-400 uppercase">{{ formData.progressColor }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <span class="text-[9px] font-bold text-slate-400">轨道背景边框</span>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="formData.progressBgColor"
                    @input="e => handleUpdate('progressBgColor', (e.target as HTMLInputElement).value)"
                    class="w-8 h-8 rounded shrink-0 bg-transparent border-0 cursor-pointer p-0" />
                  <span class="text-[9px] font-mono text-slate-400 uppercase">{{ formData.progressBgColor }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 专有属性：DigitalNode -->
        <section class="space-y-3" v-if="activeCell?.shape === 'digital-node'">
          <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">智能数字翻牌</label>
          <div class="space-y-2">
            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-bold text-slate-400">设置数值 (Number)</span>
              <input type="number" v-model.number="formData.numberValue"
                @change="e => handleUpdate('numberValue', Number((e.target as HTMLInputElement).value))"
                class="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-md px-2.5 py-1.5 text-xs text-slate-200 transition-colors outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <span class="text-[9px] font-bold text-slate-400">大额单位修饰</span>
                <select v-model="formData.numberFormat"
                  @change="e => handleUpdate('numberFormat', (e.target as HTMLSelectElement).value)"
                  class="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-md px-2 py-1.5 text-xs text-slate-200 transition-colors outline-none">
                  <option value="none">原始数值</option>
                  <option value="auto">自动 (万/亿)</option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <span class="text-[9px] font-bold text-slate-400">保留小数位</span>
                <input type="number" min="0" max="10" step="1" v-model.number="formData.decimalPlaces"
                  @change="e => handleUpdate('decimalPlaces', Number((e.target as HTMLInputElement).value))"
                  class="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-sky-500 rounded-md px-2.5 py-1.5 text-xs text-slate-200 transition-colors outline-none" />
              </div>
            </div>

            <div class="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-800/80">
              <span class="text-[9px] font-bold text-slate-400">开启千分位 (,)</span>
              <input type="checkbox" v-model="formData.useGrouping"
                @change="e => handleUpdate('useGrouping', (e.target as HTMLInputElement).checked)"
                class="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer" />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-[9px] font-bold text-slate-400">变动翻页动画 (Roll)</span>
              <input type="checkbox" v-model="formData.animateRoll"
                @change="e => handleUpdate('animateRoll', (e.target as HTMLInputElement).checked)"
                class="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer" />
            </div>
          </div>
        </section>

        <!-- 样式外观 -->
        <section class="space-y-3" v-if="activeCell?.isNode()">
          <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">外观样式</label>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-bold text-slate-400">填充颜色 (Fill)</span>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formData.fill"
                  @input="e => handleUpdate('fill', (e.target as HTMLInputElement).value)"
                  class="w-8 h-8 rounded shrink-0 bg-transparent border-0 cursor-pointer p-0" />
                <span class="text-[9px] font-mono text-slate-400 uppercase">{{ formData.fill }}</span>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-bold text-slate-400">边框颜色 (Stroke)</span>
              <div class="flex items-center gap-2">
                <input type="color" v-model="formData.stroke"
                  @input="e => handleUpdate('stroke', (e.target as HTMLInputElement).value)"
                  class="w-8 h-8 rounded shrink-0 bg-transparent border-0 cursor-pointer p-0" />
                <span class="text-[9px] font-mono text-slate-400 uppercase">{{ formData.stroke }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 几何属性 -->
        <section class="space-y-3" v-if="activeCell?.isNode()">
          <label class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">位置与尺寸</label>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-bold text-slate-400">高度 (H)</span>
              <input type="number" v-model.number="formData.height"
                @change="e => handleUpdate('height', (e.target as HTMLInputElement).value)"
                class="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500" />
            </div>
          </div>
        </section>
        <!-- 自定义图片与多状态配置 -->
        <section class="space-y-4 pt-4 border-t border-slate-800"
          v-if="activeCell?.isNode() && activeCell?.shape === 'image'">
          <div class="space-y-3">
            <label class="text-[10px] font-extrabold text-fuchsia-500 uppercase tracking-widest block">图像设置 (Image
              Settings)</label>

            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-bold text-slate-400">图像 URL 地址</span>
              <input type="text" v-model="formData.imageUrl"
                @input="e => handleUpdate('imageUrl', (e.target as HTMLInputElement).value)"
                class="w-full bg-slate-800 border border-slate-700 focus:border-fuchsia-500 rounded-md px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                placeholder="输入在线图片链接或 SVG 代码" />
            </div>

            <div
              class="mt-2 text-center text-[10px] text-slate-500 bg-slate-900 rounded-md py-2 border border-slate-800 border-dashed hover:border-fuchsia-500 hover:text-fuchsia-400 cursor-pointer transition-colors"
              @click="triggerImageUpload">
              点击这里上传替换本地图片
            </div>
            <input type="file" ref="fileInputRef" class="hidden"
              accept="image/png, image/jpeg, image/svg+xml, image/gif" @change="handleImageUpload" />
          </div>

          <!-- 多状态子模块 -->
          <div class="mt-6 pt-4 border-t border-slate-800/50 space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest leading-tight">多状态映射
                (States)</label>
              <button @click="addStatusItem"
                class="text-[9px] px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded border border-amber-500/20 transition-colors">
                + 增加
              </button>
            </div>

            <div class="space-y-3">
              <!-- 状态模拟器 -->
              <div class="p-2.5 bg-slate-950/40 rounded border border-slate-800/60 shadow-inner">
                <span class="text-[9px] font-bold text-slate-500 block mb-2 uppercase text-[8px]">状态预览模拟 (Mock
                  State)</span>
                <div class="flex items-center gap-2">
                  <select v-model="formData.currentStatus"
                    @change="e => handleUpdate('currentStatus', (e.target as HTMLSelectElement).value)"
                    class="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-amber-400 outline-none focus:border-amber-500">
                    <option value="">默认状态 (Default)</option>
                    <option v-for="st in formData.states" :key="st.value" :value="st.value">
                      {{ st.label || st.value }}
                    </option>
                  </select>
                  <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]"></div>
                </div>
              </div>

              <!-- 映射列表 -->
              <div v-for="(item, idx) in formData.states" :key="idx"
                class="group relative flex flex-col gap-2 p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-all">
                <button @click="removeStatusItem(idx)"
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-full flex items-center justify-center border border-rose-500/30 opacity-0 group-hover:opacity-100 transition-all z-10">
                  ×
                </button>

                <div class="grid grid-cols-2 gap-2">
                  <div class="flex flex-col gap-1">
                    <span class="text-[8px] text-slate-500 font-bold uppercase">状态值 (Value)</span>
                    <input type="text" v-model="item.value" @change="updateStatusItem"
                      class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-200 outline-none focus:border-amber-500"
                      placeholder="如: running" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <span class="text-[8px] text-slate-500 font-bold uppercase">显示标签</span>
                    <input type="text" v-model="item.label" @change="updateStatusItem"
                      class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-200 outline-none focus:border-amber-500"
                      placeholder="如: 运行中" />
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[8px] text-slate-500 font-bold uppercase">映射图片/GIF URL</span>
                  <input type="text" v-model="item.url" @change="updateStatusItem"
                    class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-200 outline-none focus:border-amber-500"
                    placeholder="输入链接" />
                </div>
              </div>

              <p v-if="formData.states.length === 0"
                class="text-center py-4 text-[10px] text-slate-600 border border-slate-800 border-dashed rounded-lg">
                尚未配置业务状态映射。
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- ============ TAB 2: 动作交互 ============ -->
      <div v-show="activeTab === 'animate'" class="space-y-6">
        <!-- 动画与交互属性 -->
        <section class="space-y-3" v-if="activeCell?.isNode()">
          <label class="text-[10px] font-extrabold text-purple-500 uppercase tracking-widest">高级动画 (PPT-like)</label>

          <div class="space-y-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-bold text-slate-400">登场/持续动画类型</span>
              <select v-model="formData.animationType"
                @change="e => handleUpdate('animationType', (e.target as HTMLSelectElement).value)"
                class="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-purple-500">
                <option value="none">无动画 (None)</option>
                <option value="breath">心跳呼吸缩放 (Breath)</option>
                <option value="blink">警报红光闪烁 (Blink)</option>
                <option value="move">左右穿梭平移 (Move-X)</option>
                <option value="shake">剧烈震动/报错 (Shake)</option>
                <option value="spin">匀速倒空翻自旋 (Spin)</option>
                <option value="fade">幽灵渐隐显影 (Fade In-Out)</option>
                <option value="float">垂直空浮游动 (Float-Y)</option>
                <option value="pulse">强烈脉冲放大 (Pulse)</option>
                <option value="neon">霓虹多色变幻 (Neon)</option>
                <option value="bounce">活泼弹性跳跃 (Bounce)</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5" v-if="formData.animationType !== 'none'">
              <span class="text-[9px] font-bold text-slate-400">单次动画周期 (秒)</span>
              <input type="number" :min="0.1" :step="0.1" v-model.number="formData.animationDuration"
                @change="e => handleUpdate('animationDuration', (e.target as HTMLInputElement).value)"
                class="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-purple-500" />
            </div>

            <!-- 动画方向设置 -->
            <div class="flex items-center justify-between border-t border-slate-800 pt-3"
              v-if="formData.animationType !== 'none'">
              <div class="flex flex-col gap-1.5 items-start">
                <span class="text-[9px] font-bold text-slate-400">动画反向 (逆时针/反向)</span>
                <label class="flex items-center mt-1 cursor-pointer">
                  <input type="checkbox" v-model="formData.animationReverse"
                    @change="e => handleUpdate('animationReverse', (e.target as HTMLInputElement).checked)"
                    class="sr-only peer">
                  <div
                    class="w-8 h-4 bg-slate-700 rounded-full peer peer-checked:bg-purple-500 transition-colors relative">
                    <div
                      class="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:translate-x-4 transition-transform">
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- 进场动画设置 -->
            <div class="flex flex-col gap-3 pt-3 border-t border-slate-800">
              <div class="flex flex-col gap-1.5">
                <span class="text-[9px] font-bold text-emerald-400">进场动画 (Entrance)</span>
                <div class="flex gap-2">
                  <select v-model="formData.entranceType"
                    @change="e => handleUpdate('entranceType', (e.target as HTMLSelectElement).value)"
                    class="flex-1 bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-[10px] text-slate-200 outline-none focus:border-emerald-500">
                    <option value="none">无 (None)</option>
                    <option value="fade-in">渐显 (Fade In)</option>
                    <option value="zoom-in">缩放进入 (Zoom In)</option>
                    <option value="fly-in-top">从上方飞入 (Fly Top)</option>
                    <option value="fly-in-bottom">从下方飞入 (Fly Bottom)</option>
                  </select>
                  <button @click="() => editorStore.graph?.trigger('node:play-entrance', { node: activeCell })"
                    class="px-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded text-[10px] transition-colors">
                    预览
                  </button>
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <span class="text-[9px] font-bold text-rose-400">退出动画 (Exit)</span>
                <div class="flex gap-2">
                  <select v-model="formData.exitType"
                    @change="e => handleUpdate('exitType', (e.target as HTMLSelectElement).value)"
                    class="flex-1 bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-[10px] text-slate-200 outline-none focus:border-rose-500">
                    <option value="none">无 (None)</option>
                    <option value="fade-out">渐隐 (Fade Out)</option>
                    <option value="zoom-out">缩放退出 (Zoom Out)</option>
                  </select>
                  <button @click="() => editorStore.graph?.trigger('node:play-exit', { node: activeCell })"
                    class="px-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded text-[10px] transition-colors">
                    预览
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 专门针对连线的设置 -->
        <section class="space-y-3" v-if="activeCell?.isEdge()">
          <label class="text-[10px] font-extrabold text-sky-500 uppercase tracking-widest">连线高级设置</label>
          <div class="space-y-3">
            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-bold text-slate-400">切换链路类型</span>
              <select v-model="formData.edgeShape"
                @change="e => handleUpdate('edgeShape', (e.target as HTMLSelectElement).value)"
                class="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-sky-500">
                <option value="edge">普通实心连线 (Normal Solid Line)</option>
                <option value="electric-line">电力供电线路 (Electric Line)</option>
                <option value="signal-line">信号传输线路 (Signal Line)</option>
                <option value="bus-line">工业数据总线 (Industrial Bus)</option>
                <option value="fluid-pipe">工业流体管道 (Fluid Pipe Animation)</option>
              </select>
              <p class="text-[10px] text-slate-500 mt-1 leading-tight">注：切换路径模式将会重新描绘该连接段。</p>
            </div>

            <!-- 端点装饰 -->
            <div class="flex flex-col gap-3 pt-3 border-t border-slate-800">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-bold text-slate-400">端点装饰 (Markers)</span>
                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" v-model="formData.sourceMarker"
                      @change="e => handleUpdate('sourceMarker', (e.target as HTMLInputElement).checked)"
                      class="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0" />
                    <span class="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors">起点箭头</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" v-model="formData.targetMarker"
                      @change="e => handleUpdate('targetMarker', (e.target as HTMLInputElement).checked)"
                      class="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0" />
                    <span class="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors">终点箭头</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 流体专属参数 -->
            <div class="flex items-center justify-between border-t border-slate-800 pt-3"
              v-if="formData.edgeShape === 'fluid-pipe'">
              <div class="flex flex-col gap-1.5 w-1/2 pr-2">
                <span class="text-[9px] font-bold text-slate-400">水流速率 (秒/周期)</span>
                <input type="number" :min="0.1" :step="0.1" v-model.number="formData.flowSpeed"
                  @change="e => handleUpdate('flowSpeed', (e.target as HTMLInputElement).value)"
                  class="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500" />
              </div>
              <div class="flex flex-col gap-1.5 w-1/2 pl-2 border-l border-slate-800 items-start">
                <span class="text-[9px] font-bold text-slate-400">流向反转</span>
                <label class="flex items-center mt-1 cursor-pointer">
                  <input type="checkbox" v-model="formData.flowReverse"
                    @change="e => handleUpdate('flowReverse', (e.target as HTMLInputElement).checked)"
                    class="sr-only peer">
                  <div
                    class="w-8 h-4 bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors relative">
                    <div
                      class="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:translate-x-4 transition-transform">
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>

    <div v-else class="flex-1 flex flex-col items-center justify-center opacity-30 select-none">
      <div class="w-16 h-16 border-2 border-dashed border-slate-500 rounded-lg mb-3"></div>
      <p class="text-xs text-slate-400">未选中任何图元对象</p>
    </div>
  </div>
  <!-- ================= 核心组件注入：图文选择器弹出层 ================= -->
  <IconPickerDialog v-model:show="showIconPicker" :current-icon="formData.iconName"
    @select="(icon) => { formData.iconName = icon; handleUpdate('iconName', icon) }" />
</template>

<style scoped>
input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}
</style>
