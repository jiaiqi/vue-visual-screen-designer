<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Dnd } from '@antv/x6-plugin-dnd'
import { useEditorStore } from '@/stores/editor'
import { Type, ArrowRight, MoveHorizontal, Image as ImageIcon, Square, Circle, Triangle, Minus, Database, Server, Cpu, Cloud, Monitor, HardDrive, Wifi, Activity, Terminal, Shield, AlignLeft, Hash, Search, ChevronDown } from 'lucide-vue-next'

const dndContainer = ref<HTMLElement>()
const editorStore = useEditorStore()
const dndRef = ref<Dnd>()

// 端口通用配置
const commonPorts = {
  groups: {
    top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
  },
  items: [
    { id: 'port_top', group: 'top' },
    { id: 'port_right', group: 'right' },
    { id: 'port_bottom', group: 'bottom' },
    { id: 'port_left', group: 'left' },
  ],
}

// 定义基础图元组件映射表
const shapeTypes = [
  { type: 'rect', label: '矩形', icon: Square, w: 120, h: 80, stroke: '#3b82f6', rx: 0 },
  { type: 'circle', label: '圆形', icon: Circle, w: 100, h: 100, stroke: '#10b981', rx: 0 },
  { type: 'triangle', label: '三角形', icon: Triangle, w: 100, h: 100, stroke: '#f59e0b', rx: 0 },
  { type: 'trapezoid', label: '梯形', icon: MoveHorizontal, w: 120, h: 100, stroke: '#f43f5e', rx: 0 }, // 暂借 Icon
  { type: 'line', label: '线段/连接', icon: Minus, w: 100, h: 2, stroke: '#94a3b8', rx: 0 },
  { type: 'text', label: '文字', icon: Type, w: 100, h: 40, stroke: 'transparent', rx: 0 },
  { type: 'custom_image', label: '自定义图形', icon: ImageIcon, w: 100, h: 100, stroke: '#d946ef', rx: 4 },
  { type: 'progress-node', label: '进度条', icon: AlignLeft, w: 200, h: 24, stroke: '#3b82f6', rx: 0 },
  { type: 'digital-node', label: '数字看板', icon: Hash, w: 160, h: 48, stroke: '#10b981', rx: 0 },
  { type: 'arrow_single', label: '单向箭头', icon: ArrowRight, w: 120, h: 40, stroke: '#10b981', rx: 0 },
  { type: 'arrow_double', label: '双向箭头', icon: MoveHorizontal, w: 140, h: 40, stroke: '#10b981', rx: 0 },
]

// 常用的网络拓扑和工控隐喻的 Lucide 图标集
const iconNodes = [
  { type: 'icon-node', iconName: 'Database', label: '数据库', icon: Database, w: 48, h: 48, stroke: '#3b82f6', rx: 0 },
  { type: 'icon-node', iconName: 'Server', label: '服务器', icon: Server, w: 48, h: 48, stroke: '#10b981', rx: 0 },
  { type: 'icon-node', iconName: 'Cpu', label: '处理器', icon: Cpu, w: 48, h: 48, stroke: '#f59e0b', rx: 0 },
  { type: 'icon-node', iconName: 'Cloud', label: '虚机/云', icon: Cloud, w: 48, h: 48, stroke: '#0ea5e9', rx: 0 },
  { type: 'icon-node', iconName: 'Monitor', label: '监控大屏', icon: Monitor, w: 48, h: 48, stroke: '#8b5cf6', rx: 0 },
  { type: 'icon-node', iconName: 'HardDrive', label: '磁盘阵列', icon: HardDrive, w: 48, h: 48, stroke: '#64748b', rx: 0 },
  { type: 'icon-node', iconName: 'Wifi', label: '无线网关', icon: Wifi, w: 48, h: 48, stroke: '#14b8a6', rx: 0 },
  { type: 'icon-node', iconName: 'Activity', label: '探针诊断', icon: Activity, w: 48, h: 48, stroke: '#ef4444', rx: 0 },
  { type: 'icon-node', iconName: 'Terminal', label: '终端接驳', icon: Terminal, w: 48, h: 48, stroke: '#22c55e', rx: 0 },
  { type: 'icon-node', iconName: 'Shield', label: '安全网关', icon: Shield, w: 48, h: 48, stroke: '#eab308', rx: 0 },
]

