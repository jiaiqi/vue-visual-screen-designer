<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface Props {
  width?: number
  height?: number
  donut?: boolean
  showLabel?: boolean
  data?: Array<{ name: string; value: number }>
  colors?: string[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 300,
  height: 300,
  donut: false,
  showLabel: true,
  colors: () => ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  title: '',
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const option = computed<EChartsOption>(() => {
  const data = props.data || [
    { name: 'A', value: 1048 },
    { name: 'B', value: 735 },
    { name: 'C', value: 580 },
    { name: 'D', value: 484 },
    { name: 'E', value: 300 },
  ]

  return {
    backgroundColor: 'transparent',
    title: props.title ? {
      text: props.title,
      left: 'center',
      top: '5%',
      textStyle: {
        color: '#f1f5f9',
        fontSize: 14,
      },
    } : undefined,
    color: props.colors,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#334155',
      textStyle: { color: '#f1f5f9' },
    },
    legend: props.showLabel ? {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#94a3b8' },
    } : undefined,
    series: [{
      name: '数据',
      type: 'pie',
      radius: props.donut ? ['40%', '70%'] : '70%',
      center: ['50%', '55%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#0f172a',
        borderWidth: 2,
      },
      label: {
        show: props.showLabel,
        color: '#94a3b8',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#f1f5f9',
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      labelLine: {
        show: props.showLabel,
        lineStyle: { color: '#475569' },
      },
      data,
    }],
  }
})

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(option.value)
}

watch(option, (newOption) => {
  chartInstance?.setOption(newOption)
}, { deep: true })

onMounted(() => {
  initChart()
})
</script>

<template>
  <div
    ref="chartRef"
    :style="{ width: `${width}px`, height: `${height}px` }"
    class="pie-chart"
  />
</template>

<style scoped>
.pie-chart {
  background: transparent;
}
</style>
