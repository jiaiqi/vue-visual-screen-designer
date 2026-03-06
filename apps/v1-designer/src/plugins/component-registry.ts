import type { Component } from 'vue'
import type { ComponentMeta, GraphNodeMeta } from '@/types/schema'

/**
 * 组件注册中心
 * 统一管理大屏组件和工业图元的注册、查询和加载
 */

// ============================================
// 组件存储
// ============================================

const widgetRegistry = new Map<string, { meta: ComponentMeta; component: Component }>()
const graphNodeRegistry = new Map<string, { meta: GraphNodeMeta; component?: Component }>()
const categoryRegistry = new Map<string, Set<string>>()

// ============================================
// 组件注册 API
// ============================================

/**
 * 注册大屏组件
 */
export function registerWidget(meta: ComponentMeta, component: Component) {
  widgetRegistry.set(meta.type, { meta, component })

  // 更新分类索引
  if (!categoryRegistry.has(meta.category)) {
    categoryRegistry.set(meta.category, new Set())
  }
  categoryRegistry.get(meta.category)!.add(meta.type)
}

/**
 * 注册工业图元
 */
export function registerGraphNode(meta: GraphNodeMeta, component?: Component) {
  graphNodeRegistry.set(meta.type, { meta, component })

  // 更新分类索引
  if (!categoryRegistry.has(meta.category)) {
    categoryRegistry.set(meta.category, new Set())
  }
  categoryRegistry.get(meta.category)!.add(meta.type)
}

/**
 * 批量注册组件
 */
export function registerWidgets(components: { meta: ComponentMeta; component: Component }[]) {
  components.forEach(({ meta, component }) => registerWidget(meta, component))
}

/**
 * 批量注册图元
 */
export function registerGraphNodes(nodes: { meta: GraphNodeMeta; component?: Component }[]) {
  nodes.forEach(({ meta, component }) => registerGraphNode(meta, component))
}

// ============================================
// 组件查询 API
// ============================================

/**
 * 获取大屏组件
 */
export function getWidget(type: string): { meta: ComponentMeta; component: Component } | undefined {
  return widgetRegistry.get(type)
}

/**
 * 获取工业图元
 */
export function getGraphNode(type: string): { meta: GraphNodeMeta; component?: Component } | undefined {
  return graphNodeRegistry.get(type)
}

/**
 * 获取组件元数据
 */
export function getWidgetMeta(type: string): ComponentMeta | undefined {
  return widgetRegistry.get(type)?.meta
}

/**
 * 获取图元元数据
 */
export function getGraphNodeMeta(type: string): GraphNodeMeta | undefined {
  return graphNodeRegistry.get(type)?.meta
}

/**
 * 获取分类下的所有组件
 */
export function getComponentsByCategory(category: string): ComponentMeta[] {
  const types = categoryRegistry.get(category)
  if (!types) return []

  return Array.from(types)
    .map(type => getWidgetMeta(type))
    .filter((meta): meta is ComponentMeta => meta !== undefined)
}

/**
 * 获取分类下的所有图元
 */
export function getGraphNodesByCategory(category: string): GraphNodeMeta[] {
  const types = categoryRegistry.get(category)
  if (!types) return []

  return Array.from(types)
    .map(type => getGraphNodeMeta(type))
    .filter((meta): meta is GraphNodeMeta => meta !== undefined)
}

/**
 * 获取所有组件列表
 */
export function getAllWidgets(): ComponentMeta[] {
  return Array.from(widgetRegistry.values()).map(({ meta }) => meta)
}

/**
 * 获取所有图元列表
 */
export function getAllGraphNodes(): GraphNodeMeta[] {
  return Array.from(graphNodeRegistry.values()).map(({ meta }) => meta)
}

/**
 * 搜索组件
 */
export function searchWidgets(keyword: string): ComponentMeta[] {
  const lowerKeyword = keyword.toLowerCase()
  return getAllWidgets().filter(meta =>
    meta.name.toLowerCase().includes(lowerKeyword) ||
    meta.type.toLowerCase().includes(lowerKeyword) ||
    meta.description?.toLowerCase().includes(lowerKeyword)
  )
}

/**
 * 搜索图元
 */
