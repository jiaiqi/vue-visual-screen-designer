# Vue Visual Screen Designer v2 开发方案（仓库定制完整版）

> 文档版本：v2.0
> 基于仓库状态日期：2026-03-06
> 适用范围：`E:\bx-gitee\vue-visual-screen-designer`

## 01. 目标与约束

### 1.1 项目目标
- 在现有 Monorepo 基础上，把 `v2-designer` 建成可稳定生产使用的工业大屏设计器。
- 建立 `v2-designer -> v2-renderer` 的可发布链路，而不是只停留在编辑器可视化。
- 将当前“功能可用但实现分散”的状态，升级为“架构清晰、可测试、可演进”的工程体系。

### 1.2 当前硬约束
- 前端技术栈固定：Vue 3 + Pinia + X6 + x6-vue-shape + Vite。
- 仓库是纯前端 Monorepo，当前不包含后端服务实现。
- `docs/*` 在 `.gitignore` 中被忽略，因此正式设计文档必须放在应用目录下（如 `apps/v2-designer/docs/`）。

### 1.3 本方案不覆盖内容
- NestJS / PostgreSQL / RBAC / 多租户等服务端架构落地。
- 实时协同服务端（Yjs 中继、持久化服务）实现。
- 云原生部署细节（K8s、APM 平台）实现。

## 02. 仓库现状审计（As-Is）

### 2.1 Monorepo 结构
- 应用层：
  - `apps/v1-designer`：功能相对完整，包含较多可复用实现。
  - `apps/v2-designer`：当前主建设目标，已有编辑器核心能力。
  - `apps/v2-renderer`：仍是占位渲染页。
- 包层：
  - `packages/core`：有 `schema.ts` 类型定义，但 canvas/engine 仍是 placeholder。
  - `packages/v2-shared`：有类型、常量、校验，但与 v2 实际运行数据模型存在差距。
  - `packages/ui`：导出壳层，业务组件沉淀不足。

### 2.2 v2-designer 已具备能力
- 编辑器主界面三栏结构：
  - 左侧图元库 `ToolbarV2.vue`
  - 中部画布 `CanvasEditorV2.vue`
  - 右侧属性面板 `PropertyPanelV2.vue`
- X6 核心能力：
  - 节点/边注册：`src/plugins/x6-nodes.ts`
  - 插件挂载：History / Selection / Transform / Clipboard / Export
  - 拖拽投放：Dnd
- 业务能力：
  - 自动保存（localforage）
  - JSON 导入导出
  - 多类图元与工业连线切换
  - 属性编辑（节点、边、画布）

### 2.3 已识别问题与技术债
- 坐标系统仍有“外部缩放 + 重写 clientToLocal/localToClient”的脆弱点，存在回归风险。
- 图元列表与注册表仍有潜在漂移风险，需制度化防止 `Node/Edge ... does not exist`。
- 导出逻辑与 store 字段存在不一致风险（示例：`useExport.ts` 读取了 `editorStore.canvasConfig`，而 `editorStoreV2` 未提供该字段）。
- v2-renderer 未接入真实 schema，导致发布链路不闭环。
- `packages/core` 的 canvas/engine 仍是 TODO，占用了“核心层”命名但没有承载核心行为。
- v2 缺少自动化测试（单元/组件/E2E 基本空白）。

## 03. To-Be 总体架构

### 3.1 目标架构分层
- L1 交互层（App）
  - `apps/v2-designer`: 编辑、建模、导出
  - `apps/v2-renderer`: 预览、发布态渲染
- L2 领域层（Shared/Domain）
  - `packages/v2-shared`: schema 转换器、校验器、注册清单
- L3 核心层（Core）
  - `packages/core`: schema 类型、渲染抽象、坐标工具、发布模型

### 3.2 核心设计原则
- 单一事实源：编辑态以 X6 JSON 为真相，发布态以 Schema v2.1 为真相。
- 双向转换：显式 `X6JSON <-> SchemaV2` adapter，不在 UI 组件内拼装 schema。
- 可恢复交互：先成功创建新对象，再删除旧对象，避免失败导致对象丢失。
- 注册强一致：图元/连线 UI 列表必须来自统一注册清单。
- 渐进重构：优先稳定主路径，不做一次性大重写。

## 04. 数据模型与 Schema 策略

### 4.1 现状
- 编辑器运行时直接读写 `graph.toJSON()/fromJSON()`。
- `packages/core/src/types/schema.ts` 已定义 `CanvasSchema v2.1`，但尚未成为运行/发布主模型。

### 4.2 决策
- D1：编辑态保持 X6 JSON。
- D2：在 `packages/v2-shared` 增加转换层：
  - `toSchemaV2(x6Json, canvasConfig) => CanvasSchema`
  - `fromSchemaV2(schema) => { x6Json, canvasConfig }`
