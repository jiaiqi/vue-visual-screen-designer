# 大屏设计器重构计划

## 目标

将当前项目重构为专业级的低代码大屏设计工具，核心目标：

1. **编辑模式**：固定画布尺寸（默认 1920×1080），支持自定义宽高
2. **预览模式**：CSS scale 缩放方案，自动适应不同分辨率
3. **流程图支持**：可拖入 X6 节点，使用自定义边连接
4. **丰富的自定义性**：节点、连接桩、边都可高度定制

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Screen Designer v2                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Editor View (编辑器视图)                 │    │
│  │  ┌──────────┬───────────────────┬──────────────┐   │    │
│  │  │ Toolbar  │   Canvas Editor   │ PropertyPanel│   │    │
│  │  │ (图元库)  │   (固定尺寸画布)   │  (属性面板)   │   │    │
│  │  └──────────┴───────────────────┴──────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Preview View (预览视图)                  │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │     CSS Scale Container (自适应缩放容器)        │  │    │
│  │  │     transform: scale(ratio)                    │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构

```
src/
├── views/
│   ├── v2/                          # 新版本视图
│   │   ├── EditorViewV2.vue         # 新编辑器页面
│   │   └── PreviewViewV2.vue        # 新预览页面
│   └── ...                          # 保留旧版本
│
├── components/
│   └── v2/                          # 新版本组件
│       ├── editor/
│       │   ├── CanvasEditorV2.vue   # 固定尺寸画布编辑器
│       │   ├── ToolbarV2.vue        # 图元工具栏
│       │   ├── PropertyPanelV2.vue  # 属性面板
│       │   ├── LayerPanelV2.vue     # 图层面板
│       │   └── HeaderV2.vue         # 顶部导航
│       │
│       └── nodes/                   # Vue 节点组件
│           ├── FlowNode.vue         # 流程图节点
│           ├── ChartNodeV2.vue      # 图表节点
│           ├── TableNodeV2.vue      # 表格节点
│           └── StatusNode.vue       # 状态节点
│
├── core/                            # 核心模块
│   ├── graph/                       # Graph 引擎
│   │   ├── index.ts                 # Graph 初始化
│   │   ├── nodes/                   # 节点注册
│   │   │   ├── flow-nodes.ts        # 流程图节点
│   │   │   ├── chart-nodes.ts       # 图表节点
│   │   │   └── device-nodes.ts      # 设备节点
│   │   ├── edges/                   # 边注册
│   │   │   ├── index.ts             # 边类型导出
│   │   │   ├── data-flow-edge.ts    # 数据流边
│   │   │   ├── signal-edge.ts       # 信号边
│   │   │   └── pipe-edge.ts         # 管道边
│   │   └── ports/                   # 连接桩配置
│   │       └── port-configs.ts      # 连接桩预设
│   │
│   ├── canvas/                      # 画布管理
│   │   ├── scale-manager.ts         # 缩放管理器
│   │   └── viewport-manager.ts      # 视口管理器
│   │
│   └── storage/                     # 存储管理
│       └── project-storage.ts       # 项目持久化
│
├── stores/
│   └── v2/                          # 新版本状态
│       ├── editorStoreV2.ts         # 编辑器状态
│       ├── canvasStoreV2.ts         # 画布状态
│       └── projectStoreV2.ts        # 项目状态
│
├── composables/
│   └── v2/                          # 新版本组合式函数
│       ├── useGraphV2.ts            # Graph 实例管理
│       ├── useScaleAdapter.ts       # 缩放适配器
│       └── useCanvasResize.ts       # 画布尺寸变化
│
└── router/
    └── index.ts                     # 路由配置（新增 v2 路由）
```

---

## 实现阶段

### 阶段一：基础架构搭建 (Phase 1)

**目标**：创建新目录结构，实现固定尺寸画布

**任务清单**：

- [x] 1.1 创建目录结构
- [ ] 1.2 实现新的 Store（editorStoreV2, canvasStoreV2）
- [ ] 1.3 实现 CanvasEditorV2 组件（固定尺寸画布）
- [ ] 1.4 实现 useGraphV2 组合式函数
- [ ] 1.5 创建 EditorViewV2 页面
- [ ] 1.6 配置路由

### 阶段二：预览缩放系统 (Phase 2)

**目标**：实现 CSS scale 缩放预览

**任务清单**：

- [ ] 2.1 实现 useScaleAdapter 组合式函数
- [ ] 2.2 实现 PreviewViewV2 页面
- [ ] 2.3 实现缩放比例计算逻辑
- [ ] 2.4 实现全屏预览功能

### 阶段三：节点系统重构 (Phase 3)

**目标**：重构节点注册系统，支持流程图节点

**任务清单**：

- [ ] 3.1 实现流程图节点（start, end, process, decision）
- [ ] 3.2 重构 Vue 节点注册
- [ ] 3.3 实现连接桩配置系统
- [ ] 3.4 实现 ToolbarV2 图元面板

### 阶段四：边与连线系统 (Phase 4)

**目标**：实现丰富的边类型和连线交互

**任务清单**：

- [ ] 4.1 注册新的边类型
- [ ] 4.2 实现边的动画效果
- [ ] 4.3 实现连线交互优化
- [ ] 4.4 实现边的属性配置

### 阶段五：属性面板 (Phase 5)

**目标**：实现完整的属性编辑面板

**任务清单**：

- [ ] 5.1 实现 PropertyPanelV2 组件
- [ ] 5.2 实现画布属性编辑
- [ ] 5.3 实现节点属性编辑
- [ ] 5.4 实现边属性编辑

### 阶段六：完善与优化 (Phase 6)

**目标**：完善功能，优化体验

**任务清单**：

- [ ] 6.1 实现撤销/重做
- [ ] 6.2 实现复制/粘贴
- [ ] 6.3 实现导出功能
- [ ] 6.4 实现项目保存/加载
- [ ] 6.5 性能优化

---

## 核心技术方案

### 1. 固定尺寸画布实现

```typescript
// 编辑器画布配置
interface CanvasConfig {
  width: number      // 画布宽度，默认 1920
  height: number     // 画布高度，默认 1080
  scale: number      // 编辑器缩放比例（用于在视口内查看）
}
```

**实现思路**：
- 画布容器固定为设计尺寸（如 1920×1080）
- 外层容器提供滚动或缩放查看能力
- X6 Graph 尺寸与画布尺寸一致

### 2. 预览缩放实现

```typescript
// 缩放适配器
function calculateScale(containerWidth: number, containerHeight: number, canvasWidth: number, canvasHeight: number) {
  const scaleX = containerWidth / canvasWidth
  const scaleY = containerHeight / canvasHeight

  // 默认等比缩放，保持宽高比
  return Math.min(scaleX, scaleY)
}
```

**CSS 缩放方案**：
```css
.preview-container {
  width: 1920px;
  height: 1080px;
  transform-origin: 0 0;
  transform: scale(var(--scale-ratio));
}
```

### 3. 节点坐标存储

为保证不同分辨率下的一致性，节点坐标存储为：
- 设计坐标：相对于设计尺寸的绝对坐标
- 无需百分比转换，因为使用 CSS 整体缩放

---

## 兼容性说明

- 旧版编辑器路径：`/` 或 `/editor`
- 新版编辑器路径：`/v2/editor`
- 新版预览路径：`/v2/preview`

两套系统完全独立，互不影响。

---

## 开始实施

现在开始按阶段一任务清单实施。