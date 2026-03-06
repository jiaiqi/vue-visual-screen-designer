<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, computed } from 'vue'
import { useGraph } from '@/composables/useGraph'
import { useEditorStore } from '@/stores/editor'

const wrapperRef = ref<HTMLElement>()
const { initGraph } = useGraph()
const editorStore = useEditorStore()

// 根据坐标系计算画布容器样式
const canvasStyle = computed(() => {
  const isCenterOrigin = editorStore.coordinateSystem === 'center'
  
  if (isCenterOrigin) {
    // 中心原点模式：无限画布，隐藏滚动条
    return {
      overflow: 'hidden' as const,
      width: '100%',
      height: '100%',
    }
  } else {
    // 左上角原点模式：固定尺寸，不设置 overflow（由父容器 EditorView 处理滚动）
    return {
      width: `${editorStore.canvasConfig.width}px`,
      height: `${editorStore.canvasConfig.height}px`,
      maxWidth: `${editorStore.canvasConfig.width}px`,
      maxHeight: `${editorStore.canvasConfig.height}px`,
    }
  }
})

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
  <div class="canvas-wrapper relative" :style="canvasStyle">
    <!-- 主体 X6 画板实例接缝 -->
    <div ref="wrapperRef" class="w-full h-full"></div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  /* 根据坐标系动态设置滚动条 */
  transition: width 0.3s, height 0.3s;
}
</style>
