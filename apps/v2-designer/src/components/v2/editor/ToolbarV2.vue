<script setup lang="ts">
/**
 * ToolbarV2 — v2 专用图元工具栏
 *
 * DnD 与 v1 完全一致：
 *  - ToolbarV2 内部 watch editorStore.graph，graph 就绪后创建 Dnd 实例
 *  - dndContainer 绑定到 Toolbar 自身根元素（与 v1 Toolbar 完全相同的做法）
 */
import { ref, computed, watch } from 'vue'
import { Dnd } from '@antv/x6'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useNotifier } from '@/composables/useNotifier'
import type { ChartConfig } from '@/data/chartConfigs'
import { chartCategories } from '@/data/chartConfigs'
import {
  Type, ArrowRight, MoveHorizontal, Image as ImageIcon,
  Square, Circle, Triangle, Minus, Database, Server, Cpu, Cloud,
  Monitor, HardDrive, Wifi, Activity, Terminal, Shield,
  AlignLeft, Hash, Search, ChevronDown, PanelLeftClose, PanelLeft,
  Star, BarChart, LineChart, PieChart, TrendingUp, ScatterChart,
  Gauge, Map, GitBranch, Filter, Grid3X3, LayoutDashboard, Sun,
  Workflow, Radar, Columns as ColumnsIcon, AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter, Box, MinusSquare,
  GripVertical, Timer, ListOrdered, Table, Calendar, Sparkles,
} from 'lucide-vue-next'

const editorStore = useEditorStoreV2()
const notifier = useNotifier()

// DnD 实例在 Toolbar 内部创建，与 v1 保持一致
const dndContainerRef = ref<HTMLElement>()
const dndRef = ref<Dnd>()

// 监听 graph 就绪后创建 Dnd 实例
// 使用 flush: 'post' 确保 DOM 已挂载
watch(() => editorStore.graph, (graph) => {
  console.log('[ToolbarV2] watch triggered:', {
    hasGraph: !!graph,
    hasContainer: !!dndContainerRef.value,
    hasDnd: !!dndRef.value
  })
  if (graph && dndContainerRef.value && !dndRef.value) {
    console.log('[ToolbarV2] Creating Dnd instance')

    const dnd = new Dnd({
      target: graph as any,
      scaled: false,
      // dndContainer: 设置为 Toolbar 容器，这样在 Toolbar 上放开鼠标不会放置节点
      // 这是正确的用法 - dndContainer 是阻止放置的区域
      dndContainer: dndContainerRef.value,
      // draggingContainer: 拖拽过程中临时节点显示的容器，默认是 document.body
      draggingContainer: document.body,
      // 交给 X6 DnD 内部根据 clientToLocal 统一计算最终落点
      getDropNode: (draggingNode: any) => draggingNode.clone(),
    })

    // 监听 Dnd 事件用于调试
    dnd.on('drop', (args: any) => {
      console.log('[ToolbarV2] Dnd drop event:', args)
    })
    dnd.on('dragend', (args: any) => {
      console.log('[ToolbarV2] Dnd dragend event:', args)
    })

    dndRef.value = dnd
    console.log('[ToolbarV2] Dnd instance created:', !!dndRef.value)
  }
}, { immediate: true, flush: 'post' })

const isCollapsed = computed(() => editorStore.isToolbarCollapsed)
const searchQuery = ref('')
const activeCategory = ref('base')

function showErrorToast(title: string, message: string) {
  notifier.error(title, message)
}

function formatDragError(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : String(error)
  const unregistered = message.match(/Node with name '([^']+)' does not exist\./)
  if (unregistered) {
    return `图元 "${unregistered[1]}" 未注册，已阻止本次拖拽。请刷新页面后重试，若仍失败请联系开发处理。`
  }
  return fallbackMessage
}

// ==================== 图元配置（与 v1 相同）====================
const commonPorts = {
  groups: {
    top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
  },
  items: [
    { id: 'port_top', group: 'top' }, { id: 'port_right', group: 'right' },
    { id: 'port_bottom', group: 'bottom' }, { id: 'port_left', group: 'left' },
  ],
}

