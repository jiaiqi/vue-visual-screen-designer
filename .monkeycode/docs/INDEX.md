# 低代码大屏设计器 文档

vue-visual-screen-designer 是一个基于 Vue 3 的低代码可视化大屏设计器，帮助用户通过拖拽方式快速构建数据可视化大屏。系统支持组件化设计、实时预览、多数据源接入，适用于工业监控、指挥中心、数据展示等场景。

**快速链接**: [架构设计](./ARCHITECTURE.md) | [接口定义](./INTERFACES.md) | [开发者指南](./DEVELOPER_GUIDE.md)

---

## 核心文档

### [架构设计](./ARCHITECTURE.md)
系统设计、技术栈、组件结构和数据流程。从这里开始了解系统如何运作。

### [接口定义](./INTERFACES.md)
API 端点、数据类型 Schema、组件注册规范。集成或扩展系统时的参考。

### [开发者指南](./DEVELOPER_GUIDE.md)
环境搭建、开发工作流、编码规范和常见任务。贡献者必读。

---

## 项目概览

| 模块 | 描述 | 端口 |
|------|------|------|
| `apps/v2-designer` | V2 版本可视化设计器 | 3000 |
| `apps/v2-renderer` | V2 版本大屏渲染器 | 3002 |
| `packages/core` | 核心引擎和类型定义 | - |
| `packages/v2-shared` | V2 共享 DTO 和工具 | - |

---

## 核心概念

理解这些领域概念有助于导航代码库：

| 概念 | 描述 |
|------|------|
| [Schema](./专有概念/Schema.md) | 大屏配置的序列化规范 |
| [组件节点](./专有概念/组件节点.md) | 可视化组件的抽象定义 |
| [数据源](./专有概念/数据源.md) | 动态数据的接入方式 |

---

## 入门指南

### 项目新人？

按此路径学习：
1. **[架构设计](./ARCHITECTURE.md)** - 了解全局
2. **[核心概念](#核心概念)** - 学习领域术语
3. **[开发者指南](./DEVELOPER_GUIDE.md)** - 搭建环境

### 需要集成？

1. **[接口定义](./INTERFACES.md)** - API 契约和数据类型
2. **[架构设计](./ARCHITECTURE.md)** - 系统边界和数据流

### 首次贡献？

1. **[开发者指南](./DEVELOPER_GUIDE.md)** - 搭建和工作流
2. **[常见任务](./DEVELOPER_GUIDE.md#常见任务)** - 分步指南

---

## 快速参考

### 命令

```bash
pnpm install          # 安装依赖
pnpm dev:v2-designer  # 启动设计器 (端口 3000)
pnpm dev:v2-renderer  # 启动渲染器 (端口 3002)
pnpm build            # 生产构建
pnpm test:unit        # 运行测试
pnpm lint             # 代码检查
pnpm type-check       # 类型检查
```

### 技术栈

- **前端框架**: Vue 3.5 + TypeScript
- **图形引擎**: Antv X6, ECharts, Fabric
- **UI 组件**: Naive UI, Tailwind CSS
- **状态管理**: Pinia
- **构建工具**: Vite, Turbo

### 重要文件

| 文件 | 目的 |
|------|------|
| `packages/core/src/types/schema.ts` | Schema 类型定义 |
| `apps/v2-designer/src/components/v2/editor/CanvasEditorV2.vue` | 画布编辑器 |
| `apps/v2-designer/src/stores/v2/workspaceStoreV2.ts` | 工作区状态 |
