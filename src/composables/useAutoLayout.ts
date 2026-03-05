import { Graph, Node } from '@antv/x6'

export type LayoutType = 'dagre' | 'force' | 'grid' | 'circular' | 'concentric'

export interface LayoutOptions {
  type: LayoutType
  direction?: 'TB' | 'BT' | 'LR' | 'RL'
  nodeSep?: number
  rankSep?: number
  cols?: number
  rows?: number
  preventOverlap?: boolean
  animate?: boolean
}

export interface LayoutResult {
  success: boolean
  message?: string
}

const defaultOptions: Record<LayoutType, LayoutOptions> = {
  dagre: {
    type: 'dagre',
    direction: 'TB',
    nodeSep: 50,
    rankSep: 80,
    preventOverlap: true,
    animate: true,
  },
  force: {
    type: 'force',
    preventOverlap: true,
    animate: true,
  },
  grid: {
    type: 'grid',
    cols: 4,
    nodeSep: 40,
    rankSep: 40,
    preventOverlap: true,
    animate: true,
  },
  circular: {
    type: 'circular',
    preventOverlap: true,
    animate: true,
  },
  concentric: {
    type: 'concentric',
    preventOverlap: true,
    animate: true,
  },
}

function animateNodePosition(node: Node, x: number, y: number, animate: boolean) {
  if (animate) {
    node.position(x, y, { silent: false })
    node.attr('body/style/transition', 'all 0.3s ease-in-out')
    setTimeout(() => {
      node.attr('body/style/transition', 'none')
    }, 300)
  } else {
    node.position(x, y)
  }
}