const shapeTypes = [
  { type: 'rect', label: '矩形', icon: Square, w: 120, h: 80, stroke: '#3b82f6', rx: 0 },
  { type: 'circle', label: '圆形', icon: Circle, w: 100, h: 100, stroke: '#10b981', rx: 0 },
  { type: 'triangle', label: '三角形', icon: Triangle, w: 100, h: 100, stroke: '#f59e0b', rx: 0 },
  { type: 'trapezoid', label: '梯形', icon: MoveHorizontal, w: 120, h: 100, stroke: '#f43f5e', rx: 0 },
  { type: 'line', label: '线段', icon: Minus, w: 100, h: 2, stroke: '#94a3b8', rx: 0 },
  { type: 'text', label: '文字', icon: Type, w: 100, h: 40, stroke: 'transparent', rx: 0 },
  { type: 'custom_image', label: '图片', icon: ImageIcon, w: 100, h: 100, stroke: '#d946ef', rx: 4 },
  { type: 'progress-node', label: '进度条', icon: AlignLeft, w: 200, h: 24, stroke: '#3b82f6', rx: 0 },
  { type: 'digital-node', label: '数字看板', icon: Hash, w: 160, h: 48, stroke: '#10b981', rx: 0 },
  { type: 'arrow_single', label: '单向箭头', icon: ArrowRight, w: 120, h: 40, stroke: '#10b981', rx: 0 },
  { type: 'arrow_double', label: '双向箭头', icon: MoveHorizontal, w: 140, h: 40, stroke: '#10b981', rx: 0 },
  // 大屏容器
  { type: 'dashboard-container', label: '大屏卡片', icon: LayoutDashboard, w: 400, h: 300, stroke: '#0ea5e9', rx: 6 },
  // 边框
  { type: 'border-tech', label: '边框-科技', icon: Box, w: 300, h: 200, stroke: '#00f0ff', rx: 4 },
  { type: 'border-glow', label: '边框-发光', icon: Sparkles, w: 300, h: 200, stroke: '#ff00ff', rx: 8 },
  // 分割线
  { type: 'divider-h', label: '分割线-H', icon: AlignHorizontalJustifyCenter, w: 400, h: 2, stroke: '#00f0ff', rx: 0 },
  { type: 'divider-v', label: '分割线-V', icon: AlignVerticalJustifyCenter, w: 2, h: 200, stroke: '#00f0ff', rx: 0 },
  // 按钮
  { type: 'button-primary', label: '主要按钮', icon: Box, w: 120, h: 40, stroke: '#0066ff', rx: 6 },
  { type: 'button-default', label: '默认按钮', icon: MinusSquare, w: 120, h: 40, stroke: '#64748b', rx: 6 },
  // 表格 & 列表
  { type: 'table-basic', label: '表格', icon: Table, w: 400, h: 200, stroke: '#3b82f6', rx: 0 },
  { type: 'list-rank', label: '排行榜', icon: ListOrdered, w: 300, h: 200, stroke: '#8b5cf6', rx: 0 },
  { type: 'timeline-h', label: '时间轴-横', icon: Calendar, w: 500, h: 80, stroke: '#06b6d4', rx: 0 },
  { type: 'countdown', label: '倒计时', icon: Timer, w: 200, h: 80, stroke: '#f59e0b', rx: 0 },
  // P2 新增
  { type: 'gauge-node', label: '仪表盘', icon: Gauge, w: 200, h: 200, stroke: '#0ea5e9', rx: 0 },
  { type: 'alert-node', label: '告警闪烁', icon: Activity, w: 200, h: 100, stroke: '#ef4444', rx: 0 },
]

const iconNodes = [
  { type: 'icon-node', iconName: 'Database', label: '数据库', icon: Database, w: 48, h: 48, stroke: '#3b82f6' },
  { type: 'icon-node', iconName: 'Server', label: '服务器', icon: Server, w: 48, h: 48, stroke: '#10b981' },
  { type: 'icon-node', iconName: 'Cpu', label: '处理器', icon: Cpu, w: 48, h: 48, stroke: '#f59e0b' },
  { type: 'icon-node', iconName: 'Cloud', label: '云/虚机', icon: Cloud, w: 48, h: 48, stroke: '#0ea5e9' },
  { type: 'icon-node', iconName: 'Monitor', label: '监控大屏', icon: Monitor, w: 48, h: 48, stroke: '#8b5cf6' },
  { type: 'icon-node', iconName: 'HardDrive', label: '磁盘阵列', icon: HardDrive, w: 48, h: 48, stroke: '#64748b' },
  { type: 'icon-node', iconName: 'Wifi', label: '无线网关', icon: Wifi, w: 48, h: 48, stroke: '#14b8a6' },
  { type: 'icon-node', iconName: 'Activity', label: '探针诊断', icon: Activity, w: 48, h: 48, stroke: '#ef4444' },
  { type: 'icon-node', iconName: 'Terminal', label: '终端接驳', icon: Terminal, w: 48, h: 48, stroke: '#22c55e' },
  { type: 'icon-node', iconName: 'Shield', label: '安全网关', icon: Shield, w: 48, h: 48, stroke: '#eab308' },
]

