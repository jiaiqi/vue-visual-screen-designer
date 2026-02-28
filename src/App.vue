<script setup lang="ts">
import CanvasEditor from './components/editor/CanvasEditor.vue'
import Toolbar from './components/editor/Toolbar.vue'
import PropertyPanel from './components/editor/PropertyPanel.vue'
import LayerPanel from './components/editor/LayerPanel.vue'

import { useHistoryStore } from '@/stores/history'
import { useExport } from '@/composables/useExport'
import { Undo2, Redo2, Download, HardDriveDownload, HardDriveUpload, LayoutGrid } from 'lucide-vue-next'

const historyStore = useHistoryStore()
const { exportToPNG, exportToJSON, importFromJSON } = useExport()

function triggerImportJSON() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      importFromJSON(file)
    }
  }
  input.click()
}

// 未来可以在这里 provide 核心依赖
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
    <!-- 右键菜单 -->
    <ContextMenu ref="contextMenuRef" />
    <!-- 顶部动作栏 (Header) -->
    <header
      class="h-14 border-b px-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center mr-1">
          <LayoutGrid class="w-5 h-5 text-white" />
        </div>
        <h1 class="font-extrabold text-xl tracking-tight text-slate-800 select-none">车间平面规划器</h1>
        <span
          class="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-widest">v1.2
          Pro</span>
      </div>

      <div class="actions flex items-center gap-4">
        <!-- 核心操作组：撤销还原 -->
        <div class="flex items-center bg-slate-100/80 rounded-lg p-1 border border-slate-200">
          <button @click="historyStore.undo()" :disabled="!historyStore.canUndo"
            class="p-2 rounded-md text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-20 transition-all active:scale-95"
            title="撤销 (Ctrl+Z)">
            <Undo2 class="w-4.5 h-4.5" />
          </button>

          <div class="w-[1px] h-4 bg-slate-300 mx-1"></div>

          <button @click="historyStore.redo()" :disabled="!historyStore.canRedo"
            class="p-2 rounded-md text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-20 transition-all active:scale-95"
            title="重做 (Ctrl+Y)">
            <Redo2 class="w-4.5 h-4.5" />
          </button>
        </div>

        <div class="h-6 w-[1px] bg-slate-200 mx-1"></div>

        <!-- 导出发布组 -->
        <div class="flex items-center gap-2.5">
          <button @click="exportToPNG()"
            class="group flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 shadow-sm shadow-emerald-100"
            title="导出为透明 PNG">
            <Download class="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span>导出图像</span>
          </button>

          <button @click="exportToJSON()"
            class="group flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200/50 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 shadow-sm shadow-blue-100"
            title="保存工程">
            <HardDriveDownload class="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span>保存方案</span>
          </button>

          <button @click="triggerImportJSON"
            class="group flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-orange-50 text-orange-700 border border-orange-200/50 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all active:scale-95 shadow-sm shadow-orange-100"
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
        <div class="flex-[2] overflow-hidden border-b shadow-sm z-10">
          <LayerPanel />
        </div>
        <div class="flex-[3] overflow-hidden bg-background">
          <PropertyPanel />
        </div>
      </aside>
    </main>
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