import { ref, onUnmounted } from 'vue'
import {
  Graph,
  Cell,
  Node,
  Edge,
  History,
  Selection,
  Snapline,
  Transform,
  Keyboard,
  Clipboard,
  Export
} from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import {
  registerDashboardNodes,
  registerDecorationNodes,
  registerVueNodes,
  registerEdges,
  registerFlowNodes
} from '@/plugins/x6-nodes'

void register

// 使用全局标志，防止 v1/v2 路由切换时跨模块重复注册

function ensureRegistered() {
  try {
    registerDashboardNodes()
    registerDecorationNodes()
    registerVueNodes()
    registerEdges()
    registerFlowNodes()
  } catch (e) {
    // 忽略 "already registered" 类型的重复注册错误
    if (!(String(e).includes('already registered'))) {
      console.error('[useGraphV2] 节点/边注册失败:', e)
    }
  }
}

/**
 * v2 Graph 实例管理 Composable
 * 专为固定尺寸画布（1920×1080）设计，不使用 Scroller
 */
export function useGraphV2() {
  const containerRef = ref<HTMLElement | undefined>()
  const editorStore = useEditorStoreV2()
  const canvasStore = useCanvasStoreV2()
  let graph: Graph | null = null

  /**
   * 初始化 X6 Graph
   */
  const initGraph = (el: HTMLElement) => {
    if (graph) return

    ensureRegistered()

    const { width: canvasW, height: canvasH, backgroundColor, showGrid, gridSize, gridColor, snapToGrid } =
      canvasStore.config

    graph = new Graph({
      container: el,
      width: canvasW,
      height: canvasH,
      // v2 固定尺寸模式：不自动 resize
      autoResize: false,
      background: {
        color: backgroundColor,
      },
      grid: {
        size: gridSize,
        visible: showGrid,
        type: 'dot',
        args: {
          color: gridColor,
          thickness: 1,
        },
      },
      // 平移：禁用内部平移，由外部 CSS/Scroll 处理
      panning: {
        enabled: false,
      },
      // 缩放：禁用内部缩放，由外部 CSS 处理
      mousewheel: {
        enabled: false,
      },
      connecting: {
        snap: { radius: 20 },
        allowBlank: false,
        allowLoop: false,
        highlight: true,
        router: {
          name: 'orth',
          args: { padding: 15 },
        },
        connector: {
          name: 'rounded',
          args: { radius: 8 },
        },
        createEdge() {
          return (this as Graph).createEdge({
            shape: 'fluid-pipe',
            zIndex: -1,
          })
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet
        },
      },
    })

    // 挂载插件
    graph
      .use(new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        strict: false,
        showNodeSelectionBox: true,
        showEdgeSelectionBox: true,
        modifiers: ['shift', 'ctrl', 'meta'],
      }))
      .use(new Keyboard())
      .use(new History({ enabled: true }))
      .use(new Snapline({
        enabled: snapToGrid,
        sharp: true,
        tolerance: 10,
        className: 'my-snapline',
      }))
      .use(new Transform({
        resizing: { enabled: true },
        rotating: { enabled: true },
      }))
      .use(new Clipboard({ enabled: true }))
      .use(new Export())

    // 注入 store
    editorStore.initGraph(graph)

    // --- 绑定快捷键 ---
    graph.bindKey(['meta+c', 'ctrl+c'], () => {
      editorStore.copy()
      return false
    })
    graph.bindKey(['meta+v', 'ctrl+v'], () => {
      editorStore.paste({ dx: 32, dy: 32 })
      return false
    })
    graph.bindKey(['meta+z', 'ctrl+z'], () => {
      editorStore.undo()
      return false
    })
    graph.bindKey(['meta+shift+z', 'ctrl+shift+z', 'meta+y', 'ctrl+y'], () => {
      editorStore.redo()
      return false
    })
    graph.bindKey(['backspace', 'delete'], () => {
      editorStore.deleteSelected()
      return false
    })
    graph.bindKey(['meta+a', 'ctrl+a'], () => {
      editorStore.selectAll()
      return false
    })

    // --- 同步选中状态到 Store ---
    graph.on('selection:changed', ({ added, removed }) => {
      const addedIds = added.map((c: Cell) => c.id)
      const removedIds = removed.map((c: Cell) => c.id)
      if (addedIds.length > 0) editorStore.addToSelection(addedIds)
      if (removedIds.length > 0) editorStore.deselect(removedIds)
    })

    // --- 节点动画引擎 ---
    const applyNodeAnimation = (node: Node) => {
      const data = node.getData() || {}
      const animType = data.animationType || 'none'
      const targetSelector = node.shape === 'image' ? 'image' : 'body'

      if (animType !== 'none') {
        const duration = parseFloat(data.animationDuration) || 1
        const isReverse = !!data.animationReverse
        const easing = animType === 'spin' ? 'linear' : 'ease-in-out'
        const direction = isReverse ? 'reverse' : 'normal'
        node.attr(`${targetSelector}/class`, 'node-anim-trigger')
        node.attr(`${targetSelector}/style/animation`, `anim-${animType} ${duration}s ${easing} infinite ${direction}`)
      } else {
        node.attr(`${targetSelector}/class`, '')
        node.attr(`${targetSelector}/style/animation`, 'none')
      }
    }

    // --- 多状态图片 ---
    const applyNodeStatus = (node: Node) => {
      if (node.shape !== 'image') return
      const data = node.getData() || {}
      if (!data.states || !Array.isArray(data.states)) return
      const currentStatus = data.currentStatus
      if (currentStatus === '' || currentStatus === undefined) return
      const stateItem = data.states.find(
        (st: { value: string | number; url: string }) => String(st.value) === String(currentStatus)
      )
      if (stateItem?.url) {
        node.attr('image/xlink:href', stateItem.url)
      }
    }

    // 节点变更时应用动画与状态
    graph.on('node:change:data', ({ cell }: { cell: Cell }) => {
      if (cell.isNode()) {
        applyNodeAnimation(cell as Node)
        applyNodeStatus(cell as Node)
      }
    })

    graph.on('node:added', ({ node }: { node: Node }) => {
      applyNodeAnimation(node)
      applyNodeStatus(node)
    })

    // --- 保存节点比例数据 ---
    const updateNodeRatios = (node: Node) => {
      const { width: cW, height: cH } = canvasStore.config
      const pos = node.getPosition()
      const size = node.getSize()
      node.setData({
        xRatio: pos.x / cW,
        yRatio: pos.y / cH,
        wRatio: size.width / cW,
        hRatio: size.height / cH,
      }, { overwrite: false })
    }

    graph.on('node:moved', ({ node }: { node: Node }) => updateNodeRatios(node))
    graph.on('node:resized', ({ node }: { node: Node }) => updateNodeRatios(node))
    graph.on('node:added', ({ node }: { node: Node }) => updateNodeRatios(node))

    // --- 连线拐点手柄 ---
    graph.on('edge:mouseenter', ({ edge }: { edge: Edge }) => {
      edge.addTools([
        {
          name: 'vertices',
          args: {
            stopPropagation: false,
            attrs: { fill: '#ffffff', stroke: '#38bdf8', strokeWidth: 2, r: 5 },
          },
        },
        {
          name: 'segments',
          args: { stopPropagation: false, attrs: { fill: '#38bdf8', r: 3 } },
        },
      ])
    })

    graph.on('edge:mouseleave', ({ edge }: { edge: Edge }) => {
      if (!graph?.isSelected(edge)) {
        edge.removeTools()
      }
    })

    graph.on('edge:unselected', ({ edge }: { edge: Edge }) => {
      edge.removeTools()
    })
  }

  /**
   * 销毁 Graph
   */
  onUnmounted(() => {
    if (graph) {
      graph.dispose()
      editorStore.initGraph(null)
      graph = null
    }
  })

  /**
   * 应用画布配置到 Graph
   */
  const applyCanvasConfig = () => {
    if (!graph) return
    const { width, height, backgroundColor, showGrid, gridSize, gridColor } = canvasStore.config
    graph.resize(width, height)
    graph.drawBackground({ color: backgroundColor })
    if (showGrid) {
      graph.showGrid()
      graph.setGridSize(gridSize)
      graph.drawGrid({ type: 'dot', args: { color: gridColor, thickness: 1 } })
    } else {
      graph.hideGrid()
    }
  }

  /**
   * 获取 Graph 实例
   */
  const getGraph = () => graph

  return {
    containerRef,
    initGraph,
    getGraph,
    applyCanvasConfig,
  }
}