// 流程图节点
const flowNodes = [
  { type: 'flow-start', label: '开始节点', icon: Circle, w: 120, h: 50, stroke: '#22c55e' },
  { type: 'flow-end', label: '结束节点', icon: Circle, w: 60, h: 60, stroke: '#ef4444' },
  { type: 'flow-process', label: '处理过程', icon: Square, w: 140, h: 60, stroke: '#6366f1' },
  { type: 'flow-decision', label: '判断条件', icon: GripVertical, w: 100, h: 70, stroke: '#f97316' },
]

const categoryIconMap: Record<string, unknown> = {
  'line': TrendingUp, 'area': LineChart, 'bar': BarChart, 'bar-h': BarChart,
  'pie': PieChart, 'scatter': ScatterChart, 'radar': Radar, 'graph': GitBranch,
  'gauge': Gauge, 'map': Map, 'funnel': Filter, 'heatmap': Grid3X3,
  'treemap': LayoutDashboard, 'sunburst': Sun, 'sankey': Workflow,
}

const filteredShapeTypes = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return shapeTypes
  return shapeTypes.filter(i => i.label.toLowerCase().includes(q) || i.type.toLowerCase().includes(q))
})

const filteredIconNodes = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return iconNodes
  return iconNodes.filter(i => i.label.toLowerCase().includes(q) || i.iconName.toLowerCase().includes(q))
})

const filteredFlowNodes = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return flowNodes
  return flowNodes.filter(i => i.label.toLowerCase().includes(q))
})

const filteredChartCategories = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return chartCategories
  return chartCategories.map(cat => ({
    ...cat,
    charts: cat.charts.filter(c => c.name.toLowerCase().includes(q)),
  })).filter(cat => cat.charts.length > 0)
})

// ==================== DnD 拖拽 ====================

