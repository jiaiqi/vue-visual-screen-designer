<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  node?: {
    getData: () => Record<string, unknown>
  }
}>()

const data = computed(() => {
  const d = (props.node?.getData() || {}) as {
    alertText?: string
    alertSubText?: string
    alertColor?: string
    alertBgColor?: string
    flashInterval?: number
    isAlerting?: boolean
  }
  return {
    text: d.alertText ?? '！告警',
    subText: d.alertSubText ?? '请立即处理',
    color: d.alertColor ?? 'var(--theme-primary)',
    bgColor: d.alertBgColor ?? 'color-mix(in oklab, var(--theme-primary) 12%, transparent)',
    interval: d.flashInterval ?? 800,
    isAlerting: d.isAlerting !== false,
  }
})

const isVisible = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

function startFlash() {
  stopFlash()
  if (!data.value.isAlerting) { isVisible.value = true; return }
  timer = setInterval(() => {
    isVisible.value = !isVisible.value
  }, data.value.interval)
}

function stopFlash() {
  if (timer) { clearInterval(timer); timer = null }
}

watch(data, () => {
  startFlash()
}, { deep: true, immediate: true })

onMounted(() => startFlash())
onUnmounted(() => stopFlash())
</script>

<template>
  <div
    class="alert-node"
    :style="{
      background: data.bgColor,
      borderColor: data.color,
      color: data.color,
      opacity: isVisible ? 1 : 0.15,
    }"
  >
    <div class="alert-icon">⚠</div>
    <div class="alert-text">{{ data.text }}</div>
    <div class="alert-sub">{{ data.subText }}</div>
  </div>
</template>

<style scoped>
.alert-node {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  border-radius: 8px;
  box-sizing: border-box;
  font-family: system-ui, sans-serif;
  transition: opacity 0.1s;
  gap: 4px;
}

.alert-icon {
  font-size: 24px;
  line-height: 1;
}

.alert-text {
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.alert-sub {
  font-size: 11px;
  text-align: center;
  color: color-mix(in oklab, currentColor 70%, transparent);
}
</style>
