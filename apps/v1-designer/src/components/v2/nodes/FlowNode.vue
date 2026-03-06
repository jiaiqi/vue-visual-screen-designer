<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  node?: {
    getData: () => Record<string, unknown>
    getSize: () => { width: number; height: number }
  }
}

const props = defineProps<Props>()

const data = computed(() => {
  return (props.node?.getData() || {}) as {
    label?: string
    subLabel?: string
    flowType?: 'start' | 'end' | 'process' | 'decision'
    bgColor?: string
    textColor?: string
  }
})

const flowType = computed(() => data.value.flowType || 'process')

const colorMap = {
  start: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', text: '#4ade80' },
  end: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#f87171' },
  process: { bg: 'rgba(99,102,241,0.15)', border: '#6366f1', text: '#a5b4fc' },
  decision: { bg: 'rgba(249,115,22,0.15)', border: '#f97316', text: '#fb923c' },
}

const colors = computed(() => colorMap[flowType.value] || colorMap.process)
</script>

<template>
  <div
    class="flow-node"
    :style="{
      background: colors.bg,
      borderColor: colors.border,
      color: colors.text,
    }"
  >
    <div class="flow-label">{{ data.label || '处理过程' }}</div>
    <div v-if="data.subLabel" class="flow-sub-label">{{ data.subLabel }}</div>
  </div>
</template>

<style scoped>
.flow-node {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid currentColor;
  border-radius: 6px;
  padding: 8px;
  box-sizing: border-box;
  font-family: system-ui, sans-serif;
}

.flow-label {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
}

.flow-sub-label {
  font-size: 10px;
  opacity: 0.6;
  margin-top: 3px;
  text-align: center;
}
</style>
