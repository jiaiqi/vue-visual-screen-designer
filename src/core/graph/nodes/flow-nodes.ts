import { Graph } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import FlowNode from '@/components/v2/nodes/FlowNode.vue'

let flowNodesRegistered = false

const FLOW_NODE_PORTS = {
  groups: {
    top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#6366f1', fill: '#020617', strokeWidth: 2 } } },
    right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#6366f1', fill: '#020617', strokeWidth: 2 } } },
    bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#6366f1', fill: '#020617', strokeWidth: 2 } } },
    left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#6366f1', fill: '#020617', strokeWidth: 2 } } },
  },
  items: [
    { id: 'port_top', group: 'top' },
    { id: 'port_right', group: 'right' },
    { id: 'port_bottom', group: 'bottom' },
    { id: 'port_left', group: 'left' },
  ],
}

/**
 * 注册流程图节点：start / end / process / decision
 */
export function registerFlowNodes() {
  if (flowNodesRegistered) return
  flowNodesRegistered = true

  // 开始节点（圆角矩形，绿色）
  Graph.registerNode('flow-start', {
    inherit: 'rect',
    width: 120,
    height: 50,
    ports: FLOW_NODE_PORTS,
    attrs: {
      body: {
        rx: 25,
        ry: 25,
        fill: 'rgba(34, 197, 94, 0.15)',
        stroke: '#22c55e',
        strokeWidth: 2,
        filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.3))',
      },
      text: {
        text: '开始',
        fill: '#4ade80',
        fontSize: 14,
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

  // 结束节点（圆形，红色）
  Graph.registerNode('flow-end', {
    inherit: 'circle',
    width: 60,
    height: 60,
    ports: FLOW_NODE_PORTS,
    attrs: {
      body: {
        fill: 'rgba(239, 68, 68, 0.15)',
        stroke: '#ef4444',
        strokeWidth: 2,
        filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.3))',
      },
      text: {
        text: '结束',
        fill: '#f87171',
        fontSize: 12,
        fontWeight: 'bold',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    },
    markup: [
      { tagName: 'circle', selector: 'body' },
      { tagName: 'text', selector: 'text' },
    ],
  })

  // 处理节点（矩形，蓝色）
  Graph.registerNode('flow-process', {
    inherit: 'rect',
    width: 140,
    height: 60,
    ports: FLOW_NODE_PORTS,
    attrs: {
      body: {
        rx: 6,
        ry: 6,
        fill: 'rgba(99, 102, 241, 0.15)',
        stroke: '#6366f1',
        strokeWidth: 2,
      },
      text: {
        text: '处理过程',
        fill: '#a5b4fc',
        fontSize: 13,
        fontWeight: '500',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    },
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'text', selector: 'text' },
    ],
  })

  // 判断节点（菱形，橙色）
  Graph.registerNode('flow-decision', {
    inherit: 'polygon',
    width: 100,
    height: 70,
    ports: FLOW_NODE_PORTS,
    attrs: {
      body: {
        refPoints: '50,0 100,35 50,70 0,35',
        fill: 'rgba(249, 115, 22, 0.15)',
        stroke: '#f97316',
        strokeWidth: 2,
        filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.25))',
      },
      text: {
        text: '判断',
        fill: '#fb923c',
        fontSize: 13,
        fontWeight: '500',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    },
    markup: [
      { tagName: 'polygon', selector: 'body' },
      { tagName: 'text', selector: 'text' },
    ],
  })

  // 注册 Vue 渲染版本的流程节点（可选，用于复杂内容）
  register({
    shape: 'flow-node-vue',
    width: 140,
    height: 60,
    component: FlowNode,
    ports: FLOW_NODE_PORTS,
  })
}
