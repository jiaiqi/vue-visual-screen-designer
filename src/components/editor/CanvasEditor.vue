<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useGraph } from '@/composables/useGraph'
// import { useEditorStore } from '@/stores/editor'
// import { useKeyboard } from '@/composables/useKeyboard'

const wrapperRef = ref<HTMLElement>()
const { initGraph } = useGraph()

onMounted(async () => {
  if (wrapperRef.value) {
    // 关键优化：等待 DOM 布局完全稳定，尤其是逃离路由 Transition 的影响
    await nextTick()
    setTimeout(() => {
      if (wrapperRef.value) initGraph(wrapperRef.value)
    }, 100)
  }
})

onUnmounted(() => {
  // useGraph 内部已处理清理逻辑
})
</script>

<template>
  <div class="canvas-wrapper w-full h-full bg-[#0f172a] relative">
    <!-- 主体 X6 画板实例接缝 -->
    <div ref="wrapperRef" class="w-full h-full"></div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  /* Allow X6 scroller to handle its own scrollbars */
}
</style>
