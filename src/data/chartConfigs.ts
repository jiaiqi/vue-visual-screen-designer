import type { EChartsOption } from 'echarts'

export interface ChartConfig {
  id: string
  name: string
  category: string
  icon: string
  width: number
  height: number
  option: EChartsOption
}

export interface ChartCategory {
  id: string
  name: string
  icon: string
  charts: ChartConfig[]
}

const generateXAxisData = (count: number = 7) => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return days.slice(0, count)
}

const generateRandomData = (count: number = 7, min: number = 0, max: number = 100) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

export const chartCategories: ChartCategory[] = [
  {
    id: 'line',
    name: '折线图',
    icon: 'TrendingUp',
    charts: [
      {
        id: 'line-basic',
        name: '基础折线图',
        category: 'line',
        icon: 'LineChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '基础折线图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [{ type: 'line', data: generateRandomData(), smooth: false, lineStyle: { color: '#3b82f6' }, itemStyle: { color: '#3b82f6' } }],
          grid: { left: '10%', right: '10%', top: '20%', bottom: '15%' }
        }
      },
      {
        id: 'line-multi',
        name: '多线折线图',
        category: 'line',
        icon: 'LineChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '多线折线图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          legend: { data: ['系列A', '系列B', '系列C'], top: 30, textStyle: { color: '#94a3b8' } },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [
            { name: '系列A', type: 'line', data: generateRandomData(), lineStyle: { color: '#3b82f6' }, itemStyle: { color: '#3b82f6' } },
            { name: '系列B', type: 'line', data: generateRandomData(), lineStyle: { color: '#10b981' }, itemStyle: { color: '#10b981' } },
            { name: '系列C', type: 'line', data: generateRandomData(), lineStyle: { color: '#f59e0b' }, itemStyle: { color: '#f59e0b' } }
          ],
          grid: { left: '10%', right: '10%', top: '25%', bottom: '15%' }
        }
      },
      {
        id: 'line-dual-y',
        name: '双Y轴折线图',
        category: 'line',
        icon: 'LineChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '双Y轴折线图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          legend: { data: ['温度', '湿度'], top: 30, textStyle: { color: '#94a3b8' } },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: [
            { type: 'value', name: '温度(°C)', axisLabel: { color: '#64748b' }, nameTextStyle: { color: '#64748b' } },
            { type: 'value', name: '湿度(%)', axisLabel: { color: '#64748b' }, nameTextStyle: { color: '#64748b' } }
          ],
          series: [
            { name: '温度', type: 'line', data: generateRandomData(7, 20, 35), lineStyle: { color: '#ef4444' }, itemStyle: { color: '#ef4444' } },
            { name: '湿度', type: 'line', yAxisIndex: 1, data: generateRandomData(7, 40, 80), lineStyle: { color: '#3b82f6' }, itemStyle: { color: '#3b82f6' } }
          ],
          grid: { left: '10%', right: '10%', top: '25%', bottom: '15%' }
        }
      },
      {
        id: 'line-smooth',
        name: '曲线折线图',
        category: 'line',
        icon: 'LineChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '曲线折线图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [{ type: 'line', data: generateRandomData(), smooth: true, lineStyle: { color: '#8b5cf6' }, itemStyle: { color: '#8b5cf6' }, areaStyle: { color: 'rgba(139, 92, 246, 0.1)' } }],
          grid: { left: '10%', right: '10%', top: '20%', bottom: '15%' }
        }
      },
      {
        id: 'line-step',
        name: '阶梯折线图',
        category: 'line',
        icon: 'LineChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '阶梯折线图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [{ type: 'line', data: generateRandomData(), step: 'middle', lineStyle: { color: '#06b6d4' }, itemStyle: { color: '#06b6d4' } }],
          grid: { left: '10%', right: '10%', top: '20%', bottom: '15%' }
        }
      },
      {
        id: 'line-area-gradient',
        name: '渐变面积折线图',
        category: 'line',
        icon: 'LineChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '渐变面积折线图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [{
            type: 'line',
            data: generateRandomData(),
            smooth: true,
            lineStyle: { color: '#3b82f6', width: 2 },
            itemStyle: { color: '#3b82f6' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.5)' }, { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }]
              }
            }
          }],
          grid: { left: '10%', right: '10%', top: '20%', bottom: '15%' }
        }
      }
    ]
  },
  {
    id: 'area',
    name: '面积图',
    icon: 'AreaChart',
    charts: [
      {
        id: 'area-basic',
        name: '基础面积图',
        category: 'area',
        icon: 'AreaChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '基础面积图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [{ type: 'line', data: generateRandomData(), areaStyle: { color: 'rgba(59, 130, 246, 0.4)' }, lineStyle: { color: '#3b82f6' }, itemStyle: { color: '#3b82f6' } }],
          grid: { left: '10%', right: '10%', top: '20%', bottom: '15%' }
        }
      },
      {
        id: 'area-stacked',
        name: '堆叠面积图',
        category: 'area',
        icon: 'AreaChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '堆叠面积图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          legend: { data: ['系列A', '系列B'], top: 30, textStyle: { color: '#94a3b8' } },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [
            { name: '系列A', type: 'line', stack: 'Total', data: generateRandomData(), areaStyle: { color: 'rgba(59, 130, 246, 0.4)' }, lineStyle: { color: '#3b82f6' }, itemStyle: { color: '#3b82f6' } },
            { name: '系列B', type: 'line', stack: 'Total', data: generateRandomData(), areaStyle: { color: 'rgba(16, 185, 129, 0.4)' }, lineStyle: { color: '#10b981' }, itemStyle: { color: '#10b981' } }
          ],
          grid: { left: '10%', right: '10%', top: '25%', bottom: '15%' }
        }
      }
    ]
  },
  {
    id: 'bar',
    name: '柱状图',
    icon: 'BarChart',
    charts: [
      {
        id: 'bar-basic',
        name: '基础柱状图',
        category: 'bar',
        icon: 'BarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '基础柱状图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [{ type: 'bar', data: generateRandomData(), itemStyle: { color: '#3b82f6' } }],
          grid: { left: '10%', right: '10%', top: '20%', bottom: '15%' }
        }
      },
      {
        id: 'bar-stacked',
        name: '堆叠柱状图',
        category: 'bar',
        icon: 'BarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '堆叠柱状图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          legend: { data: ['系列A', '系列B'], top: 30, textStyle: { color: '#94a3b8' } },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [
            { name: '系列A', type: 'bar', stack: 'total', data: generateRandomData(), itemStyle: { color: '#3b82f6' } },
            { name: '系列B', type: 'bar', stack: 'total', data: generateRandomData(), itemStyle: { color: '#10b981' } }
          ],
          grid: { left: '10%', right: '10%', top: '25%', bottom: '15%' }
        }
      },
      {
        id: 'bar-grouped',
        name: '分组柱状图',
        category: 'bar',
        icon: 'BarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '分组柱状图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          legend: { data: ['系列A', '系列B'], top: 30, textStyle: { color: '#94a3b8' } },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [
            { name: '系列A', type: 'bar', data: generateRandomData(), itemStyle: { color: '#3b82f6' } },
            { name: '系列B', type: 'bar', data: generateRandomData(), itemStyle: { color: '#10b981' } }
          ],
          grid: { left: '10%', right: '10%', top: '25%', bottom: '15%' }
        }
      },
      {
        id: 'bar-gradient',
        name: '渐变柱状图',
        category: 'bar',
        icon: 'BarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '渐变柱状图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: generateXAxisData(), axisLabel: { color: '#64748b' } },
          yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          series: [{
            type: 'bar',
            data: generateRandomData(),
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#1e40af' }]
              }
            }
          }],
          grid: { left: '10%', right: '10%', top: '20%', bottom: '15%' }
        }
      },
      {
        id: 'bar-horizontal',
        name: '横向柱状图',
        category: 'bar',
        icon: 'BarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '横向柱状图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          yAxis: { type: 'category', data: ['类别A', '类别B', '类别C', '类别D', '类别E'], axisLabel: { color: '#64748b' } },
          series: [{ type: 'bar', data: generateRandomData(5), itemStyle: { color: '#8b5cf6' } }],
          grid: { left: '15%', right: '10%', top: '20%', bottom: '15%' }
        }
      }
    ]
  },
  {
    id: 'bar-h',
    name: '条形图',
    icon: 'BarChartHorizontal',
    charts: [
      {
        id: 'barh-basic',
        name: '基础条形图',
        category: 'bar-h',
        icon: 'BarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '基础条形图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          yAxis: { type: 'category', data: ['类别A', '类别B', '类别C', '类别D', '类别E'], axisLabel: { color: '#64748b' } },
          series: [{ type: 'bar', data: generateRandomData(5), itemStyle: { color: '#06b6d4' } }],
          grid: { left: '15%', right: '10%', top: '20%', bottom: '15%' }
        }
      },
      {
        id: 'barh-grouped',
        name: '分组条形图',
        category: 'bar-h',
        icon: 'BarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '分组条形图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          legend: { data: ['系列A', '系列B'], top: 30, textStyle: { color: '#94a3b8' } },
          xAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          yAxis: { type: 'category', data: ['类别A', '类别B', '类别C', '类别D'], axisLabel: { color: '#64748b' } },
          series: [
            { name: '系列A', type: 'bar', data: generateRandomData(4), itemStyle: { color: '#06b6d4' } },
            { name: '系列B', type: 'bar', data: generateRandomData(4), itemStyle: { color: '#f59e0b' } }
          ],
          grid: { left: '15%', right: '10%', top: '25%', bottom: '15%' }
        }
      },
      {
        id: 'barh-stacked',
        name: '堆叠条形图',
        category: 'bar-h',
        icon: 'BarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '堆叠条形图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          legend: { data: ['系列A', '系列B'], top: 30, textStyle: { color: '#94a3b8' } },
          xAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          yAxis: { type: 'category', data: ['类别A', '类别B', '类别C', '类别D'], axisLabel: { color: '#64748b' } },
          series: [
            { name: '系列A', type: 'bar', stack: 'total', data: generateRandomData(4), itemStyle: { color: '#06b6d4' } },
            { name: '系列B', type: 'bar', stack: 'total', data: generateRandomData(4), itemStyle: { color: '#f59e0b' } }
          ],
          grid: { left: '15%', right: '10%', top: '25%', bottom: '15%' }
        }
      },
      {
        id: 'barh-negative',
        name: '正负条形图',
        category: 'bar-h',
        icon: 'BarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '正负条形图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'value', axisLabel: { color: '#64748b' } },
          yAxis: { type: 'category', data: ['指标A', '指标B', '指标C', '指标D'], axisLabel: { color: '#64748b' } },
          series: [{
            type: 'bar',
            data: [20, -30, 15, -25],
            itemStyle: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              color: (params: any) => params.value >= 0 ? '#10b981' : '#ef4444'
            }
          }],
          grid: { left: '15%', right: '10%', top: '20%', bottom: '15%' }
        }
      }
    ]
  },
  {
    id: 'pie',
    name: '饼环图',
    icon: 'PieChart',
    charts: [
      {
        id: 'pie-basic',
        name: '饼图',
        category: 'pie',
        icon: 'PieChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '饼图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left', textStyle: { color: '#94a3b8' } },
          series: [{
            type: 'pie',
            radius: '60%',
            data: [
              { value: 1048, name: '类型A', itemStyle: { color: '#3b82f6' } },
              { value: 735, name: '类型B', itemStyle: { color: '#10b981' } },
              { value: 580, name: '类型C', itemStyle: { color: '#f59e0b' } },
              { value: 484, name: '类型D', itemStyle: { color: '#ef4444' } }
            ]
          }]
        }
      },
      {
        id: 'pie-doughnut',
        name: '环图',
        category: 'pie',
        icon: 'PieChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '环图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left', textStyle: { color: '#94a3b8' } },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { value: 1048, name: '类型A', itemStyle: { color: '#3b82f6' } },
              { value: 735, name: '类型B', itemStyle: { color: '#10b981' } },
              { value: 580, name: '类型C', itemStyle: { color: '#f59e0b' } },
              { value: 484, name: '类型D', itemStyle: { color: '#8b5cf6' } }
            ]
          }]
        }
      },
      {
        id: 'pie-rounded',
        name: '圆角环图',
        category: 'pie',
        icon: 'PieChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '圆角环图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left', textStyle: { color: '#94a3b8' } },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            itemStyle: { borderRadius: 10, borderColor: '#0f172a', borderWidth: 2 },
            data: [
              { value: 1048, name: '类型A', itemStyle: { color: '#3b82f6' } },
              { value: 735, name: '类型B', itemStyle: { color: '#10b981' } },
              { value: 580, name: '类型C', itemStyle: { color: '#f59e0b' } },
              { value: 484, name: '类型D', itemStyle: { color: '#06b6d4' } }
            ]
          }]
        }
      },
      {
        id: 'pie-rose',
        name: '玫瑰图',
        category: 'pie',
        icon: 'PieChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '玫瑰图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left', textStyle: { color: '#94a3b8' } },
          series: [{
            type: 'pie',
            radius: ['20%', '70%'],
            roseType: 'area',
            itemStyle: { borderRadius: 5 },
            data: [
              { value: 30, name: '类型A', itemStyle: { color: '#3b82f6' } },
              { value: 28, name: '类型B', itemStyle: { color: '#10b981' } },
              { value: 26, name: '类型C', itemStyle: { color: '#f59e0b' } },
              { value: 24, name: '类型D', itemStyle: { color: '#ef4444' } },
              { value: 22, name: '类型E', itemStyle: { color: '#8b5cf6' } }
            ]
          }]
        }
      }
    ]
  },
  {
    id: 'scatter',
    name: '散点图',
    icon: 'ScatterChart',
    charts: [
      {
        id: 'scatter-basic',
        name: '散点图',
        category: 'scatter',
        icon: 'ScatterChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '散点图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          xAxis: { axisLabel: { color: '#64748b' } },
          yAxis: { axisLabel: { color: '#64748b' } },
          series: [{
            type: 'scatter',
            symbolSize: 10,
            data: Array.from({ length: 30 }, () => [Math.random() * 100, Math.random() * 100]),
            itemStyle: { color: '#3b82f6' }
          }],
          grid: { left: '10%', right: '10%', top: '20%', bottom: '15%' }
        }
      },
      {
        id: 'scatter-ripple',
        name: '涟漪散点图',
        category: 'scatter',
        icon: 'ScatterChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '涟漪散点图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          xAxis: { axisLabel: { color: '#64748b' } },
          yAxis: { axisLabel: { color: '#64748b' } },
          series: [{
            type: 'effectScatter',
            symbolSize: 10,
            rippleEffect: { brushType: 'stroke', scale: 4 },
            data: Array.from({ length: 15 }, () => [Math.random() * 100, Math.random() * 100]),
            itemStyle: { color: '#06b6d4' }
          }],
          grid: { left: '10%', right: '10%', top: '20%', bottom: '15%' }
        }
      }
    ]
  },
  {
    id: 'radar',
    name: '雷达图',
    icon: 'RadarChart',
    charts: [
      {
        id: 'radar-basic',
        name: '雷达图',
        category: 'radar',
        icon: 'RadarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '雷达图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: {},
          legend: { data: ['预算分配', '实际开销'], top: 30, textStyle: { color: '#94a3b8' } },
          radar: {
            indicator: [
              { name: '销售', max: 100 },
              { name: '管理', max: 100 },
              { name: '信息技术', max: 100 },
              { name: '客服', max: 100 },
              { name: '研发', max: 100 },
              { name: '市场', max: 100 }
            ],
            axisName: { color: '#64748b' }
          },
          series: [{
            type: 'radar',
            data: [
              { value: [60, 70, 80, 65, 90, 75], name: '预算分配', areaStyle: { color: 'rgba(59, 130, 246, 0.3)' }, lineStyle: { color: '#3b82f6' }, itemStyle: { color: '#3b82f6' } },
              { value: [50, 60, 70, 55, 80, 65], name: '实际开销', areaStyle: { color: 'rgba(16, 185, 129, 0.3)' }, lineStyle: { color: '#10b981' }, itemStyle: { color: '#10b981' } }
            ]
          }]
        }
      },
      {
        id: 'radar-circle',
        name: '圆形雷达图',
        category: 'radar',
        icon: 'RadarChart',
        width: 400,
        height: 300,
        option: {
          title: { text: '圆形雷达图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: {},
          radar: {
            shape: 'circle',
            indicator: [
              { name: '指标A', max: 100 },
              { name: '指标B', max: 100 },
              { name: '指标C', max: 100 },
              { name: '指标D', max: 100 },
              { name: '指标E', max: 100 }
            ],
            axisName: { color: '#64748b' }
          },
          series: [{
            type: 'radar',
            data: [{
              value: [85, 70, 95, 60, 80],
              areaStyle: { color: 'rgba(139, 92, 246, 0.3)' },
              lineStyle: { color: '#8b5cf6' },
              itemStyle: { color: '#8b5cf6' }
            }]
          }]
        }
      }
    ]
  },
  {
    id: 'graph',
    name: '关系图',
    icon: 'GitBranch',
    charts: [
      {
        id: 'graph-force',
        name: '力引导图',
        category: 'graph',
        icon: 'GitBranch',
        width: 400,
        height: 300,
        option: {
          title: { text: '力引导图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: {},
          series: [{
            type: 'graph',
            layout: 'force',
            data: [
              { name: '节点1', symbolSize: 40, itemStyle: { color: '#3b82f6' } },
              { name: '节点2', symbolSize: 30, itemStyle: { color: '#10b981' } },
              { name: '节点3', symbolSize: 30, itemStyle: { color: '#f59e0b' } },
              { name: '节点4', symbolSize: 25, itemStyle: { color: '#ef4444' } },
              { name: '节点5', symbolSize: 25, itemStyle: { color: '#8b5cf6' } }
            ],
            links: [
              { source: '节点1', target: '节点2' },
              { source: '节点1', target: '节点3' },
              { source: '节点2', target: '节点4' },
              { source: '节点3', target: '节点5' }
            ],
            force: { repulsion: 200, edgeLength: 80 },
            label: { show: true, color: '#94a3b8' },
            lineStyle: { color: '#475569', width: 2 }
          }]
        }
      },
      {
        id: 'graph-knowledge',
        name: '知识图谱',
        category: 'graph',
        icon: 'GitBranch',
        width: 400,
        height: 300,
        option: {
          title: { text: '知识图谱', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: {},
          series: [{
            type: 'graph',
            layout: 'circular',
            data: [
              { name: '中心概念', symbolSize: 50, itemStyle: { color: '#3b82f6' } },
              { name: '概念A', symbolSize: 30, itemStyle: { color: '#10b981' } },
              { name: '概念B', symbolSize: 30, itemStyle: { color: '#f59e0b' } },
              { name: '概念C', symbolSize: 30, itemStyle: { color: '#ef4444' } },
              { name: '概念D', symbolSize: 25, itemStyle: { color: '#8b5cf6' } },
              { name: '概念E', symbolSize: 25, itemStyle: { color: '#06b6d4' } }
            ],
            links: [
              { source: '中心概念', target: '概念A', label: { show: true, formatter: '关联' } },
              { source: '中心概念', target: '概念B', label: { show: true, formatter: '关联' } },
              { source: '中心概念', target: '概念C', label: { show: true, formatter: '关联' } },
              { source: '概念A', target: '概念D' },
              { source: '概念B', target: '概念E' }
            ],
            label: { show: true, color: '#94a3b8' },
            lineStyle: { color: '#475569', width: 2, curveness: 0.2 }
          }]
        }
      }
    ]
  },
  {
    id: 'gauge',
    name: '仪表盘',
    icon: 'Gauge',
    charts: [
      {
        id: 'gauge-basic',
        name: '基础仪表盘',
        category: 'gauge',
        icon: 'Gauge',
        width: 400,
        height: 300,
        option: {
          title: { text: '基础仪表盘', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          series: [{
            type: 'gauge',
            detail: { formatter: '{value}%', color: '#94a3b8' },
            data: [{ value: 68, name: '完成率', title: { color: '#64748b' } }],
            axisLine: { lineStyle: { width: 20, color: [[0.3, '#ef4444'], [0.7, '#f59e0b'], [1, '#10b981']] } },
            pointer: { itemStyle: { color: '#94a3b8' } }
          }]
        }
      },
      {
        id: 'gauge-disc',
        name: '圆盘仪表盘',
        category: 'gauge',
        icon: 'Gauge',
        width: 400,
        height: 300,
        option: {
          title: { text: '圆盘仪表盘', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          series: [{
            type: 'gauge',
            radius: '90%',
            detail: { formatter: '{value}', color: '#94a3b8', fontSize: 24 },
            data: [{ value: 75, name: '得分', title: { color: '#64748b', offsetCenter: [0, '70%'] } }],
            axisLine: { lineStyle: { width: 30, color: [[0.25, '#ef4444'], [0.5, '#f59e0b'], [0.75, '#3b82f6'], [1, '#10b981']] } },
            pointer: { width: 5, itemStyle: { color: '#f1f5f9' } },
            splitLine: { length: 15, lineStyle: { color: '#475569' } }
          }]
        }
      },
      {
        id: 'gauge-progress',
        name: '进度仪表盘',
        category: 'gauge',
        icon: 'Gauge',
        width: 400,
        height: 300,
        option: {
          title: { text: '进度仪表盘', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          series: [{
            type: 'gauge',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 10,
            detail: { formatter: '{value}%', color: '#3b82f6', fontSize: 28, offsetCenter: [0, '60%'] },
            data: [{ value: 85 }],
            axisLine: { lineStyle: { width: 15, color: [[1, '#1e293b']] } },
            progress: { show: true, width: 15, itemStyle: { color: '#3b82f6' } },
            pointer: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false }
          }]
        }
      }
    ]
  },
  {
    id: 'map',
    name: '地图',
    icon: 'Map',
    charts: [
      {
        id: 'map-china',
        name: '中国地图',
        category: 'map',
        icon: 'Map',
        width: 500,
        height: 400,
        option: {
          title: { text: '中国地图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          visualMap: {
            min: 0,
            max: 100,
            left: 'left',
            top: 'bottom',
            text: ['高', '低'],
            textStyle: { color: '#94a3b8' },
            inRange: { color: ['#1e3a5f', '#3b82f6'] }
          },
          series: [{
            type: 'map',
            map: 'china',
            roam: true,
            label: { show: false },
            itemStyle: { areaColor: '#1e293b', borderColor: '#475569' },
            emphasis: { itemStyle: { areaColor: '#3b82f6' }, label: { show: true, color: '#f1f5f9' } },
            data: [
              { name: '北京', value: 85 },
              { name: '上海', value: 92 },
              { name: '广东', value: 78 },
              { name: '陕西', value: 65 },
              { name: '四川', value: 70 }
            ]
          }]
        }
      },
      {
        id: 'map-shaanxi',
        name: '陕西地图',
        category: 'map',
        icon: 'Map',
        width: 400,
        height: 350,
        option: {
          title: { text: '陕西地图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          visualMap: {
            min: 0,
            max: 100,
            left: 'left',
            top: 'bottom',
            text: ['高', '低'],
            textStyle: { color: '#94a3b8' },
            inRange: { color: ['#1e3a5f', '#10b981'] }
          },
          series: [{
            type: 'map',
            map: '陕西',
            roam: true,
            label: { show: false },
            itemStyle: { areaColor: '#1e293b', borderColor: '#475569' },
            emphasis: { itemStyle: { areaColor: '#10b981' }, label: { show: true, color: '#f1f5f9' } },
            data: [
              { name: '西安市', value: 95 },
              { name: '咸阳市', value: 72 },
              { name: '宝鸡市', value: 58 },
              { name: '渭南市', value: 65 },
              { name: '延安市', value: 45 }
            ]
          }]
        }
      },
      {
        id: 'map-lines',
        name: '飞线图',
        category: 'map',
        icon: 'Map',
        width: 500,
        height: 400,
        option: {
          title: { text: '飞线图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          geo: {
            map: 'china',
            roam: true,
            itemStyle: { areaColor: '#1e293b', borderColor: '#475569' },
            emphasis: { itemStyle: { areaColor: '#334155' } }
          },
          series: [{
            type: 'lines',
            coordinateSystem: 'geo',
            effect: { show: true, period: 4, trailLength: 0.2, symbol: 'arrow', symbolSize: 5, color: '#3b82f6' },
            lineStyle: { color: '#3b82f6', width: 1.5, curveness: 0.3 },
            data: [
              { coords: [[116.4074, 39.9042], [121.4737, 31.2304]] },
              { coords: [[116.4074, 39.9042], [113.2644, 23.1291]] },
              { coords: [[116.4074, 39.9042], [108.9402, 34.3416]] },
              { coords: [[121.4737, 31.2304], [104.0665, 30.5723]] }
            ]
          },
          {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            symbolSize: 10,
            rippleEffect: { brushType: 'stroke', scale: 5 },
            itemStyle: { color: '#ef4444' },
            data: [
              { name: '北京', value: [116.4074, 39.9042, 100] },
              { name: '上海', value: [121.4737, 31.2304, 90] },
              { name: '广州', value: [113.2644, 23.1291, 80] },
              { name: '西安', value: [108.9402, 34.3416, 70] },
              { name: '成都', value: [104.0665, 30.5723, 75] }
            ]
          }]
        }
      }
    ]
  },
  {
    id: 'funnel',
    name: '漏斗图',
    icon: 'Filter',
    charts: [
      {
        id: 'funnel-basic',
        name: '基础漏斗图',
        category: 'funnel',
        icon: 'Filter',
        width: 400,
        height: 300,
        option: {
          title: { text: '漏斗图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          legend: { orient: 'vertical', left: 'left', textStyle: { color: '#94a3b8' } },
          series: [{
            type: 'funnel',
            left: '20%',
            width: '60%',
            data: [
              { value: 100, name: '展现', itemStyle: { color: '#3b82f6' } },
              { value: 80, name: '点击', itemStyle: { color: '#10b981' } },
              { value: 60, name: '访问', itemStyle: { color: '#f59e0b' } },
              { value: 40, name: '咨询', itemStyle: { color: '#ef4444' } },
              { value: 20, name: '订单', itemStyle: { color: '#8b5cf6' } }
            ]
          }]
        }
      }
    ]
  },
  {
    id: 'heatmap',
    name: '热力图',
    icon: 'Grid3X3',
    charts: [
      {
        id: 'heatmap-basic',
        name: '热力图',
        category: 'heatmap',
        icon: 'Grid3X3',
        width: 400,
        height: 300,
        option: {
          title: { text: '热力图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { position: 'top' },
          grid: { left: '10%', right: '15%', top: '20%', bottom: '15%' },
          xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'], axisLabel: { color: '#64748b' } },
          yAxis: { type: 'category', data: ['上午', '下午', '晚上'], axisLabel: { color: '#64748b' } },
          visualMap: { min: 0, max: 100, calculable: true, orient: 'vertical', right: '5%', top: 'center', textStyle: { color: '#94a3b8' }, inRange: { color: ['#1e3a5f', '#3b82f6', '#f59e0b', '#ef4444'] } },
          series: [{
            type: 'heatmap',
            data: [
              [0, 0, 80], [0, 1, 60], [0, 2, 40],
              [1, 0, 70], [1, 1, 90], [1, 2, 50],
              [2, 0, 55], [2, 1, 75], [2, 2, 85],
              [3, 0, 65], [3, 1, 45], [3, 2, 70],
              [4, 0, 85], [4, 1, 60], [4, 2, 95]
            ],
            label: { show: true, color: '#f1f5f9' }
          }]
        }
      }
    ]
  },
  {
    id: 'treemap',
    name: '矩形树图',
    icon: 'LayoutDashboard',
    charts: [
      {
        id: 'treemap-basic',
        name: '矩形树图',
        category: 'treemap',
        icon: 'LayoutDashboard',
        width: 400,
        height: 300,
        option: {
          title: { text: '矩形树图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: {},
          series: [{
            type: 'treemap',
            data: [
              { name: '类别A', value: 40, itemStyle: { color: '#3b82f6' } },
              { name: '类别B', value: 30, itemStyle: { color: '#10b981' } },
              { name: '类别C', value: 20, itemStyle: { color: '#f59e0b' } },
              { name: '类别D', value: 10, itemStyle: { color: '#8b5cf6' } }
            ],
            label: { show: true, color: '#f1f5f9' }
          }]
        }
      }
    ]
  },
  {
    id: 'sunburst',
    name: '旭日图',
    icon: 'Sun',
    charts: [
      {
        id: 'sunburst-basic',
        name: '旭日图',
        category: 'sunburst',
        icon: 'Sun',
        width: 400,
        height: 300,
        option: {
          title: { text: '旭日图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: {},
          series: [{
            type: 'sunburst',
            radius: ['20%', '70%'],
            data: [
              { name: '类别A', value: 40, children: [{ name: 'A1', value: 20 }, { name: 'A2', value: 20 }] },
              { name: '类别B', value: 30, children: [{ name: 'B1', value: 15 }, { name: 'B2', value: 15 }] },
              { name: '类别C', value: 20, children: [{ name: 'C1', value: 10 }, { name: 'C2', value: 10 }] }
            ],
            label: { color: '#f1f5f9' },
            itemStyle: { borderRadius: 5, borderColor: '#0f172a', borderWidth: 2 }
          }]
        }
      }
    ]
  },
  {
    id: 'sankey',
    name: '桑基图',
    icon: 'Workflow',
    charts: [
      {
        id: 'sankey-basic',
        name: '桑基图',
        category: 'sankey',
        icon: 'Workflow',
        width: 400,
        height: 300,
        option: {
          title: { text: '桑基图', left: 'center', textStyle: { color: '#94a3b8', fontSize: 14 } },
          tooltip: { trigger: 'item' },
          series: [{
            type: 'sankey',
            emphasis: { focus: 'adjacency' },
            data: [
              { name: 'a', itemStyle: { color: '#3b82f6' } },
              { name: 'b', itemStyle: { color: '#10b981' } },
              { name: 'c', itemStyle: { color: '#f59e0b' } },
              { name: 'd', itemStyle: { color: '#ef4444' } },
              { name: 'e', itemStyle: { color: '#8b5cf6' } }
            ],
            links: [
              { source: 'a', target: 'b', value: 5 },
              { source: 'a', target: 'c', value: 3 },
              { source: 'b', target: 'd', value: 4 },
              { source: 'c', target: 'd', value: 2 },
              { source: 'c', target: 'e', value: 1 }
            ],
            lineStyle: { color: 'gradient', curveness: 0.5 }
          }]
        }
      }
    ]
  }
]

export const getAllCharts = (): ChartConfig[] => {
  return chartCategories.flatMap(cat => cat.charts)
}

export const getChartById = (id: string): ChartConfig | undefined => {
  return getAllCharts().find(chart => chart.id === id)
}

export const getChartsByCategory = (categoryId: string): ChartConfig[] => {
  const category = chartCategories.find(cat => cat.id === categoryId)
  return category ? category.charts : []
}