export function searchGraphNodes(keyword: string): GraphNodeMeta[] {
  const lowerKeyword = keyword.toLowerCase()
  return getAllGraphNodes().filter(meta =>
    meta.name.toLowerCase().includes(lowerKeyword) ||
    meta.type.toLowerCase().includes(lowerKeyword)
  )
}

/**
 * 检查组件是否存在
 */
export function hasWidget(type: string): boolean {
  return widgetRegistry.has(type)
}

/**
 * 检查图元是否存在
 */
export function hasGraphNode(type: string): boolean {
  return graphNodeRegistry.has(type)
}

// ============================================
// 组件分类定义
// ============================================

export const widgetCategories = {
  chart: {
    name: '图表',
    icon: 'i-carbon-chart-line',
    description: '数据可视化图表组件',
  },
  map: {
    name: '地图',
    icon: 'i-carbon-map',
    description: '地理信息可视化组件',
  },
  data: {
    name: '数据',
    icon: 'i-carbon-table',
    description: '数据展示组件',
  },
  decoration: {
    name: '装饰',
    icon: 'i-cbon-color-palette',
    description: '装饰性视觉组件',
  },
  container: {
    name: '容器',
    icon: 'i-carbon-container-software',
    description: '布局容器组件',
  },
  media: {
    name: '媒体',
    icon: 'i-carbon-media-library',
    description: '多媒体组件',
  },
  graph: {
    name: '图元',
    icon: 'i-carbon-iot-connect',
    description: '工业图元组件',
  },
} as const

export const graphNodeCategories = {
  process: {
    name: '工艺设备',
    icon: 'i-carbon-industry',
    description: '工业工艺设备图元',
  },
  instrument: {
    name: '仪表仪器',
    icon: 'i-carbon-meter',
    description: '测量仪表图元',
  },
  electrical: {
    name: '电气设备',
    icon: 'i-carbon-flash',
    description: '电气系统图元',
  },
  it: {
    name: 'IT 拓扑',
    icon: 'i-carbon-network-4',
    description: 'IT 基础设施图元',
  },
  flowchart: {
    name: '流程图形',
    icon: 'i-carbon-flow',
    description: '流程图基础图形',
  },
  custom: {
    name: '自定义',
    icon: 'i-carbon-customize',
    description: '用户自定义图元',
  },
} as const

// ============================================
// 内置组件注册
// ============================================

/**
 * 初始化内置组件
 */