function startDrag(e: MouseEvent, item: typeof shapeTypes[0]) {
  console.log('[ToolbarV2] startDrag called:', {
    hasGraph: !!editorStore.graph,
    hasDnd: !!dndRef.value,
    itemType: item.type
  })
  const graph = editorStore.graph
  if (!graph || !dndRef.value) {
    console.error('[ToolbarV2] startDrag failed: graph or dnd not ready')
    return
  }

  const iconName = 'iconName' in item ? item.iconName : undefined

  try {
    let node

    if (item.type === 'icon-node') {
      node = graph.createNode({
        shape: 'icon-node', width: item.w, height: item.h,
        ports: commonPorts,
        data: { iconName: iconName || 'Database', color: item.stroke },
      })
    } else if (item.type === 'progress-node') {
      node = graph.createNode({
        shape: 'progress-node', width: item.w, height: item.h,
        ports: commonPorts,
        data: { progressValue: 60, progressColor: item.stroke, progressBgColor: '#1e293b', showProgressText: true },
      })
    } else if (item.type === 'digital-node') {
      node = graph.createNode({
        shape: 'digital-node', width: item.w, height: item.h,
        ports: commonPorts,
        data: { numberValue: 8848, textColor: item.stroke, fontSize: 28, fontWeight: 'bold', animateRoll: true },
      })
    } else if (item.type === 'gauge-node') {
      node = graph.createNode({
        shape: 'gauge-node', width: item.w, height: item.h,
        ports: commonPorts,
        data: { gaugeValue: 75, gaugeMax: 100, gaugeTitle: '指标', gaugeUnit: '%', gaugeColor: item.stroke },
      })
    } else if (item.type === 'alert-node') {
      node = graph.createNode({
        shape: 'alert-node', width: item.w, height: item.h,
        ports: commonPorts,
        data: { alertText: '告警', alertSubText: '请立即处理', alertColor: item.stroke, isAlerting: true },
      })
    } else if (item.type === 'text') {
      // text 不是有效的 shape，使用 rect 并设置透明边框
      node = graph.createNode({
        shape: 'rect', width: item.w, height: item.h,
        ports: commonPorts,
        attrs: { body: { fill: 'transparent', stroke: 'transparent' }, text: { text: '文本标签', fill: '#94a3b8', fontSize: 16 } },
      })
    } else if (item.type === 'custom_image') {
      node = graph.createNode({
        shape: 'image', width: item.w, height: item.h,
        ports: commonPorts,
        attrs: {
          body: { fill: '#1e293b', stroke: item.stroke, strokeWidth: 2, strokeDasharray: '5 5', rx: item.rx, ry: item.rx },
          image: { width: item.w, height: item.h },
          label: { text: '(双击上传图片)', fill: '#94a3b8', fontSize: 11 },
        },
        data: { isCustomImage: true },
      })
    } else if (['flow-start', 'flow-end', 'flow-process', 'flow-decision'].includes(item.type)) {
      node = graph.createNode({
        shape: item.type, width: item.w, height: item.h,
        ports: commonPorts,
      })
    } else if (['border-tech', 'border-glow', 'border-gradient'].includes(item.type)) {
      node = graph.createNode({
        shape: item.type, width: item.w, height: item.h,
        data: { title: '标题' },
        attrs: { headerText: { text: '标题' } },
      })
    } else if (['divider-h', 'divider-v', 'decoration-corner', 'decoration-line'].includes(item.type)) {
      node = graph.createNode({ shape: item.type, width: item.w, height: item.h })
    } else if (['button-primary', 'button-default'].includes(item.type)) {
      node = graph.createNode({ shape: item.type, width: item.w, height: item.h, attrs: { text: { text: '按钮' } } })
    } else if (item.type === 'table-basic') {
      node = graph.createNode({
        shape: 'table-basic', width: item.w, height: item.h,
        ports: commonPorts,
        data: {
          tableTitle: '数据表格', headerData: ['列1', '列2', '列3'],
          bodyData: [['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3', 'C3']],
          headerBgColor: '#1e3a5f', headerTextColor: '#60a5fa', rowBgColor: '#0f172a',
          rowAltBgColor: '#1e293b', rowTextColor: '#94a3b8', borderColor: '#334155',
        },
      })
    } else if (item.type === 'list-rank') {
      node = graph.createNode({
        shape: 'list-rank', width: item.w, height: item.h,
        ports: commonPorts,
        data: {
          listTitle: '排名列表',
          listData: [
            { rank: 1, name: '项目 A', value: 100 },
            { rank: 2, name: '项目 B', value: 90 },
            { rank: 3, name: '项目 C', value: 80 },
          ],
          headerBgColor: '#1e3a5f', headerTextColor: '#60a5fa',
          rowBgColor: '#0f172a', rowAltBgColor: '#1e293b', rowTextColor: '#94a3b8',
        },
      })
    } else if (item.type === 'countdown') {
      node = graph.createNode({
        shape: 'countdown', width: item.w, height: item.h,
        ports: commonPorts,
        data: { countdownValue: 60, countdownColor: item.stroke, bgColor: '#1e293b', isRunning: true },
      })
    } else if (item.type === 'circle') {
      node = graph.createNode({
        shape: 'circle', width: item.w, height: item.h, ports: commonPorts,
        attrs: { body: { fill: '#1e293b', stroke: item.stroke, strokeWidth: 2 }, text: { text: item.label, fill: '#e2e8f0', fontSize: 12 } },
      })
    } else if (item.type === 'triangle' || item.type === 'trapezoid') {
      const pointsStr = item.type === 'triangle'
        ? `${item.w / 2},0 ${item.w},${item.h} 0,${item.h}`
        : `${item.w * 0.2},0 ${item.w * 0.8},0 ${item.w},${item.h} 0,${item.h}`
      node = graph.createNode({
        shape: 'polygon', width: item.w, height: item.h, ports: commonPorts,
        attrs: { body: { fill: '#1e293b', stroke: item.stroke, strokeWidth: 2, refPoints: pointsStr } },
      })
    } else if (item.type === 'line') {
      node = graph.createNode({
        shape: 'rect', width: item.w, height: 3, ports: commonPorts,
        attrs: { body: { fill: item.stroke, stroke: item.stroke, strokeWidth: 0, rx: 2 } },
      })
    } else if (item.type === 'arrow_single' || item.type === 'arrow_double') {
      const { w, h } = item
      const ah = Math.round(h / 3), aw = Math.round(h * 0.45)
      const pathData = item.type === 'arrow_single'
        ? `M 0,${h / 2 - ah / 2} L ${w - aw},${h / 2 - ah / 2} L ${w - aw},0 L ${w},${h / 2} L ${w - aw},${h} L ${w - aw},${h / 2 + ah / 2} L 0,${h / 2 + ah / 2} Z`
        : `M ${aw},${h / 2 - ah / 2} L ${w - aw},${h / 2 - ah / 2} L ${w - aw},0 L ${w},${h / 2} L ${w - aw},${h} L ${w - aw},${h / 2 + ah / 2} L ${aw},${h / 2 + ah / 2} L ${aw},${h} L 0,${h / 2} L ${aw},0 Z`
      node = graph.createNode({
        shape: 'path', width: item.w, height: item.h, ports: commonPorts,
        path: pathData,
        attrs: { body: { fill: '#22c55e', stroke: '#000000', strokeWidth: 1 } },
      })
    } else {
      node = graph.createNode({
        shape: 'rect', width: item.w, height: item.h, ports: commonPorts,
        attrs: {
          body: { fill: '#1e293b', stroke: item.stroke, strokeWidth: 2, rx: item.rx, ry: item.rx },
          text: { text: item.label, fill: '#e2e8f0', fontSize: 13, fontWeight: 'bold' },
        },
      })
    }

    console.log('[ToolbarV2] Calling dnd.start:', { node: !!node, event: !!e })
    dndRef.value.start(node, e)
    console.log('[ToolbarV2] dnd.start called')
  } catch (error) {
    console.error('[ToolbarV2] startDrag error:', error)
    showErrorToast(
      '图元拖拽失败',
      formatDragError(error, `“${item.label}” 创建失败，请刷新页面后重试。`),
    )
  }
}

