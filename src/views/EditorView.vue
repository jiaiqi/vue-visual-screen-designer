<script setup lang="ts">
import CanvasEditor from '../components/editor/CanvasEditor.vue'
import Toolbar from '../components/editor/Toolbar.vue'
import PropertyPanel from '../components/editor/PropertyPanel.vue'
import ContextMenu from '../components/editor/ContextMenu.vue'
import JsonEditorModal from '../components/editor/JsonEditorModal.vue'
import TemplateLibrary from '../components/editor/TemplateLibrary.vue'
import GuideTour from '../components/editor/GuideTour.vue'
import Minimap from '../components/editor/Minimap.vue'
import AppHeader from '../components/layout/AppHeader.vue'

import { ref, onMounted, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Keyboard, X } from 'lucide-vue-next'

const editorStore = useEditorStore()

const showGuide = ref(false)

const isToolbarCollapsed = computed(() => editorStore.isToolbarCollapsed)
const isPropertyPanelCollapsed = computed(() => editorStore.isPropertyPanelCollapsed)

const toolbarWidth = computed(() => isToolbarCollapsed.value ? '60px' : '280px')
const propertyPanelWidth = computed(() => isPropertyPanelCollapsed.value ? '24px' : '300px')

const showJsonEditor = ref(false)

const showTemplateLibrary = ref(false)

const contextMenuRef = ref<InstanceType<typeof ContextMenu>>()

const isHelpModalOpen = ref(false)

function handleOpenGuide() {
  showGuide.value = true
}

function handleGuideComplete() {
  editorStore.completeGuide()
}

onMounted(() => {
  setTimeout(() => {
    const graph = editorStore.graph
    if (graph) {
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

  if (!editorStore.hasSeenGuide) {
    setTimeout(() => {
      showGuide.value = true
    }, 800)
  }
})
</script>

<template>
  <div class="editor-view flex-1 flex flex-col overflow-hidden">
    <ContextMenu ref="contextMenuRef" />

    <AppHeader
      @open-json-editor="showJsonEditor = true"
      @open-help-modal="isHelpModalOpen = true"
      @open-guide="handleOpenGuide"
      @open-template-library="showTemplateLibrary = true"
    />

    <main class="flex-1 flex overflow-hidden relative">
      <div
        data-guide="toolbar"
        class="h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden"
        :style="{ width: toolbarWidth }">
        <Toolbar />
      </div>

      <div
        data-guide="canvas"
        class="flex-1 relative flex flex-col shadow-inner overflow-hidden"
        style="background-color: var(--color-bg-secondary);"
      >
        <CanvasEditor />
        <Minimap />
      </div>

      <aside
        data-guide="property-panel"
        class="h-full shrink-0 relative shadow-2xl z-20 transition-all duration-300 ease-in-out overflow-hidden"
        :style="{ width: propertyPanelWidth, backgroundColor: 'var(--color-bg-primary)', borderLeft: '1px solid var(--color-border-primary)' }">
        <PropertyPanel />
      </aside>
    </main>

    <JsonEditorModal v-if="showJsonEditor" @close="showJsonEditor = false" />

    <TemplateLibrary v-if="showTemplateLibrary" @close="showTemplateLibrary = false" />

    <Transition name="fade">
      <div v-if="isHelpModalOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div class="absolute inset-0 backdrop-blur-sm" style="background-color: rgba(2, 6, 23, 0.7);" @click="isHelpModalOpen = false"></div>

        <div
          class="relative w-full max-w-[520px] rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
          style="background-color: var(--color-bg-secondary); border: 1px solid var(--color-border-primary);">
          <div
            class="flex items-center justify-between px-6 py-5 backdrop-blur-md"
            style="background-color: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border-primary);">
            <h2 class="text-lg font-bold flex items-center gap-3" style="color: var(--color-text-primary);">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: rgba(14, 165, 233, 0.2);">
                <Keyboard class="w-5 h-5" style="color: var(--color-accent-sky);" />
              </div>
              快捷键操作指南
            </h2>
            <button @click="isHelpModalOpen = false"
              class="p-2 rounded-xl transition-all active:scale-90"
              style="color: var(--color-text-muted);">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-8 overflow-y-auto max-h-[70vh]">
            <div class="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
              <div class="flex items-center justify-between group">
                <span class="transition-colors" style="color: var(--color-text-muted);">撤销当前操作</span>
                <kbd
                  class="px-2.5 py-1.5 rounded-lg font-mono text-xs shadow-inner"
                  style="background-color: var(--color-bg-primary); border: 1px solid var(--color-border-primary); color: var(--color-text-tertiary);">Ctrl
                  + Z</kbd>
              </div>
              <div class="flex items-center justify-between group">
                <span class="transition-colors" style="color: var(--color-text-muted);">重做上一步</span>
                <kbd
                  class="px-2.5 py-1.5 rounded-lg font-mono text-xs shadow-inner"
                  style="background-color: var(--color-bg-primary); border: 1px solid var(--color-border-primary); color: var(--color-text-tertiary);">Ctrl
                  + Y</kbd>
              </div>
              <div class="flex items-center justify-between group">
                <span class="transition-colors" style="color: var(--color-text-muted);">复制图元</span>
                <kbd
                  class="px-2.5 py-1.5 rounded-lg font-mono text-xs shadow-inner"
                  style="background-color: var(--color-bg-primary); border: 1px solid var(--color-border-primary); color: var(--color-text-tertiary);">Ctrl
                  + C</kbd>
              </div>
              <div class="flex items-center justify-between group">
                <span class="transition-colors" style="color: var(--color-text-muted);">粘贴至画布</span>
                <kbd
                  class="px-2.5 py-1.5 rounded-lg font-mono text-xs shadow-inner"
                  style="background-color: var(--color-bg-primary); border: 1px solid var(--color-border-primary); color: var(--color-text-tertiary);">Ctrl
                  + V</kbd>
              </div>
              <div class="flex items-center justify-between group">
                <span class="transition-colors" style="color: var(--color-text-muted);">全选图元</span>
                <kbd
                  class="px-2.5 py-1.5 rounded-lg font-mono text-xs shadow-inner"
                  style="background-color: var(--color-bg-primary); border: 1px solid var(--color-border-primary); color: var(--color-text-tertiary);">Ctrl
                  + A</kbd>
              </div>
              <div class="flex items-center justify-between group">
                <span style="color: var(--color-accent-rose);">删除选中项</span>
                <kbd
                  class="px-2.5 py-1.5 rounded-lg font-mono text-xs shadow-inner"
                  style="background-color: var(--color-bg-primary); border: 1px solid rgba(244, 63, 94, 0.3); color: var(--color-accent-rose);">Delete</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <GuideTour v-model="showGuide" @complete="handleGuideComplete" />
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

.ruler-active {
  margin-top: 20px;
  margin-left: 20px;
}
</style>
