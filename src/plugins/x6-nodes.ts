import { Graph } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import CoolingFan from '@/components/editor/nodes/CoolingFan.vue'
import StorageTank from '@/components/editor/nodes/StorageTank.vue'

export function registerEdges() {
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
}
