<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface Props {
  width?: number
  height?: number
  smooth?: boolean
  area?: boolean
  showPoints?: boolean
  data?: Array<{ name: string; value: number }>
  color?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 300,
  smooth: true,
  area: false,
  showPoints: true,
  color: '#0ea5e9',
  title: '',
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const option = computed<EChartsOption>(() => {
  const xData = props.data?.map(item => item.name) || ['1月', '2月', '3月', '4月', '5月', '6月']
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
      type: 'category',
      data: xData,
      axisLine: {
        lineStyle: { color: '#475569' },
      },
      axisLabel: {
        color: '#94a3b8',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: { color: '#475569' },
      },
      axisLabel: {
        color: '#94a3b8',
      },
      splitLine: {
        lineStyle: { color: '#334155', type: 'dashed' },
      },
    },
    series: [{
      data: yData,
      type: 'line',
      smooth: props.smooth,
      symbol: props.showPoints ? 'circle' : 'none',
      symbolSize: 8,
      lineStyle: {
        color: props.color,
        width: 3,
      },
      itemStyle: {
        color: props.color,
        borderColor: '#fff',
        borderWidth: 2,
      },
      areaStyle: props.area ? {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: props.color + '80' },
            { offset: 1, color: props.color + '10' },
          ],
        },
      } : undefined,
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
    class="line-chart"
  />
</template>

<style scoped>
.line-chart {
  background: transparent;
}
</style>
