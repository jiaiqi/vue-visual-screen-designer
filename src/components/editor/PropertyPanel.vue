<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { Cell, Edge, Node } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'

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
  flowSpeed: 1, // 动画周期 (s)
  flowReverse: false, // 动画反向
})

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
  }
}

function handleUpdate(key: keyof typeof formData.value, value: string | number | boolean) {
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
    case 'edgeShape':
      if (cell.isEdge()) {
        const edge = cell as Edge
        const graph = editorStore.graph
        if (!graph) return
        const newEdge = graph.createEdge({
          shape: value as string,
          source: edge.getSource(),
          target: edge.getTarget(),
          vertices: edge.getVertices(),
          router: edge.getRouter(),
        })
        graph.addEdge(newEdge)
        graph.removeCell(edge)
        graph.select(newEdge)
      }
      break
    case 'flowSpeed':
    case 'flowReverse':
      if (cell.isEdge() && cell.shape === 'fluid-pipe') {
        const speed = key === 'flowSpeed' ? Number(value) : formData.value.flowSpeed
        const reverse = key === 'flowReverse' ? Boolean(value) : formData.value.flowReverse
        const animationStr = speed > 0
          ? `dash-flow ${speed}s linear infinite ${reverse ? 'reverse' : 'normal'}`
          : 'none'
        cell.attr('fluid/style/animation', animationStr)
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
</script>

<template>
  <div class="h-full bg-slate-900 border-l border-slate-800 flex flex-col text-slate-300">
    <div class="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-950/50">
      <div class="w-1 h-3 bg-sky-500 rounded-full"></div>
      <h3 class="text-xs font-bold text-slate-200 tracking-widest uppercase">参数面板</h3>
    </div>

    <div v-if="activeCell" class="p-4 space-y-6 overflow-y-auto custom-scrollbar">

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

      <!-- 样式外观 -->
      <section class="space-y-3" v-if="activeCell.isNode()">
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
      <section class="space-y-3" v-if="activeCell.isNode()">
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

      <!-- 专门针对连线的设置 -->
      <section class="space-y-3 pt-4 border-t border-slate-800" v-if="activeCell?.isEdge()">
        <label class="text-[10px] font-extrabold text-sky-500 uppercase tracking-widest">连线高级设置</label>
        <div class="space-y-3">
          <div class="flex flex-col gap-1.5">
            <span class="text-[9px] font-bold text-slate-400">切换链路类型</span>
            <select v-model="formData.edgeShape"
              @change="e => handleUpdate('edgeShape', (e.target as HTMLSelectElement).value)"
              class="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-sky-500">
              <option value="edge">普通实心连线 (Normal Solid Line)</option>
              <option value="fluid-pipe">工业流体管道 (Fluid Pipe Animation)</option>
            </select>
            <p class="text-[10px] text-slate-500 mt-1 leading-tight">注：切换路径模式将会重新描绘该连接段。</p>
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

    <div v-else class="flex-1 flex flex-col items-center justify-center opacity-30 select-none">
      <div class="w-16 h-16 border-2 border-dashed border-slate-500 rounded-lg mb-3"></div>
      <p class="text-xs text-slate-400">未选中任何图元对象</p>
    </div>
  </div>
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