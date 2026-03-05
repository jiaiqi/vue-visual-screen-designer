import { Graph } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import CoolingFan from '@/components/editor/nodes/CoolingFan.vue'
import StorageTank from '@/components/editor/nodes/StorageTank.vue'
import IconNode from '@/components/editor/nodes/IconNode.vue'
import ProgressBarNode from '@/components/editor/nodes/ProgressBarNode.vue'
import DigitalNode from '@/components/editor/nodes/DigitalNode.vue'
import ChartNode from '@/components/editor/nodes/ChartNode.vue'
import TableNode from '@/components/editor/nodes/TableNode.vue'
import ListNode from '@/components/editor/nodes/ListNode.vue'
import TimelineNode from '@/components/editor/nodes/TimelineNode.vue'
import CountDownNode from '@/components/editor/nodes/CountDownNode.vue'
import GaugeNode from '@/components/editor/nodes/GaugeNode.vue'
import AlertNode from '@/components/editor/nodes/AlertNode.vue'

// 装饰类组件注册标志
let decorationNodesRegistered = false

// 装饰类组件注册函数
export function registerDecorationNodes() {
  if (decorationNodesRegistered) return
  decorationNodesRegistered = true

  // 边框-科技风
  Graph.registerNode('border-tech', {
    inherit: 'rect',
    width: 300,
    height: 200,
    resizable: true,
    draggable: true,
    attrs: {
      body: {
        rx: 4,
        ry: 4,
        stroke: '#00f0ff',
        strokeWidth: 2,
        fill: 'rgba(0, 20, 40, 0.8)',
        filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))',
      },
      header: {
        rx: 4,
        ry: 4,
        strokeWidth: 0,
        fill: 'rgba(0, 240, 255, 0.15)',
      },
      headerText: {
        fill: '#00f0ff',
        fontSize: 14,
        fontWeight: 'bold',
        refX: 15,
        refY: 12,
      },
      content: {
        fill: 'transparent',
      },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'header' },
      { tagName: 'text', selector: 'headerText' },
      { tagName: 'rect', selector: 'content' },
    ],
  })

  // 边框-发光
  Graph.registerNode('border-glow', {
    inherit: 'rect',
    width: 300,
    height: 200,
    resizable: true,
    draggable: true,
    attrs: {
      body: {
        rx: 8,
        ry: 8,
        stroke: '#ff00ff',
        strokeWidth: 3,
        fill: 'rgba(30, 0, 40, 0.85)',
        filter: 'drop-shadow(0 0 12px rgba(255, 0, 255, 0.8))',
      },
      header: {
        rx: 8,
        ry: 8,
        strokeWidth: 0,
        fill: 'rgba(255, 0, 255, 0.1)',
      },
      headerText: {
        fill: '#ff00ff',
        fontSize: 14,
        fontWeight: 'bold',
        refX: 15,
        refY: 12,
      },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'header' },
      { tagName: 'text', selector: 'headerText' },
    ],
  })

  // 边框-渐变
  Graph.registerNode('border-gradient', {
    inherit: 'rect',
    width: 300,
    height: 200,
    resizable: true,
    draggable: true,
    attrs: {
      body: {
        rx: 6,
        ry: 6,
        fill: 'l(0) 0:#ff6b6b 0.5:#feca57 1:#48dbfb',
        stroke: '#48dbfb',
        strokeWidth: 2,
        opacity: 0.9,
      },
      header: {
        rx: 6,
        ry: 6,
        strokeWidth: 0,
        fill: 'rgba(255, 255, 255, 0.1)',
      },
      headerText: {
        fill: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        refX: 15,
        refY: 12,
      },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'header' },
      { tagName: 'text', selector: 'headerText' },
    ],
  })

  // 分割线-水平
  Graph.registerNode('divider-h', {
    inherit: 'rect',
    width: 400,
    height: 2,
    resizable: true,
    draggable: true,
    attrs: {
      body: {
        fill: 'l(0) 0:transparent 0.5:#00f0ff 1:transparent',
      },
    },
  })

  // 分割线-垂直
  Graph.registerNode('divider-v', {
    inherit: 'rect',
    width: 2,
    height: 200,
    resizable: true,
    draggable: true,
    attrs: {
      body: {
        fill: 'l(0) 0:transparent 0.5:#00f0ff 1:transparent',
      },
    },
  })

  // 装饰-角标
  Graph.registerNode('decoration-corner', {
    inherit: 'rect',
    width: 60,
    height: 60,
    resizable: false,
    draggable: true,
    attrs: {
      body: {
        fill: 'transparent',
        stroke: 'transparent',
      },
      corner: {
        fill: '#00f0ff',
        opacity: 0.8,
      },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'path', selector: 'corner' },
    ],
  })

  // 装饰-动线
  Graph.registerNode('decoration-line', {
    inherit: 'rect',
    width: 200,
    height: 4,
    resizable: true,
    draggable: true,
    attrs: {
      body: {
        rx: 2,
        ry: 2,
        fill: 'rgba(0, 240, 255, 0.3)',
        stroke: '#00f0ff',
        strokeWidth: 1,
      },
      line: {
        fill: '#00f0ff',
        style: 'animation: dash-flow 2s linear infinite',
      },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'line' },
    ],
  })

  // 按钮-主要
  Graph.registerNode('button-primary', {
    inherit: 'rect',
    width: 120,
    height: 40,
    resizable: true,
    draggable: true,
    attrs: {
      body: {
        rx: 6,
        ry: 6,
        fill: 'l(0) 0:#0066ff 1:#00ccff',
        cursor: 'pointer',
      },
      text: {
        fill: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        cursor: 'pointer',
      },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'text', selector: 'text' },
    ],
  })

  // 按钮-默认
  Graph.registerNode('button-default', {
    inherit: 'rect',
    width: 120,
    height: 40,
    resizable: true,
    draggable: true,
    attrs: {
      body: {
        rx: 6,
        ry: 6,
        fill: 'rgba(100, 116, 139, 0.3)',
        stroke: '#64748b',
        strokeWidth: 1,
        cursor: 'pointer',
      },
      text: {
        fill: '#e2e8f0',
        fontSize: 14,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        cursor: 'pointer',
      },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'text', selector: 'text' },
    ],
  })

  // 标签-状态
  Graph.registerNode('tag-status', {
    inherit: 'rect',
    width: 80,
    height: 28,
    resizable: false,
    draggable: true,
    attrs: {
      body: {
        rx: 14,
        ry: 14,
        fill: 'rgba(16, 185, 129, 0.2)',
        stroke: '#10b981',
        strokeWidth: 1,
      },
      text: {
        fill: '#10b981',
        fontSize: 12,
        fontWeight: 'bold',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'text', selector: 'text' },
    ],
  })
}

