<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Dnd } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import { Type, ArrowRight, MoveHorizontal, Image as ImageIcon, Square, Circle, Triangle, Minus, Database, Server, Cpu, Cloud, Monitor, HardDrive, Wifi, Activity, Terminal, Shield, AlignLeft, Hash, Search, ChevronDown, PanelLeftClose, PanelLeft, Star, BarChart, LineChart, PieChart, TrendingUp, ScatterChart, Gauge, Map, GitBranch, Filter, Grid3X3, LayoutDashboard, Sun, Workflow, Radar, Columns, AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter, ArrowDownToLine, Box, MinusSquare, GripVertical, Timer, ListOrdered, Table, Calendar, Sparkles } from 'lucide-vue-next'
import { chartCategories, type ChartConfig } from '@/data/chartConfigs'

const dndContainer = ref<HTMLElement>()
const editorStore = useEditorStore()
const dndRef = ref<Dnd>()

const isCollapsed = computed(() => editorStore.isToolbarCollapsed)

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

const shapeTypes = [
  { type: 'rect', label: '矩形', icon: Square, w: 120, h: 80, stroke: '#3b82f6', rx: 0 },
  { type: 'circle', label: '圆形', icon: Circle, w: 100, h: 100, stroke: '#10b981', rx: 0 },
  { type: 'triangle', label: '三角形', icon: Triangle, w: 100, h: 100, stroke: '#f59e0b', rx: 0 },
  { type: 'trapezoid', label: '梯形', icon: MoveHorizontal, w: 120, h: 100, stroke: '#f43f5e', rx: 0 },
  { type: 'line', label: '线段/连接', icon: Minus, w: 100, h: 2, stroke: '#94a3b8', rx: 0 },
  { type: 'text', label: '文字', icon: Type, w: 100, h: 40, stroke: 'transparent', rx: 0 },
  { type: 'custom_image', label: '自定义图形', icon: ImageIcon, w: 100, h: 100, stroke: '#d946ef', rx: 4 },
  { type: 'progress-node', label: '进度条', icon: AlignLeft, w: 200, h: 24, stroke: '#3b82f6', rx: 0 },
  { type: 'digital-node', label: '数字看板', icon: Hash, w: 160, h: 48, stroke: '#10b981', rx: 0 },
  { type: 'arrow_single', label: '单向箭头', icon: ArrowRight, w: 120, h: 40, stroke: '#10b981', rx: 0 },
  { type: 'arrow_double', label: '双向箭头', icon: MoveHorizontal, w: 140, h: 40, stroke: '#10b981', rx: 0 },
  // 大屏卡片容器
  { type: 'dashboard-container', label: '大屏卡片', icon: LayoutDashboard, w: 400, h: 300, stroke: '#0ea5e9', rx: 6 },
  // 边框组件
  { type: 'border-tech', label: '边框-科技', icon: Box, w: 300, h: 200, stroke: '#00f0ff', rx: 4 },
  { type: 'border-glow', label: '边框-发光', icon: Sparkles, w: 300, h: 200, stroke: '#ff00ff', rx: 8 },
  { type: 'border-gradient', label: '边框-渐变', icon: GripVertical, w: 300, h: 200, stroke: '#ff6b6b', rx: 6 },
  // 分割线
  { type: 'divider-h', label: '分割线-水平', icon: AlignHorizontalJustifyCenter, w: 400, h: 2, stroke: '#00f0ff', rx: 0 },
  { type: 'divider-v', label: '分割线-垂直', icon: AlignVerticalJustifyCenter, w: 2, h: 200, stroke: '#00f0ff', rx: 0 },
  // 装饰元素
  { type: 'decoration-corner', label: '装饰-角标', icon: MinusSquare, w: 60, h: 60, stroke: '#00f0ff', rx: 0 },
  { type: 'decoration-line', label: '装饰-动线', icon: ArrowDownToLine, w: 200, h: 4, stroke: '#00f0ff', rx: 0 },
  // 按钮
  { type: 'button-primary', label: '按钮-主要', icon: Box, w: 120, h: 40, stroke: '#0066ff', rx: 6 },
  { type: 'button-default', label: '按钮-默认', icon: Box, w: 120, h: 40, stroke: '#64748b', rx: 6 },
  // 标签
  { type: 'tag-status', label: '标签-状态', icon: Filter, w: 80, h: 28, stroke: '#10b981', rx: 14 },
  // 表格
  { type: 'table-basic', label: '表格-基础', icon: Table, w: 400, h: 200, stroke: '#3b82f6', rx: 0 },
  // 列表-排名
  { type: 'list-rank', label: '列表-排名', icon: ListOrdered, w: 300, h: 200, stroke: '#8b5cf6', rx: 0 },
  // 时间轴
  { type: 'timeline-h', label: '时间轴-横向', icon: Calendar, w: 500, h: 80, stroke: '#06b6d4', rx: 0 },
  { type: 'timeline-v', label: '时间轴-纵向', icon: Calendar, w: 100, h: 300, stroke: '#06b6d4', rx: 0 },
  { type: 'countdown', label: '倒计时', icon: Timer, w: 200, h: 80, stroke: '#f59e0b', rx: 0 },
]

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

