<script setup lang="ts">
import CanvasEditor from '../components/editor/CanvasEditor.vue'
import Toolbar from '../components/editor/Toolbar.vue'
import PropertyPanel from '../components/editor/PropertyPanel.vue'
import ContextMenu from '../components/editor/ContextMenu.vue'
import JsonEditorModal from '../components/editor/JsonEditorModal.vue'
import AppHeader from '../components/layout/AppHeader.vue'

import { ref, onMounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Keyboard, X } from 'lucide-vue-next'

const editorStore = useEditorStore()

// JSON 编辑器弹窗状态
const showJsonEditor = ref(false)

// 右键菜单引用
const contextMenuRef = ref<InstanceType<typeof ContextMenu>>()

// 快捷键帮助弹窗状态
const isHelpModalOpen = ref(false)

onMounted(() => {
  // 延迟监听 graph 的相关环境与事件
  setTimeout(() => {
    const graph = editorStore.graph
    if (graph) {
      // X6 右键事件绑定
      graph.on('blank:contextmenu', ({ e }) => {
        const selected = graph.getSelectedCells().filter(c => c.isNode())
        if (contextMenuRef.value) {
          if (selected.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contextMenuRef.value.open(e as any, 'node')
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contextMenuRef.value.open(e as any, 'blank')
          }
        }
      })
      graph.on('node:contextmenu', ({ e, node }) => {
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
</script>

<template>
  <div class="editor-view flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
    <!-- 全局右键菜单 -->
    <ContextMenu ref="contextMenuRef" />

    <!-- 抽离出的顶部导航栏 -->
    <AppHeader @open-json-editor="showJsonEditor = true" @open-help-modal="isHelpModalOpen = true" />

    <!-- 工作台主体 -->
    <main class="flex-1 flex overflow-hidden relative">
      <!-- 左侧图元栏 -->
      <Toolbar />

      <!-- 中央绘图区域 (增加 min-width: 0 防止被挤压) -->
      <div class="flex-1 relative flex flex-col bg-slate-900 shadow-inner min-width-0" style="min-width: 0">
        <CanvasEditor />
      </div>

      <!-- 右侧设定栏 (确保 shrink-0 且强制宽度) -->
      <aside
        class="w-[300px] border-l border-slate-800 bg-slate-950 flex flex-col shrink-0 h-full relative shadow-2xl z-20">
        <div class="flex-1 overflow-hidden">
          <PropertyPanel />
        </div>
      </aside>
    </main>

    <JsonEditorModal v-if="showJsonEditor" @close="showJsonEditor = false" />

    <!-- 快捷键指南弹窗 -->
    <Transition name="fade">
      <div v-if="isHelpModalOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" @click="isHelpModalOpen = false"></div>

        <!-- 弹窗内容 -->
        <div
          class="relative w-full max-w-[520px] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col text-white">
          <div
            class="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
            <h2 class="text-lg font-bold text-slate-100 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <Keyboard class="w-5 h-5 text-sky-400" />
              </div>
              快捷键操作指南
            </h2>
            <button @click="isHelpModalOpen = false"
              class="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all active:scale-90">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-8 overflow-y-auto max-h-[70vh]">
            <div class="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
              <div class="flex items-center justify-between group">
                <span class="text-slate-400 group-hover:text-slate-200 transition-colors">撤销当前操作</span>
                <kbd
                  class="px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-300 font-mono text-xs shadow-inner">Ctrl
                  + Z</kbd>
              </div>
              <div class="flex items-center justify-between group">
                <span class="text-slate-400 group-hover:text-slate-200 transition-colors">重做上一步</span>
                <kbd
                  class="px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-300 font-mono text-xs shadow-inner">Ctrl
                  + Y</kbd>
              </div>
              <div class="flex items-center justify-between group">
                <span class="text-slate-400 group-hover:text-slate-200 transition-colors">复制图元</span>
                <kbd
                  class="px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-300 font-mono text-xs shadow-inner">Ctrl
                  + C</kbd>
              </div>
              <div class="flex items-center justify-between group">
                <span class="text-slate-400 group-hover:text-slate-200 transition-colors">粘贴至画布</span>
                <kbd
                  class="px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-300 font-mono text-xs shadow-inner">Ctrl
                  + V</kbd>
              </div>
              <div class="flex items-center justify-between group">
                <span class="text-slate-400 group-hover:text-slate-200 transition-colors">全选图元</span>
                <kbd
                  class="px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-300 font-mono text-xs shadow-inner">Ctrl
                  + A</kbd>
              </div>
              <div class="flex items-center justify-between group">
                <span class="text-slate-400 group-hover:text-slate-200 transition-colors text-rose-400/80">删除选中项</span>
                <kbd
                  class="px-2.5 py-1.5 bg-slate-950 border border-rose-900/30 rounded-lg text-rose-400/80 font-mono text-xs shadow-inner">Delete</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.editor-view {
  height: 100vh;
  width: 100vw;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