function startChartDrag(e: MouseEvent, chart: ChartConfig) {
  const graph = editorStore.graph
  if (!graph || !dndRef.value) {
    console.error('[ToolbarV2] 图表拖拽失败: graph 或 dnd 未就绪')
    return
  }

  try {
    const node = graph.createNode({
      shape: 'chart-node', width: chart.width, height: chart.height,
      ports: commonPorts,
      data: { chartId: chart.id, chartOption: JSON.parse(JSON.stringify(chart.option)) },
      attrs: { body: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0 } },
    })

    dndRef.value.start(node, e)
  } catch (error) {
    console.error('[ToolbarV2] startChartDrag error:', error)
    showErrorToast(
      '图表拖拽失败',
      formatDragError(error, `图表“${chart.name}”创建失败，请刷新页面后重试。`),
    )
  }
}

const openChartCategories = ref<Record<string, boolean>>({
  line: true, area: true, bar: true, 'bar-h': true, pie: true,
  scatter: true, radar: true, graph: true, gauge: true, map: true,
  funnel: true, heatmap: true, treemap: true, sunburst: true, sankey: true,
})

// 收藏功能（从旧 editorStore 迁移，此处简单用 ref 实现）
const favorites = ref<string[]>([])
const getItemKey = (item: any) => item.iconName ? `${item.type}:${item.iconName}` : item.type
const isFavorite = (item: any) => favorites.value.includes(getItemKey(item))
const toggleFavorite = (e: MouseEvent, item: any) => {
  e.stopPropagation()
  const key = getItemKey(item)
  const idx = favorites.value.indexOf(key)
  if (idx >= 0) favorites.value.splice(idx, 1)
  else favorites.value.push(key)
}

void ColumnsIcon
</script>

