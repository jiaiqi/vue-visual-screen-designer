import { Graph } from '@antv/x6'
import type { EdgeAnimation } from '@/types/schema'

/**
 * 边动画配置
 */
export interface EdgeAnimationConfig {
  type: EdgeAnimation['type']
  speed?: number
  color?: string
  reverse?: boolean
}

/**
 * 动画 CSS 关键帧
 */
const animationKeyframes = `
@keyframes dash-flow {
  to {
    stroke-dashoffset: -20;
  }
}

@keyframes dash-flow-reverse {
  to {
    stroke-dashoffset: 20;
  }
}

@keyframes electric-pulse {
  0%, 100% {
    stroke-opacity: 1;
    filter: drop-shadow(0 0 2px currentColor);
  }
  50% {
    stroke-opacity: 0.6;
    filter: drop-shadow(0 0 8px currentColor);
  }
}

@keyframes signal-blink {
  0%, 100% {
    stroke-opacity: 1;
  }
  50% {
    stroke-opacity: 0.3;
  }
}

@keyframes particle-move {
  0% {
    offset-distance: 0%;
  }
  100% {
    offset-distance: 100%;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 0 2px currentColor);
  }
  50% {
    filter: drop-shadow(0 0 10px currentColor);
  }
}

@keyframes packet-move {
  0% {
    offset-distance: 0%;
  }
  100% {
    offset-distance: 100%;
  }
}

@keyframes reverse-flow {
  to {
    stroke-dashoffset: 15;
  }
}
`

/**
 * 注入动画样式
 */
export function injectEdgeAnimations() {
  const styleId = 'x6-edge-animations'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = animationKeyframes
  document.head.appendChild(style)
}

/**
 * 获取动画样式
 */
function getAnimationStyle(config: EdgeAnimationConfig): Record<string, string> {
  const { type, speed = 1, reverse = false } = config
  const duration = `${1 / speed}s`

  switch (type) {
    case 'waterFlow':
      return {
        animation: `dash-flow${reverse ? '-reverse' : ''} ${duration} linear infinite`,
      }
    case 'electric':
      return {
        animation: `electric-pulse ${duration} ease-in-out infinite`,
      }
    case 'signal':
      return {
        animation: `signal-blink ${duration} ease-in-out infinite`,
      }
    case 'pulse':
      return {
        animation: `pulse-glow ${duration} ease-in-out infinite`,
      }
    case 'dashed':
      return {
        animation: `dash-flow${reverse ? '-reverse' : ''} ${duration} linear infinite`,
      }
    default:
      return {}
  }
}

/**
 * 注册所有边类型
 */