// 初始化 Dnd
watch(() => editorStore.graph, (graph) => {
  if (graph && dndContainer.value && !dndRef.value) {
    dndRef.value = new Dnd({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target: graph as any,
      scaled: false,
      dndContainer: dndContainer.value,
    })
  }
}, { immediate: true })

// 设置分类开关折叠状态
const openGroups = ref<Record<string, boolean>>({
  base: true,
  icons: true,
  advanced: true
})

const toggleGroup = (key: string) => {
  openGroups.value[key] = !openGroups.value[key]
}

const searchQuery = ref('')

// 过滤后的类别
const filteredShapeTypes = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return shapeTypes
  return shapeTypes.filter(item => item.label.toLowerCase().includes(query))
})

const filteredIconNodes = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return iconNodes
  return iconNodes.filter(item =>
    item.label.toLowerCase().includes(query) ||
    item.iconName.toLowerCase().includes(query)
  )
})

// 拖拽挂载
const startDrag = (e: MouseEvent, item: typeof shapeTypes[0]) => {
  const graph = editorStore.graph
  if (!graph || !dndRef.value) return

  let node

  if (item.type === 'icon-node') {
    node = graph.createNode({
      shape: 'icon-node',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        iconName: (item as any).iconName || 'Image',
        color: item.stroke,
      },
    })
  } else if (item.type === 'progress-node') {
    node = graph.createNode({
      shape: 'progress-node',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      data: {
        progressValue: 50,
        progressColor: item.stroke,
        progressBgColor: '#1e293b',
        showProgressText: true,
      },
      attrs: {
        body: {
          fill: '#1e293b',
          stroke: item.stroke,
          strokeWidth: 1,
        }
      }
    })
  } else if (item.type === 'digital-node') {
    node = graph.createNode({
      shape: 'digital-node',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      data: {
        numberValue: 8848.0,
        numberFormat: 'none',
        decimalPlaces: 0,
        useGrouping: true,
        animateRoll: true,
        textColor: item.stroke,
        fontSize: 32,
        fontWeight: 'bold',
      },
      attrs: {
        body: {
          fill: 'transparent',
          stroke: 'transparent',
        },
        text: {
          fill: item.stroke,
          fontSize: 32,
        }
      }
    })
  } else if (item.type === 'text') {
    node = graph.createNode({
      shape: 'text',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      attrs: {
        body: { fill: 'transparent', stroke: 'transparent' },
        text: { text: '文本标签', fill: '#94a3b8', fontSize: 16 }
      }
    })
  } else if (item.type === 'custom_image') {
    node = graph.createNode({
      shape: 'image',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      // 默认给张占位图
      imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v10h14V7H5zm2 2h2v2H7V9zm0 4h10v2H7v-2z"/></svg>',
      attrs: {
        body: {
          fill: '#1e293b',
          stroke: item.stroke,
          strokeWidth: 2,
          strokeDasharray: '5 5', // 虚线边框代表可替换
          rx: item.rx, ry: item.rx
        },
        image: {
          width: item.w,
          height: item.h,
        },
        label: { text: '(双击可上传图片)', fill: '#94a3b8', fontSize: 11, refY: '100%', refY2: 10 }
      },
      data: { isCustomImage: true }
    })
  } else if (item.type === 'arrow_single' || item.type === 'arrow_double') {
    // 根据用户提供的绿色工业箭头定制 Path 数据
    const w = item.w
    const h = Math.round(item.h)
    const ah = Math.round(h / 3) // 箭柱部分宽度
    const aw = Math.round(h * 0.45) // 箭头尖锐部分横向长度

    let pathData = ''
    if (item.type === 'arrow_single') {
      // 向右的单向箭头
      pathData = `M 0,${h / 2 - ah / 2} L ${w - aw},${h / 2 - ah / 2} L ${w - aw},0 L ${w},${h / 2} L ${w - aw},${h} L ${w - aw},${h / 2 + ah / 2} L 0,${h / 2 + ah / 2} Z`
    } else {
      // 双向箭头
      pathData = `M ${aw},${h / 2 - ah / 2} L ${w - aw},${h / 2 - ah / 2} L ${w - aw},0 L ${w},${h / 2} L ${w - aw},${h} L ${w - aw},${h / 2 + ah / 2} L ${aw},${h / 2 + ah / 2} L ${aw},${h} L 0,${h / 2} L ${aw},0 Z`
    }

    node = graph.createNode({
      shape: 'path',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      path: pathData,
      attrs: {
        body: {
          fill: '#00ff00',      // 刺眼的工业绿
          stroke: '#000000',    // 强烈的黑边包围
          strokeWidth: 1.5,
          filter: { name: 'dropShadow', args: { dx: 1, dy: 3, blur: 5, color: 'rgba(0,0,0,0.5)' } }
        }
      }
    })
  } else if (item.type === 'circle') {
    node = graph.createNode({
      shape: 'circle',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      attrs: {
        body: {
          fill: '#1e293b',
          stroke: item.stroke,
          strokeWidth: 2,
          filter: { name: 'dropShadow', args: { dx: 0, dy: 4, blur: 15, color: item.stroke.replace(')', ',0.2)').replace('rgb', 'rgba') } }
        },
        text: { text: item.label, fill: '#e2e8f0', fontSize: 13, fontWeight: 'bold' }
      }
    })
  } else if (item.type === 'triangle' || item.type === 'trapezoid') {
    let pointsStr = ''
    if (item.type === 'triangle') {
      pointsStr = `${item.w / 2},0 ${item.w},${item.h} 0,${item.h}`
    } else {
      // 梯形: 上小下大
      pointsStr = `${item.w * 0.2},0 ${item.w * 0.8},0 ${item.w},${item.h} 0,${item.h}`
    }
    node = graph.createNode({
      shape: 'polygon',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      attrs: {
        body: {
          fill: '#1e293b',
          stroke: item.stroke,
          strokeWidth: 2,
          refPoints: pointsStr,
          filter: { name: 'dropShadow', args: { dx: 0, dy: 4, blur: 15, color: item.stroke.replace(')', ',0.2)').replace('rgb', 'rgba') } }
        },
        text: { text: item.label, fill: '#e2e8f0', fontSize: 13, fontWeight: 'bold' }
      }
    })
  } else if (item.type === 'line') {
    // 基础独立线段（两端无强制吸附），拖拽时作为一个 node 伪装也可，但在 X6 Dnd 里不支持直接拖拽 Edge
    // 为此我们可以生成一个带非常窄高度的不可见矩形壳子，内置一条样式线段，或者是只提供首尾端口的两点容器
    // 这里最直接合理的作为几何图形的是创建一个高度只有 2px 的 rect 来当作线条。
    node = graph.createNode({
      shape: 'rect',
      width: item.w,
      height: item.h > 4 ? item.h : 4,
      ports: commonPorts,
      attrs: {
        body: {
          fill: item.stroke,
          stroke: item.stroke,
          strokeWidth: 0,
          rx: item.h / 2, ry: item.h / 2
        }
      }
    })
  } else {
    // 保底回退为基础矩形 (包含 'rect')
    node = graph.createNode({
      shape: 'rect',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      attrs: {
        body: {
          fill: '#1e293b',    // Slate 800 基底
          stroke: item.stroke,
          strokeWidth: 2,
          rx: item.rx,
          ry: item.rx,
          filter: { name: 'dropShadow', args: { dx: 0, dy: 4, blur: 15, color: item.stroke.replace(')', ',0.2)').replace('rgb', 'rgba') } }
        },
        text: { text: item.label, fill: '#e2e8f0', fontSize: 13, fontWeight: 'bold' }
      }
    })
  }

  // 开始将其挂载至原生外层 Drag
  dndRef.value.start(node, e)
}
</script>

