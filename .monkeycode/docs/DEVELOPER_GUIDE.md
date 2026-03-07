# 开发者指南

本文档为贡献者提供环境搭建、开发工作流、编码规范和常见任务的指导。

## 项目目的

vue-visual-screen-designer 是一个低代码可视化大屏设计器系统，通过拖拽方式帮助用户快速构建数据可视化大屏。

**核心职责**：
- 提供可视化拖拽编辑能力
- 支持多种数据源接入
- 实现高性能大屏渲染

## 环境要求

### 前置条件

- **Node.js** >= 20.19.0 (推荐 22.12.0+)
- **PNPM** >= 9.0.0
- **Git**

### 推荐 IDE

- **VS Code** + **Vue - Official** 插件
- 浏览器：Chrome/Edge/Firefox + Vue DevTools

## 安装

```bash
# 克隆仓库
git clone <repo-url>
cd vue-visual-screen-designer

# 安装依赖
pnpm install
```

## 环境变量

本项目无需环境变量即可本地开发。

如需连接后端服务，可配置：

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `VITE_API_BASE` | API 基础路径 | `/api` |

## 运行

### 开发模式

```bash
# 启动所有应用
pnpm dev

# 启动 V2 设计器 (端口 3000)
pnpm dev:v2-designer

# 启动 V2 渲染器 (端口 3002)
pnpm dev:v2-renderer
```

### 构建

```bash
# 构建所有包和应用
pnpm build

# 仅构建 V2 设计器和渲染器
pnpm build:v2

# 仅构建共享包
pnpm build:packages
```

### 测试

```bash
# 运行单元测试
pnpm test:unit

# 运行类型检查
pnpm type-check

# 运行代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 项目结构

```
vue-visual-screen-designer/
├── apps/
│   ├── v1-designer/          # V1 设计器 (Legacy)
│   ├── v2-designer/          # V2 设计器 (当前主力)
│   └── v2-renderer/          # V2 渲染器
├── packages/
│   ├── core/                 # 核心引擎
│   ├── ui/                   # UI 组件库
│   └── v2-shared/            # V2 共享
└── ...
```

## 开发工作流

### 分支策略

- `main` - 生产就绪代码
- `feature/*` - 新功能开发
- `fix/*` - Bug 修复

### 提交前检查

```bash
# 运行所有检查
pnpm lint
pnpm type-check
pnpm test:unit
```

## 常见任务

### 添加新组件节点

**需修改的文件**：
1. `apps/v2-designer/src/components/v2/nodes/` - 创建组件文件
2. `apps/v2-designer/src/registry/shapes.ts` - 注册组件

**步骤**：
1. 创建 Vue 组件，实现节点渲染逻辑
2. 在 shapes.ts 中注册组件元数据
3. 添加组件图标到工具栏

**示例**：

```typescript
// apps/v2-designer/src/registry/shapes.ts
export const customShapes = [
  {
    type: 'custom-chart',
    name: '自定义图表',
    category: 'chart',
    icon: 'BarChart',
    defaultSize: { width: 400, height: 300 },
    defaultProps: { ... },
  }
]
```

### 添加新图形节点

**需修改的文件**：
1. `apps/v2-designer/src/data/graph-nodes/` - 添加 SVG 定义
2. `apps/v2-designer/src/registry/edges.ts` - 注册图形

**支持的图形类别**：
- `process` - 工艺流程
- `instrument` - 仪表设备
- `electrical` - 电气元件
- `it` - IT 设备

### 添加新数据源类型

**需修改的文件**：
1. `packages/core/src/types/schema.ts` - 添加数据源类型
2. `packages/core/src/engine/` - 实现数据获取逻辑

**支持的数据源类型**：
- `rest` - REST API
- `websocket` - WebSocket
- `graphql` - GraphQL
- `mqtt` - MQTT
- `static` - 静态数据
- `mysql/postgresql/influxdb` - 数据库

### 修改编辑器行为

**核心 Hooks**：
- `useGraphV2.ts` - 图形操作（添加、删除、连线）
- `useEditorCommands.ts` - 编辑命令（撤销、重做）
- `useScaleAdapter.ts` - 画布缩放适配

### 添加主题

**需修改的文件**：
1. `apps/v2-designer/src/stores/v2/themeStoreV2.ts` - 添加主题配置
2. `packages/core/src/types/schema.ts` - 添加主题类型

**主题类型**：
- `dark` - 深色主题
- `light` - 浅色主题
- `cyber` - 赛博朋克
- `industrial` - 工业风格

## 编码规范

### 文件组织

- 每个文件一个组件/类
- 文件以其默认导出命名
- 相关文件放在同一目录

### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `ChartNode.vue` |
| 工具文件 | camelCase | `useGraphV2.ts` |
| 类型文件 | camelCase | `workspace.dto.ts` |
| 常量文件 | camelCase | `constants/index.ts` |

### 组件开发规范

```typescript
// 推荐：使用组合式 API
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 300
})

const emit = defineEmits<{
  update: [value: string]
}>()

const value = ref('')
</script>
```

### 状态管理规范

```typescript
// 使用 Pinia
import { defineStore } from 'pinia'

export const useCanvasStore = defineStore('canvas', () => {
  const nodes = ref<Node[]>([])

  function addNode(node: Node) {
    nodes.value.push(node)
  }

  return {
    nodes,
    addNode
  }
})
```

### 测试规范

```typescript
// 测试文件命名
filename.spec.ts
filename.test.ts

// 测试结构
describe('ComponentName', () => {
  it('should render correctly', () => {
    // test implementation
  })
})
```

## 调试技巧

### Vue DevTools

- 安装 Vue DevTools 浏览器扩展
- 在 Chrome 中开启 Custom Object Formatter

### 画布调试

- 使用 `CanvasEditorV2.vue` 中的调试面板
- 查看 Pinia 状态：`window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps[0].config.globalProperties.$pinia`

### 网络请求

- 使用浏览器开发者工具 Network 面板
- 检查 localforage 存储：Application > IndexedDB

## 构建与发布

### 生产构建

```bash
pnpm build
```

输出目录：
- `apps/v2-designer/dist`
- `apps/v2-renderer/dist`

### 部署注意事项

- 确保后端 API 正确配置
- 静态资源使用 CDN
- 考虑 SSR 方案
