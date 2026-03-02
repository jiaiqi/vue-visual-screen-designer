<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { Cell } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import CanvasProperties from './properties/CanvasProperties.vue'
import NodeProperties from './properties/NodeProperties.vue'

const editorStore = useEditorStore()
const activeCell = ref<Cell | null>(null)
let graphUnsubscribe: (() => void) | null = null

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
    if (graph && !graph.isDisposed?.()) {
      graph.off('selection:changed', updateSelection)
    }
  })
}, { immediate: true })

</script>

<template>
  <div class="h-full bg-slate-900 flex flex-col overflow-hidden">
    <!-- 面板标题 -->
    <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-1 h-3 bg-sky-500 rounded-full"></div>
        <h3 class="text-xs font-bold text-slate-200 tracking-widest uppercase">
          {{ activeCell ? '对象参数' : '画布属性' }}
        </h3>
      </div>
      <div v-if="activeCell" class="text-[10px] text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
        ID: {{ (activeCell.id as string).slice(0, 8) }}
      </div>
    </div>

    <!-- 动态组件切换 -->
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