<template>
  <div ref="dndContainerRef" class="toolbar-v2" :class="isCollapsed ? 'toolbar-collapsed' : 'toolbar-expanded'">
    <!-- ===== 折叠模式 ===== -->
    <template v-if="isCollapsed">
      <div class="collapse-header">
        <button class="collapse-btn" @click="editorStore.toggleToolbar()" title="展开图元库">
          <PanelLeft class="w-5 h-5" />
        </button>
      </div>
      <div class="collapsed-list">
        <div v-for="item in shapeTypes.slice(0, 16)" :key="item.type" class="collapsed-item"
          @mousedown="startDrag($event, item)" :title="item.label">
          <component :is="item.icon" class="w-5 h-5"
            :style="{ color: item.stroke !== 'transparent' ? item.stroke : '#94a3b8' }" />
        </div>
      </div>
    </template>

    <!-- ===== 展开模式 ===== -->
    <template v-else>
      <!-- 顶部 Header -->
      <div class="toolbar-header">
        <span class="toolbar-title">图元库</span>
        <button class="collapse-btn" @click="editorStore.toggleToolbar()" title="折叠">
          <PanelLeftClose class="w-4 h-4" />
        </button>
      </div>

      <!-- 搜索 -->
      <div class="search-bar">
        <Search class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="搜索图元名称…" class="search-input" />
      </div>

      <!-- 主内容：左侧分类 + 右侧图元 -->
      <div class="toolbar-body">
        <!-- 左侧分类标签 -->
        <nav class="category-nav">
          <button v-for="cat in [
            { key: 'base', label: '基础', icon: Square, color: '#38bdf8' },
            { key: 'icons', label: '架构', icon: Database, color: '#818cf8' },
            { key: 'charts', label: '图表', icon: BarChart, color: '#a78bfa' },
            { key: 'flow', label: '流程', icon: GitBranch, color: '#34d399' },
          ]" :key="cat.key" class="cat-btn" :class="{ active: activeCategory === cat.key }"
            :style="activeCategory === cat.key ? { '--cat-color': cat.color } : {}" @click="activeCategory = cat.key">
            <component :is="cat.icon" class="w-4 h-4" />
            <span>{{ cat.label }}</span>
          </button>
        </nav>

        <!-- 右侧图元网格 -->
        <div class="items-panel">

          <!-- 基础图元 -->
          <template v-if="activeCategory === 'base'">
            <p class="group-label">基础图元 & 大屏组件</p>
            <div class="items-grid">
              <div v-for="item in filteredShapeTypes" :key="item.type" class="item-card"
                @mousedown="startDrag($event, item)">
                <component :is="item.icon" class="item-icon"
                  :style="{ color: item.stroke !== 'transparent' ? item.stroke : '#94a3b8' }" />
                <span class="item-label">{{ item.label }}</span>
                <button class="fav-btn" :class="{ 'is-fav': isFavorite(item) }" @click="toggleFavorite($event, item)">
                  <Star class="w-2.5 h-2.5" :fill="isFavorite(item) ? 'currentColor' : 'none'" />
                </button>
              </div>
            </div>

            <p class="group-label mt-4">常用组合</p>
            <div class="items-grid">
              <div v-for="item in shapeTypes.slice(5, 7)" :key="item.type" class="item-card"
                @mousedown="startDrag($event, item)">
                <component :is="item.icon" class="item-icon" style="color: #94a3b8" />
                <span class="item-label">{{ item.label }}</span>
              </div>
            </div>
          </template>

          <!-- 架构图标 -->
          <template v-if="activeCategory === 'icons'">
            <p class="group-label">通用架构图标</p>
            <div class="items-grid">
              <div v-for="item in filteredIconNodes" :key="item.iconName" class="item-card"
                @mousedown="startDrag($event, item as any)">
                <component :is="item.icon" class="item-icon" :style="{ color: item.stroke }" />
                <span class="item-label">{{ item.label }}</span>
              </div>
            </div>
          </template>

          <!-- 图表 -->
          <template v-if="activeCategory === 'charts'">
            <template v-for="cat in filteredChartCategories" :key="cat.id">
              <div class="chart-category-header" @click="openChartCategories[cat.id] = !openChartCategories[cat.id]">
                <component :is="categoryIconMap[cat.id] || BarChart" class="w-3.5 h-3.5 text-violet-400" />
                <span>{{ cat.name }}</span>
                <ChevronDown class="w-3 h-3 ml-auto transition-transform"
                  :class="openChartCategories[cat.id] ? 'rotate-180' : ''" />
              </div>
              <div v-if="openChartCategories[cat.id]" class="items-grid">
                <div v-for="chart in cat.charts" :key="chart.id" class="item-card"
                  @mousedown="startChartDrag($event, chart)">
                  <component :is="categoryIconMap[cat.id] || BarChart" class="item-icon text-violet-400" />
                  <span class="item-label">{{ chart.name }}</span>
                </div>
              </div>
            </template>
          </template>

          <!-- 流程图 -->
          <template v-if="activeCategory === 'flow'">
            <p class="group-label">流程图节点</p>
            <div class="items-grid">
              <div v-for="item in filteredFlowNodes" :key="item.type" class="item-card"
                @mousedown="startDrag($event, item as any)">
                <component :is="item.icon" class="item-icon" :style="{ color: item.stroke }" />
                <span class="item-label">{{ item.label }}</span>
              </div>
            </div>
          </template>
        </div> <!-- end items-panel -->
      </div> <!-- end toolbar-body -->
    </template> <!-- end 展开模式 -->
  </div> <!-- end toolbar-v2 -->
