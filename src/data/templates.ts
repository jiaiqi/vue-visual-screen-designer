export interface Template {
  id: string
  name: string
  category: string
  description: string
  thumbnail: string
  data: { cells: any[] }
}

export const templateCategories = [
  { key: 'all', label: '全部模板' },
  { key: 'flow', label: '流程图' },
  { key: 'network', label: '网络拓扑' },
  { key: 'industrial', label: '工业流程' },
  { key: 'dashboard', label: '数据看板' },
]

const createRectCell = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  stroke: string,
  fill: string = '#1e293b'
) => ({
  id,
  shape: 'rect',
  x,
  y,
  width,
  height,
  attrs: {
    body: {
      fill,
      stroke,
      strokeWidth: 2,
      rx: 8,
      ry: 8,
    },
    text: {
      text: label,
      fill: '#e2e8f0',
      fontSize: 13,
      fontWeight: 'bold',
    },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    },
    items: [
      { id: `${id}_top`, group: 'top' },
      { id: `${id}_right`, group: 'right' },
      { id: `${id}_bottom`, group: 'bottom' },
      { id: `${id}_left`, group: 'left' },
    ],
  },
})

const createEdge = (id: string, source: string, target: string, sourcePort: string = 'bottom', targetPort: string = 'top') => ({
  id,
  shape: 'edge',
  source: { cell: source, port: `${source}_${sourcePort}` },
  target: { cell: target, port: `${target}_${targetPort}` },
  router: { name: 'orth', args: { padding: 15 } },
  connector: { name: 'rounded', args: { radius: 8 } },
  attrs: {
    line: {
      stroke: '#64748b',
      strokeWidth: 2,
      targetMarker: { name: 'classic', size: 8 },
    },
  },
})

const createIconNode = (id: string, x: number, y: number, iconName: string, label: string, color: string) => ({
  id,
  shape: 'icon-node',
  x,
  y,
  width: 48,
  height: 48,
  data: {
    iconName,
    color,
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    },
    items: [
      { id: `${id}_top`, group: 'top' },
      { id: `${id}_right`, group: 'right' },
      { id: `${id}_bottom`, group: 'bottom' },
      { id: `${id}_left`, group: 'left' },
    ],
  },
})

