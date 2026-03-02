import { Graph } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import CoolingFan from '@/components/editor/nodes/CoolingFan.vue'
import StorageTank from '@/components/editor/nodes/StorageTank.vue'
import IconNode from '@/components/editor/nodes/IconNode.vue'
import ProgressBarNode from '@/components/editor/nodes/ProgressBarNode.vue'
import DigitalNode from '@/components/editor/nodes/DigitalNode.vue'
import ChartNode from '@/components/editor/nodes/ChartNode.vue'

export function registerEdges() {
  // 1. 电力线 (模拟高压/电流)
  Graph.registerEdge('electric-line', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#1e40af', // 深蓝色
        strokeWidth: 4,
      },
    }
  })

  // 2. 信号线 (细窄虚线)
  Graph.registerEdge('signal-line', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#10b981', // 绿色
        strokeWidth: 2,
        strokeDasharray: '4, 4',
      },
    }
  })

  // 3. 工业总线 (灰色粗实线)
  Graph.registerEdge('bus-line', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#64748b', // 冷灰色
        strokeWidth: 8,
      },
    }
  })

  // 4. 原有的 3D 流体管道
  Graph.registerEdge('fluid-pipe', {
    inherit: 'edge', // 继承基础连线
    attrs: {
      // 管道外壳/底色
      line: {
        connection: true, // 必须携带此属性，X6 才会注入连线路径
        stroke: '#475569', // 具有工业金属感的暗色
        strokeWidth: 10,
        strokeLinejoin: 'round',
        targetMarker: null, // 管道默认无箭头
      },
      // 内部流动液体特效层
      fluid: {
        connection: true, // 同上，绑定路径
        stroke: '#38bdf8', // 亮蓝色液体
        strokeWidth: 6,
        strokeDasharray: '12, 12', // 拉大虚线距离实现明显的水流
        style: {
          animation: 'dash-flow 1s linear infinite',
        }
      }
    },
    markup: [
      {
        tagName: 'path',
        selector: 'line',
        attrs: {
          fill: 'none',
        },
      },
      {
        tagName: 'path',
        selector: 'fluid',
        attrs: {
          fill: 'none',
        },
      },
    ],
  })
}

export function registerVueNodes() {
  register({
    shape: 'cooling-fan',
    width: 100,
    height: 100,
    component: CoolingFan,
  })

  register({
    shape: 'storage-tank',
    width: 120,
    height: 160,
    component: StorageTank,
  })

  register({
    shape: 'icon-node',
    width: 64,
    height: 64,
    component: IconNode,
  })

  register({
    shape: 'progress-node',
    width: 200,
    height: 24,
    component: ProgressBarNode,
  })

  register({
    shape: 'digital-node',
    width: 120,
    height: 48,
    component: DigitalNode,
  })

  register({
    shape: 'chart-node',
    width: 400,
    height: 300,
    component: ChartNode,
  })
}