- D3：所有导出发布相关逻辑只接受 `CanvasSchema v2.1`。

### 4.3 转换器覆盖范围
- 第一阶段（MVP）
  - 支持基础图元、Vue 节点、工业边、端口配置、画布配置。
- 第二阶段
  - 支持动画参数、状态映射、变量与事件。
- 第三阶段
  - 支持数据源绑定与发布资源索引。

## 05. 坐标系统与视口模型

### 5.1 坐标规范
- 统一使用左上角原点、像素坐标。
- 画布逻辑尺寸由 `canvasStoreV2.config.width/height` 定义。
- 视图缩放仅影响视觉，不改变逻辑坐标。

### 5.2 改造要求
- 将当前分散在 `CanvasEditorV2.vue` 的坐标重写逻辑提取为单独适配器（如 `src/utils/viewport-adapter.ts`）。
- 适配器输入：DOMRect + scroll + zoom + padding。
- 适配器输出：
  - `clientToCanvasPoint`
  - `canvasToClientPoint`
  - `getVisibleCanvasRect`

### 5.3 验收标准
- 拖拽到画布四角均为非异常偏移。
- 任意缩放（0.1~5）下拖拽落点误差 <= 1px。
- 回归不再出现左上角负坐标异常。

## 06. 图元/连线注册体系

### 6.1 当前问题
- UI 图元列表在 `ToolbarV2.vue`，X6 注册在 `x6-nodes.ts`，两个源容易漂移。

### 6.2 目标方案
- 新增统一注册清单（建议路径）
  - `apps/v2-designer/src/registry/shapes.ts`
  - `apps/v2-designer/src/registry/edges.ts`
- 清单字段包括：
  - `id`, `kind(node|edge)`, `displayName`, `category`, `isEnabled`, `createConfig`

### 6.3 启动自检
- `useGraphV2.initGraph` 阶段执行一致性检查：
  - Toolbar 显示项必须可 `graph.createNode/createEdge`
  - 对不一致项输出统一告警并在 UI 自动禁用

## 07. 编辑器模块详细方案

### 7.1 HeaderV2
- 目标：动作入口收敛为命令式调用，不直接耦合多处状态。
- 改造：
  - 引入 `useEditorCommands()` 统一暴露 undo/redo/export/import/preview。
  - 预览按钮改为导出 schema 后跳转，不再仅写 localStorage 的 X6 JSON。

### 7.2 ToolbarV2
- 目标：稳定拖拽与统一错误提示。
- 改造：
  - 图元元数据从 registry 拉取，替代硬编码数组。
  - 拖拽错误统一走 `notifyError`（Toast 服务）。
  - 收藏、最近使用记录接入 `storage.favoriteShapes/recentShapes`。

### 7.3 CanvasEditorV2
- 目标：清理“组件内巨量逻辑”，提升可维护性。
- 改造：
  - 拆分 composable：
    - `useViewportSync`
    - `useRulerSync`
    - `useGraphCoordinateAdapter`
  - 去除直接重写 graph 原型方法的散落逻辑，统一通过适配层安装。

### 7.4 PropertyPanelV2
- 目标：属性变更原子化、可追踪。
- 改造：
  - Node/Edge 属性更新统一通过 command layer，避免多个组件直接 setData/attr。
  - Edge 切换保留当前“先建后删”的安全流程，补充对 router/connector/labels 的兼容兜底。

### 7.5 LayerPanelV2
- 目标：图层与选择态一致。
- 改造：
  - 图层排序、显隐、锁定全部映射到 graph cell data 与 attrs。

## 08. 插件与扩展架构

### 8.1 当前插件
- `x6-nodes.ts`、`echarts.ts` 是事实插件入口。

### 8.2 目标插件生命周期
- 统一接口：
  - `register()`
  - `init(graph, ctx)`
  - `dispose()`
- 插件加载器：`src/plugins/index.ts`
- 插件上下文：store、schemaAdapter、eventBus、theme。

### 8.3 健康检查
- 每个插件返回 `health`（ok/warn/error）及消息，用于开发模式诊断面板。

## 09. 存储、自动保存与版本迁移

### 9.1 存储分层
- 短期
  - localforage 自动保存：编辑器恢复。
- 中期
  - 区分 `draft` 与 `snapshot`。

### 9.2 自动保存改造
- 当前 `useAutoSave` 存储结构中仅有 `version: '2.0.0'`。
- 需升级为：
  - `formatVersion`
  - `appVersion`
  - `savedAt`
  - `payloadType(x6-json|schema-v2)`
  - `payload`