const pinyinMap: Record<string, string> = {
  '矩形': 'jx', '圆形': 'yx', '三角形': 'sjx', '梯形': 'tx',
  '线段/连接': 'xdlj', '文字': 'wz', '自定义图形': 'zdytx',
  '进度条': 'jdt', '数字看板': 'szkb', '单向箭头': 'dxjt',
  '双向箭头': 'sxjt', '数据库': 'sjk', '服务器': 'fwq',
  '处理器': 'clq', '虚机/云': 'xjy', '监控大屏': 'jkdp',
  '磁盘阵列': 'cpzl', '无线网关': 'wxwg', '探针诊断': 'tzjd',
  '终端接驳': 'zdjg', '安全网关': 'aqwg',
  '折线图': 'zxt', '面积图': 'mjt', '柱状图': 'zzt', '条形图': 'txt',
  '饼环图': 'bht', '散点图': 'sdt', '雷达图': 'ldt', '关系图': 'gxt',
  '仪表盘': 'ybp', '地图': 'dt', '漏斗图': 'ldt2', '热力图': 'rlt',
  '矩形树图': 'jxst', '旭日图': 'xrt', '桑基图': 'sjt',
}

const categoryIconMap: Record<string, unknown> = {
  'line': TrendingUp,
  'area': LineChart,
  'bar': BarChart,
  'bar-h': BarChart,
  'pie': PieChart,
  'scatter': ScatterChart,
  'radar': Radar,
  'graph': GitBranch,
  'gauge': Gauge,
  'map': Map,
  'funnel': Filter,
  'heatmap': Grid3X3,
  'treemap': LayoutDashboard,
  'sunburst': Sun,
  'sankey': Workflow,
}

const getPinyin = (label: string): string => {
  return pinyinMap[label] || ''
}

const matchPinyin = (label: string, query: string): boolean => {
  const pinyin = getPinyin(label)
  return pinyin.includes(query.toLowerCase())
}

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

const openChartCategories = ref<Record<string, boolean>>({
  line: true,
  area: true,
  bar: true,
  'bar-h': true,
  pie: true,
  scatter: true,
  radar: true,
  graph: true,
  gauge: true,
  map: true,
  funnel: true,
  heatmap: true,
  treemap: true,
  sunburst: true,
  sankey: true
})

const toggleChartCategory = (key: string) => {
  openChartCategories.value[key] = !openChartCategories.value[key]
}

const searchQuery = ref('')

const activeCategory = ref('base')

const filteredShapeTypes = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return shapeTypes
  return shapeTypes.filter(item =>
    item.label.toLowerCase().includes(query) ||
    matchPinyin(item.label, query)
  )
})

const filteredIconNodes = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return iconNodes
  return iconNodes.filter(item =>
    item.label.toLowerCase().includes(query) ||
    item.iconName.toLowerCase().includes(query) ||
    matchPinyin(item.label, query)
  )
})

const getItemKey = (item: typeof shapeTypes[0] | typeof iconNodes[0]): string => {
  const iconName = (item as typeof iconNodes[0]).iconName
  return iconName ? `${item.type}:${iconName}` : item.type
}

