<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, computed } from 'vue'
import { Node } from '@antv/x6'

const getNode = inject('getNode') as () => Node
const node = getNode()

const countdownValue = ref(60)
const countdownColor = ref('var(--theme-primary)')
const bgColor = ref('var(--color-bg-tertiary)')
const isRunning = ref(true)
const timer = ref<number | null>(null)

const updateData = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (node.getData() || {}) as any
  countdownValue.value = typeof data.countdownValue === 'number' ? data.countdownValue : 60
  countdownColor.value = data.countdownColor || node.attr('body/stroke') || 'var(--theme-primary)'
  bgColor.value = data.bgColor || node.attr('body/fill') || 'var(--color-bg-tertiary)'
  isRunning.value = data.isRunning !== false

  if (isRunning.value && timer.value === null) {
    startTimer()
  } else if (!isRunning.value && timer.value !== null) {
    stopTimer()
  }
}

const startTimer = () => {
  if (timer.value !== null) return

  timer.value = window.setInterval(() => {
    if (countdownValue.value > 0) {
      countdownValue.value--
    } else {
      countdownValue.value = 60
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer.value !== null) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const formattedTime = computed(() => {
  const minutes = Math.floor(countdownValue.value / 60)
  const seconds = countdownValue.value % 60
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return seconds.toString()
})

const progressPercent = computed(() => {
  return (countdownValue.value / 60) * 100
})

onMounted(() => {
  updateData()
  node.on('change:data', updateData)

  if (isRunning.value) {
    startTimer()
  }
})

onUnmounted(() => {
  node.off('change:data', updateData)
  stopTimer()
})
</script>

<template>
  <div
    class="countdown-container w-full h-full relative overflow-hidden rounded-md shadow-inner border border-slate-700/50 flex flex-col items-center justify-center"
    :style="{ backgroundColor: bgColor }">

    <div class="countdown-circle relative flex items-center justify-center">
      <svg class="countdown-ring transform -rotate-90" width="60" height="60" viewBox="0 0 60 60">
        <circle
          class="countdown-ring-bg"
          cx="30"
          cy="30"
          r="26"
          fill="none"
          stroke="var(--color-border-secondary)"
          stroke-width="4"
        />
        <circle
          class="countdown-ring-progress"
          cx="30"
          cy="30"
          r="26"
          fill="none"
          :stroke="countdownColor"
          stroke-width="4"
          stroke-linecap="round"
          :stroke-dasharray="163.36"
          :stroke-dashoffset="163.36 * (1 - progressPercent / 100)"
          :style="{ filter: 'drop-shadow(0 0 6px color-mix(in oklab, var(--theme-primary) 45%, transparent))' }"
        />
      </svg>
      <div
        class="countdown-text absolute inset-0 flex items-center justify-center text-xl font-bold tracking-wider"
        :style="{ color: countdownColor }">
        {{ formattedTime }}
      </div>
    </div>

    <div
      v-if="isRunning"
      class="countdown-label mt-1 text-[10px]">
      倒计时
    </div>
  </div>
</template>

<style scoped>
.countdown-container {
  pointer-events: none;
}

.countdown-container>* {
  pointer-events: none;
}

.countdown-ring-progress {
  transition: stroke-dashoffset 0.3s ease;
}

.countdown-text {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.countdown-label {
  color: var(--color-text-tertiary);
}
</style>
