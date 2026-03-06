<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import { useWorkspaceStoreV2 } from '@/stores/v2/workspaceStoreV2'
import { useEditorCommands } from '@/composables/useEditorCommands'
import { useNotifier } from '@/composables/useNotifier'
import { x6ToSchemaV2 } from '@vue-visual-screen/v2-shared'
import {
  LayoutGrid, Eye, Undo2, Redo2, Download, Trash2,
  ZoomIn, ZoomOut, Maximize, Code,
  ChevronDown, FileImage, FileCode2, Save, Upload,
  Moon, Sun, PanelLeft, PanelRight,
} from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'open-json-editor'): void
}>()

const editorStore = useEditorStoreV2()
const canvasStore = useCanvasStoreV2()
const workspaceStore = useWorkspaceStoreV2()
const commands = useEditorCommands()
const notifier = useNotifier()
const router = useRouter()

const zoomRatio = computed(() => Math.round(canvasStore.viewport.zoom * 100))
const isDark = ref(true)

function handleZoom(delta: number) {
  commands.zoomBy(delta)
}

function handleZoomFit() {
  commands.resetZoom()
}

function handlePreview() {
  const g = editorStore.graph
  if (g) {
    const graphJson = g.toJSON() as Record<string, unknown>
    localStorage.setItem('v2_preview_graph_data', JSON.stringify(graphJson))

    const schema = x6ToSchemaV2(graphJson, {
      width: canvasStore.config.width,
      height: canvasStore.config.height,
      backgroundColor: canvasStore.config.backgroundColor,
    })
    localStorage.setItem('v2_preview_schema_data', JSON.stringify(schema))

    void workspaceStore.saveCurrentPageSnapshot({
      canvasConfig: canvasStore.exportConfig() as Record<string, unknown>,
      graphData: graphJson,
    })
  }

  const appId = workspaceStore.activeAppId
  const pageId = workspaceStore.activePageId
  if (!appId || !pageId) {
    notifier.warning('无法预览', '当前未选择页面，请先从应用管理进入页面编辑。')
    return
  }
  window.open(`/app/${appId}/page/${pageId}/preview`, '_blank')
}

function handleClearCanvas() {
  if (confirm('确定清空整个画布？此操作不可撤销！')) {
    commands.clearCanvas()
  }
}

const fileInput = ref<HTMLInputElement>()
function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) commands.importFromJSON(file)
}

const canUndo = computed(() => editorStore.canUndo)
const canRedo = computed(() => editorStore.canRedo)
const projectName = computed(() => workspaceStore.activePage?.name || canvasStore.config.name)
const currentPages = computed(() => workspaceStore.currentPages)
const currentPageId = computed(() => workspaceStore.activePageId || '')

async function handlePageChange(e: Event) {
  const pageId = (e.target as HTMLSelectElement).value
  if (!pageId) return
  const page = workspaceStore.pages.find((item) => item.id === pageId)
  if (!page) return
  await workspaceStore.setActivePage(pageId)
  await router.push(`/app/${page.appId}/page/${page.id}/editor`)
}