### 9.3 迁移机制
- 新增 `migrations`：按 `formatVersion` 逐级迁移。
- 恢复失败策略：
  - 不覆盖当前画布
  - 显示友好提示并可导出损坏数据供排查

## 10. 导入导出与发布快照

### 10.1 当前状态
- `useExport.ts` 支持 PNG/SVG/JSON 导出与 JSON 导入。
- 但缺少统一项目文件协议与 schema 导出协议。

### 10.2 目标协议
- `.vvsd.json`（设计工程文件）
  - 包含编辑态 X6 JSON + 画布配置 + 元数据
- `.vvsd-schema.json`（发布快照）
  - 仅包含 Schema v2.1 + 资源引用清单

### 10.3 导出策略
- 设计导出：保留可编辑信息。
- 发布导出：剥离编辑器临时数据、压缩可选字段。

## 11. v2-renderer 落地方案

### 11.1 目标
- 将 `apps/v2-renderer/src/views/PreviewView.vue` 从占位页升级为真实渲染容器。

### 11.2 三阶段实现
- R1：可加载 `schema-v2` 并绘制基础节点/边。
- R2：支持核心动画与数据驱动刷新。
- R3：支持主题、资源懒加载、错误降级。

### 11.3 renderer 输入契约
- 入参：
  - `schema`
  - `theme`
  - `runtimeEnv`
- 输出：
  - 渲染完成事件
  - 异常事件（可被监控采集）

## 12. 包层重构方案（core / v2-shared / ui）

### 12.1 packages/core
- 现状：canvas/engine 为 placeholder。
- 目标：
  - `types`: 保持 schema 权威定义
  - `utils`: 坐标、颜色、数据映射工具
  - `engine`: renderer 通用抽象（接口与适配层）

### 12.2 packages/v2-shared
- 目标成为“v2 领域层”
  - schema adapter
  - registry types
  - validator
  - migration

### 12.3 packages/ui
- 承接可复用 UI（如统一错误提示、弹窗、表单段）
- 减少 apps 内重复实现

## 13. 错误边界与 UX 规范

### 13.1 错误分级
- P0：阻断核心流程（拖拽失败、连线丢失）
- P1：功能可降级（某类图元禁用）
- P2：视觉/体验问题

### 13.2 错误处理规范
- 统一 `ErrorCode` 与 `ErrorMessageMap`。
- 所有用户可感知错误必须可读、可操作、可恢复。
- 关键动作失败必须保留原状态，不允许“静默丢失”。

### 13.3 统一提示组件
- 新增 `GlobalToast` + `useNotifier()`。
- Toolbar/PropertyPanel/Header 不再自行拼提示逻辑。

## 14. 性能优化方案

### 14.1 指标预算
- 画布 300 节点 / 500 边场景下：
  - 拖拽操作 FPS >= 45
  - 属性变更反馈 <= 100ms
  - 首次进入编辑器 TTI <= 3.0s（本地开发除外）

### 14.2 优化动作
- Node/Edge 批处理更新，减少频繁 setData。
- 重型面板（图表配置）按需渲染。
- 图元库搜索与分类缓存。
- 大图上传压缩与懒加载。

## 15. 测试与质量保障

### 15.1 测试分层
- 单元测试（Vitest）
  - 转换器、校验器、坐标适配器、迁移函数
- 组件测试（Vue Test Utils）
  - Toolbar 拖拽入口、Edge 切换、属性更新
- E2E（Playwright，建议新增）
  - 拖拽放置、连线切换、导入导出、预览渲染

### 15.2 回归用例基线
- C1：左上角拖拽落点正确。
- C2：所有图元都可拖拽创建。
- C3：切换任意 edge shape 不丢线。
- C4：导出再导入后画布一致。
- C5：schema 导出后 renderer 可加载。

### 15.3 CI 门禁
- `pnpm type-check`
- `pnpm lint`
- `pnpm test:unit`
- E2E 冒烟（至少主流程）

## 16. 工程规范与分支策略

### 16.1 分支策略
- 主分支：`main`
- 功能分支：`feature/v2-*`
- 修复分支：`fix/v2-*`

### 16.2 提交规范
- `feat(v2-designer): ...`
- `fix(v2-designer): ...`
- `refactor(v2-shared): ...`
- `test(v2): ...`

### 16.3 代码规范
- Vue 组件使用 `<script setup lang="ts">`。
- 业务状态统一走 Pinia，不在深层组件堆状态。
- 常量与类型优先抽离到 shared 包。

## 17. 里程碑与排期（建议 8 周）

### 17.1 M1 稳定性里程碑（第 1-2 周）
- 坐标适配层落地
- 注册表统一与自检
- 统一错误提示
- 三大核心回归用例自动化

