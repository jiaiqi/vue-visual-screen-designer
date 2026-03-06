<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Graph } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import { useExport } from '@/composables/useExport'
import { useAutoLayout, type LayoutType } from '@/composables/useAutoLayout'
import { useRouter } from 'vue-router'
import {
  Undo2, Redo2, Download, LayoutGrid, ZoomIn, ZoomOut,
  Maximize, Trash2, MousePointerSquareDashed, Keyboard,
  Code, ChevronDown, FileImage, FileCode2, Eye, LayoutTemplate,
  HelpCircle, Sun, Moon, ArrowUpFromLine, ArrowDownToLine, ArrowUp, ArrowDown,
  GitBranch, Circle, Grid3X3, Target, Layers
} from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'open-json-editor'): void
  (e: 'open-help-modal'): void
  (e: 'open-template-library'): void
  (e: 'open-guide'): void
}>()

const editorStore = useEditorStore()
const { exportToPNG, exportToSVG } = useExport()
const { applyLayout } = useAutoLayout()
const router = useRouter()

const zoomRatio = ref(100)
function updateZoomInfo() {
  const graph = editorStore.graph
  if (graph) {
    zoomRatio.value = Math.round(graph.zoom() * 100)
  }
}

function handleZoom(factor: number) {
  const graph = editorStore.graph
  if (graph) {
    graph.zoom(factor)
    updateZoomInfo()
  }
}

function handleZoomFit() {
  const graph = editorStore.graph
  if (graph) {
    graph.zoomToFit({ padding: 20, maxScale: 1 })
    graph.centerContent()
    updateZoomInfo()
  }
}

function handleSelectAll() {
  const graph = editorStore.graph
  if (graph) {
    const cells = graph.getCells()
    graph.select(cells)
  }
}

function handleClearCanvas() {
  const graph = editorStore.graph
  if (graph && confirm('确定清空整个画布吗？该操作不可逆转！')) {
    graph.clearCells()
  }
}

const canUndo = ref(false)
const canRedo = ref(false)

onMounted(() => {
  setTimeout(() => {
    const graph = editorStore.graph
    if (graph) {
      updateZoomInfo()
      graph.on('scale', updateZoomInfo)

      canUndo.value = graph.canUndo()
      canRedo.value = graph.canRedo()
      graph.on('history:change', () => {
        canUndo.value = graph.canUndo()
        canRedo.value = graph.canRedo()
      })
    }
  }, 500)
})

function handlePreview() {
  const graph = editorStore.graph
  if (graph) {
    const data = graph.toJSON()
    localStorage.setItem('preview_graph_data', JSON.stringify(data))
    router.push('/preview')
  } else {
    router.push('/preview')
  }
}

function handleLayerAction(action: 'toFront' | 'toBack' | 'forward' | 'backward') {
  const graph = editorStore.graph
  if (!graph) return

  const selectedCells = graph.getSelectedCells()
  if (selectedCells.length !== 1 || !selectedCells[0]?.isNode()) {
    return
  }

  const node = selectedCells[0]
  switch (action) {
    case 'toFront':
      node.toFront()
      break
    case 'toBack':
      node.toBack()
      break
    case 'forward':
      if (node.zIndex != null) {
        node.zIndex = (node.zIndex ?? 0) + 1
      }
      break
    case 'backward':
      if (node.zIndex != null) {
        node.zIndex = (node.zIndex ?? 0) - 1
      }
      break
  }
}

function handleAutoLayout(type: LayoutType) {
  const graph = editorStore.graph
  if (!graph) return

  const result = applyLayout(graph as Graph, {
    type,
    animate: true,
    preventOverlap: true,
  })

  if (!result.success) {
    console.warn('自动布局失败:', result.message)
  }
}
</script>

