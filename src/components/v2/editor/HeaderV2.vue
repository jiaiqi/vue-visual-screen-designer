<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import { useExport } from '@/composables/useExport'
import {
  LayoutGrid, Eye, Undo2, Redo2, Download, Trash2,
  ZoomIn, ZoomOut, Maximize, Sun, Moon, Code,
  ChevronDown, FileImage, FileCode2, Save
} from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'open-json-editor'): void
}>()

const router = useRouter()
const editorStore = useEditorStoreV2()
const canvasStore = useCanvasStoreV2()
const { exportToPNG, exportToSVG, exportToJSON, importFromJSON } = useExport()

const zoomRatio = ref(100)
const isDark = ref(true)

function updateZoom() {
  const g = editorStore.graph
  if (g) zoomRatio.value = Math.round(g.zoom() * 100)
}

function handleZoom(delta: number) {
  editorStore.graph?.zoom(delta)
  updateZoom()
}

function handleZoomFit() {
  const g = editorStore.graph
  if (g) {
    g.zoomToFit({ padding: 40, maxScale: 1 })
    g.centerContent()
    updateZoom()
  }
}

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

function handlePreview() {
  const g = editorStore.graph
  if (g) {
    localStorage.setItem('v2_preview_graph_data', JSON.stringify(g.toJSON()))
  }
  router.push('/v2/preview')
}

function handleClearCanvas() {
  if (confirm('确定清空整个画布吗？该操作不可逆转！')) {
    editorStore.clearCanvas()
  }
}

const fileInput = ref<HTMLInputElement>()
function triggerImport() {
  fileInput.value?.click()
}
function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) importFromJSON(file)
}

onMounted(() => {
  setTimeout(() => {
    const g = editorStore.graph
    if (g) {
      updateZoom()
      g.on('scale', updateZoom)
    }
  }, 100)
})

const canUndo = computed(() => editorStore.canUndo)
const canRedo = computed(() => editorStore.canRedo)
</script>

<template>
  <header class="header-v2">
    <!-- Logo 区域 -->
    <div class="header-logo">
      <div class="logo-icon">
        <LayoutGrid class="w-5 h-5 text-slate-950" />
      </div>
      <div class="logo-text">
        <span class="project-name">{{ canvasStore.config.name }}</span>
        <span class="version-badge">v2</span>
      </div>
    </div>

    <!-- 主操作区 -->
    <div class="header-actions">
      <!-- 撤销/重做 -->
      <div class="action-group">
        <button class="icon-btn" :disabled="!canUndo" title="撤销 (Ctrl+Z)" @click="editorStore.undo()">
          <Undo2 class="w-4 h-4" />
        </button>
        <button class="icon-btn" :disabled="!canRedo" title="重做 (Ctrl+Y)" @click="editorStore.redo()">
          <Redo2 class="w-4 h-4" />
        </button>
      </div>

      <div class="divider" />

      <!-- 缩放控制 -->
      <div class="zoom-control">
        <button class="zoom-btn" @click="handleZoom(-0.1)" title="缩小">
          <ZoomOut class="w-3.5 h-3.5" />
        </button>
        <span class="zoom-ratio">{{ zoomRatio }}%</span>
        <button class="zoom-btn" @click="handleZoom(0.1)" title="放大">
          <ZoomIn class="w-3.5 h-3.5" />
        </button>
        <div class="zoom-divider" />
        <button class="zoom-btn" @click="handleZoomFit" title="适应视图">
          <Maximize class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="divider" />

      <!-- 清空画布 -->
      <button class="action-btn danger" @click="handleClearCanvas" title="清空画布">
        <Trash2 class="w-4 h-4" />
        <span>清空</span>
      </button>
    </div>

    <!-- 右侧功能区 -->
    <div class="header-right">
      <!-- 主题切换 -->
      <button class="icon-btn" @click="toggleTheme" :title="isDark ? '切换到亮色' : '切换到暗色'">
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </button>

      <!-- JSON 编辑器 -->
      <button class="icon-btn" @click="emit('open-json-editor')" title="JSON 源码">
        <Code class="w-4 h-4" />
      </button>

      <div class="divider" />

      <!-- 导出下拉 -->
      <div class="dropdown-group">
        <button class="action-btn success" title="导出">
          <Download class="w-4 h-4" />
          <span>导出</span>
          <ChevronDown class="w-3 h-3 opacity-60" />
        </button>
        <div class="dropdown-menu">
          <button class="dropdown-item" @click="exportToPNG()">
            <FileImage class="w-4 h-4 text-emerald-400" />
            <div>
              <div>导出 PNG</div>
              <div class="item-desc">位图（含透明通道）</div>
            </div>
          </button>
          <button class="dropdown-item" @click="exportToSVG()">
            <FileCode2 class="w-4 h-4 text-sky-400" />
            <div>
              <div>导出 SVG</div>
              <div class="item-desc">矢量图（无限放大）</div>
            </div>
          </button>
          <div class="dropdown-divider" />
          <button class="dropdown-item" @click="exportToJSON()">
            <Save class="w-4 h-4 text-indigo-400" />
            <div>
              <div>保存工程文件</div>
              <div class="item-desc">JSON 格式，可再次导入</div>
            </div>
          </button>
          <button class="dropdown-item" @click="triggerImport()">
            <Save class="w-4 h-4 text-amber-400" />
            <div>
              <div>载入工程文件</div>
              <div class="item-desc">从 JSON 文件恢复</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 预览按钮 -->
      <button class="action-btn primary" @click="handlePreview" title="全屏预览">
        <Eye class="w-4 h-4" />
        <span>预览</span>
      </button>
    </div>

    <!-- 隐藏的文件输入 -->
    <input ref="fileInput" type="file" accept=".json" style="display:none" @change="handleImport" />
  </header>
