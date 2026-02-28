<script setup lang="ts">
import CanvasEditor from './components/editor/CanvasEditor.vue'
import Toolbar from './components/editor/Toolbar.vue'
import PropertyPanel from './components/editor/PropertyPanel.vue'
import ContextMenu from './components/editor/ContextMenu.vue'

import { ref, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useHistoryStore } from '@/stores/history'
import { useExport } from '@/composables/useExport'
import { Undo2, Redo2, Download, HardDriveDownload, HardDriveUpload, LayoutGrid, ZoomIn, ZoomOut, Maximize, Trash2, MousePointerSquareDashed } from 'lucide-vue-next'

const editorStore = useEditorStore()
const historyStore = useHistoryStore()
const { exportToPNG, exportToJSON, importFromJSON } = useExport()

function triggerImportJSON() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      importFromJSON(file)
    }
  }
  input.click()
}

// 画布缩放与全选控制
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

// 右键菜单引用
const contextMenuRef = ref<InstanceType<typeof ContextMenu>>()

onMounted(() => {
  // 延迟监听 graph 的相关环境与事件
  setTimeout(() => {
    const graph = editorStore.graph
    if (graph) {
      updateZoomInfo()
      graph.on('scale', updateZoomInfo)

      // X6 右键事件绑定
      graph.on('blank:contextmenu', ({ e }) => {
        const selected = graph.getSelectedCells().filter(c => c.isNode())
        if (contextMenuRef.value) {
          if (selected.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contextMenuRef.value.open(e as any, 'node') // 从空白处右键但有选中图元时，作为针对图元操作弹窗
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contextMenuRef.value.open(e as any, 'blank')
          }
        }
      })
      graph.on('node:contextmenu', ({ e, node }) => {
        // 如果当前右击点并非已经选中的多节点之一，才重置选中
        if (!graph.isSelected(node)) {
          graph.cleanSelection()
          graph.select(node)
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (contextMenuRef.value) contextMenuRef.value.open(e as any, 'node', node)
      })
    }
  }, 500)
})

onUnmounted(() => {
  const graph = editorStore.graph
  if (graph) {
    graph.off('scale', updateZoomInfo)
  }
})
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
    <!-- 右键菜单 -->
    <ContextMenu ref="contextMenuRef" />
    <!-- 顶部动作栏 (Header) -->
    <header
      class="h-14 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mr-1 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
          <LayoutGrid class="w-5 h-5 text-slate-950" />
        </div>
        <h1 class="font-extrabold text-xl tracking-tight text-slate-100 select-none">车间平面规划器</h1>
        <span
          class="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-sky-400 border border-slate-700 uppercase tracking-widest">v1.2
          Pro</span>
      </div>

      <div class="actions flex items-center gap-4">
        <!-- 核心操作组：撤销还原 -->
        <div class="flex items-center bg-slate-900/80 rounded-lg p-1 border border-slate-800">
          <button @click="historyStore.undo()" :disabled="!historyStore.canUndo"
            class="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:shadow-sm disabled:opacity-20 transition-all active:scale-95"
            title="撤销 (Ctrl+Z)">
            <Undo2 class="w-4.5 h-4.5" />
          </button>

          <div class="w-[1px] h-4 bg-slate-800 mx-1"></div>

          <button @click="historyStore.redo()" :disabled="!historyStore.canRedo"
            class="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:shadow-sm disabled:opacity-20 transition-all active:scale-95"
            title="重做 (Ctrl+Y)">
            <Redo2 class="w-4.5 h-4.5" />
          </button>
        </div>

        <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

        <!-- 快捷画布操作组 -->
        <div class="flex items-center gap-1.5 bg-slate-900/50 rounded-lg p-1 border border-slate-800/80">
          <button @click="handleSelectAll"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
            title="全选 (Ctrl+A)">
            <MousePointerSquareDashed class="w-3.5 h-3.5" />
            <span>全选</span>
          </button>

          <button @click="handleClearCanvas"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="清空画布">
            <Trash2 class="w-3.5 h-3.5" />
            <span>清空</span>
          </button>
        </div>

        <!-- 比例缩放组 -->
        <div class="flex items-center bg-slate-900/50 rounded-lg p-1 border border-slate-800/80">
          <button @click="handleZoom(-0.1)"
            class="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition-colors" title="缩小">
            <ZoomOut class="w-4 h-4" />
          </button>
          <span class="text-xs font-mono font-bold text-slate-300 min-w-[3.5rem] text-center select-none">{{ zoomRatio
            }}%</span>
          <button @click="handleZoom(0.1)"
            class="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition-colors" title="放大">
            <ZoomIn class="w-4 h-4" />
          </button>
          <div class="w-[1px] h-3 bg-slate-700/50 mx-1"></div>
          <button @click="handleZoomFit"
            class="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition-colors"
            title="适应视图">
            <Maximize class="w-4 h-4" />
          </button>
        </div>

        <div class="h-6 w-[1px] bg-slate-800 mx-1"></div>

        <!-- 导出发布组 -->
        <div class="flex items-center gap-2.5">
          <button @click="exportToPNG()"
            class="group flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 transition-all active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            title="导出为透明 PNG">
            <Download class="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span>导出图像</span>
          </button>

          <button @click="exportToJSON()"
            class="group flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500 hover:text-slate-950 hover:border-sky-500 transition-all active:scale-95 shadow-[0_0_10px_rgba(14,165,233,0.1)] hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
            title="保存工程">
            <HardDriveDownload class="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span>保存方案</span>
          </button>

          <button @click="triggerImportJSON"
            class="group flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-slate-950 hover:border-orange-500 transition-all active:scale-95 shadow-[0_0_10px_rgba(249,115,22,0.1)] hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]"
            title="导入工程">
            <HardDriveUpload class="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span>读取文件</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 工作台 -->
    <main class="flex-1 flex overflow-hidden">
      <!-- 左侧工具栏 -->
      <Toolbar />

      <!-- 中央绘图区域 -->
      <div class="flex-1 relative flex flex-col">
        <CanvasEditor />
      </div>

      <!-- 右侧悬浮面板区 -->
      <aside class="w-[300px] border-l bg-card flex flex-col shrink-0 h-full relative border-collapse">
        <!-- <div class="flex-[2] overflow-hidden border-b shadow-sm z-10">
          <LayerPanel />
        </div> -->
        <div class="flex-1 overflow-hidden bg-background">
          <PropertyPanel />
        </div>
      </aside>
    </main>

    <!-- 全局右键菜单 -->
    <ContextMenu ref="contextMenuRef" />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

/* 画布容器全局平滑 */
canvas {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  -webkit-font-smoothing: antialiased;
}

#app {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  height: 100%;
  width: 100%;
}

* {
  box-sizing: border-box;
}
</style>