async function handlePublish() {
  const g = editorStore.graph
  if (!g) return
  try {
    await workspaceStore.saveCurrentPageSnapshot({
      canvasConfig: canvasStore.exportConfig() as Record<string, unknown>,
      graphData: g.toJSON() as Record<string, unknown>,
    })
    const release = await workspaceStore.publishCurrentPage('设计器发布')
    notifier.success('发布成功', `已创建版本 ${release.version}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : '发布失败'
    notifier.error('发布失败', message)
  }
}
</script>

<template>
  <header class="header-v2">
    <!-- 左区：Logo + 项目名 -->
    <div class="hv2-left">
      <div class="hv2-logo">
        <LayoutGrid class="w-4 h-4 text-white" />
      </div>
      <div class="hv2-project">
        <span class="hv2-name">{{ projectName }}</span>
        <span class="hv2-badge">v2</span>
      </div>
      <select class="hv2-page-select" :value="currentPageId" @change="handlePageChange">
        <option v-for="page in currentPages" :key="page.id" :value="page.id">
          {{ page.name }}
        </option>
      </select>

      <!-- 面板折叠快捷按钮 -->
      <div class="hv2-panel-toggle">
        <button class="hv2-toggle-btn" :title="editorStore.isToolbarCollapsed ? '展开图元库' : '折叠图元库'"
          @click="editorStore.toggleToolbar()">
          <PanelLeft class="w-3.5 h-3.5" />
        </button>
        <button class="hv2-toggle-btn" :title="editorStore.isPropertyPanelCollapsed ? '展开属性面板' : '折叠属性面板'"
          @click="editorStore.togglePropertyPanel()">
          <PanelRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- 中区：主操作工具栏 -->
    <div class="hv2-center">
      <!-- 撤销/重做 -->
      <div class="hv2-group">
        <button class="hv2-icon-btn" :disabled="!canUndo" title="撤销 (Ctrl+Z)" @click="editorStore.undo()">
          <Undo2 class="w-3.5 h-3.5" />
        </button>
        <button class="hv2-icon-btn" :disabled="!canRedo" title="重做 (Ctrl+Y)" @click="editorStore.redo()">
          <Redo2 class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="hv2-sep" />

      <!-- 缩放控制 -->
      <div class="hv2-zoom">
        <button class="hv2-zoom-btn" @click="handleZoom(-0.1)" title="缩小">
          <ZoomOut class="w-3.5 h-3.5" />
        </button>
        <span class="hv2-zoom-val">{{ zoomRatio }}%</span>
        <button class="hv2-zoom-btn" @click="handleZoom(0.1)" title="放大">
          <ZoomIn class="w-3.5 h-3.5" />
        </button>
        <div class="hv2-zoom-sep" />
        <button class="hv2-zoom-btn" @click="handleZoomFit" title="适应视图">
          <Maximize class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="hv2-sep" />

      <!-- 清空 -->
      <button class="hv2-action danger" @click="handleClearCanvas" title="清空画布">
        <Trash2 class="w-3.5 h-3.5" />
        <span>清空</span>
      </button>
    </div>

    <!-- 右区：操作 + 导出 + 预览 -->
    <div class="hv2-right">
      <!-- 主题切换 -->
      <button class="hv2-icon-btn" @click="isDark = !isDark" :title="isDark ? '亮色主题' : '暗色主题'">
        <Sun v-if="isDark" class="w-3.5 h-3.5" />
        <Moon v-else class="w-3.5 h-3.5" />
      </button>

      <!-- JSON 编辑器 -->
      <button class="hv2-icon-btn" @click="emit('open-json-editor')" title="JSON 数据编辑">
        <Code class="w-3.5 h-3.5" />
      </button>

      <div class="hv2-sep" />
      <button class="hv2-action" @click="router.push('/apps')">
        <span>应用管理</span>
      </button>
      <button class="hv2-action" @click="handlePublish">
        <span>发布</span>
      </button>

      <!-- 导出下拉 -->
      <div class="hv2-dropdown">
        <button class="hv2-action success">
          <Download class="w-3.5 h-3.5" />
          <span>导出</span>
          <ChevronDown class="w-3 h-3 opacity-50" />
        </button>
        <div class="hv2-dropdown-menu">
          <button class="hv2-dropdown-item" @click="commands.exportToPNG()">
            <FileImage class="w-3.5 h-3.5 text-emerald-400" style="flex-shrink:0" />
            <div>
              <div class="item-text">导出 PNG</div>
              <div class="item-sub">高质量位图</div>
            </div>
          </button>
          <button class="hv2-dropdown-item" @click="commands.exportToSVG()">
            <FileCode2 class="w-3.5 h-3.5 text-sky-400" style="flex-shrink:0" />
            <div>
              <div class="item-text">导出 SVG</div>
              <div class="item-sub">无损矢量图</div>
            </div>
          </button>
          <div class="hv2-dropdown-divider" />
          <button class="hv2-dropdown-item" @click="commands.exportToJSON()">
            <Save class="w-3.5 h-3.5 text-indigo-400" style="flex-shrink:0" />
            <div>
              <div class="item-text">保存工程文件</div>
              <div class="item-sub">JSON 格式</div>
            </div>
          </button>
          <button class="hv2-dropdown-item" @click="fileInput?.click()">
            <Upload class="w-3.5 h-3.5 text-amber-400" style="flex-shrink:0" />
            <div>
              <div class="item-text">载入工程文件</div>
              <div class="item-sub">从 JSON 文件恢复</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 预览按钮 -->
      <button class="hv2-action primary" @click="handlePreview">
        <Eye class="w-3.5 h-3.5" />
        <span>预览</span>
      </button>
    </div>

    <input ref="fileInput" type="file" accept=".json" style="display:none" @change="handleImport" />
  </header>
</template>

<style scoped>
.header-v2 {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 8px;
  background: rgba(2, 6, 23, 0.97);
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  backdrop-filter: blur(16px);
  flex-shrink: 0;
  position: relative;
  z-index: 50;
}

/* 左区 */
.hv2-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  min-width: 0;
}

.hv2-logo {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(14, 165, 233, 0.25);
  flex-shrink: 0;
}

.hv2-project {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hv2-page-select {
  height: 28px;
  max-width: 180px;
  border-radius: 6px;
  border: 1px solid rgba(51, 65, 85, 0.7);
  background: rgba(15, 23, 42, 0.72);
  color: #cbd5e1;
  font-size: 12px;
  padding: 0 8px;
}

.hv2-name {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
  max-width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hv2-badge {
  font-size: 9px;
  font-weight: 700;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.28);
  border-radius: 4px;
  padding: 1px 5px;
  letter-spacing: 0.04em;
}

.hv2-panel-toggle {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
}

.hv2-toggle-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  border: 1px solid rgba(51, 65, 85, 0.4);
  background: rgba(30, 41, 59, 0.3);
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}

.hv2-toggle-btn:hover {
  color: #94a3b8;
  border-color: rgba(56, 189, 248, 0.2);
  background: rgba(56, 189, 248, 0.05);
}

/* 中区 */
.hv2-center {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.hv2-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.hv2-sep {
  width: 1px;
  height: 18px;
  background: rgba(51, 65, 85, 0.5);
  margin: 0 4px;
}

/* 缩放控制 */
.hv2-zoom {
  display: flex;
  align-items: center;
  gap: 3px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 7px;
  padding: 3px 6px;
}

.hv2-zoom-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.hv2-zoom-btn:hover {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

.hv2-zoom-val {
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
  color: #94a3b8;
  min-width: 36px;
  text-align: center;
}

.hv2-zoom-sep {
  width: 1px;
  height: 14px;
  background: rgba(51, 65, 85, 0.5);
  margin: 0 2px;
}

/* 图标按钮 */
.hv2-icon-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid rgba(51, 65, 85, 0.4);
  background: rgba(30, 41, 59, 0.3);
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.hv2-icon-btn:hover {
  background: rgba(51, 65, 85, 0.5);
  color: #94a3b8;
  border-color: rgba(51, 65, 85, 0.6);
}

.hv2-icon-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

/* 右区 */
.hv2-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* 操作按钮 */
.hv2-action {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  height: 30px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  white-space: nowrap;
}

.hv2-action.primary {
  background: rgba(14, 165, 233, 0.12);
  color: #38bdf8;
  border-color: rgba(14, 165, 233, 0.25);
}

.hv2-action.primary:hover {
  background: #0ea5e9;
  color: #020617;
}

.hv2-action.success {
  background: rgba(34, 197, 94, 0.08);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.2);
}

.hv2-action.success:hover {
  background: #22c55e;
  color: #020617;
}

.hv2-action.danger {
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.2);
}

.hv2-action.danger:hover {
  background: rgba(239, 68, 68, 0.18);
}

/* 下拉菜单 */
.hv2-dropdown {
  position: relative;
}

.hv2-dropdown:hover .hv2-dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.hv2-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 200px;
  background: #0f172a;
  border: 1px solid rgba(51, 65, 85, 0.7);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.03);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.hv2-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 7px;
  width: 100%;
  text-align: left;
  font-size: 12px;
  color: #94a3b8;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.12s;
}

.hv2-dropdown-item:hover {
  background: rgba(51, 65, 85, 0.4);
  color: #e2e8f0;
}

.item-text {
  font-weight: 600;
  font-size: 12px;
}

.item-sub {
  font-size: 10px;
  color: #475569;
  margin-top: 1px;
}

.hv2-dropdown-divider {
  height: 1px;
  background: rgba(51, 65, 85, 0.4);
  margin: 4px 0;
}
</style>
