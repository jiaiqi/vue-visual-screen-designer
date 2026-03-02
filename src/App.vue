<script setup lang="ts">
import CanvasEditor from './components/editor/CanvasEditor.vue'
import Toolbar from './components/editor/Toolbar.vue'
import PropertyPanel from './components/editor/PropertyPanel.vue'
import ContextMenu from './components/editor/ContextMenu.vue'

import { ref, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useExport } from '@/composables/useExport'
import { Undo2, Redo2, Download, HardDriveDownload, HardDriveUpload, LayoutGrid, ZoomIn, ZoomOut, Maximize, Trash2, MousePointerSquareDashed, Keyboard, X } from 'lucide-vue-next'

const editorStore = useEditorStore()
const { exportToPNG, exportToSVG, exportToJSON, importFromJSON } = useExport()

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

// 快捷键帮助弹窗状态
const isHelpModalOpen = ref(false)

const canUndo = ref(false)
const canRedo = ref(false)

onMounted(() => {
  // 延迟监听 graph 的相关环境与事件
  setTimeout(() => {
    const graph = editorStore.graph
    if (graph) {
      updateZoomInfo()
      graph.on('scale', updateZoomInfo)

      // 同步历史堆栈状态以控制撤销重做按钮亮度
      canUndo.value = graph.canUndo()
      canRedo.value = graph.canRedo()
      graph.on('history:change', () => {
        canUndo.value = graph.canUndo()
        canRedo.value = graph.canRedo()
      })

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
        <h1 class="font-extrabold text-xl tracking-tight text-slate-100 select-none">平面图设计</h1>
        <!-- <span
          class="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-sky-400 border border-slate-700 uppercase tracking-widest">v1.2
          Pro</span> -->
      </div>

      <div class="actions flex items-center gap-4">
        <!-- 帮助组 -->
        <button @click="isHelpModalOpen = true"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-700/50 bg-slate-800/30 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-sky-400 transition-all active:scale-95"
          title="查看快捷键指南">
          <Keyboard class="w-4 h-4" />
          <span>快捷键指南</span>
        </button>

        <div class="h-6 w-[1px] bg-slate-800"></div>

        <!-- 核心操作组：撤销还原 (结合 X6 History Plugin) -->
        <div class="flex items-center bg-slate-900/50 rounded-lg p-1 border border-slate-800/80">
          <button @click="editorStore.graph?.undo()" :disabled="!canUndo"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
            title="撤销 (Ctrl+Z)">
            <Undo2 class="w-3.5 h-3.5" />
            <span>撤销</span>
          </button>

          <div class="w-[1px] h-4 bg-slate-800 mx-1"></div>

          <button @click="editorStore.graph?.redo()" :disabled="!canRedo"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
            title="重做 (Ctrl+Y)">
            <Redo2 class="w-3.5 h-3.5" />
            <span>重做</span>
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
          <div
            class="flex items-center bg-emerald-500/10 rounded-lg p-0.5 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
            <button @click="exportToPNG()"
              class="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all active:scale-95"
              title="导出为透明 PNG">
              <Download class="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span>PNG</span>
            </button>
            <div class="w-[1px] h-4 bg-emerald-500/20 mx-0.5"></div>
            <button @click="exportToSVG()"
              class="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all active:scale-95"
              title="导出为高清矢量 SVG">
              <Download class="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span>SVG</span>
            </button>
          </div>

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

    <!-- 快捷键指南弹窗 -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="isHelpModalOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="isHelpModalOpen = false"></div>

        <!-- 弹窗内容 -->
        <div
          class="relative w-full max-w-[500px] bg-slate-900 border border-slate-700 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
            <h2 class="text-base font-bold text-slate-100 flex items-center gap-2">
              <Keyboard class="w-4.5 h-4.5 text-sky-400" />
              快捷键操作指南
            </h2>
            <button @click="isHelpModalOpen = false"
              class="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="p-6 overflow-y-auto">
            <div class="grid grid-cols-2 gap-x-12 gap-y-5 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-400">撤销当前操作</span>
                <kbd
                  class="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded text-slate-300 font-mono text-xs shadow-inner">Ctrl
                  + Z</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400">重做上一步</span>
                <kbd
                  class="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded text-slate-300 font-mono text-xs shadow-inner">Ctrl
                  + Y</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400">复制图元</span>
                <kbd
                  class="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded text-slate-300 font-mono text-xs shadow-inner">Ctrl
                  + C</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400">粘贴至画布</span>
                <kbd
                  class="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded text-slate-300 font-mono text-xs shadow-inner">Ctrl
                  + V</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400">全选图元</span>
                <kbd
                  class="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded text-slate-300 font-mono text-xs shadow-inner">Ctrl
                  + A</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400">删除选中项</span>
                <kbd
                  class="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded text-slate-300 font-mono text-xs shadow-inner">Delete</kbd>
              </div>
              <div class="flex flex-col gap-2 col-span-2 mt-2 pt-5 border-t border-slate-800 border-dashed">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">追加多选/点选</span>
                  <span class="text-slate-300 text-xs text-right">按住 <kbd
                      class="px-1.5 py-0.5 bg-slate-950 border border-slate-700/80 rounded font-mono shadow-inner mx-0.5">Ctrl</kbd>
                    或 <kbd
                      class="px-1.5 py-0.5 bg-slate-950 border border-slate-700/80 rounded font-mono shadow-inner mx-0.5">Shift</kbd>
                    并点击图元</span>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-slate-400">平移拖拽视口</span>
                  <span class="text-slate-300 text-xs text-right">按住 <kbd
                      class="px-1.5 py-0.5 bg-slate-950 border border-slate-700/80 rounded font-mono shadow-inner mx-0.5">Space空格</kbd>
                    并自由拖移</span>
                </div>
              </div>
            </div>
          </div>
          <div class="px-5 py-3 border-t border-slate-800 bg-slate-900/30 text-xs text-slate-500 text-center">
            Mac 用户请将 Ctrl 替换为 Command (⌘) 键使用
          </div>
        </div>
      </div>
    </Transition>
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

/* 组态图元进阶核心动画库 */
.node-anim-trigger {
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes anim-breath {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);
  }
}

@keyframes anim-blink {

  0%,
  100% {
    opacity: 1;
    filter: drop-shadow(0 0 2px transparent);
  }

  50% {
    opacity: 0.85;
    filter: drop-shadow(0 0 15px rgba(220, 38, 38, 0.9));
  }
}

@keyframes anim-move {

  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(12px);
  }
}

@keyframes anim-shake {

  0%,
  100% {
    transform: translateX(0) rotate(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-4px) rotate(-2deg);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(4px) rotate(2deg);
  }
}

@keyframes anim-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes anim-fade {

  0%,
  100% {
    opacity: 1;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
  }

  50% {
    opacity: 0.15;
    filter: drop-shadow(0 0 0px transparent);
  }
}

@keyframes anim-float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}
</style>