export function registerAllEdges() {
  injectEdgeAnimations()

  // 1. 水流动画线
  Graph.registerEdge('water-flow', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#22c55e',
        strokeWidth: 4,
        strokeDasharray: '10, 5',
        targetMarker: {
          name: 'classic',
          size: 8,
        },
        style: {
          animation: 'dash-flow 1s linear infinite',
        },
      },
    },
  })

  // 2. 电流动画线
  Graph.registerEdge('electric-flow', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#f59e0b',
        strokeWidth: 3,
        strokeDasharray: '15, 10',
        targetMarker: {
          name: 'classic',
          size: 8,
        },
        style: {
          animation: 'electric-pulse 0.5s ease-in-out infinite',
        },
      },
    },
  })

  // 3. 信号传输线
  Graph.registerEdge('signal-flow', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#3b82f6',
        strokeWidth: 2,
        targetMarker: {
          name: 'classic',
          size: 6,
        },
        style: {
          animation: 'signal-blink 1s ease-in-out infinite',
        },
      },
    },
  })

  // 4. 脉冲效果线
  Graph.registerEdge('pulse-flow', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#8b5cf6',
        strokeWidth: 2,
        targetMarker: {
          name: 'classic',
          size: 8,
        },
        style: {
          animation: 'pulse-glow 2s ease-in-out infinite',
        },
      },
    },
  })

  // 5. 虚线流动
  Graph.registerEdge('dashed-flow', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#64748b',
        strokeWidth: 2,
        strokeDasharray: '8, 4',
        targetMarker: {
          name: 'classic',
          size: 6,
        },
        style: {
          animation: 'dash-flow 1s linear infinite',
        },
      },
    },
  })

  // 6. 双向流动线
  Graph.registerEdge('bidirectional-flow', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#10b981',
        strokeWidth: 2,
        targetMarker: {
          name: 'classic',
          size: 6,
        },
      },
      line2: {
        stroke: '#ef4444',
        strokeWidth: 2,
        strokeDasharray: '5, 5',
        targetMarker: {
          name: 'classic',
          size: 6,
        },
        style: {
          animation: 'reverse-flow 1.5s linear infinite',
        },
      },
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
        selector: 'line2',
        attrs: {
          fill: 'none',
        },
      },
    ],
  })

  // 7. 粒子流动线
  Graph.registerEdge('particle-flow', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#475569',
        strokeWidth: 2,
        targetMarker: null,
      },
      particle: {
        r: 4,
        fill: '#ef4444',
        style: {
          animation: 'particle-move 2s linear infinite',
        },
      },
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
        tagName: 'circle',
        selector: 'particle',
      },
    ],
  })

  // 8. 数据包传输线
  Graph.registerEdge('packet-flow', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#475569',
        strokeWidth: 2,
        targetMarker: null,
      },
      packet: {
        width: 12,
        height: 8,
        fill: '#06b6d4',
        rx: 2,
        style: {
          animation: 'packet-move 1s linear infinite',
        },
      },
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
        tagName: 'rect',
        selector: 'packet',
      },
    ],
  })

  // 9. 智能管道（带流动动画）
  Graph.registerEdge('smart-pipe', {
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
        },
      },
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

  // 10. 贝塞尔曲线
  Graph.registerEdge('bezier-curve', {
    inherit: 'edge',
    connector: {
      name: 'smooth',
    },
    attrs: {
      line: {
        stroke: '#64748b',
        strokeWidth: 2,
        targetMarker: {
          name: 'classic',
          size: 8,
        },
      },
    },
  })

  // 11. 正交路由
  Graph.registerEdge('orthogonal-line', {
    inherit: 'edge',
    router: {
      name: 'orth',
      args: {
        padding: 10,
      },
    },
    attrs: {
      line: {
        stroke: '#64748b',
        strokeWidth: 2,
        targetMarker: {
          name: 'classic',
          size: 8,
        },
      },
    },
  })

  // 12. 曼哈顿路由
  Graph.registerEdge('manhattan-line', {
    inherit: 'edge',
    router: {
      name: 'manhattan',
      args: {
        step: 10,
        padding: 10,
      },
    },
    attrs: {
      line: {
        stroke: '#64748b',
        strokeWidth: 2,
        targetMarker: {
          name: 'classic',
          size: 8,
        },
      },
    },
  })

  // 13. 地铁线路
  Graph.registerEdge('metro-line', {
    inherit: 'edge',
    router: {
      name: 'metro',
      args: {
        step: 10,
        padding: 10,
      },
    },
    attrs: {
      line: {
        stroke: '#64748b',
        strokeWidth: 2,
        targetMarker: {
          name: 'classic',
          size: 8,
        },
      },
    },
  })

  // 14. 圆角连接线
  Graph.registerEdge('rounded-line', {
    inherit: 'edge',
    connector: {
      name: 'rounded',
      args: {
        radius: 10,
      },
    },
    attrs: {
      line: {
        stroke: '#64748b',
        strokeWidth: 2,
        targetMarker: {
          name: 'classic',
          size: 8,
        },
      },
    },
  })

  // 15. 跳线连接
  Graph.registerEdge('jumpover-line', {
    inherit: 'edge',
    connector: {
      name: 'jumpover',
      args: {
        radius: 5,
      },
    },
    attrs: {
      line: {
        stroke: '#64748b',
        strokeWidth: 2,
        targetMarker: {
          name: 'classic',
          size: 8,
        },
      },
    },
  })
}