### 17.2 M2 模型里程碑（第 3-4 周）
- `X6JSON <-> SchemaV2` 双向转换
- 导入导出协议升级
- 自动保存版本迁移机制

### 17.3 M3 发布链路里程碑（第 5-6 周）
- renderer 接入 schema 渲染
- 预览链路改为 schema 驱动
- 发布快照可生成、可加载

### 17.4 M4 工程化里程碑（第 7-8 周）
- 插件生命周期改造
- 质量门禁完善（CI + E2E）
- 性能预算验证与优化收口

## 18. 详细任务拆解（按文件）

### 18.1 P0 任务（必做）
- `apps/v2-designer/src/components/v2/editor/CanvasEditorV2.vue`
  - 拆分坐标适配与视口同步逻辑。
- `apps/v2-designer/src/components/v2/editor/ToolbarV2.vue`
  - 使用统一 registry，接入 notifier。
- `apps/v2-designer/src/components/v2/editor/properties/EdgePropertiesV2.vue`
  - 强化切换失败兜底与错误码。
- `apps/v2-designer/src/plugins/x6-nodes.ts`
  - 对外暴露可查询的注册结果。
- `apps/v2-designer/src/stores/v2/editorStoreV2.ts`
  - 新增 command facade，收敛操作入口。

### 18.2 P1 任务（高优先）
- `packages/v2-shared/src/adapters/*`（新增）
  - 双向转换器。
- `packages/v2-shared/src/migrations/*`（新增）
  - 自动保存与工程文件迁移。
- `apps/v2-designer/src/composables/useExport.ts`
  - 协议升级与 store 字段对齐。

### 18.3 P2 任务（中优先）
- `apps/v2-renderer/src/views/PreviewView.vue`
  - 实现 schema 渲染入口。
- `packages/core/src/engine/*`
  - 抽象渲染接口。
- `apps/v2-designer/src/plugins/*`
  - 生命周期管理器。

## 19. 风险清单与应对

### R-01 坐标逻辑回归
- 风险：拖拽、缩放、滚动组合下再次偏移。
- 应对：坐标适配器单测 + E2E 四角回归。

### R-02 注册表漂移
- 风险：新增图元忘记注册导致运行时报错。
- 应对：启动自检 + CI 静态检查 registry 一致性。

### R-03 模型转换不完整
- 风险：schema 导出后信息丢失。
- 应对：建立“导出->导入->比对”黄金测试集。

### R-04 renderer 进度拖慢
- 风险：designer 完成但发布链路不可用。
- 应对：并行推进最小 renderer，先保核心节点。

## 20. 验收标准（Definition of Done）

### 20.1 功能验收
- 设计器核心流程（拖拽、连线、属性、保存、导入导出）稳定。
- 任一注册图元可创建，任一注册连线可切换。
- 预览由 schema 驱动，不依赖 editor 内部私有数据。

### 20.2 质量验收
- Type check、lint、unit test 全绿。
- 核心 E2E 用例全绿。
- 无 P0/P1 未关闭缺陷。

### 20.3 文档验收
- 开发者可按本文档直接定位改造范围与验收方法。
- 关键协议（工程文件、发布快照、schema adapter）均有示例。

## 21. 首批执行建议（你可以直接按这个顺序开工）

1. 先做坐标适配器 + 拖拽回归测试（优先把核心稳定性锁住）。
2. 再做 registry 统一与自检（彻底消灭未注册节点/连线问题）。
3. 再做 schema adapter（建立 designer 和 renderer 的桥）。
4. 最后接 renderer 最小渲染闭环，并把导出链路切到 schema。

---

## 附录 A：关键文件索引
- `apps/v2-designer/src/components/v2/editor/CanvasEditorV2.vue`
- `apps/v2-designer/src/components/v2/editor/ToolbarV2.vue`
- `apps/v2-designer/src/components/v2/editor/properties/NodePropertiesV2.vue`
- `apps/v2-designer/src/components/v2/editor/properties/EdgePropertiesV2.vue`
- `apps/v2-designer/src/plugins/x6-nodes.ts`
- `apps/v2-designer/src/composables/useGraphV2.ts`
- `apps/v2-designer/src/composables/useAutoSave.ts`
- `apps/v2-designer/src/composables/useExport.ts`
- `apps/v2-designer/src/stores/v2/editorStoreV2.ts`
- `apps/v2-designer/src/stores/v2/canvasStoreV2.ts`
- `apps/v2-renderer/src/views/PreviewView.vue`
- `packages/core/src/types/schema.ts`
- `packages/v2-shared/src/types/index.ts`
- `packages/v2-shared/src/validators/index.ts`