<template>
  <header
    class="h-14 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
    <div class="flex items-center gap-2">
      <div
        class="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mr-1 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
        <LayoutGrid class="w-5 h-5 text-slate-950" />
      </div>
      <h1 class="font-extrabold text-xl tracking-tight text-slate-100 select-none">大屏设计器</h1>
    </div>

    <div data-guide="header-actions" class="actions flex items-center gap-4">
      <div class="flex items-center gap-2">
        <button @click="handlePreview"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500 hover:text-slate-950 transition-all active:scale-95 shadow-sm"
          title="预览设计 (只读模式)">
          <Eye class="w-4 h-4" />
          <span class="hidden xl:inline">预览</span>
        </button>

        <button
          data-guide="help-button"
          @click="emit('open-guide')"
          class="flex items-center justify-center p-2 text-sm font-bold rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-all active:scale-95 shadow-sm"
          title="查看操作引导">
          <HelpCircle class="w-4 h-4" />
        </button>

        <button
          @click="editorStore.toggleTheme()"
          class="flex items-center justify-center p-2 text-sm font-bold rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-all active:scale-95 shadow-sm"
          :title="editorStore.theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'">
          <Sun v-if="editorStore.theme === 'dark'" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </button>

        <button @click="emit('open-help-modal')"
          class="flex items-center justify-center p-2 text-sm font-bold rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-all active:scale-95 shadow-sm"
          title="查看快捷键指南">
          <Keyboard class="w-4 h-4" />
        </button>
      </div>

      <div class="h-6 w-[1px] bg-slate-800/60 mx-1"></div>

      <div class="flex items-center gap-1.5">
        <button @click="editorStore.graph?.undo()" :disabled="!canUndo"
          class="flex items-center justify-center p-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-sky-400 disabled:opacity-30 disabled:hover:bg-slate-800/50 disabled:hover:text-slate-300 transition-all active:scale-95 shadow-sm"
          title="撤销 (Ctrl+Z)">
          <Undo2 class="w-4 h-4" />
        </button>

        <button @click="editorStore.graph?.redo()" :disabled="!canRedo"
          class="flex items-center justify-center p-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-sky-400 disabled:opacity-30 disabled:hover:bg-slate-800/50 disabled:hover:text-slate-300 transition-all active:scale-95 shadow-sm"
          title="重做 (Ctrl+Y)">
          <Redo2 class="w-4 h-4" />
        </button>
      </div>

      <div class="h-6 w-[1px] bg-slate-800/60 mx-1"></div>

      <div class="flex items-center gap-2">
        <button @click="handleSelectAll"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all active:scale-95 shadow-sm"
          title="全选 (Ctrl+A)">
          <MousePointerSquareDashed class="w-4 h-4" />
          <span class="hidden md:inline">全选</span>
        </button>

        <button @click="handleClearCanvas"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300 transition-all active:scale-95 shadow-sm"
          title="清空画布 (不可恢复)">
          <Trash2 class="w-4 h-4" />
          <span class="hidden md:inline">清空</span>
        </button>
      </div>

      <div class="h-6 w-[1px] bg-slate-800/60 mx-1"></div>

      <!-- 层级管理工具 -->
      <div class="flex items-center gap-1">
        <button @click="handleLayerAction('toFront')"
          class="flex items-center justify-center p-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-sky-500/20 hover:border-sky-500/50 hover:text-sky-400 transition-all active:scale-95 shadow-sm"
          title="置于顶层">
          <ArrowUpFromLine class="w-4 h-4" />
        </button>
        <button @click="handleLayerAction('forward')"
          class="flex items-center justify-center p-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-sky-500/20 hover:border-sky-500/50 hover:text-sky-400 transition-all active:scale-95 shadow-sm"
          title="上移一层">
          <ArrowUp class="w-4 h-4" />
        </button>
        <button @click="handleLayerAction('backward')"
          class="flex items-center justify-center p-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-sky-500/20 hover:border-sky-500/50 hover:text-sky-400 transition-all active:scale-95 shadow-sm"
          title="下移一层">
          <ArrowDown class="w-4 h-4" />
        </button>
        <button @click="handleLayerAction('toBack')"
          class="flex items-center justify-center p-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-sky-500/20 hover:border-sky-500/50 hover:text-sky-400 transition-all active:scale-95 shadow-sm"
          title="置于底层">
          <ArrowDownToLine class="w-4 h-4" />
        </button>
      </div>

      <div class="h-6 w-[1px] bg-slate-800/60 mx-1"></div>

      <!-- 自动布局工具 -->
      <div class="relative group">
        <button
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-300 transition-all active:scale-95 shadow-sm"
          title="自动布局 (智能排列图元)">
          <Layers class="w-4 h-4" />
          <span class="hidden lg:inline">布局</span>
          <ChevronDown class="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
        </button>

        <div
          class="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700/80 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-left z-50 overflow-hidden">
          <div class="p-1 flex flex-col gap-0.5">
            <button @click="handleAutoLayout('dagre')"
              class="flex items-center gap-2.5 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-300 hover:bg-amber-500/20 hover:text-amber-400 transition-colors group/item">
              <div class="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center border border-slate-700 group-hover/item:border-amber-500/30">
                <GitBranch class="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div class="flex flex-col">
                <span>有向图布局</span>
                <span class="text-[10px] text-slate-500 font-normal">适合流程图、架构图</span>
              </div>
            </button>
            <button @click="handleAutoLayout('grid')"
              class="flex items-center gap-2.5 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-300 hover:bg-sky-500/20 hover:text-sky-400 transition-colors group/item">
              <div class="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center border border-slate-700 group-hover/item:border-sky-500/30">
                <Grid3X3 class="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div class="flex flex-col">
                <span>网格布局</span>
                <span class="text-[10px] text-slate-500 font-normal">整齐排列所有节点</span>
              </div>
            </button>
            <button @click="handleAutoLayout('circular')"
              class="flex items-center gap-2.5 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-300 hover:bg-violet-500/20 hover:text-violet-400 transition-colors group/item">
              <div class="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center border border-slate-700 group-hover/item:border-violet-500/30">
                <Circle class="w-3.5 h-3.5 text-violet-500" />
              </div>
              <div class="flex flex-col">
                <span>环形布局</span>
                <span class="text-[10px] text-slate-500 font-normal">节点围绕中心排列</span>
              </div>
            </button>
            <button @click="handleAutoLayout('concentric')"
              class="flex items-center gap-2.5 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors group/item">
              <div class="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center border border-slate-700 group-hover/item:border-emerald-500/30">
                <Target class="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div class="flex flex-col">
                <span>同心圆布局</span>
                <span class="text-[10px] text-slate-500 font-normal">按连接度分层排列</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="h-6 w-[1px] bg-slate-800/60 mx-1"></div>

      <div class="flex items-center gap-1 py-1 px-2 rounded-lg bg-slate-900/60 border border-slate-800">
        <button @click="handleZoom(-0.1)"
          class="p-1.5 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition-colors"
          title="缩小画布 (缩小 10%)">
          <ZoomOut class="w-4 h-4" />
        </button>
        <span class="text-xs font-mono font-bold text-slate-300 min-w-[3.5rem] text-center select-none">
          {{ zoomRatio }}%
        </span>
        <button @click="handleZoom(0.1)"
          class="p-1.5 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition-colors"
          title="放大画布 (放大 10%)">
          <ZoomIn class="w-4 h-4" />
        </button>
        <div class="w-[1px] h-4 bg-slate-800 mx-1"></div>
        <button @click="handleZoomFit"
          class="p-1.5 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition-colors"
          title="适应视图 (自动缩放至合适大小)">
          <Maximize class="w-4 h-4" />
        </button>
      </div>

      <button @click="emit('open-template-library')"
        class="flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 hover:text-violet-300 transition-all active:scale-95 shadow-sm"
        title="打开模板库 (快速应用预设模板)">
        <LayoutTemplate class="w-4 h-4" />
        <span class="hidden lg:inline">模板库</span>
      </button>

      <div class="h-6 w-[1px] bg-slate-800/60 mx-1"></div>

      <div class="flex items-center gap-2.5">
        <div class="relative group">
          <button
            class="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-sm"
            title="导出图像 (支持 PNG 和 SVG 格式)">
            <Download class="w-4 h-4" />
            <span>导出图像</span>
            <ChevronDown class="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
          </button>

          <div
            class="absolute top-full right-0 mt-2 w-60 bg-slate-800 border border-slate-700/80 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-50 overflow-hidden">
            <div class="p-1 flex flex-col gap-0.5">
              <button @click="exportToPNG()"
                class="flex items-center gap-2.5 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors group/item">
                <div class="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center border border-slate-700 group-hover/item:border-emerald-500/30">
                  <FileImage class="w-4 h-4 text-emerald-500" />
                </div>
                <div class="flex flex-col">
                  <span>生成 PNG 图像</span>
                  <span class="text-[10px] text-slate-500 font-normal">带有透明通道的位图</span>
                </div>
              </button>
              <button @click="exportToSVG()"
                class="flex items-center gap-2.5 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-300 hover:bg-sky-500/20 hover:text-sky-400 transition-colors group/item relative">
                <div class="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center border border-slate-700 group-hover/item:border-sky-500/30">
                  <FileCode2 class="w-4 h-4 text-sky-500" />
                </div>
                <div class="flex flex-col">
                  <span>生成纯净 SVG</span>
                  <span class="text-[10px] text-slate-500 font-normal">无限放大的矢量图纸</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <button @click="emit('open-json-editor')"
          class="group flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-slate-950 transition-all active:scale-95 shadow-sm"
          title="JSON 源码管理 (查看和编辑画布数据)">
          <Code class="w-4 h-4 group-hover:animate-pulse" />
          <span>JSON 数据</span>
        </button>
      </div>
    </div>
  </header>
</template>