const isFavorite = (item: typeof shapeTypes[0] | typeof iconNodes[0]): boolean => {
  const key = getItemKey(item)
  return editorStore.favoriteShapes.includes(key)
}

const handleToggleFavorite = (e: MouseEvent, item: typeof shapeTypes[0] | typeof iconNodes[0]) => {
  e.stopPropagation()
  const iconName = (item as typeof iconNodes[0]).iconName
  editorStore.toggleFavorite(item.type, iconName)
}

const startDrag = (e: MouseEvent, item: typeof shapeTypes[0]) => {
  const graph = editorStore.graph
  if (!graph || !dndRef.value) return

  const iconName = (item as typeof iconNodes[0]).iconName
  editorStore.addRecentShape(item.type, iconName)

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
      imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v10h14V7H5zm2 2h2v2H7V9zm0 4h10v2H7v-2z"/></svg>',
      attrs: {
        body: {
          fill: '#1e293b',
          stroke: item.stroke,
          strokeWidth: 2,
          strokeDasharray: '5 5',
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
    const w = item.w
    const h = Math.round(item.h)
    const ah = Math.round(h / 3)
    const aw = Math.round(h * 0.45)

    let pathData = ''
    if (item.type === 'arrow_single') {
      pathData = `M 0,${h / 2 - ah / 2} L ${w - aw},${h / 2 - ah / 2} L ${w - aw},0 L ${w},${h / 2} L ${w - aw},${h} L ${w - aw},${h / 2 + ah / 2} L 0,${h / 2 + ah / 2} Z`
    } else {
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
          fill: '#00ff00',
          stroke: '#000000',
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
  } else if (['border-tech', 'border-glow', 'border-gradient'].includes(item.type)) {
    // 边框组件
    node = graph.createNode({
      shape: item.type,
      width: item.w,
      height: item.h,
      data: {
        title: '标题',
      },
      attrs: {
        headerText: {
          text: '标题',
        },
      },
    })
  } else if (item.type === 'divider-h' || item.type === 'divider-v') {
    // 分割线组件
    node = graph.createNode({
      shape: item.type,
      width: item.w,
      height: item.h,
    })
  } else if (item.type === 'decoration-corner') {
    // 装饰-角标
    node = graph.createNode({
      shape: item.type,
      width: item.w,
      height: item.h,
    })
  } else if (item.type === 'decoration-line') {
    // 装饰-动线
    node = graph.createNode({
      shape: item.type,
      width: item.w,
      height: item.h,
    })
  } else if (item.type === 'button-primary' || item.type === 'button-default') {
    // 按钮组件
    node = graph.createNode({
      shape: item.type,
      width: item.w,
      height: item.h,
      attrs: {
        text: {
          text: '按钮',
        },
      },
    })
  } else if (item.type === 'tag-status') {
    // 标签组件
    node = graph.createNode({
      shape: item.type,
      width: item.w,
      height: item.h,
      attrs: {
        text: {
          text: '状态',
        },
      },
    })
  } else if (item.type === 'table-basic') {
    // 表格组件
    node = graph.createNode({
      shape: 'table-basic',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      data: {
        tableTitle: '表格标题',
        headerData: ['列1', '列2', '列3'],
        bodyData: [
          ['数据1-1', '数据1-2', '数据1-3'],
          ['数据2-1', '数据2-2', '数据2-3'],
          ['数据3-1', '数据3-2', '数据3-3'],
        ],
        headerBgColor: '#1e3a5f',
        headerTextColor: '#60a5fa',
        rowBgColor: '#0f172a',
        rowAltBgColor: '#1e293b',
        rowTextColor: '#94a3b8',
        borderColor: '#334155',
      },
      attrs: {
        body: {
          fill: '#0f172a',
          stroke: item.stroke,
          strokeWidth: 1,
        }
      }
    })
  } else if (item.type === 'list-rank') {
    // 列表-排名组件
    node = graph.createNode({
      shape: 'list-rank',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      data: {
        listTitle: '排名列表',
        listData: [
          { rank: 1, name: '项目 A', value: 100 },
          { rank: 2, name: '项目 B', value: 95 },
          { rank: 3, name: '项目 C', value: 88 },
          { rank: 4, name: '项目 D', value: 75 },
          { rank: 5, name: '项目 E', value: 60 },
        ],
        headerBgColor: '#1e3a5f',
        headerTextColor: '#60a5fa',
        rowBgColor: '#0f172a',
        rowAltBgColor: '#1e293b',
        rowTextColor: '#94a3b8',
        borderColor: '#334155',
      },
      attrs: {
        body: {
          fill: '#0f172a',
          stroke: item.stroke,
          strokeWidth: 1,
        }
      }
    })
  } else if (item.type === 'timeline-h' || item.type === 'timeline-v') {
    // 时间轴组件
    const isHorizontal = item.type === 'timeline-h'
    node = graph.createNode({
      shape: item.type,
      width: item.w,
      height: item.h,
      ports: commonPorts,
      data: {
        timelineType: isHorizontal ? 'horizontal' : 'vertical',
        timelineNodes: [
          { id: '1', label: '阶段一', time: '09:00' },
          { id: '2', label: '阶段二', time: '10:00' },
          { id: '3', label: '阶段三', time: '11:00' },
        ],
        lineColor: item.stroke,
        bgColor: '#1e293b',
        nodeColor: item.stroke,
      },
      attrs: {
        body: {
          fill: '#1e293b',
          stroke: item.stroke,
          strokeWidth: 1,
        }
      }
    })
  } else if (item.type === 'countdown') {
    // 倒计时组件
    node = graph.createNode({
      shape: 'countdown',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      data: {
        countdownValue: 60,
        countdownColor: item.stroke,
        bgColor: '#1e293b',
        isRunning: true,
      },
      attrs: {
        body: {
          fill: '#1e293b',
          stroke: item.stroke,
          strokeWidth: 1,
        }
      }
    })
  } else {
    node = graph.createNode({
      shape: 'rect',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      attrs: {
        body: {
          fill: '#1e293b',
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

  dndRef.value.start(node, e)
}

const startChartDrag = (e: MouseEvent, chart: ChartConfig) => {
  const graph = editorStore.graph
  if (!graph || !dndRef.value) return

  editorStore.addRecentShape('chart-node', chart.id)

  const node = graph.createNode({
    shape: 'chart-node',
    width: chart.width,
    height: chart.height,
    ports: commonPorts,
    data: {
      chartId: chart.id,
      chartOption: JSON.parse(JSON.stringify(chart.option)),
    },
    attrs: {
      body: {
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
      }
    }
  })

  dndRef.value.start(node, e)
}

const filteredChartCategories = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return chartCategories

  return chartCategories.map(cat => ({
    ...cat,
    charts: cat.charts.filter(chart =>
      chart.name.toLowerCase().includes(query) ||
      cat.name.toLowerCase().includes(query) ||
      matchPinyin(chart.name, query) ||
      matchPinyin(cat.name, query)
    )
  })).filter(cat => cat.charts.length > 0)
})
</script>

<template>
  <div
    class="h-full bg-[#141824] border-r  border-[#2a3045] flex flex-col shrink-0 z-20 shadow-xl overflow-hidden transition-all duration-300"
    :class="isCollapsed ? 'w-[60px]' : 'w-full'"
    ref="dndContainer">

    <!-- 折叠模式 -->
    <template v-if="isCollapsed">
      <div class="flex flex-col items-center py-3 border-b border-[#2a3045]">
        <button
          @click="editorStore.toggleToolbar()"
          class="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
          title="展开面板">
          <PanelLeft class="w-5 h-5" />
        </button>
      </div>

      <!-- 折叠状态下的图元图标列表 -->
      <div class="flex-1 overflow-y-auto custom-scrollbar py-2">
        <div class="flex flex-col items-center gap-2 px-2">
          <template v-for="item in shapeTypes" :key="item.type">
            <div
              class="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1f2e] border border-[#2a3045] cursor-grab hover:border-sky-500 hover:bg-[#1e2640] transition-all group relative"
              @mousedown="startDrag($event, item)">
              <component :is="item.icon" class="w-5 h-5"
                :style="{ color: item.stroke !== 'transparent' ? item.stroke : '#94a3b8' }" />
              <div class="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {{ item.label }}
              </div>
            </div>
          </template>

          <div class="w-full h-px bg-[#2a3045] my-2"></div>

          <template v-for="item in iconNodes" :key="item.iconName">
            <div
              class="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1f2e] border border-[#2a3045] cursor-grab hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group relative"
              @mousedown="startDrag($event, item as any)">
              <component :is="item.icon" class="w-5 h-5"
                :style="{ color: item.stroke }" />
              <div class="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {{ item.label }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- 展开模式 - 新布局 -->
    <template v-else>
      <!-- 面板头部 -->
      <div
        class="px-4 py-3 text-sm font-semibold text-slate-400 uppercase tracking-widest border-b border-[#2a3045] flex items-center justify-between shrink-0">
        <span>图元库</span>
        <button
          @click="editorStore.toggleToolbar()"
          class="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-500 hover:text-slate-300"
          title="折叠面板">
          <PanelLeftClose class="w-4 h-4" />
        </button>
      </div>

      <!-- 搜索区 -->
      <div class="p-3 bg-[#1a1f2e] border-b border-[#2a3045] shrink-0">
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <component :is="Search" class="h-4 w-4 text-slate-500" />
          </div>
          <input type="text" v-model="searchQuery" placeholder="搜索图元名称/拼音..."
            class="block w-full pl-9 pr-3 py-1.5 border border-[#2a3045] rounded-md text-xs bg-[#141824] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors" />
        </div>
      </div>

      <!-- 主内容区 - 左右布局 -->
      <div class="flex-1 flex overflow-hidden">
        <!-- 左侧分类标签栏 -->
        <div class="flex-shrink-0 bg-[#0f172a] border-r border-[#2a3045] overflow-y-auto custom-scrollbar">
          <div class="flex flex-col py-2">
            <!-- 基础图元 -->
            <button
              @click="activeCategory = 'base'"
              :class="[
                'px-3 py-3 text-xs font-medium transition-all text-left border-l-2',
                activeCategory === 'base'
                  ? 'bg-[#1e2640] border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1f2e]'
              ]">
              <div class="flex flex-col items-center gap-2">
                <Square class="w-4 h-4" />
                <span class="text-[10px]">基础</span>
              </div>
            </button>

            <!-- 架构图标 -->
            <button
              @click="activeCategory = 'icons'"
              :class="[
                'px-3 py-3 text-xs font-medium transition-all text-left border-l-2',
                activeCategory === 'icons'
                  ? 'bg-[#1e2640] border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1f2e]'
              ]">
              <div class="flex flex-col items-center gap-2">
                <Database class="w-4 h-4" />
                <span class="text-[10px]">架构</span>
              </div>
            </button>

            <!-- 图表 -->
            <button
              @click="activeCategory = 'charts'"
              :class="[
                'px-3 py-3 text-xs font-medium transition-all text-left border-l-2',
                activeCategory === 'charts'
                  ? 'bg-[#1e2640] border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1f2e]'
              ]">
              <div class="flex flex-col items-center gap-2">
                <BarChart class="w-4 h-4" />
                <span class="text-[10px]">图表</span>
              </div>
            </button>

            <!-- 复杂设备 -->
            <button
              @click="activeCategory = 'advanced'"
              :class="[
                'px-3 py-3 text-xs font-medium transition-all text-left border-l-2',
                activeCategory === 'advanced'
                  ? 'bg-[#1e2640] border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1f2e]'
              ]">
              <div class="flex flex-col items-center gap-2">
                <Workflow class="w-4 h-4" />
                <span class="text-[10px]">设备</span>
              </div>
            </button>
          </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="flex-1 overflow-y-auto custom-scrollbar bg-[#141824]">
          <div class="p-3">
            <!-- 基础图元内容 -->
            <template v-if="activeCategory === 'base'">
              <div class="mb-4">
                <h3 class="text-xs font-semibold text-slate-300 mb-3 px-1">基础图元</h3>
                <div class="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-2">
                  <template v-for="item in filteredShapeTypes" :key="item.type">
                    <div
                      class="flex flex-col items-center justify-center p-2 rounded-lg bg-[#1a1f2e] border border-[#2a3045] cursor-grab hover:-translate-y-0.5 hover:border-sky-500 hover:bg-[#1e2640] transition-all group relative"
                      @mousedown="startDrag($event, item)">
                      <component :is="item.icon" class="w-5 h-5 mb-1"
                        :style="{ color: item.stroke !== 'transparent' ? item.stroke : '#94a3b8' }" />
                      <span class="text-[9px] text-slate-400 font-medium text-center leading-tight">{{ item.label }}</span>
                      <button
                        @click="handleToggleFavorite($event, item)"
                        class="absolute top-1 right-1 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100"
                        :class="isFavorite(item) ? 'opacity-100 text-amber-400' : 'text-slate-500 hover:text-amber-400'">
                        <Star class="w-3 h-3" :fill="isFavorite(item) ? 'currentColor' : 'none'" />
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </template>

            <!-- 架构图标内容 -->
            <template v-if="activeCategory === 'icons'">
              <div class="mb-4">
                <h3 class="text-xs font-semibold text-slate-300 mb-3 px-1">通用架构图标</h3>
                <div class="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-2">
                  <template v-for="item in filteredIconNodes" :key="item.iconName">
                    <div
                      class="flex flex-col items-center justify-center p-2 rounded-lg bg-[#1a1f2e] border border-[#2a3045] cursor-grab hover:-translate-y-0.5 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group relative"
                      @mousedown="startDrag($event, item as any)">
                      <component :is="item.icon" class="w-6 h-6 mb-1 transition-transform group-hover:scale-110"
                        :style="{ color: item.stroke }" />
                      <span class="text-[9px] text-slate-400 font-medium text-center leading-tight">{{ item.label }}</span>
                      <button
                        @click="handleToggleFavorite($event, item)"
                        class="absolute top-1 right-1 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100"
                        :class="isFavorite(item) ? 'opacity-100 text-amber-400' : 'text-slate-500 hover:text-amber-400'">
                        <Star class="w-3 h-3" :fill="isFavorite(item) ? 'currentColor' : 'none'" />
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </template>

            <!-- 图表内容 -->
            <template v-if="activeCategory === 'charts'">
              <div class="space-y-3">
                <template v-for="category in filteredChartCategories" :key="category.id">
                  <div>
                    <div class="flex items-center justify-between px-2 py-2 cursor-pointer bg-[#0f172a] rounded border border-[#2a3045] transition-colors hover:bg-[#1e2640]"
                      @click="toggleChartCategory(category.id)">
                      <span class="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                        <component :is="categoryIconMap[category.id] || BarChart" class="w-3.5 h-3.5" />
                        {{ category.name }}
                        <span class="text-slate-600">({{ category.charts.length }})</span>
                      </span>
                      <component :is="ChevronDown" class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{ '-rotate-90': !openChartCategories[category.id] }" />
                    </div>

                    <div v-show="openChartCategories[category.id]"
                      class="mt-1 grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-1.5 p-1">
                      <template v-for="chart in category.charts" :key="chart.id">
                        <div
                          class="flex flex-col items-center justify-center p-1.5 rounded bg-[#1a1f2e] border border-[#2a3045] cursor-grab hover:border-purple-500/50 hover:bg-purple-500/10 transition-all group"
                          @mousedown="startChartDrag($event, chart)">
                          <div class="w-6 h-6 flex items-center justify-center mb-0.5 rounded bg-[#0f172a]">
                            <component :is="categoryIconMap[category.id] || BarChart" class="w-3.5 h-3.5 text-purple-400" />
                          </div>
                          <span class="text-[8px] text-slate-400 text-center leading-tight line-clamp-2">{{ chart.name }}</span>
                        </div>
                      </template>
                    </div>
                  </div>
                </template>
              </div>
            </template>

            <!-- 复杂设备内容 -->
            <template v-if="activeCategory === 'advanced'">
              <div class="text-xs text-slate-500 bg-slate-900/50 rounded-lg p-4 border border-slate-800/50 text-center">
                <Workflow class="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>复杂设备及管线</p>
                <p class="text-slate-600 mt-1">已集成在上方搜索大类中</p>
                <p class="text-slate-600">更多定制组件开发中...</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
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
