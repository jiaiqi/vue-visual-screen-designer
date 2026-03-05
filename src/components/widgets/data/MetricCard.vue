<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

interface Props {
  title?: string
  value?: number | string
  unit?: string
  trend?: 'up' | 'down' | 'flat'
  trendValue?: string
  precision?: number
  icon?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '指标',
  value: 0,
  unit: '',
  trend: 'flat',
  trendValue: '',
  precision: 0,
  color: '#0ea5e9',
})

const formattedValue = computed(() => {
  const num = typeof props.value === 'string' ? parseFloat(props.value) : props.value
  if (isNaN(num)) return props.value
  return num.toFixed(props.precision)
})

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up': return TrendingUp
    case 'down': return TrendingDown
    default: return Minus
  }
})

const trendColor = computed(() => {
  switch (props.trend) {
    case 'up': return 'text-emerald-400'
    case 'down': return 'text-rose-400'
    default: return 'text-slate-400'
  }
})
</script>

<template>
  <div class="metric-card p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-slate-400 mb-1">{{ title }}</p>
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-bold text-slate-100">{{ formattedValue }}</span>
          <span v-if="unit" class="text-sm text-slate-400">{{ unit }}</span>
        </div>
      </div>
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center"
        :style="{ backgroundColor: color + '20' }"
      >
        <slot name="icon">
          <div
            class="w-5 h-5 rounded"
            :style="{ backgroundColor: color }"
          />
        </slot>
      </div>
    </div>

    <div v-if="trendValue" class="mt-3 flex items-center gap-1">
      <component
        :is="trendIcon"
        class="w-4 h-4"
        :class="trendColor"
      />
      <span class="text-sm" :class="trendColor">{{ trendValue }}</span>
      <span class="text-sm text-slate-500">较上期</span>
    </div>
  </div>
</template>

<style scoped>
.metric-card {
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: v-bind(color + '40');
  box-shadow: 0 0 20px v-bind(color + '10');
}
</style>
