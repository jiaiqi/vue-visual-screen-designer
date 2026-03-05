<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, shallowRef, watch, nextTick } from 'vue'
import { Node } from '@antv/x6'
import echarts from '@/plugins/echarts'
import type { EChartsOption } from '@/plugins/echarts'

const getNode = inject('getNode') as () => Node
const node = getNode()

const chartRef = ref<HTMLDivElement>()
const chartInstance = shallowRef<echarts.ECharts | null>(null)

const chartOption = shallowRef<EChartsOption>({})
const chartSize = ref({ width: 400, height: 300 })

const chartStyle = ref({
  width: '400px',
  height: '300px'
})

const initChart = async () => {
  await nextTick()
  if (!chartRef.value) return

  // 初始化时直接设置主题，但后面通过 setOption 覆盖背景
  chartInstance.value = echarts.init(chartRef.value, 'dark')
  updateChart()
}

const resizeChart = () => {
  chartInstance.value?.resize()
}

const updateChart = () => {
  if (chartInstance.value && chartOption.value) {
    // 强制背景透明，保留主题其他样式
    chartInstance.value.setOption({
      ...chartOption.value,
      backgroundColor: 'transparent'
    }, true)
  }
}

const updateData = () => {
  const data = node.getData() as { chartOption?: EChartsOption }
  if (data.chartOption) {
    chartOption.value = data.chartOption
    updateChart()
  }
}

const updateSize = () => {
  const size = node.getSize()
  chartSize.value = size
  chartStyle.value = {
    width: `${size.width}px`,
    height: `${size.height}px`
  }
  nextTick(() => {
    resizeChart()
  })
}

watch(chartOption, updateChart, { deep: true })

onMounted(() => {
  const data = node.getData() as { chartOption?: EChartsOption }
  chartOption.value = data.chartOption || {}

  const size = node.getSize()
  chartSize.value = size
  chartStyle.value = {
    width: `${size.width}px`,
    height: `${size.height}px`
  }

  initChart()

  node.on('change:data', updateData)
  node.on('change:size', updateSize)

  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  node.off('change:data', updateData)
  node.off('change:size', updateSize)
  window.removeEventListener('resize', resizeChart)
  chartInstance.value?.dispose()
  chartInstance.value = null
})

defineExpose({
  getChartInstance: () => chartInstance.value,
  resize: resizeChart
})
</script>

<template>
  <div ref="chartRef" class="chart-node" :style="chartStyle"></div>
</template>

<style scoped>
.chart-node {
  background: transparent;
  min-width: 100px;
  min-height: 100px;
}
</style>