export function initBuiltinComponents() {
  // 图表类组件元数据
  const chartMetas: ComponentMeta[] = [
    {
      type: 'line-chart',
      name: '折线图',
      category: 'chart',
      icon: 'i-carbon-chart-line',
      defaultProps: {
        smooth: true,
        area: false,
        showPoints: true,
      },
      defaultSize: { width: 400, height: 300 },
      propsSchema: {
        type: 'object',
        properties: {
          smooth: { type: 'boolean', default: true },
          area: { type: 'boolean', default: false },
          showPoints: { type: 'boolean', default: true },
        },
      },
      resizable: true,
    },
    {
      type: 'bar-chart',
      name: '柱状图',
      category: 'chart',
      icon: 'i-carbon-chart-bar',
      defaultProps: {
        horizontal: false,
        stacked: false,
      },
      defaultSize: { width: 400, height: 300 },
      propsSchema: {
        type: 'object',
        properties: {
          horizontal: { type: 'boolean', default: false },
          stacked: { type: 'boolean', default: false },
        },
      },
      resizable: true,
    },
    {
      type: 'pie-chart',
      name: '饼图',
      category: 'chart',
      icon: 'i-carbon-chart-pie',
      defaultProps: {
        donut: false,
        showLabel: true,
      },
      defaultSize: { width: 300, height: 300 },
      propsSchema: {
        type: 'object',
        properties: {
          donut: { type: 'boolean', default: false },
          showLabel: { type: 'boolean', default: true },
        },
      },
      resizable: true,
      aspectRatio: 1,
    },
    {
      type: 'gauge-chart',
      name: '仪表盘',
      category: 'chart',
      icon: 'i-carbon-meter',
      defaultProps: {
        min: 0,
        max: 100,
        showAxis: true,
      },
      defaultSize: { width: 300, height: 300 },
      propsSchema: {
        type: 'object',
        properties: {
          min: { type: 'number', default: 0 },
          max: { type: 'number', default: 100 },
          showAxis: { type: 'boolean', default: true },
        },
      },
      resizable: true,
      aspectRatio: 1,
    },
    {
      type: 'radar-chart',
      name: '雷达图',
      category: 'chart',
      icon: 'i-carbon-chart-radar',
      defaultProps: {
        showArea: true,
        showPoints: true,
      },
      defaultSize: { width: 300, height: 300 },
      propsSchema: {
        type: 'object',
        properties: {
          showArea: { type: 'boolean', default: true },
          showPoints: { type: 'boolean', default: true },
        },
      },
      resizable: true,
      aspectRatio: 1,
    },
  ]

  // 数据类组件元数据
  const dataMetas: ComponentMeta[] = [
    {
      type: 'metric-card',
      name: '指标卡',
      category: 'data',
      icon: 'i-carbon-number-small-1',
      defaultProps: {
        title: '指标',
        unit: '',
        showTrend: true,
        precision: 2,
      },
      defaultSize: { width: 200, height: 120 },
      propsSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', default: '指标' },
          unit: { type: 'string', default: '' },
          showTrend: { type: 'boolean', default: true },
          precision: { type: 'number', default: 2 },
        },
      },
      resizable: true,
    },
    {
      type: 'carousel-table',
      name: '轮播表格',
      category: 'data',
      icon: 'i-carbon-table',
      defaultProps: {
        rowHeight: 40,
        showHeader: true,
        scrollSpeed: 1,
      },
      defaultSize: { width: 400, height: 300 },
      propsSchema: {
        type: 'object',
        properties: {
          rowHeight: { type: 'number', default: 40 },
          showHeader: { type: 'boolean', default: true },
          scrollSpeed: { type: 'number', default: 1 },
        },
      },
      resizable: true,
    },
    {
      type: 'progress-bar',
      name: '进度条',
      category: 'data',
      icon: 'i-carbon-progress-bar',
      defaultProps: {
        showText: true,
        striped: false,
        animated: false,
      },
      defaultSize: { width: 300, height: 30 },
      propsSchema: {
        type: 'object',
        properties: {
          showText: { type: 'boolean', default: true },
          striped: { type: 'boolean', default: false },
          animated: { type: 'boolean', default: false },
        },
      },
      resizable: true,
    },
    {
      type: 'number-flipper',
      name: '数字翻牌器',
      category: 'data',
      icon: 'i-carbon-number-0',
      defaultProps: {
        duration: 1000,
        separator: ',',
        precision: 0,
      },
      defaultSize: { width: 200, height: 60 },
      propsSchema: {
        type: 'object',
        properties: {
          duration: { type: 'number', default: 1000 },
          separator: { type: 'string', default: ',' },
          precision: { type: 'number', default: 0 },
        },
      },
      resizable: true,
    },
  ]

  // 装饰类组件元数据
  const decorationMetas: ComponentMeta[] = [
    {
      type: 'tech-border',
      name: '科技边框',
      category: 'decoration',
      icon: 'i-carbon-border-full',
      defaultProps: {
        variant: 'default',
        glow: true,
        animated: true,
      },
      defaultSize: { width: 400, height: 300 },
      propsSchema: {
        type: 'object',
        properties: {
          variant: { type: 'string', enum: ['default', 'corner', 'full'], default: 'default' },
          glow: { type: 'boolean', default: true },
          animated: { type: 'boolean', default: true },
        },
      },
      resizable: true,
    },
    {
      type: 'title-box',
      name: '标题框',
      category: 'decoration',
      icon: 'i-carbon-text-font',
      defaultProps: {
        title: '标题',
        subtitle: '',
        align: 'left',
      },
      defaultSize: { width: 300, height: 50 },
      propsSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', default: '标题' },
          subtitle: { type: 'string', default: '' },
          align: { type: 'string', enum: ['left', 'center', 'right'], default: 'left' },
        },
      },
      resizable: true,
    },
  ]

  // 注册所有组件元数据
  return {
    charts: chartMetas,
    data: dataMetas,
    decorations: decorationMetas,
  }
}

/**
 * 初始化内置图元
 */