</template>

<style scoped>
.toolbar-v2 {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(2, 6, 23, 0.7);
  /* 半透明呈现毛玻璃 */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid var(--color-border-secondary);
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.2);
}

.toolbar-collapsed {
  width: 56px;
}

.toolbar-expanded {
  width: 260px;
}

/* 折叠模式 */
.collapse-header {
  padding: 12px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid rgba(51, 65, 85, 0.4);
}

.collapsed-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.collapsed-item {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(51, 65, 85, 0.4);
  background: rgba(30, 41, 59, 0.5);
  cursor: grab;
  transition: all 0.15s;
}

.collapsed-item:hover {
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.3);
  transform: translateX(2px);
}

/* 展开模式顶部 */
.toolbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.4);
  flex-shrink: 0;
}

.toolbar-title {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.collapse-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.collapse-btn:hover {
  background: rgba(51, 65, 85, 0.5);
  color: #94a3b8;
}

/* 搜索栏 */
.search-bar {
  position: relative;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.3);
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  width: 13px;
  height: 13px;
  color: #475569;
}

.search-input {
  width: 100%;
  padding: 6px 10px 6px 28px;
  background: rgba(15, 23, 42, 0.5);
  /* 沉浸式输入底色 */
  border: 1px solid var(--color-border-secondary);
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-text-primary);
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:focus {
  border-color: rgba(34, 197, 94, 0.5);
  /* 聚集焦点：翠绿色微光 */
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
}

/* 主体布局 */
.toolbar-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧分类导航 */
.category-nav {
  width: 52px;
  flex-shrink: 0;
  background: rgba(2, 6, 23, 0.6);
  border-right: 1px solid rgba(51, 65, 85, 0.3);
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  overflow-y: auto;
  gap: 2px;
}

.cat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  font-size: 9px;
  font-weight: 600;
  color: #475569;
  border: none;
  background: transparent;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.15s;
  letter-spacing: 0.02em;
}

.cat-btn:hover {
  color: #94a3b8;
  background: rgba(51, 65, 85, 0.2);
}

.cat-btn.active {
  color: var(--cat-color, #38bdf8);
  background: rgba(56, 189, 248, 0.08);
  border-left-color: var(--cat-color, #38bdf8);
}

/* 右侧图元面板 */
.items-panel {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
}

.items-panel::-webkit-scrollbar {
  width: 4px;
}

.items-panel::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
}

.group-label {
  font-size: 10px;
  font-weight: 600;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 8px 2px;
}

/* 图元网格 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
}

.item-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 8px;
  border: 1px solid var(--color-border-secondary);
  background: rgba(15, 23, 42, 0.4);
  /* 透明度增加，毛玻璃穿透 */
  backdrop-filter: blur(4px);
  cursor: grab;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-card:hover {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.05);
  /* 用户指南指导的翡翠色强调 */
  transform: translateY(-2px) scale(1.02);
  /* Bento Grid 微动反馈 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(34, 197, 94, 0.05);
}

.item-card:active {
  cursor: grabbing;
  transform: scale(0.96);
}

.item-icon {
  width: 20px;
  height: 20px;
}

.item-label {
  font-size: 9px;
  color: #64748b;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  padding: 0 2px;
}

.item-card:hover .item-label {
  color: #94a3b8;
}

/* 收藏按钮 */
.fav-btn {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #334155;
  opacity: 0;
  transition: all 0.15s;
  border-radius: 3px;
}

.item-card:hover .fav-btn {
  opacity: 1;
}

.fav-btn:hover {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.fav-btn.is-fav {
  opacity: 1;
  color: #fbbf24;
}

/* 图表分类 */
.chart-category-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  margin-bottom: 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.chart-category-header:hover {
  background: rgba(51, 65, 85, 0.3);
  color: #94a3b8;
}

</style>
