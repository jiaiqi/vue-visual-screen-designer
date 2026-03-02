<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from 'vue'
import { Node } from '@antv/x6'

const getNode = inject('getNode') as () => Node
const node = getNode()

// 进度条属性
const progressValue = ref(50)
const progressColor = ref('#3b82f6')
const progressBgColor = ref('#1e293b')
const showProgressText = ref(true)

// 同步节点数据
const updateData = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (node.getData() || {}) as any
  progressValue.value = typeof data.progressValue === 'number' ? data.progressValue : 50
  progressColor.value = data.progressColor || node.attr('body/stroke') || '#3b82f6'
  progressBgColor.value = data.progressBgColor || node.attr('body/fill') || '#1e293b'
  showProgressText.value = data.showProgressText !== false // 默认为 true
}

onMounted(() => {
  updateData()
  node.on('change:data', updateData)
  // 如果外围被改了颜色，也尝试同步
  node.on('change:attrs', () => {
    const stroke = node.attr('body/stroke')
    const fill = node.attr('body/fill')
    if (stroke && stroke !== progressColor.value) {
      progressColor.value = stroke as string
    }
    if (fill && fill !== progressBgColor.value) {
      progressBgColor.value = fill as string
    }
  })
})

onUnmounted(() => {
  node.off('change:data', updateData)
  // off attrs 留给核心销毁
})
</script>

<template>
  <div
    class="progress-container w-full h-full relative overflow-hidden rounded-md shadow-inner border border-slate-700/50"
    :style="{ backgroundColor: progressBgColor }">

    <!-- 内部填充滑块 -->
    <div class="progress-bar absolute left-0 top-0 bottom-0 transition-all duration-300 ease-out" :style="{
      width: `${Math.max(0, Math.min(100, progressValue))}%`,
      backgroundColor: progressColor,
      boxShadow: `0 0 10px ${progressColor}80`
    }">
    </div>

    <!-- 百分比居中文本 -->
    <div v-if="showProgressText"
      class="progress-text absolute inset-0 flex items-center justify-center text-xs font-bold tracking-wider z-10"
      :style="{ color: progressValue > 45 ? '#ffffff' : progressColor }">
      {{ progressValue.toFixed(0) }}%
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  pointer-events: none;
  /* 让事件穿透到 X6 画布 */
}

.progress-container>* {
  pointer-events: none;
}

.progress-text {
  mix-blend-mode: normal;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
