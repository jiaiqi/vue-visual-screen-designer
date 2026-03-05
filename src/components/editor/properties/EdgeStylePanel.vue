<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Edge } from '@antv/x6'
import { RefreshCw } from 'lucide-vue-next'

const props = defineProps<{
  edge: Edge
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const edgeShapes = [
  { value: 'edge', label: '默认' },
  { value: 'fluid-pipe', label: '流体管道' },
  { value: 'electric-line', label: '电力线' },
  { value: 'signal-line', label: '信号线' },
  { value: 'bus-line', label: '工业总线' },
  { value: 'dashed-line', label: '虚线连接' },
  { value: 'dotted-line', label: '点线连接' },
  { value: 'flow-line', label: '流动动画' },
  { value: 'warning-line', label: '警告线' },
  { value: 'data-line', label: '数据线' },
]

const connectors = [
  { value: 'normal', label: '直线' },
  { value: 'rounded', label: '圆角' },
  { value: 'smooth', label: '平滑曲线' },
  { value: 'jumpover', label: '跳线' },
]

const routers = [
  { value: 'normal', label: '无路由' },
  { value: 'orth', label: '正交路由' },
  { value: 'oneSide', label: '单侧路由' },
  { value: 'manhattan', label: '曼哈顿路由' },
  { value: 'metro', label: '地铁线路' },
  { value: 'er', label: 'ER图路由' },
]

const lineStyles = [
  { value: 'solid', label: '实线' },
  { value: 'dashed', label: '虚线' },
  { value: 'dotted', label: '点线' },
]

const targetMarkers = [
  { value: '', label: '无箭头' },
  { value: 'classic', label: '经典箭头' },
  { value: 'block', label: '块状箭头' },
  { value: 'async', label: '异步箭头' },
  { value: 'circle', label: '圆形' },
  { value: 'diamond', label: '菱形' },
]

const edgeConfig = ref({
  stroke: '#64748b',
  strokeWidth: 2,
  strokeDasharray: '',
  edgeShape: 'edge',
  connector: 'rounded',
  router: 'orth',
  targetMarker: 'classic',
  label: '',
  labelPosition: 0.5,
  animationSpeed: 1,
  animationEnabled: false,
})

const loadEdgeConfig = () => {
  const edge = props.edge
  const attrs = edge.getAttrs()
  const labels = edge.getLabels()
  const firstLabel = labels[0]

  edgeConfig.value = {
    stroke: (attrs?.line?.stroke as string) || '#64748b',
    strokeWidth: (attrs?.line?.strokeWidth as number) || 2,
    strokeDasharray: (attrs?.line?.strokeDasharray as string) || '',
    edgeShape: edge.shape || 'edge',
    connector: edge.getConnector()?.name || 'rounded',
    router: edge.getRouter()?.name || 'orth',
    targetMarker: (attrs?.line?.targetMarker as { name: string })?.name || 'classic',
    label: typeof firstLabel?.attrs?.text?.text === 'string' ? firstLabel.attrs.text.text : '',
    labelPosition: 0.5,
    animationSpeed: 1,
    animationEnabled: false,
  }
}

watch(() => props.edge, loadEdgeConfig, { immediate: true })

const updateEdge = () => {
  const edge = props.edge

  const strokeDasharray = edgeConfig.value.strokeDasharray ||
    (edgeConfig.value.edgeShape === 'dashed-line' ? '8, 8' :
     edgeConfig.value.edgeShape === 'dotted-line' ? '2, 4' :
     edgeConfig.value.edgeShape === 'signal-line' ? '4, 4' : '')

  edge.attr('line/stroke', edgeConfig.value.stroke)
  edge.attr('line/strokeWidth', edgeConfig.value.strokeWidth)

  if (strokeDasharray) {
    edge.attr('line/strokeDasharray', strokeDasharray)
  } else {
    edge.attr('line/strokeDasharray', '')
  }

  if (edgeConfig.value.targetMarker) {
    edge.attr('line/targetMarker', { name: edgeConfig.value.targetMarker, size: 8 })
  } else {
    edge.attr('line/targetMarker', null)
  }

  if (edgeConfig.value.connector && edgeConfig.value.connector !== 'normal') {
    edge.setConnector(edgeConfig.value.connector, { radius: 10 })
  }

  if (edgeConfig.value.router && edgeConfig.value.router !== 'normal') {
    edge.setRouter({ name: edgeConfig.value.router })
  }

  if (edgeConfig.value.label) {
    const labels = edge.getLabels()
    if (labels.length > 0) {
      edge.setLabelAt(0, {
        attrs: {
          text: { text: edgeConfig.value.label, fill: edgeConfig.value.stroke },
        },
        position: edgeConfig.value.labelPosition,
      })
    } else {
      edge.appendLabel({
        attrs: {
          text: { text: edgeConfig.value.label, fill: edgeConfig.value.stroke },
        },
        position: edgeConfig.value.labelPosition,
      })
    }
  } else {
    const labels = edge.getLabels()
    labels.forEach((_, index) => {
      edge.removeLabelAt(index)
    })
  }

  if (edgeConfig.value.animationEnabled) {
    const speed = edgeConfig.value.animationSpeed
    edge.attr('line/style/animation', `dash-flow ${speed}s linear infinite`)
    edge.attr('line/strokeDasharray', '10, 10')
  } else {
    edge.attr('line/style/animation', 'none')
  }

  emit('update')
}

const applyPreset = (preset: string) => {
  switch (preset) {
    case 'data':
      edgeConfig.value.stroke = '#8b5cf6'
      edgeConfig.value.strokeWidth = 2
      edgeConfig.value.connector = 'smooth'
      edgeConfig.value.targetMarker = 'classic'
      break
    case 'warning':
      edgeConfig.value.stroke = '#ef4444'
      edgeConfig.value.strokeWidth = 3
      edgeConfig.value.connector = 'rounded'
      edgeConfig.value.targetMarker = 'block'
      break
    case 'success':
      edgeConfig.value.stroke = '#10b981'
      edgeConfig.value.strokeWidth = 2
      edgeConfig.value.connector = 'rounded'
      edgeConfig.value.targetMarker = 'classic'
      break
    case 'flow':
      edgeConfig.value.stroke = '#22c55e'
      edgeConfig.value.strokeWidth = 4
      edgeConfig.value.connector = 'rounded'
      edgeConfig.value.targetMarker = ''
      edgeConfig.value.animationEnabled = true
      break
  }
  updateEdge()
}
</script>

<template>
  <div class="edge-style-panel">
    <div class="panel-header">
      <h4 class="text-xs font-semibold text-slate-300 mb-3">边样式配置</h4>
      <button
        @click="loadEdgeConfig"
        class="p-1.5 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-sky-400"
        title="刷新">
        <RefreshCw class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="space-y-3">
      <div class="preset-buttons flex gap-1 flex-wrap">
        <button
          v-for="preset in ['data', 'warning', 'success', 'flow']"
          :key="preset"
          @click="applyPreset(preset)"
          class="px-2 py-1 text-[10px] rounded border transition-colors"
          :class="{
            'border-violet-500/50 text-violet-400 hover:bg-violet-500/10': preset === 'data',
            'border-red-500/50 text-red-400 hover:bg-red-500/10': preset === 'warning',
            'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10': preset === 'success',
            'border-green-500/50 text-green-400 hover:bg-green-500/10': preset === 'flow',
          }">
          {{ preset === 'data' ? '数据' : preset === 'warning' ? '警告' : preset === 'success' ? '成功' : '流动' }}
        </button>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-[10px] text-slate-500 block mb-1">线条颜色</label>
          <input
            type="color"
            v-model="edgeConfig.stroke"
            @change="updateEdge"
            class="w-full h-7 rounded cursor-pointer bg-slate-900 border border-slate-700" />
        </div>

        <div>
          <label class="text-[10px] text-slate-500 block mb-1">线条宽度</label>
          <input
            type="range"
            v-model.number="edgeConfig.strokeWidth"
            @change="updateEdge"
            min="1"
            max="10"
            class="w-full accent-sky-500" />
          <span class="text-[10px] text-slate-500">{{ edgeConfig.strokeWidth }}px</span>
        </div>
      </div>

      <div>
        <label class="text-[10px] text-slate-500 block mb-1">连接器</label>
        <select
          v-model="edgeConfig.connector"
          @change="updateEdge"
          class="w-full px-2 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-slate-300 focus:border-sky-500 focus:outline-none">
          <option v-for="c in connectors" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
      </div>

      <div>
        <label class="text-[10px] text-slate-500 block mb-1">路由</label>
        <select
          v-model="edgeConfig.router"
          @change="updateEdge"
          class="w-full px-2 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-slate-300 focus:border-sky-500 focus:outline-none">
          <option v-for="r in routers" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
      </div>

      <div>
        <label class="text-[10px] text-slate-500 block mb-1">箭头</label>
        <select
          v-model="edgeConfig.targetMarker"
          @change="updateEdge"
          class="w-full px-2 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-slate-300 focus:border-sky-500 focus:outline-none">
          <option v-for="m in targetMarkers" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>

      <div>
        <label class="text-[10px] text-slate-500 block mb-1">标签文字</label>
        <input
          type="text"
          v-model="edgeConfig.label"
          @change="updateEdge"
          placeholder="输入标签..."
          class="w-full px-2 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-slate-300 placeholder-slate-600 focus:border-sky-500 focus:outline-none" />
      </div>

      <div class="flex items-center gap-3">
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            v-model="edgeConfig.animationEnabled"
            @change="updateEdge"
            class="accent-sky-500" />
          <span class="text-[10px] text-slate-500">流动动画</span>
        </label>

        <div v-if="edgeConfig.animationEnabled" class="flex-1">
          <label class="text-[10px] text-slate-500 block mb-1">速度</label>
          <input
            type="range"
            v-model.number="edgeConfig.animationSpeed"
            @change="updateEdge"
            min="0.5"
            max="5"
            step="0.5"
            class="w-full accent-sky-500" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edge-style-panel {
  padding: 8px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
