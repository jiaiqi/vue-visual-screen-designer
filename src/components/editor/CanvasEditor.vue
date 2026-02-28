<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useGraph } from '@/composables/useGraph'
// import { useEditorStore } from '@/stores/editor'
// import { useKeyboard } from '@/composables/useKeyboard'

const wrapperRef = ref<HTMLElement>()
const { containerRef, initGraph } = useGraph()

onMounted(() => {
  if (wrapperRef.value) {
    // 挂载 X6 引擎
    initGraph(wrapperRef.value)

    // 初始化键盘等...
  }
})

onUnmounted(() => {
  // 清理
})
</script>

<template>
  <div
    class="canvas-wrapper w-full h-full flex flex-col items-center justify-center bg-[#0f172a] relative overflow-hidden">
    <!-- 主体 X6 画板实例接缝 -->
    <div ref="wrapperRef" class="w-full h-full"></div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  overflow: hidden;
  /* Prevent native scrollbars around canvas */
}
</style>