</template>

<style scoped>
.header-v2 {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(2, 6, 23, 0.95);
  border-bottom: 1px solid rgba(51, 65, 85, 0.6);
  backdrop-filter: blur(12px);
  flex-shrink: 0;
  gap: 12px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(14, 165, 233, 0.3);
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.project-name {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.version-badge {
  font-size: 10px;
  font-weight: 700;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 4px;
  padding: 1px 5px;
}

.header-actions, .header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(51, 65, 85, 0.6);
  margin: 0 4px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid rgba(51, 65, 85, 0.5);
  background: rgba(30, 41, 59, 0.5);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s;
}

.icon-btn:hover {
  background: rgba(51, 65, 85, 0.8);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
}

.icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 32px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border-color: rgba(14, 165, 233, 0.3);
}
.action-btn.primary:hover {
  background: #0ea5e9;
  color: #020617;
}

.action-btn.success {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.25);
}
.action-btn.success:hover {
  background: #22c55e;
  color: #020617;
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.25);
}
.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.25);
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.6);
  border-radius: 8px;
  padding: 3px 6px;
}

.zoom-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #64748b;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.15s;
}
.zoom-btn:hover {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

.zoom-ratio {
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
  color: #94a3b8;
  min-width: 38px;
  text-align: center;
}

.zoom-divider {
  width: 1px;
  height: 14px;
  background: rgba(51, 65, 85, 0.6);
  margin: 0 2px;
}

/* 下拉菜单 */
.dropdown-group {
  position: relative;
}

.dropdown-group:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: #1e293b;
  border: 1px solid rgba(51, 65, 85, 0.8);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  width: 100%;
  text-align: left;
  font-size: 13px;
  color: #94a3b8;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.15s;
}
.dropdown-item:hover {
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
}

.item-desc {
  font-size: 10px;
  color: #475569;
  margin-top: 2px;
}

.dropdown-divider {
  height: 1px;
  background: rgba(51, 65, 85, 0.5);
  margin: 4px 0;
}
</style>
