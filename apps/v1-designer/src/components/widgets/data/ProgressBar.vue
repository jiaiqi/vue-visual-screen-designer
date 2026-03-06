<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value?: number
  max?: number
  showText?: boolean
  striped?: boolean
  animated?: boolean
  color?: string
  height?: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  max: 100,
  showText: true,
  striped: false,
  animated: false,
  color: '#0ea5e9',
  height: 24,
  label: '',
})

const percentage = computed(() => {
  const pct = (props.value / props.max) * 100
  return Math.min(Math.max(pct, 0), 100)
})

const barStyle = computed(() => ({
  width: `${percentage.value}%`,
  backgroundColor: props.color,
  height: `${props.height}px`,
}))
</script>

<template>
  <div class="progress-bar">
    <div v-if="label" class="flex justify-between mb-2">
      <span class="text-sm text-slate-300">{{ label }}</span>
      <span v-if="showText" class="text-sm text-slate-400">
        {{ Math.round(percentage) }}%
      </span>
    </div>
    <div
      class="progress-track w-full rounded-full bg-slate-700/50 overflow-hidden"
      :style="{ height: `${height}px` }"
    >
      <div
        class="progress-fill h-full rounded-full transition-all duration-500 ease-out"
        :class="{
          'progress-striped': striped,
          'progress-animated': animated,
        }"
        :style="barStyle"
      >
        <span
          v-if="showText && !label"
          class="flex items-center justify-center h-full text-xs font-medium text-white"
        >
          {{ Math.round(percentage) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.progress-animated {
  animation: progress-bar-stripes 1s linear infinite;
}

@keyframes progress-bar-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