/**
 * 应用动画配置到边
 */
export function applyEdgeAnimation(
  edge: import('@antv/x6').Edge,
  config: EdgeAnimationConfig
) {
  const { type, speed = 1, color, reverse = false } = config

  if (type === 'none') {
    edge.attr('line/style/animation', 'none')
    return
  }

  const duration = `${1 / speed}s`
  let animation = ''

  switch (type) {
    case 'waterFlow':
      animation = `dash-flow${reverse ? '-reverse' : ''} ${duration} linear infinite`
      edge.attr('line/stroke', color || '#22c55e')
      edge.attr('line/strokeDasharray', '10, 5')
      break
    case 'electric':
      animation = `electric-pulse ${duration} ease-in-out infinite`
      edge.attr('line/stroke', color || '#f59e0b')
      edge.attr('line/strokeDasharray', '15, 10')
      break
    case 'signal':
      animation = `signal-blink ${duration} ease-in-out infinite`
      edge.attr('line/stroke', color || '#3b82f6')
      break
    case 'pulse':
      animation = `pulse-glow ${duration} ease-in-out infinite`
      edge.attr('line/stroke', color || '#8b5cf6')
      break
    case 'dashed':
      animation = `dash-flow${reverse ? '-reverse' : ''} ${duration} linear infinite`
      edge.attr('line/stroke', color || '#64748b')
      edge.attr('line/strokeDasharray', '8, 4')
      break
    case 'bidirectional':
      // 双向流动需要特殊处理
      edge.attr('line/stroke', color || '#10b981')
      break
    case 'particle':
      animation = `particle-move ${duration} linear infinite`
      break
    case 'dataPacket':
      animation = `packet-move ${duration} linear infinite`
      break
  }

  if (animation) {
    edge.attr('line/style/animation', animation)
  }
}

/**
 * 获取所有边类型列表
 */
export function getEdgeTypes() {
  return [
    { type: 'water-flow', name: '水流动画', category: 'animation' },
    { type: 'electric-flow', name: '电流动画', category: 'animation' },
    { type: 'signal-flow', name: '信号传输', category: 'animation' },
    { type: 'pulse-flow', name: '脉冲效果', category: 'animation' },
    { type: 'dashed-flow', name: '虚线流动', category: 'animation' },
    { type: 'bidirectional-flow', name: '双向流动', category: 'animation' },
    { type: 'particle-flow', name: '粒子流动', category: 'animation' },
    { type: 'packet-flow', name: '数据包传输', category: 'animation' },
    { type: 'smart-pipe', name: '智能管道', category: 'special' },
    { type: 'bezier-curve', name: '贝塞尔曲线', category: 'connector' },
    { type: 'orthogonal-line', name: '正交路由', category: 'router' },
    { type: 'manhattan-line', name: '曼哈顿路由', category: 'router' },
    { type: 'metro-line', name: '地铁线路', category: 'router' },
    { type: 'rounded-line', name: '圆角连接', category: 'connector' },
    { type: 'jumpover-line', name: '跳线连接', category: 'connector' },
  ]
}

/**
 * 获取边动画类型列表
 */
export function getEdgeAnimationTypes() {
  return [
    { value: 'none', label: '无动画' },
    { value: 'waterFlow', label: '水流' },
    { value: 'electric', label: '电流' },
    { value: 'signal', label: '信号' },
    { value: 'pulse', label: '脉冲' },
    { value: 'dashed', label: '虚线流动' },
    { value: 'bidirectional', label: '双向' },
    { value: 'particle', label: '粒子' },
    { value: 'dataPacket', label: '数据包' },
  ]
}

export default {
  registerAllEdges,
  injectEdgeAnimations,
  applyEdgeAnimation,
  getEdgeTypes,
  getEdgeAnimationTypes,
}
