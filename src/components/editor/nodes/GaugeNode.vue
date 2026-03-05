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
    color: d.gaugeColor ?? '#0ea5e9',
  }
})

function buildOption() {
  const { value, max, title, unit, color } = data.value

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
              [value / max, color],
              [1, 'rgba(51,65,85,0.5)'],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: {
          length: '60%',
          width: 4,
          itemStyle: { color },
        },
        detail: {
          valueAnimation: true,
          formatter: `{value}${unit}`,
          color,
          fontSize: 18,
          fontWeight: 'bold',
          offsetCenter: [0, '30%'],
        },
        title: {
          offsetCenter: [0, '60%'],
          fontSize: 12,
          color: '#94a3b8',
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
