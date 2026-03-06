/**
 * 统一 Schema v2.1 规范
 * 用于大屏设计器和工业组态的完整数据模型
 */

// ============================================
// 基础类型定义
// ============================================

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface NodeLayout extends Position, Size {
  rotation?: number
  zIndex?: number
}

export interface NodeStyle {
  background?: string
  backgroundImage?: string
  backgroundOpacity?: number
  borderColor?: string
  borderWidth?: number
  borderStyle?: 'solid' | 'dashed' | 'dotted'
  borderRadius?: number
  opacity?: number
  shadow?: string
  filter?: string
}

// ============================================
// 画布配置
// ============================================

export interface GridConfig {
  enabled: boolean
  size: number
  type: 'dot' | 'line' | 'mesh'
  color: string
  snap: boolean
}

export interface CanvasConfig {
  width: number
  height: number
  background: string
  backgroundImage?: string
  backgroundOpacity: number
  grid: GridConfig
  scale: number
  offsetX: number
  offsetY: number
}

// ============================================
// 连接点 (Port)
// ============================================

export interface PortSchema {
  id: string
  position: 'top' | 'right' | 'bottom' | 'left'
  offset?: { x: number; y: number }
  type: 'source' | 'target' | 'both'
  allowedEdges?: string[]
  style?: {
    fill?: string
    stroke?: string
    radius?: number
  }
}

// ============================================
// 节点类型
// ============================================

export type NodeKind = 'widget' | 'graph'

export interface BaseNode {
  id: string
  nodeKind: NodeKind
  layout: NodeLayout
  style?: NodeStyle
  parent?: string
  locked?: boolean
  hidden?: boolean
}

export interface DataBinding {
  dataSourceId: string
  field: string
  filter?: string
  mapping?: Record<string, string>
  refreshInterval?: number
}

export interface WidgetNode extends BaseNode {
  nodeKind: 'widget'
  type: string
  props: Record<string, unknown>
  dataBinding?: DataBinding
}

export interface StateRule {
  condition: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'range' | 'regex'
  value: unknown
  style: Partial<NodeStyle>
  animation?: string
  tooltip?: string
}

export interface StateMapping {
  dataSourceId: string
  field: string
  rules: StateRule[]
}

export interface GraphNode extends BaseNode {
  nodeKind: 'graph'
  graphType: string
  label?: string
  svgSource?: string
  ports: PortSchema[]
  stateMapping?: StateMapping
}

export type CanvasNode = WidgetNode | GraphNode

// ============================================
// 连线 (Edge)
// ============================================

export type PathType = 'bezier' | 'straight' | 'step' | 'smoothstep' | 'orthogonal'

export interface EdgeStyle {
  stroke: string
  strokeWidth: number
  strokeDasharray?: string
  opacity?: number
}

export interface EdgeAnimation {
  type: 'waterFlow' | 'electric' | 'signal' | 'particle' | 'pulse' | 'dashed' | 'bidirectional' | 'dataPacket' | 'none'
  speed?: number
  color?: string
  reverse?: boolean
  paused?: boolean
}

export interface EdgeLabel {
  text: string
  position: number
  align: 'center' | 'source' | 'target'
  dataBinding?: DataBinding
}

export interface EdgeSchema {
  id: string
  source: string
  sourcePort: string
  target: string
  targetPort: string
  pathType: PathType
  style: EdgeStyle
  animation?: EdgeAnimation
  label?: EdgeLabel
}

// ============================================
// 数据源
// ============================================

export type DataSourceType = 'rest' | 'websocket' | 'graphql' | 'mqtt' | 'static' | 'mysql' | 'postgresql' | 'influxdb'

export interface RESTConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  params?: Record<string, unknown>
  body?: unknown
}

export interface WebSocketConfig {
  url: string
  protocols?: string[]
  reconnect?: boolean
  reconnectInterval?: number
}

export interface MQTTConfig {
  host: string
  port: number
  username?: string
  password?: string
  topics: string[]
}

export interface StaticConfig {
  data: unknown
}

export interface SQLConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  query: string
}

export interface DataSourceConfig {
  id: string
  name: string
  type: DataSourceType
  config: RESTConfig | WebSocketConfig | MQTTConfig | StaticConfig | SQLConfig
  polling?: {
    enabled: boolean
    interval: number
    jitter?: boolean
  }
  cache?: {
    enabled: boolean
    ttl: number
  }
  retry?: {
    maxAttempts: number
    delay: number
  }
}

// ============================================
// 变量与事件
// ============================================

export interface VariableSchema {
  name: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description?: string
}

export interface Action {
  type: 'updateData' | 'showHide' | 'openModal' | 'navigate' | 'triggerAnimation' | 'setVariable' | 'refresh'
  targetId?: string
  params?: Record<string, unknown>
  condition?: string
  delay?: number
}

export interface EventBinding {
  sourceId: string
  eventName: string
  actions: Action[]
}

// ============================================
// 根 Schema
// ============================================

export interface CanvasSchema {
  version: '2.1'
  canvas: CanvasConfig
  nodes: CanvasNode[]
  edges: EdgeSchema[]
  datasources: DataSourceConfig[]
  variables: VariableSchema[]
  events: EventBinding[]
  meta?: {
    title?: string
    description?: string
    author?: string
    createdAt?: number
    updatedAt?: number
  }
}

// ============================================
// 组件元数据
// ============================================

export interface ComponentMeta {
  type: string
  name: string
  category: 'chart' | 'map' | 'data' | 'decoration' | 'container' | 'media' | 'graph'
  icon: string
  thumbnail?: string
  description?: string
  defaultProps: Record<string, unknown>
  defaultSize: Size
  propsSchema: JSONSchema
  styleSchema?: JSONSchema
  dataSchema?: JSONSchema
  events?: string[]
  actions?: string[]
  resizable: boolean
  aspectRatio?: number
}

export interface JSONSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean'
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
  enum?: unknown[]
  default?: unknown
  description?: string
}

// ============================================
// 图元元数据
// ============================================

export interface GraphNodeMeta {
  type: string
  name: string
  category: 'process' | 'instrument' | 'electrical' | 'it' | 'flowchart' | 'custom'
  icon: string
  svg: string
  defaultPorts: PortSchema[]
  defaultSize: Size
  stateRules?: StateRule[]
}

// ============================================
// 工具类型
// ============================================

export type DataPipeline = {
  jsonPath?: string
  filter?: string
  mapping?: Record<string, string>
}

export type ThemeType = 'dark' | 'light' | 'cyber' | 'industrial'

export interface ThemeConfig {
  name: string
  type: ThemeType
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    danger: string
    info: string
    background: string
    surface: string
    border: string
    text: string
    textSecondary: string
  }
  canvas: {
    background: string
    grid: string
    gridDot: string
    ruler: string
    guideline: string
  }
}
