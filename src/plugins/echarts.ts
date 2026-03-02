import * as echarts from 'echarts/core'

import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  FunnelChart,
  HeatmapChart,
  TreemapChart,
  SunburstChart,
  SankeyChart,
  GraphChart,
  EffectScatterChart,
  MapChart,
  LinesChart,
} from 'echarts/charts'

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  ToolboxComponent,
  GeoComponent,
} from 'echarts/components'

import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  FunnelChart,
  HeatmapChart,
  TreemapChart,
  SunburstChart,
  SankeyChart,
  GraphChart,
  EffectScatterChart,
  MapChart,
  LinesChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  ToolboxComponent,
  GeoComponent,
  CanvasRenderer,
])

export default echarts

export type { EChartsOption } from 'echarts'
