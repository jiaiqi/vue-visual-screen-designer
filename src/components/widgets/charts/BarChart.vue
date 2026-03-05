<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface Props {
  width?: number
  height?: number
  horizontal?: boolean
  stacked?: boolean
  data?: Array<{ name: string; value: number }>
  color?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 300,
  horizontal: false,
  stacked: false,
  color: '#0ea5e9',
  title: '',
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const option = computed<EChartsOption>(() => {
  const xData = props.data?.map(item => item.name) || ['A', 'B', 'C', 'D', 'E', 'F']
  const yData = props.data?.map(item => item.value) || [120, 200, 150, 80, 70, 110]

  return {
    backgroundColor: 'transparent',
    title: props.title ? {
      text: props.title,
      left: 'center',
      textStyle: {
        color: '#f1f5f9',
        fontSize: 14,
      },
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: props.title ? '15%' : '10%',
      containLabel: true,
    },
    xAxis: {
      type: props.horizontal ? 'value' : 'category',
      data: props.horizontal ? undefined : xData,
      axisLine: {
        lineStyle: { color: '#475569' },
      },
      axisLabel: {
        color: '#94a3b8',
      },
      splitLine: props.horizontal ? {
        lineStyle: { color: '#334155', type: 'dashed' },
      } : undefined,
    },
    yAxis: {
      type: props.horizontal ? 'category' : 'value',
      data: props.horizontal ? xData : undefined,
      axisLine: {
        lineStyle: { color: '#475569' },
      },
      axisLabel: {
        color: '#94a3b8',
      },
      splitLine: props.horizontal ? undefined : {
        lineStyle: { color: '#334155', type: 'dashed' },
      },
    },
    series: [{
      data: yData,
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: props.horizontal ? 1 : 0, y2: props.horizontal ? 0 : 1,
          colorStops: [
            { offset: 0, color: props.color },
            { offset: 1, color: props.color + '60' },
          ],
        },
        borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
      },
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
    class="bar-chart"
  />
</template>

<style scoped>
.bar-chart {
  background: transparent;
}
</style>