// 大屏卡片容器节点注册
let dashboardNodesRegistered = false

export function registerDashboardNodes() {
  // 检查是否已经注册过，避免热更新时报错
  if (dashboardNodesRegistered) {
    return
  }
  dashboardNodesRegistered = true

  // 大屏卡片容器
  Graph.registerNode('dashboard-container', {
    inherit: 'rect',
    width: 400,
    height: 300,
    minWidth: 200,
    minHeight: 150,
    resizable: true,
    movable: true,
    snapable: true,
    draggable: true,
    // 启用调整大小的控制点
    resizeAxes: 'xy',
    resizeOptions: {
      locked: false, // 不锁定宽高比
      minWidth: 200,
      minHeight: 150,
    },
    // 样式定义
    attrs: {
      body: {
        rx: 6,
        ry: 6,
        stroke: '#0ea5e9',
        strokeWidth: 2,
        fill: 'rgba(15, 23, 42, 0.85)',
        filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.4))',
      },
      header: {
        rx: 6,
        ry: 6,
        strokeWidth: 0,
        fill: 'rgba(14, 165, 233, 0.15)',
      },
      headerText: {
        fill: '#e0f2fe',
        fontSize: 14,
        fontWeight: 'bold',
        refX: 15,
        refY: 15,
      },
      headerIcon: {
        width: 16,
        height: 16,
        x: 8,
        y: 8,
        fill: '#0ea5e9',
      },
    },
    // markup 结构
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'rect',
        selector: 'header',
      },
      {
        tagName: 'text',
        selector: 'headerText',
      },
      {
        tagName: 'circle',
        selector: 'headerIcon',
      },
    ],
  })
}

export function registerEdges() {
  // 1. 电力线 (模拟高压/电流)
  Graph.registerEdge('electric-line', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#1e40af', // 深蓝色
        strokeWidth: 4,
        targetMarker: 'classic',
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
        targetMarker: 'classic',
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
        targetMarker: 'classic',
      },
    }
  })

  // 4. 虚线连接 (蓝色虚线)
  Graph.registerEdge('dashed-line', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#38bdf8', // 蓝色
        strokeWidth: 3,
        strokeDasharray: '8, 8',
        targetMarker: 'classic',
      },
    }
  })

  // 5. 点线连接 (橙色点线)
  Graph.registerEdge('dotted-line', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#f97316', // 橙色
        strokeWidth: 3,
        strokeDasharray: '2, 4',
        targetMarker: 'classic',
      },
    }
  })

  // 6. 流动动画线 (带流动动画)
  Graph.registerEdge('flow-line', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#22c55e', // 绿色
        strokeWidth: 4,
        strokeDasharray: '10, 10',
        targetMarker: 'classic',
        style: {
          animation: 'dash-flow 1s linear infinite',
        },
      },
    }
  })

  // 7. 红色警告线
  Graph.registerEdge('warning-line', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#ef4444', // 红色
        strokeWidth: 3,
        targetMarker: 'classic',
      },
    }
  })

  // 8. 紫色数据线
  Graph.registerEdge('data-line', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#8b5cf6', // 紫色
        strokeWidth: 2,
        targetMarker: 'classic',
      },
    }
  })

  // 9. 原有的 3D 流体管道
  Graph.registerEdge('fluid-pipe', {
    inherit: 'edge',
    attrs: {
      line: {
        connection: true,
        stroke: '#475569',
        strokeWidth: 10,
        strokeLinejoin: 'round',
        targetMarker: null,
      },
      fluid: {
        connection: true,
        stroke: '#38bdf8',
        strokeWidth: 6,
        strokeDasharray: '12, 12',
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

  register({
    shape: 'table-basic',
    width: 400,
    height: 200,
    component: TableNode,
  })

  register({
    shape: 'list-rank',
    width: 300,
    height: 200,
    component: ListNode,
  })

  register({
    shape: 'timeline-h',
    width: 500,
    height: 80,
    component: TimelineNode,
  })

  register({
    shape: 'timeline-v',
    width: 100,
    height: 300,
    component: TimelineNode,
  })

  register({
    shape: 'countdown',
    width: 200,
    height: 80,
    component: CountDownNode,
  })

  // P2 新增：仪表盘节点
  register({
    shape: 'gauge-node',
    width: 200,
    height: 200,
    component: GaugeNode,
  })

  // P2 新增：告警闪烁节点
  register({
    shape: 'alert-node',
    width: 200,
    height: 100,
    component: AlertNode,
  })
}
