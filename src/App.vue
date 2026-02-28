<script setup lang="ts">
import CanvasEditor from './components/editor/CanvasEditor.vue'
import Toolbar from './components/editor/Toolbar.vue'
import PropertyPanel from './components/editor/PropertyPanel.vue'
import LayerPanel from './components/editor/LayerPanel.vue'

import { useHistoryStore } from '@/stores/history'
import { useExport } from '@/composables/useExport'
import { Undo2, Redo2, Download, HardDriveDownload, HardDriveUpload } from 'lucide-vue-next'

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
    <!-- 顶部动作栏 (Header) -->
    <header class="h-12 border-b px-4 flex items-center justify-between shrink-0">
      <h1 class="font-bold text-lg select-none">车间平面规划图编辑器</h1>
      <div class="actions flex items-center gap-2">
        <div class="flex items-center bg-muted/50 rounded-md border p-1 mr-4">
          <button
            @click="historyStore.undo()"
            :disabled="!historyStore.canUndo"
            class="px-2 py-1.5 rounded text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 class="w-4 h-4" />
          </button>

          <div class="w-[1px] h-4 bg-border mx-1"></div>

          <button
            @click="historyStore.redo()"
            :disabled="!historyStore.canRedo"
            class="px-2 py-1.5 rounded text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="重做 (Ctrl+Y / Ctrl+Shift+Z)"
          >
            <Redo2 class="w-4 h-4" />
          </button>
        </div>

        <!-- 导入导出与出图发布 -->
        <div class="flex items-center gap-2">
          <button
            @click="exportToPNG()"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-transparent border hover:bg-muted transition-colors cursor-pointer"
            title="导出为透明 PNG"
          >
            <Download class="w-4 h-4 text-emerald-600" />
            <span class="hidden sm:inline">出图</span>
          </button>

          <button
            @click="exportToJSON()"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-transparent border hover:bg-muted transition-colors cursor-pointer"
            title="导出规划工程模型 (.json)"
          >
            <HardDriveDownload class="w-4 h-4 text-blue-600" />
            <span class="hidden sm:inline">保存</span>
          </button>

          <button
            @click="triggerImportJSON"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-transparent border hover:bg-muted transition-colors cursor-pointer"
            title="加载本地工程"
          >
            <HardDriveUpload class="w-4 h-4 text-orange-600" />
            <span class="hidden sm:inline">导入</span>
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
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

* {
  box-sizing: border-box;
}
</style>