<template>
  <div
    class="w-[280px] h-full bg-[#141824] border-r border-[#2a3045] flex flex-col shrink-0 z-20 shadow-xl overflow-hidden"
    ref="dndContainer">
    <!-- Vue 原生面板头部 -->
    <div
      class="px-4 py-3 text-sm font-semibold text-slate-400 uppercase tracking-widest border-b border-[#2a3045] flex items-center justify-between shrink-0">
      <span>基础图元</span>
    </div>

    <!-- 搜索区悬浮 -->
    <div class="p-3 bg-[#1a1f2e] border-b border-[#2a3045] shrink-0">
      <div class="relative w-full">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <component :is="Search" class="h-4 w-4 text-slate-500" />
        </div>
        <input type="text" v-model="searchQuery" placeholder="搜索图元名称..."
          class="block w-full pl-9 pr-3 py-1.5 border border-[#2a3045] rounded-md text-xs bg-[#141824] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors" />
      </div>
    </div>

    <!-- 面板内容滚动区 -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">

      <!-- === 分类一：基础控制体 === -->
      <div class="border-b border-[#2a3045] pb-2">
        <div class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1e2640] transition-colors"
          @click="toggleGroup('base')">
          <span class="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">基础控制体</span>
          <component :is="ChevronDown" class="w-4 h-4 text-slate-500 transition-transform duration-200"
            :class="{ '-rotate-90': !openGroups['base'] }" />
        </div>

        <div v-show="openGroups['base'] && filteredShapeTypes.length > 0" class="px-3 pb-2 grid grid-cols-2 gap-3">
          <template v-for="item in filteredShapeTypes" :key="item.type">
            <div
              class="flex flex-col items-center justify-center p-4 rounded-lg bg-[#1a1f2e] border border-[#2a3045] cursor-grab hover:-translate-y-0.5 hover:border-sky-500 hover:bg-[#1e2640] transition-all"
              @mousedown="startDrag($event, item)">
              <component :is="item.icon" class="w-6 h-6 mb-2"
                :style="{ color: item.stroke !== 'transparent' ? item.stroke : '#94a3b8' }" />
              <span class="text-xs text-slate-300 font-medium">{{ item.label }}</span>
            </div>
          </template>
        </div>
        <div v-show="openGroups['base'] && filteredShapeTypes.length === 0"
          class="px-4 py-2 text-xs text-slate-500 text-center">
          未找到对应基础图元
        </div>
      </div>

      <!-- === 分类二：通用架构与标志 === -->
      <div class="border-b border-[#2a3045] pb-2">
        <div class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1e2640] transition-colors"
          @click="toggleGroup('icons')">
          <span class="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">通用架构图标图元</span>
          <component :is="ChevronDown" class="w-4 h-4 text-slate-500 transition-transform duration-200"
            :class="{ '-rotate-90': !openGroups['icons'] }" />
        </div>

        <div v-show="openGroups['icons'] && filteredIconNodes.length > 0" class="px-3 pb-2 grid grid-cols-2 gap-3">
          <template v-for="item in filteredIconNodes" :key="item.iconName">
            <div
              class="flex flex-col items-center justify-center p-3 rounded-lg bg-[#1a1f2e] border border-[#2a3045] cursor-grab hover:-translate-y-0.5 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group"
              @mousedown="startDrag($event, item as any)">
              <component :is="item.icon" class="w-7 h-7 mb-1.5 transition-transform group-hover:scale-110"
                :style="{ color: item.stroke }" />
              <span class="text-[11px] text-slate-400 font-medium">{{ item.label }}</span>
            </div>
          </template>
        </div>
        <div v-show="openGroups['icons'] && filteredIconNodes.length === 0"
          class="px-4 py-2 text-xs text-slate-500 text-center">
          未找到相关架构图标 (支持搜英文如: Server)
        </div>
      </div>

      <!-- === 分类三：复杂设备及管线 === -->
      <div class="pb-4">
        <div class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1e2640] transition-colors"
          @click="toggleGroup('advanced')">
          <span class="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">复杂设备及管线</span>
          <component :is="ChevronDown" class="w-4 h-4 text-slate-500 transition-transform duration-200"
            :class="{ '-rotate-90': !openGroups['advanced'] }" />
        </div>

        <div v-show="openGroups['advanced']" class="px-3">
          <div class="text-xs text-slate-600 bg-slate-900/50 rounded p-3 border border-slate-800/50">
            已集成在上方搜索大类中，更多定制组件开发中...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 针对于滚动区的定制外观 */
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