export const templates: Template[] = [
  {
    id: 'basic-flow',
    name: '基础流程图',
    category: 'flow',
    description: '包含开始、处理、判断、结束的标准流程图模板，适用于业务流程梳理',
    thumbnail: 'flow',
    data: {
      cells: [
        createRectCell('start', 400, 50, 120, 50, '开始', '#10b981', '#064e3b'),
        createRectCell('process1', 400, 150, 120, 60, '数据处理', '#3b82f6'),
        createRectCell('decision', 400, 260, 120, 60, '条件判断', '#f59e0b', '#78350f'),
        createRectCell('process2', 250, 380, 120, 60, '分支A', '#8b5cf6'),
        createRectCell('process3', 550, 380, 120, 60, '分支B', '#ec4899'),
        createRectCell('end', 400, 500, 120, 50, '结束', '#ef4444', '#7f1d1d'),
        createEdge('e1', 'start', 'process1'),
        createEdge('e2', 'process1', 'decision'),
        {
          id: 'e3',
          shape: 'edge',
          source: { cell: 'decision', port: 'decision_left' },
          target: { cell: 'process2', port: 'process2_top' },
          router: { name: 'orth', args: { padding: 15 } },
          connector: { name: 'rounded', args: { radius: 8 } },
          attrs: {
            line: {
              stroke: '#8b5cf6',
              strokeWidth: 2,
              targetMarker: { name: 'classic', size: 8 },
            },
          },
          labels: [{ attrs: { text: { text: '是', fill: '#a78bfa' } }, position: 0.3 }],
        },
        {
          id: 'e4',
          shape: 'edge',
          source: { cell: 'decision', port: 'decision_right' },
          target: { cell: 'process3', port: 'process3_top' },
          router: { name: 'orth', args: { padding: 15 } },
          connector: { name: 'rounded', args: { radius: 8 } },
          attrs: {
            line: {
              stroke: '#ec4899',
              strokeWidth: 2,
              targetMarker: { name: 'classic', size: 8 },
            },
          },
          labels: [{ attrs: { text: { text: '否', fill: '#f472b6' } }, position: 0.3 }],
        },
        createEdge('e5', 'process2', 'end', 'bottom', 'left'),
        createEdge('e6', 'process3', 'end', 'bottom', 'right'),
      ],
    },
  },
  {
    id: 'network-topology',
    name: '网络拓扑图',
    category: 'network',
    description: '展示服务器、数据库、客户端之间连接关系的网络架构模板',
    thumbnail: 'network',
    data: {
      cells: [
        createIconNode('cloud', 380, 40, 'Cloud', '云服务', '#0ea5e9'),
        createIconNode('server1', 200, 180, 'Server', '应用服务器', '#10b981'),
        createIconNode('server2', 380, 180, 'Server', '备份服务器', '#10b981'),
        createIconNode('server3', 560, 180, 'Server', '缓存服务器', '#10b981'),
        createIconNode('db', 380, 320, 'Database', '主数据库', '#3b82f6'),
        createIconNode('monitor', 200, 420, 'Monitor', '监控中心', '#8b5cf6'),
        createIconNode('terminal', 560, 420, 'Terminal', '终端设备', '#f59e0b'),
        {
          id: 'ne1',
          shape: 'edge',
          source: { cell: 'cloud' },
          target: { cell: 'server1' },
          attrs: { line: { stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '5 5' } },
        },
        {
          id: 'ne2',
          shape: 'edge',
          source: { cell: 'cloud' },
          target: { cell: 'server2' },
          attrs: { line: { stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '5 5' } },
        },
        {
          id: 'ne3',
          shape: 'edge',
          source: { cell: 'cloud' },
          target: { cell: 'server3' },
          attrs: { line: { stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '5 5' } },
        },
        {
          id: 'ne4',
          shape: 'edge',
          source: { cell: 'server1' },
          target: { cell: 'db' },
          attrs: { line: { stroke: '#3b82f6', strokeWidth: 2 } },
        },
        {
          id: 'ne5',
          shape: 'edge',
          source: { cell: 'server2' },
          target: { cell: 'db' },
          attrs: { line: { stroke: '#3b82f6', strokeWidth: 2 } },
        },
        {
          id: 'ne6',
          shape: 'edge',
          source: { cell: 'server3' },
          target: { cell: 'db' },
          attrs: { line: { stroke: '#3b82f6', strokeWidth: 2 } },
        },
        {
          id: 'ne7',
          shape: 'edge',
          source: { cell: 'server1' },
          target: { cell: 'monitor' },
          attrs: { line: { stroke: '#8b5cf6', strokeWidth: 2 } },
        },
        {
          id: 'ne8',
          shape: 'edge',
          source: { cell: 'server3' },
          target: { cell: 'terminal' },
          attrs: { line: { stroke: '#f59e0b', strokeWidth: 2 } },
        },
      ],
    },
  },
  {
    id: 'industrial-process',
    name: '工业流程图',
    category: 'industrial',
    description: '展示工业生产线物料流转的标准流程模板',
    thumbnail: 'industrial',
    data: {
      cells: [
        createRectCell('input', 100, 200, 100, 80, '原料输入', '#22c55e', '#14532d'),
        createRectCell('process1', 280, 200, 100, 80, '加热处理', '#f97316', '#7c2d12'),
        createRectCell('process2', 460, 200, 100, 80, '混合搅拌', '#3b82f6'),
        createRectCell('process3', 640, 200, 100, 80, '冷却定型', '#06b6d4', '#164e63'),
        createRectCell('output', 820, 200, 100, 80, '成品输出', '#a855f7', '#581c87'),
        {
          id: 'arrow1',
          shape: 'path',
          x: 200,
          y: 230,
          width: 80,
          height: 20,
          path: 'M 0,10 L 60,10 L 60,0 L 80,10 L 60,20 L 60,10 Z',
          attrs: {
            body: {
              fill: '#22c55e',
              stroke: '#000',
              strokeWidth: 1,
            },
          },
        },
        {
          id: 'arrow2',
          shape: 'path',
          x: 380,
          y: 230,
          width: 80,
          height: 20,
          path: 'M 0,10 L 60,10 L 60,0 L 80,10 L 60,20 L 60,10 Z',
          attrs: {
            body: {
              fill: '#f97316',
              stroke: '#000',
              strokeWidth: 1,
            },
          },
        },
        {
          id: 'arrow3',
          shape: 'path',
          x: 560,
          y: 230,
          width: 80,
          height: 20,
          path: 'M 0,10 L 60,10 L 60,0 L 80,10 L 60,20 L 60,10 Z',
          attrs: {
            body: {
              fill: '#3b82f6',
              stroke: '#000',
              strokeWidth: 1,
            },
          },
        },
        {
          id: 'arrow4',
          shape: 'path',
          x: 740,
          y: 230,
          width: 80,
          height: 20,
          path: 'M 0,10 L 60,10 L 60,0 L 80,10 L 60,20 L 60,10 Z',
          attrs: {
            body: {
              fill: '#06b6d4',
              stroke: '#000',
              strokeWidth: 1,
            },
          },
        },
      ],
    },
  },
  {
    id: 'dashboard-template',
    name: '数据看板',
    category: 'dashboard',
    description: '包含数字看板、进度条等组件的数据可视化模板',
    thumbnail: 'dashboard',
    data: {
      cells: [
        {
          id: 'digital1',
          shape: 'digital-node',
          x: 100,
          y: 100,
          width: 160,
          height: 48,
          data: {
            numberValue: 12847,
            numberFormat: 'none',
            decimalPlaces: 0,
            useGrouping: true,
            animateRoll: true,
            textColor: '#10b981',
            fontSize: 32,
            fontWeight: 'bold',
          },
          attrs: {
            body: { fill: 'transparent', stroke: 'transparent' },
          },
        },
        {
          id: 'digital2',
          shape: 'digital-node',
          x: 300,
          y: 100,
          width: 160,
          height: 48,
          data: {
            numberValue: 98.6,
            numberFormat: 'percent',
            decimalPlaces: 1,
            useGrouping: false,
            animateRoll: true,
            textColor: '#3b82f6',
            fontSize: 32,
            fontWeight: 'bold',
          },
          attrs: {
            body: { fill: 'transparent', stroke: 'transparent' },
          },
        },
        {
          id: 'digital3',
          shape: 'digital-node',
          x: 500,
          y: 100,
          width: 160,
          height: 48,
          data: {
            numberValue: 3542.5,
            numberFormat: 'currency',
            decimalPlaces: 2,
            useGrouping: true,
            animateRoll: true,
            textColor: '#f59e0b',
            fontSize: 32,
            fontWeight: 'bold',
          },
          attrs: {
            body: { fill: 'transparent', stroke: 'transparent' },
          },
        },
        {
          id: 'progress1',
          shape: 'progress-node',
          x: 100,
          y: 200,
          width: 200,
          height: 24,
          data: {
            progressValue: 75,
            progressColor: '#10b981',
            progressBgColor: '#1e293b',
            showProgressText: true,
          },
          attrs: {
            body: {
              fill: '#1e293b',
              stroke: '#10b981',
              strokeWidth: 1,
            },
          },
        },
        {
          id: 'progress2',
          shape: 'progress-node',
          x: 100,
          y: 260,
          width: 200,
          height: 24,
          data: {
            progressValue: 45,
            progressColor: '#f59e0b',
            progressBgColor: '#1e293b',
            showProgressText: true,
          },
          attrs: {
            body: {
              fill: '#1e293b',
              stroke: '#f59e0b',
              strokeWidth: 1,
            },
          },
        },
        {
          id: 'progress3',
          shape: 'progress-node',
          x: 100,
          y: 320,
          width: 200,
          height: 24,
          data: {
            progressValue: 92,
            progressColor: '#3b82f6',
            progressBgColor: '#1e293b',
            showProgressText: true,
          },
          attrs: {
            body: {
              fill: '#1e293b',
              stroke: '#3b82f6',
              strokeWidth: 1,
            },
          },
        },
        createRectCell('label1', 100, 60, 160, 30, '用户总数', '#10b981', 'transparent'),
        createRectCell('label2', 300, 60, 160, 30, '系统负载', '#3b82f6', 'transparent'),
        createRectCell('label3', 500, 60, 160, 30, '今日收入', '#f59e0b', 'transparent'),
      ],
    },
  },
  {
    id: 'microservice-arch',
    name: '微服务架构',
    category: 'network',
    description: '展示微服务架构中各服务组件的交互关系',
    thumbnail: 'microservice',
    data: {
      cells: [
        createIconNode('gateway', 380, 40, 'Shield', 'API网关', '#eab308'),
        createIconNode('svc1', 150, 180, 'Server', '用户服务', '#10b981'),
        createIconNode('svc2', 300, 180, 'Server', '订单服务', '#3b82f6'),
        createIconNode('svc3', 450, 180, 'Server', '支付服务', '#f59e0b'),
        createIconNode('svc4', 600, 180, 'Server', '通知服务', '#8b5cf6'),
        createIconNode('mq', 380, 320, 'Activity', '消息队列', '#ef4444'),
        createIconNode('cache', 150, 320, 'HardDrive', 'Redis缓存', '#06b6d4'),
        createIconNode('db', 600, 320, 'Database', 'MySQL', '#3b82f6'),
        {
          id: 'ms1',
          shape: 'edge',
          source: { cell: 'gateway' },
          target: { cell: 'svc1' },
          attrs: { line: { stroke: '#10b981', strokeWidth: 2 } },
        },
        {
          id: 'ms2',
          shape: 'edge',
          source: { cell: 'gateway' },
          target: { cell: 'svc2' },
          attrs: { line: { stroke: '#3b82f6', strokeWidth: 2 } },
        },
        {
          id: 'ms3',
          shape: 'edge',
          source: { cell: 'gateway' },
          target: { cell: 'svc3' },
          attrs: { line: { stroke: '#f59e0b', strokeWidth: 2 } },
        },
        {
          id: 'ms4',
          shape: 'edge',
          source: { cell: 'gateway' },
          target: { cell: 'svc4' },
          attrs: { line: { stroke: '#8b5cf6', strokeWidth: 2 } },
        },
        {
          id: 'ms5',
          shape: 'edge',
          source: { cell: 'svc1' },
          target: { cell: 'cache' },
          attrs: { line: { stroke: '#06b6d4', strokeWidth: 2, strokeDasharray: '4 4' } },
        },
        {
          id: 'ms6',
          shape: 'edge',
          source: { cell: 'svc2' },
          target: { cell: 'mq' },
          attrs: { line: { stroke: '#ef4444', strokeWidth: 2 } },
        },
        {
          id: 'ms7',
          shape: 'edge',
          source: { cell: 'svc3' },
          target: { cell: 'mq' },
          attrs: { line: { stroke: '#ef4444', strokeWidth: 2 } },
        },
        {
          id: 'ms8',
          shape: 'edge',
          source: { cell: 'svc4' },
          target: { cell: 'db' },
          attrs: { line: { stroke: '#3b82f6', strokeWidth: 2 } },
        },
        {
          id: 'ms9',
          shape: 'edge',
          source: { cell: 'mq' },
          target: { cell: 'svc4' },
          router: { name: 'manhattan' },
          attrs: { line: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '4 4' } },
        },
      ],
    },
  },
]

export function getTemplatesByCategory(category: string): Template[] {
  if (category === 'all') return templates
  return templates.filter(t => t.category === category)
}