export function useAutoLayout() {
  const applyLayout = (graph: Graph, options: LayoutOptions): LayoutResult => {
    const nodes = graph.getNodes()
    const edges = graph.getEdges()

    if (nodes.length === 0) {
      return { success: false, message: '画布上没有节点可以布局' }
    }

    const mergedOptions = { ...defaultOptions[options.type], ...options }

    try {
      switch (mergedOptions.type) {
        case 'dagre':
          applyDagreLayout(graph, nodes, edges, mergedOptions)
          break
        case 'force':
          applyForceLayout(nodes, mergedOptions)
          break
        case 'grid':
          applyGridLayout(nodes, mergedOptions)
          break
        case 'circular':
          applyCircularLayout(nodes, mergedOptions)
          break
        case 'concentric':
          applyConcentricLayout(nodes, edges, mergedOptions)
          break
        default:
          return { success: false, message: '未知的布局类型' }
      }

      return { success: true }
    } catch (error) {
      console.error('布局执行失败:', error)
      return { success: false, message: `布局执行失败: ${error}` }
    }
  }

  const applyDagreLayout = (
    _graph: Graph,
    nodes: Node[],
    edges: ReturnType<Graph['getEdges']>,
    options: LayoutOptions
  ) => {
    const nodeMap = new Map<string, { node: Node; x: number; y: number }>()
    const adjacencyList = new Map<string, string[]>()

    nodes.forEach((node) => {
      nodeMap.set(node.id, { node, x: 0, y: 0 })
      adjacencyList.set(node.id, [])
    })

    edges.forEach((edge) => {
      const source = edge.getSourceCellId()
      const target = edge.getTargetCellId()
      if (source && target && adjacencyList.has(source)) {
        adjacencyList.get(source)!.push(target)
      }
    })

    const ranks = new Map<string, number>()
    const visited = new Set<string>()

    const calculateRank = (nodeId: string, rank: number) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)

      const currentRank = ranks.get(nodeId)
      if (currentRank === undefined || currentRank < rank) {
        ranks.set(nodeId, rank)
      }

      const children = adjacencyList.get(nodeId) || []
      children.forEach((childId) => calculateRank(childId, rank + 1))
    }

    const nodesWithNoIncoming = nodes.filter((node) => {
      return !edges.some((edge) => edge.getTargetCellId() === node.id)
    })

    if (nodesWithNoIncoming.length === 0) {
      nodesWithNoIncoming.push(nodes[0]!)
    }

    nodesWithNoIncoming.forEach((node) => calculateRank(node.id, 0))

    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        calculateRank(node.id, 0)
      }
    })

    const rankGroups = new Map<number, string[]>()
    ranks.forEach((rank, nodeId) => {
      if (!rankGroups.has(rank)) {
        rankGroups.set(rank, [])
      }
      rankGroups.get(rank)!.push(nodeId)
    })

    const direction = options.direction || 'TB'
    const nodeSep = options.nodeSep || 50
    const rankSep = options.rankSep || 80

    const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => a - b)

    sortedRanks.forEach((rank, rankIndex) => {
      const nodeIds = rankGroups.get(rank) || []
      const totalWidth = nodeIds.reduce((sum, id) => {
        const node = nodeMap.get(id)
        return sum + (node?.node.getSize().width || 100)
      }, 0)
      const totalSep = (nodeIds.length - 1) * nodeSep
      let currentX = -((totalWidth + totalSep) / 2)

      nodeIds.forEach((nodeId) => {
        const nodeData = nodeMap.get(nodeId)
        if (nodeData) {
          const size = nodeData.node.getSize()

          if (direction === 'TB') {
            nodeData.x = currentX + size.width / 2
            nodeData.y = rankIndex * rankSep
          } else if (direction === 'BT') {
            nodeData.x = currentX + size.width / 2
            nodeData.y = -rankIndex * rankSep
          } else if (direction === 'LR') {
            nodeData.x = rankIndex * rankSep
            nodeData.y = currentX + size.width / 2
          } else if (direction === 'RL') {
            nodeData.x = -rankIndex * rankSep
            nodeData.y = currentX + size.width / 2
          }

          currentX += size.width + nodeSep
        }
      })
    })

    const boundingBox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    nodeMap.forEach((data) => {
      const size = data.node.getSize()
      boundingBox.minX = Math.min(boundingBox.minX, data.x - size.width / 2)
      boundingBox.minY = Math.min(boundingBox.minY, data.y - size.height / 2)
      boundingBox.maxX = Math.max(boundingBox.maxX, data.x + size.width / 2)
      boundingBox.maxY = Math.max(boundingBox.maxY, data.y + size.height / 2)
    })

    const offsetX = -boundingBox.minX + 50
    const offsetY = -boundingBox.minY + 50

    nodeMap.forEach((data) => {
      const finalX = data.x + offsetX
      const finalY = data.y + offsetY
      animateNodePosition(data.node, finalX, finalY, !!options.animate)
    })
  }

  const applyForceLayout = (
    nodes: Node[],
    options: LayoutOptions
  ) => {
    const nodeSep = options.nodeSep || 100
    const canvasWidth = 800
    const canvasHeight = 600
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length
      const radius = Math.max(100, nodes.length * nodeSep / (2 * Math.PI))

      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      animateNodePosition(node, x, y, !!options.animate)
    })
  }

  const applyGridLayout = (nodes: Node[], options: LayoutOptions) => {
    const cols = options.cols || Math.ceil(Math.sqrt(nodes.length))
    const rows = Math.ceil(nodes.length / cols)
    const nodeSep = options.nodeSep || 40
    const rankSep = options.rankSep || 40

    const cellWidth = 150
    const cellHeight = 100

    const totalWidth = cols * cellWidth + (cols - 1) * nodeSep
    const totalHeight = rows * cellHeight + (rows - 1) * rankSep

    const canvasWidth = 800
    const canvasHeight = 600
    const startX = (canvasWidth - totalWidth) / 2
    const startY = (canvasHeight - totalHeight) / 2

    nodes.forEach((node, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)

      const x = startX + col * (cellWidth + nodeSep) + cellWidth / 2
      const y = startY + row * (cellHeight + rankSep) + cellHeight / 2

      animateNodePosition(node, x, y, !!options.animate)
    })
  }

  const applyCircularLayout = (nodes: Node[], options: LayoutOptions) => {
    const canvasWidth = 800
    const canvasHeight = 600
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radius = Math.min(canvasWidth, canvasHeight) / 3

    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      animateNodePosition(node, x, y, !!options.animate)
    })
  }

  const applyConcentricLayout = (
    nodes: Node[],
    edges: ReturnType<Graph['getEdges']>,
    options: LayoutOptions
  ) => {
    const nodeDegree = new Map<string, number>()

    nodes.forEach((node) => {
      nodeDegree.set(node.id, 0)
    })

    edges.forEach((edge) => {
      const source = edge.getSourceCellId()
      const target = edge.getTargetCellId()
      if (source && nodeDegree.has(source)) {
        nodeDegree.set(source, nodeDegree.get(source)! + 1)
      }
      if (target && nodeDegree.has(target)) {
        nodeDegree.set(target, nodeDegree.get(target)! + 1)
      }
    })

    const sortedNodes = [...nodes].sort((a, b) => {
      return (nodeDegree.get(b.id) || 0) - (nodeDegree.get(a.id) || 0)
    })

    const canvasWidth = 800
    const canvasHeight = 600
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const baseRadius = Math.min(canvasWidth, canvasHeight) / 6

    let currentRing = 0
    let nodesInCurrentRing = 0
    const nodesPerRing = [1, 6, 12, 18, 24]

    sortedNodes.forEach((node, index) => {
      if (index === 0) {
        animateNodePosition(node, centerX, centerY, !!options.animate)
        return
      }

      const maxNodesInRing = nodesPerRing[currentRing] || 24
      if (nodesInCurrentRing >= maxNodesInRing) {
        currentRing++
        nodesInCurrentRing = 0
      }

      const radius = baseRadius * (currentRing + 1)
      const angle = (2 * Math.PI * nodesInCurrentRing) / maxNodesInRing - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      animateNodePosition(node, x, y, !!options.animate)

      nodesInCurrentRing++
    })
  }

  return {
    applyLayout,
    defaultOptions,
  }
}
