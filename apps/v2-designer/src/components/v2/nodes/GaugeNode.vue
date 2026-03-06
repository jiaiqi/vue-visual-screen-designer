<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  node?: {
    getData: () => Record<string, unknown>
  }
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const data = computed(() => {
  const d = (props.node?.getData() || {}) as {
    gaugeValue?: number
    gaugeMax?: number
    gaugeTitle?: string
    gaugeUnit?: string
    gaugeColor?: string
  }
  return {
    value: d.gaugeValue ?? 75,
    max: d.gaugeMax ?? 100,
    title: d.gaugeTitle ?? '指标',
    unit: d.gaugeUnit ?? '%',
    color: d.gaugeColor ?? 'var(--theme-primary)',
  }
})

function resolveCssColor(input: string): string {
  if (!input.startsWith('var(')) return input
  if (typeof window === 'undefined') return 'rgb(14, 165, 233)'
  const varName = input.slice(4, -1).trim()
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || 'rgb(14, 165, 233)'
}

function buildOption() {
  const { value, max, title, unit, color } = data.value
  const resolvedColor = resolveCssColor(color)
  const mutedTrack = resolveCssColor('var(--color-border-secondary)')
  const mutedText = resolveCssColor('var(--color-text-muted)')

  return {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max,
        radius: '85%',
        center: ['50%', '55%'],
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [value / max, resolvedColor],
              [1, mutedTrack],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: {
          length: '60%',
          width: 4,
          itemStyle: { color: resolvedColor },
        },
        detail: {
          valueAnimation: true,
          formatter: `{value}${unit}`,
          color: resolvedColor,
          fontSize: 18,
          fontWeight: 'bold',
          offsetCenter: [0, '30%'],
        },
        title: {
          offsetCenter: [0, '60%'],
          fontSize: 12,
          color: mutedText,
          text: title,
        },
        data: [{ value }],
      },
    ],
  }
}

function initChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value, null, { renderer: 'canvas' })
  chartInstance.setOption(buildOption())
}

watch(data, () => {
  chartInstance?.setOption(buildOption())
}, { deep: true })

onMounted(() => {
  initChart()
  const ro = new ResizeObserver(() => chartInstance?.resize())
  if (chartRef.value) ro.observe(chartRef.value)
  onUnmounted(() => {
    ro.disconnect()
    chartInstance?.dispose()
  })
})
</script>

<template>
  <div ref="chartRef" style="width:100%;height:100%;" />
</template>
