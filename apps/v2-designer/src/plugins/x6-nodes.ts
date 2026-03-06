import { Graph } from '@antv/x6'

// 注册标志位
let flowNodesRegistered = false
let decorationNodesRegistered = false
let dashboardNodesRegistered = false

/**
 * 注册核心装饰类节点
 */
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
        rx: 4, ry: 4,
        stroke: '#00f0ff', strokeWidth: 2,
        fill: 'rgba(0, 20, 40, 0.8)',
        filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))',
      },
      header: { rx: 4, ry: 4, strokeWidth: 0, fill: 'rgba(0, 240, 255, 0.15)' },
      headerText: { fill: '#00f0ff', fontSize: 14, fontWeight: 'bold', refX: 15, refY: 12 },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'header' },
      { tagName: 'text', selector: 'headerText' },
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
        rx: 8, ry: 8,
        stroke: '#ff00ff', strokeWidth: 3,
        fill: 'rgba(30, 0, 40, 0.85)',
        filter: 'drop-shadow(0 0 12px rgba(255, 0, 255, 0.8))',
      },
      header: { rx: 8, ry: 8, strokeWidth: 0, fill: 'rgba(255, 0, 255, 0.1)' },
      headerText: { fill: '#ff00ff', fontSize: 14, fontWeight: 'bold', refX: 15, refY: 12 },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'header' },
      { tagName: 'text', selector: 'headerText' },
    ],
  })

  // 分割线
  Graph.registerNode('divider-h', {
    inherit: 'rect', width: 400, height: 2,
    attrs: { body: { fill: 'l(0) 0:transparent 0.5:#00f0ff 1:transparent' } },
  })
  Graph.registerNode('divider-v', {
    inherit: 'rect', width: 2, height: 200,
    attrs: { body: { fill: 'l(0) 0:transparent 0.5:#00f0ff 1:transparent' } },
  })

  // 按钮
  Graph.registerNode('button-primary', {
    inherit: 'rect', width: 120, height: 40,
    attrs: {
      body: { rx: 6, ry: 6, fill: 'l(0) 0:#0066ff 1:#00ccff' },
      text: { fill: '#ffffff', fontSize: 14, fontWeight: 'bold', textAnchor: 'middle', textVerticalAnchor: 'middle' },
    },
    markup: [{ tagName: 'rect', selector: 'body' }, { tagName: 'text', selector: 'text' }],
  })
  Graph.registerNode('button-default', {
    inherit: 'rect', width: 120, height: 40,
    attrs: {
      body: { rx: 6, ry: 6, fill: 'rgba(100, 116, 139, 0.3)', stroke: '#64748b', strokeWidth: 1 },
      text: { fill: '#e2e8f0', fontSize: 14, textAnchor: 'middle', textVerticalAnchor: 'middle' },
    },
    markup: [{ tagName: 'rect', selector: 'body' }, { tagName: 'text', selector: 'text' }],
  })
}

/**
 * 注册流程图节点
 */
export function registerFlowNodes() {
  if (flowNodesRegistered) return
  flowNodesRegistered = true

  Graph.registerNode('flow-start', {
    inherit: 'rect', width: 120, height: 50,
    attrs: {
      body: { rx: 25, ry: 25, fill: 'rgba(34, 197, 94, 0.1)', stroke: '#22c55e', strokeWidth: 2 },
      text: { text: '开始', fill: '#e2e8f0', fontSize: 14 },
    },
  })
  Graph.registerNode('flow-end', {
    inherit: 'rect', width: 60, height: 60,
    attrs: {
      body: { rx: 30, ry: 30, fill: 'rgba(239, 68, 68, 0.1)', stroke: '#ef4444', strokeWidth: 2 },
      text: { text: '结束', fill: '#e2e8f0', fontSize: 14 },
    },
  })
  Graph.registerNode('flow-process', {
    inherit: 'rect', width: 140, height: 60,
    attrs: {
      body: { fill: 'rgba(99, 102, 241, 0.1)', stroke: '#6366f1', strokeWidth: 2 },
      text: { text: '处理过程', fill: '#e2e8f0', fontSize: 14 },
    },
  })
  Graph.registerNode('flow-decision', {
    inherit: 'polygon', width: 100, height: 70,
    attrs: {
      body: { refPoints: '50,0 100,50 50,100 0,50', fill: 'rgba(249, 115, 22, 0.1)', stroke: '#f97316', strokeWidth: 2 },
      text: { text: '判断', fill: '#e2e8f0', fontSize: 14 },
    },
  })
}

/**
 * 注册大屏卡片容器
 */
export function registerDashboardNodes() {
  if (dashboardNodesRegistered) return
  dashboardNodesRegistered = true

  Graph.registerNode('dashboard-container', {
    inherit: 'rect', width: 400, height: 300, resizable: true,
    attrs: {
      body: { rx: 6, ry: 6, stroke: '#0ea5e9', strokeWidth: 2, fill: 'rgba(15, 23, 42, 0.85)' },
      header: { rx: 6, ry: 6, fill: 'rgba(14, 165, 233, 0.15)' },
      headerText: { fill: '#e0f2fe', fontSize: 14, fontWeight: 'bold', refX: 15, refY: 15 },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'rect', selector: 'header' },
      { tagName: 'text', selector: 'headerText' },
    ],
  })
}

/**
 * 注册连线相关逻辑
 */
export function registerEdges() {
  Graph.registerEdge('electric-line', {
    inherit: 'edge',
    attrs: { line: { stroke: '#1e40af', strokeWidth: 4, targetMarker: 'classic' } }
  })
  Graph.registerEdge('signal-line', {
    inherit: 'edge',
    attrs: { line: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4, 4', targetMarker: 'classic' } }
  })
  // 基础 3D 管道兼容
  Graph.registerEdge('fluid-pipe', {
    inherit: 'edge',
    attrs: {
      line: { connection: true, stroke: '#475569', strokeWidth: 10, targetMarker: null },
      fluid: { connection: true, stroke: '#38bdf8', strokeWidth: 6, strokeDasharray: '12, 12', style: { animation: 'dash-flow 1s linear infinite' } }
    },
    markup: [{ tagName: 'path', selector: 'line' }, { tagName: 'path', selector: 'fluid' }],
  })
}

/**
 * 注册 Vue 组件节点
 * 注意：v2-designer 目前没有 Vue 节点组件，此函数为空实现
 * 如需添加 Vue 节点，请先在 @/components/v2/nodes/ 目录下创建对应组件
 */
export function registerVueNodes() {
  // v2-designer 暂无 Vue 节点组件
  // 如需添加，请使用以下模式：
  // import { register } from '@antv/x6-vue-shape'
  // import MyNode from '@/components/v2/nodes/MyNode.vue'
  // register({ shape: 'my-node', component: MyNode })
}
