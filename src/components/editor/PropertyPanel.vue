<script setup lang="ts">
import { ref, watch } from 'vue'
import { Cell } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import CanvasProperties from './properties/CanvasProperties.vue'
import NodeProperties from './properties/NodeProperties.vue'

const editorStore = useEditorStore()
const activeCell = ref<Cell | null>(null)

// 监听画布的选区变动
watch(() => editorStore.graph, (graph, oldGraph, onCleanup) => {
  if (!graph) {
    activeCell.value = null
    return
  }

  const updateSelection = () => {
    const cells = graph.getSelectedCells()
    if (cells.length === 1) {
      activeCell.value = cells[0] as Cell
    } else {
      activeCell.value = null
    }
  }

  // 绑定事件
  graph.on('selection:changed', updateSelection)

  // 立即同步一次当前状态
  updateSelection()

  // 注册清理逻辑：当组件卸载或 graph 重新赋值时自动执行
  onCleanup(() => {
    if (graph && !(graph as unknown as { disposed?: boolean }).disposed) {
      graph.off('selection:changed', updateSelection)
    }
  })
}, { immediate: true })

</script>

<template>
  <div class="h-full flex flex-col overflow-hidden" style="background-color: var(--color-bg-secondary);">
    <div class="p-4 flex items-center justify-between shrink-0" style="background-color: rgba(2, 6, 23, 0.5); border-bottom: 1px solid var(--color-border-primary);">
      <div class="flex items-center gap-2">
        <div class="w-1 h-3 rounded-full" style="background-color: var(--color-accent-sky);"></div>
        <h3 class="text-xs font-bold tracking-widest uppercase" style="color: var(--color-text-secondary);">
          {{ activeCell ? '对象参数' : '画布属性' }}
        </h3>
      </div>
      <div v-if="activeCell" class="text-[10px] font-mono px-1.5 py-0.5 rounded" style="background-color: var(--color-bg-tertiary); color: var(--color-text-muted);">
        ID: {{ (activeCell.id as string).slice(0, 8) }}
      </div>
    </div>

    <div class="flex-1 overflow-hidden relative">
      <Transition name="fade-slide" mode="out-in">
        <NodeProperties v-if="activeCell" :cell="activeCell" />
        <CanvasProperties v-else />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
