# 接口定义

本文档定义了低代码大屏设计器系统的公开接口，包括 API 端点、数据类型和组件注册规范。

## 目录

- [工作区 API](#工作区-api)
- [应用管理 API](#应用管理-api)
- [页面管理 API](#页面管理-api)
- [发布管理 API](#发布管理-api)
- [Schema 类型](#schema-类型)
- [组件注册](#组件注册)

---

## 工作区 API

### 获取工作区快照

```typescript
GET /api/workspace/snapshot
```

**响应**：
```typescript
interface WorkspaceSnapshotDto {
  apps: AppDto[]
  pages: PageDto[]
  releases: ReleaseDto[]
  activeAppId: string | null
  activePageId: string | null
}
```

### 保存工作区快照

```typescript
POST /api/workspace/snapshot
```

**请求体**：
```typescript
interface SaveWorkspaceSnapshotRequestDto {
  snapshot: WorkspaceSnapshotDto
}
```

---

## 应用管理 API

### 获取应用列表

```typescript
GET /api/apps
```

**响应**：
```typescript
interface ListAppsResponseDto {
  items: AppDto[]
}
```

### 创建应用

```typescript
POST /api/apps
```

**请求体**：
```typescript
interface CreateAppRequestDto {
  name: string
  description?: string
  owner?: string
  tags?: string[]
  themeColor?: string
}
```

### 更新应用

```typescript
PATCH /api/apps/:id
```

**请求体**：
```typescript
interface UpdateAppRequestDto {
  name?: string
  description?: string
  owner?: string
  status?: 'draft' | 'testing' | 'online' | 'archived'
  tags?: string[]
  themeColor?: string
  homePageId?: string | null
}
```

### 删除应用

```typescript
DELETE /api/apps/:id
```

**应用状态**：
```typescript
type AppStatusDto = 'draft' | 'testing' | 'online' | 'archived'
```

---

## 页面管理 API

### 获取页面列表

```typescript
GET /api/apps/:appId/pages
```

**响应**：
```typescript
interface ListPagesResponseDto {
  items: PageDto[]
}
```

### 创建页面

```typescript
POST /api/apps/:appId/pages
```

**请求体**：
```typescript
interface CreatePageRequestDto {
  appId: string
  name: string
  path?: string
}
```

### 更新页面

```typescript
PATCH /api/pages/:id
```

**请求体**：
```typescript
interface UpdatePageRequestDto {
  name?: string
  path?: string
  status?: 'draft' | 'published'
  order?: number
  isHome?: boolean
}
```

### 保存页面快照

```typescript
POST /api/pages/:id/snapshot
```

**请求体**：
```typescript
interface SavePageSnapshotRequestDto {
  canvasConfig: Record<string, unknown>
  graphData: Record<string, unknown>
}
```

### 复制页面

```typescript
POST /api/pages/duplicate
```

**请求体**：
```typescript
interface DuplicatePageRequestDto {
  sourcePageId: string
  name?: string
  path?: string
}
```

### 移动页面顺序

```typescript
POST /api/pages/:id/move
```

**请求体**：
```typescript
interface MovePageRequestDto {
  direction: 'up' | 'down'
}
```

---

## 发布管理 API

### 获取发布列表

```typescript
GET /api/apps/:appId/releases
```

**响应**：
```typescript
interface ListReleasesResponseDto {
  items: ReleaseDto[]
}
```

### 发布页面

```typescript
POST /api/apps/:appId/releases
```

**请求体**：
```typescript
interface PublishPageRequestDto {
  pageId: string
  note?: string
}
```

### 回滚发布

```typescript
POST /api/releases/rollback
```

**请求体**：
```typescript
interface RollbackReleaseRequestDto {
  releaseId: string
}
```

---

## Schema 类型

完整类型定义见 `packages/core/src/types/schema.ts`

### 根 Schema

```typescript
interface CanvasSchema {
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
```

### 画布配置

```typescript
interface CanvasConfig {
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

interface GridConfig {
  enabled: boolean
  size: number
  type: 'dot' | 'line' | 'mesh'
  color: string
  snap: boolean
}
```

### 节点类型

```typescript
// 组件节点
interface WidgetNode {
  id: string
  nodeKind: 'widget'
  type: string
  layout: NodeLayout
  style?: NodeStyle
  props: Record<string, unknown>
  dataBinding?: DataBinding
  parent?: string
  locked?: boolean
  hidden?: boolean
}

// 图形节点
interface GraphNode {
  id: string
  nodeKind: 'graph'
  graphType: string
  label?: string
  svgSource?: string
  layout: NodeLayout
  style?: NodeStyle
  ports: PortSchema[]
  stateMapping?: StateMapping
  parent?: string
  locked?: boolean
  hidden?: boolean
}

interface NodeLayout {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  zIndex?: number
}

interface NodeStyle {
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
```

### 连线类型

```typescript
interface EdgeSchema {
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

type PathType = 'bezier' | 'straight' | 'step' | 'smoothstep' | 'orthogonal'

interface EdgeStyle {
  stroke: string
  strokeWidth: number
  strokeDasharray?: string
  opacity?: number
}

interface EdgeAnimation {
  type: 'waterFlow' | 'electric' | 'signal' | 'particle' | 'pulse' | 'dashed' | 'bidirectional' | 'dataPacket' | 'none'
  speed?: number
  color?: string
  reverse?: boolean
  paused?: boolean
}
```

### 数据源类型

```typescript
type DataSourceType = 'rest' | 'websocket' | 'graphql' | 'mqtt' | 'static' | 'mysql' | 'postgresql' | 'influxdb'

interface DataSourceConfig {
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

// REST 数据源
interface RESTConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  params?: Record<string, unknown>
  body?: unknown
}

// WebSocket 数据源
interface WebSocketConfig {
  url: string
  protocols?: string[]
  reconnect?: boolean
  reconnectInterval?: number
}

// MQTT 数据源
interface MQTTConfig {
  host: string
  port: number
  username?: string
  password?: string
  topics: string[]
}

// 静态数据源
interface StaticConfig {
  data: unknown
}

// SQL 数据源
interface SQLConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  query: string
}
```

### 数据绑定

```typescript
interface DataBinding {
  dataSourceId: string
  field: string
  filter?: string
  mapping?: Record<string, string>
  refreshInterval?: number
}
```

### 变量与事件

```typescript
interface VariableSchema {
  name: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description?: string
}

interface EventBinding {
  sourceId: string
  eventName: string
  actions: Action[]
}

interface Action {
  type: 'updateData' | 'showHide' | 'openModal' | 'navigate' | 'triggerAnimation' | 'setVariable' | 'refresh'
  targetId?: string
  params?: Record<string, unknown>
  condition?: string
  delay?: number
}
```

---

## 组件注册

### 组件元数据

```typescript
interface ComponentMeta {
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
```

### 图形节点元数据

```typescript
interface GraphNodeMeta {
  type: string
  name: string
  category: 'process' | 'instrument' | 'electrical' | 'it' | 'flowchart' | 'custom'
  icon: string
  svg: string
  defaultPorts: PortSchema[]
  defaultSize: Size
  stateRules?: StateRule[]
}
```

### 主题配置

```typescript
type ThemeType = 'dark' | 'light' | 'cyber' | 'industrial'

interface ThemeConfig {
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
```