export function initBuiltinGraphNodes(): GraphNodeMeta[] {
  return [
    // 工艺设备
    {
      type: 'pump',
      name: '泵',
      category: 'process',
      icon: 'i-carbon-flow',
      svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="2"/><path d="M30 50 L50 30 L70 50 L50 70 Z" fill="currentColor"/></svg>',
      defaultPorts: [
        { id: 'in', position: 'left', type: 'target' },
        { id: 'out', position: 'right', type: 'source' },
      ],
      defaultSize: { width: 60, height: 60 },
    },
    {
      type: 'valve',
      name: '阀门',
      category: 'process',
      icon: 'i-carbon-stop',
      svg: '<svg viewBox="0 0 100 100"><path d="M20 20 L80 50 L20 80 Z" fill="none" stroke="currentColor" stroke-width="2"/><line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" stroke-width="2"/></svg>',
      defaultPorts: [
        { id: 'in', position: 'left', type: 'both' },
        { id: 'out', position: 'right', type: 'both' },
      ],
      defaultSize: { width: 60, height: 40 },
    },
    {
      type: 'tank',
      name: '储罐',
      category: 'process',
      icon: 'i-carbon-cylinder',
      svg: '<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="20" y1="35" x2="80" y2="35" stroke="currentColor" stroke-width="1"/><line x1="20" y1="65" x2="80" y2="65" stroke="currentColor" stroke-width="1"/></svg>',
      defaultPorts: [
        { id: 'top', position: 'top', type: 'both' },
        { id: 'bottom', position: 'bottom', type: 'both' },
        { id: 'left', position: 'left', type: 'both' },
        { id: 'right', position: 'right', type: 'both' },
      ],
      defaultSize: { width: 80, height: 100 },
    },
    // 仪表仪器
    {
      type: 'pressure-gauge',
      name: '压力表',
      category: 'instrument',
      icon: 'i-carbon-meter',
      svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="2"/><line x1="50" y1="50" x2="50" y2="20" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="5" fill="currentColor"/></svg>',
      defaultPorts: [
        { id: 'bottom', position: 'bottom', type: 'target' },
      ],
      defaultSize: { width: 60, height: 60 },
    },
    // 电气设备
    {
      type: 'circuit-breaker',
      name: '断路器',
      category: 'electrical',
      icon: 'i-carbon-flash',
      svg: '<svg viewBox="0 0 100 100"><rect x="30" y="20" width="40" height="60" fill="none" stroke="currentColor" stroke-width="2"/><line x1="50" y1="20" x2="50" y2="10" stroke="currentColor" stroke-width="2"/><line x1="50" y1="80" x2="50" y2="90" stroke="currentColor" stroke-width="2"/></svg>',
      defaultPorts: [
        { id: 'top', position: 'top', type: 'both' },
        { id: 'bottom', position: 'bottom', type: 'both' },
      ],
      defaultSize: { width: 40, height: 60 },
    },
    // IT 拓扑
    {
      type: 'server',
      name: '服务器',
      category: 'it',
      icon: 'i-carbon-server',
      svg: '<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="30" y1="35" x2="70" y2="35" stroke="currentColor" stroke-width="1"/><line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" stroke-width="1"/><line x1="30" y1="65" x2="70" y2="65" stroke="currentColor" stroke-width="1"/></svg>',
      defaultPorts: [
        { id: 'top', position: 'top', type: 'both' },
        { id: 'bottom', position: 'bottom', type: 'both' },
      ],
      defaultSize: { width: 60, height: 60 },
    },
    {
      type: 'router',
      name: '路由器',
      category: 'it',
      icon: 'i-carbon-router',
      svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="2"/><line x1="50" y1="20" x2="50" y2="10" stroke="currentColor" stroke-width="2"/></svg>',
      defaultPorts: [
        { id: 'top', position: 'top', type: 'both' },
        { id: 'left', position: 'left', type: 'both' },
        { id: 'right', position: 'right', type: 'both' },
        { id: 'bottom', position: 'bottom', type: 'both' },
      ],
      defaultSize: { width: 60, height: 60 },
    },
  ]
}

// 导出注册中心
export default {
  registerWidget,
  registerGraphNode,
  registerWidgets,
  registerGraphNodes,
  getWidget,
  getGraphNode,
  getWidgetMeta,
  getGraphNodeMeta,
  getComponentsByCategory,
  getGraphNodesByCategory,
  getAllWidgets,
  getAllGraphNodes,
  searchWidgets,
  searchGraphNodes,
  hasWidget,
  hasGraphNode,
  initBuiltinComponents,
  initBuiltinGraphNodes,
}
