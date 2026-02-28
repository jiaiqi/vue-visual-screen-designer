import { ref, onUnmounted } from 'vue'
import { Graph } from '@antv/x6'
import { Selection } from '@antv/x6-plugin-selection'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { History } from '@antv/x6-plugin-history'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Transform } from '@antv/x6-plugin-transform'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { Export } from '@antv/x6-plugin-export'
import { useEditorStore } from '@/stores/editor'
import { registerVueNodes, registerEdges } from '@/plugins/x6-nodes'

export function useGraph() {
  const containerRef = ref<HTMLElement>()
  const editorStore = useEditorStore()
  let graph: Graph | null = null

  const initGraph = (el: HTMLElement) => {
    if (graph) return

    // 注册所有自定义图元及管线
    registerVueNodes()
    registerEdges()

    // 初始化 X6 引擎
    graph = new Graph({
      container: el,
      autoResize: true,
      background: {
        color: '#0f172a', // 深色网格背景 (Slate 900)
      },
      grid: {
        size: 20,
        visible: true,
        type: 'dot',
        args: {
          color: '#334155', // (Slate 700)
          thickness: 1,
        },
      },
      panning: {
        enabled: true,
        modifiers: ['space', 'alt'], // 按住空格或 Alt 拖拽平移画布
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: ['ctrl', 'meta'],
        minScale: 0.1,
        maxScale: 10,
      },
      connecting: {
        snap: true, // 连线时吸附到桩
        allowBlank: false,
        allowLoop: false,
        highlight: true, // 提示高亮
        router: {
          name: 'manhattan', // 采用工业级正交直角路油
          args: { padding: 15 },
        },
        connector: {
          name: 'rounded',
          args: { radius: 8 },
        },
        createEdge() {
          return this.createEdge({
            shape: 'fluid-pipe', // 重点：所有连线默认采用我们自定义的 3D 流水边
            zIndex: -1, // 线条置底
          })
        },
        validateConnection({ targetMagnet }) {
          // 只允许连接到桩上 (magnet: true) 的端口
          return !!targetMagnet
        },
      }
    })

    // 挂载插件生态
    graph
      .use(new Selection({
        enabled: true,
        multiple: true,
        rubberband: true, // 允许直接拖扯出框选区
        strict: false, // 只要相交/划过即可选中，无需完全包围
        showNodeSelectionBox: true,
        showEdgeSelectionBox: true, // 允许边界点选高亮显示
        modifiers: ['shift', 'ctrl', 'meta'], // 允许使用 Shift/Ctrl/Command 键进行多选追加
      }))
      .use(new Keyboard())
      .use(new History({ enabled: true }))
      .use(new Snapline({ enabled: true, sharp: true }))
      .use(new Transform({
        resizing: { enabled: true },
        rotating: { enabled: true }
      }))
      .use(new Clipboard({ enabled: true }))
      .use(new Export())

    // 将 Graph 实例注入 Store
    editorStore.initGraph(graph)

    setupGlobalEvents()
  }

  const setupGlobalEvents = () => {
    const handleResize = () => {
      if (!graph || !containerRef.value) return
      // autoResize: true 理论上会自动处理
    }
    window.addEventListener('resize', handleResize)

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (graph) {
        graph.dispose()
      }
    })
  }

  return {
    containerRef,
    initGraph,
    getGraph: () => graph
  }
}
