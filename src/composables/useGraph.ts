import { ref, onUnmounted } from 'vue'
import { Graph, Node, Edge, Cell, EdgeView } from '@antv/x6'
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
        rotating: { enabled: true },
      }))
      .use(new Clipboard({ enabled: true }))
      .use(new Export())

    // 将 Graph 实例注入 Store
    editorStore.initGraph(graph)

    // 绑定各类常用的生产力快捷键
    graph.bindKey(['meta+c', 'ctrl+c'], () => {
      const g = editorStore.graph
      if (!g) return false
      const cells = g.getSelectedCells()
      if (cells.length > 0) g.copy(cells)
      return false
    })

    graph.bindKey(['meta+v', 'ctrl+v'], () => {
      const g = editorStore.graph
      if (!g) return false
      if (!g.isClipboardEmpty()) {
        const cells = g.paste({ offset: 32 })
        g.cleanSelection()
        g.select(cells)
      }
      return false
    })

    graph.bindKey(['meta+z', 'ctrl+z'], () => {
      const g = editorStore.graph
      if (g?.canUndo()) g.undo()
      return false
    })

    graph.bindKey(['meta+shift+z', 'ctrl+shift+z', 'meta+y', 'ctrl+y'], () => {
      const g = editorStore.graph
      if (g?.canRedo()) g.redo()
      return false
    })

    graph.bindKey(['backspace', 'delete'], () => {
      const g = editorStore.graph
      if (!g) return false
      const cells = g.getSelectedCells()
      if (cells.length > 0) g.removeCells(cells)
      return false
    })

    graph.bindKey(['meta+a', 'ctrl+a'], () => {
      const g = editorStore.graph
      if (g) g.select(g.getCells())
      return false
    })

    // 双击自定义图片节点时，触发本地文件上传
    graph.on('node:dblclick', ({ node }) => {
      if (node.shape === 'image' && node.data?.isCustomImage) {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/png, image/jpeg, image/svg+xml, image/gif'
        input.onchange = (e: Event) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            if (dataUrl) {
              // 加载进 Image 天然获取原始长宽并等比填满其盒子
              const img = new Image()
              img.onload = () => {
                const aspect = img.width / img.height
                const curSize = node.getSize()
                let newW = curSize.width
                let newH = curSize.width / aspect
                // 如果过高，以高为准压缩
                if (newH > 200) {
                  newH = 200
                  newW = newH * aspect
                }
                node.attr('image/xlink:href', dataUrl)
                node.resize(newW, newH)
                // 清除原有的虚线和提示文字
                node.attr('body/strokeDasharray', null)
                node.attr('label/text', '')
              }
              img.src = dataUrl
            }
          }
          reader.readAsDataURL(file)
        }
        input.click()
      }
    })

    // --- 图元高级动画底层系统 (解析与挂载) ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyNodeAnimation = (node: any) => {
      const data = node.getData() || {}
      const animType = data.animationType || 'none'

      // X6 对不同元件的底层渲染选择器不同：普通图元通常在 body 上，自定义图片图元在 image 属性上
      const targetSelector = node.shape === 'image' ? 'image' : 'body'

      if (animType !== 'none') {
        const duration = parseFloat(data.animationDuration) || 1
        const isReverse = !!data.animationReverse

        // 核心优化：自旋(spin)类动画为了保证视觉无缝循环，必须使用 linear 匀速，
        // 而 breath/float 等往复性动画则适合使用 ease-in-out。
        const easing = animType === 'spin' ? 'linear' : 'ease-in-out'
        const direction = isReverse ? 'reverse' : 'normal'

        // 注意：因为 SVG 的缩放原点问题，需要挂载我们定制的 class
        node.attr(`${targetSelector}/class`, 'node-anim-trigger')
        node.attr(`${targetSelector}/style/animation`, `anim-${animType} ${duration}s ${easing} infinite ${direction}`)
      } else {
        node.attr(`${targetSelector}/class`, '')
        node.attr(`${targetSelector}/style/animation`, 'none')
      }
    }

    // --- 进场与退出动画执行引擎 (Transition) ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playTransition = (node: any, type: string) => {
      const originalSize = node.getSize()
      const originalPos = node.getPosition()
      const targetSelector = node.shape === 'image' ? 'image' : 'body'

      switch (type) {
        case 'fade-in':
          node.attr(`${targetSelector}/opacity`, 0)
          node.transition(`attrs/${targetSelector}/opacity`, 1, { duration: 1000 })
          break
        case 'zoom-in':
          node.resize(1, 1)
          node.attr(`${targetSelector}/opacity`, 0)
          node.transition('size', originalSize, { duration: 800 })
          node.transition(`attrs/${targetSelector}/opacity`, 1, { duration: 800 })
          break
        case 'fly-in-top':
          node.position(originalPos.x, originalPos.y - 120)
          node.attr(`${targetSelector}/opacity`, 0)
          node.transition('position', originalPos, { duration: 850 })
          node.transition(`attrs/${targetSelector}/opacity`, 1, { duration: 850 })
          break
        case 'fly-in-bottom':
          node.position(originalPos.x, originalPos.y + 120)
          node.attr(`${targetSelector}/opacity`, 0)
          node.transition('position', originalPos, { duration: 850 })
          node.transition(`attrs/${targetSelector}/opacity`, 1, { duration: 850 })
          break
        case 'fade-out':
          node.transition(`attrs/${targetSelector}/opacity`, 0, {
            duration: 1000,
            complete: () => {
              // 预览结束后恢复显示以便编辑
              setTimeout(() => node.attr(`${targetSelector}/opacity`, 1), 800)
            }
          })
          break
        case 'zoom-out':
          node.transition('size', { width: 1, height: 1 }, {
            duration: 800,
            complete: () => {
              setTimeout(() => node.resize(originalSize.width, originalSize.height), 800)
            }
          })
          node.transition(`attrs/${targetSelector}/opacity`, 0, { duration: 800 })
          break
      }
    }

    // 绑定预览事件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graph.on('node:play-entrance', ({ node }: any) => {
      const data = node.getData() || {}
      if (data.entranceType && data.entranceType !== 'none') {
        playTransition(node, data.entranceType)
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graph.on('node:play-exit', ({ node }: any) => {
      const data = node.getData() || {}
      if (data.exitType && data.exitType !== 'none') {
        playTransition(node, data.exitType)
      }
    })

    // 监听节点数据在 PropertyPanel 里被修改时的实时反馈
    graph.on('node:change:data', ({ cell }: { cell: Cell }) => {
      if (cell.isNode()) {
        const node = cell as Node
        applyNodeAnimation(node)
        applyNodeStatus(node)
      }
    })

    // 应用多状态图片
    const applyNodeStatus = (node: Node) => {
      if (node.shape !== 'image') return
      const data = node.getData() || {}
      if (!data.states || !Array.isArray(data.states)) return

      const currentStatus = data.currentStatus
      // 如果没有状态值，保持默认 imageUrl
      if (currentStatus === '' || currentStatus === undefined) return

      const stateItem = data.states.find((st: { value: string | number, url: string }) => String(st.value) === String(currentStatus))
      if (stateItem && stateItem.url) {
        node.attr('image/xlink:href', stateItem.url)
      }
    }

    graph.on('node:added', ({ node }: { node: Node }) => {
      applyNodeAnimation(node)
      applyNodeStatus(node)
      // 首次添加时触发进场动画
      const data = node.getData() || {}
      if (data.entranceType && data.entranceType !== 'none') {
        playTransition(node, data.entranceType)
      }
    })

    // --- 动作路径系统 (Motion Paths) ---
    let isPickingPath = false
    let targetNodeForPath: Node | null = null

    graph.on('motion:start-bind', ({ node }: { node: Node }) => {
      isPickingPath = true
      targetNodeForPath = node
      if (graph) graph.container.style.cursor = 'crosshair'
    })

    // 处理全局点击以确认拾取
    graph.on('edge:click', ({ edge }: { edge: Edge }) => {
      if (isPickingPath && targetNodeForPath) {
        targetNodeForPath.setData({ motionPathId: edge.id }, { overwrite: false })
        isPickingPath = false
        targetNodeForPath = null
        if (graph) graph.container.style.cursor = 'default'
      }
    })

    // 空白处点击取消拾取模式
    graph.on('blank:click', () => {
      if (isPickingPath) {
        isPickingPath = false
        targetNodeForPath = null
        if (graph) graph.container.style.cursor = 'default'
      }
    })

    // 播放动作路径动画
    graph.on('motion:play', ({ node }: { node: Node }) => {
      const data = node.getData() || {}
      if (!data.motionPathId || !graph) return

      const cell = graph.getCellById(data.motionPathId)
      if (!cell || !cell.isEdge()) return
      const edge = cell as Edge

      const originalPos = node.getPosition()

      // 使用动画驱动 progress (0 -> 1)
      const duration = 2000
      const start = Date.now()

      const safeGraph = graph
      const animate = () => {
        if (!safeGraph) return
        const now = Date.now()
        const progress = Math.min(1, (now - start) / duration)

        // 获取连线上对应比例的点 (通过 View 层获取几何路径)
        const view = safeGraph.findViewByCell(edge) as EdgeView
        if (view) {
          const point = view.getPointAtRatio(progress)
          if (point) {
            const size = node.getSize()
            node.position(point.x - size.width / 2, point.y - size.height / 2)
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // 播放结束后 1s 自动滚回原位
          setTimeout(() => {
            node.transition('position', originalPos, { duration: 500 })
          }, 1000)
        }
      }

      requestAnimationFrame(animate)
    })

    // --- 连线粒子 Token 系统 (Edge Tokens) ---
    const edgeTokenTimers = new Map<string, number>()

    const safeGraph = graph
    const applyEdgeTokenAnimation = (edge: Edge) => {
      const data = edge.getData() || {}
      const edgeId = edge.id

      // 彻底清理存量定时器，防止多重叠加
      if (edgeTokenTimers.has(edgeId)) {
        window.clearInterval(edgeTokenTimers.get(edgeId))
        edgeTokenTimers.delete(edgeId)
      }

      if (data.edgeTokenEnabled) {
        const interval = (parseFloat(data.edgeTokenSpeed) || 1) * 1000
        const size = data.edgeTokenSize || 4
        const color = data.edgeTokenColor || '#3b82f6'

        const send = () => {
          if (!safeGraph) return
            // X6 原生 sendToken 存在于 Graph 实例上（部分版本类型定义不全）
            ; (safeGraph as Graph & { sendToken: (args: Record<string, any>, edge: Edge, options?: Record<string, any>) => void }).sendToken(
              {
                tagName: 'circle',
                attrs: {
                  r: size / 2,
                  fill: color,
                  stroke: 'transparent'
                },
              },
              edge,
              {
                duration: 2500, // Token 滑行时间
              },
            )
        }

        // 立即发射首个 Token 并开启循环
        send()
        const timer = window.setInterval(send, interval) as unknown as number
        edgeTokenTimers.set(edgeId, timer)
      }
    }

    graph.on('edge:change:data', ({ cell }: { cell: Cell }) => {
      if (cell.isEdge()) {
        applyEdgeTokenAnimation(cell as Edge)
      }
    })

    graph.on('edge:removed', ({ edge }: { edge: Edge }) => {
      if (edgeTokenTimers.has(edge.id)) {
        window.clearInterval(edgeTokenTimers.get(edge.id))
        edgeTokenTimers.delete(edge.id)
      }
    })

    graph.on('edge:added', ({ edge }: { edge: Edge }) => {
      applyEdgeTokenAnimation(edge)
    })

    // --- 连线拐点交互系统 (Edge Vertices & Tools) ---
    // 改用 mouseenter/mouseleave 确保交互手柄能即时弹出，提升工业级操作灵敏度
    graph.on('edge:mouseenter', ({ edge }: { edge: Edge }) => {
      edge.addTools([
        {
          name: 'vertices',
          args: {
            stopPropagation: false,
            attrs: {
              fill: '#ffffff',
              stroke: '#38bdf8',
              strokeWidth: 2,
              r: 5
            }
          }
        },
        {
          name: 'segments',
          args: {
            stopPropagation: false,
            attrs: {
              fill: '#38bdf8',
              r: 3
            }
          }
        }
      ])
    })

    graph.on('edge:mouseleave', ({ edge }: { edge: Edge }) => {
      // 只有在未选中该连线时，才在鼠标移出后清除手柄
      if (!graph?.isSelected(edge)) {
        edge.removeTools()
      }
    })

    graph.on('edge:unselected', ({ edge }: { edge: Edge }) => {
      // 彻底取消选中时清除所有手柄
      edge.removeTools()
    })

    // --- 百分比响应式布局系统 (Percentage Layout) ---
    const updateNodeRatios = (node: Node) => {
      if (!graph) return
      const { width: gW, height: gH } = graph.options
      const pos = node.getPosition()
      const size = node.getSize()

      // 存储相对于当前画布尺寸的比例
      node.setData({
        xRatio: pos.x / gW,
        yRatio: pos.y / gH,
        wRatio: size.width / gW,
        hRatio: size.height / gH
      }, { overwrite: false })
    }

    graph.on('node:moved', ({ node }: { node: Node }) => updateNodeRatios(node))
    graph.on('node:resized', ({ node }: { node: Node }) => updateNodeRatios(node))

    // --- 页面大小监听与响应式重拍 ---
    const handleResize = () => {
      if (!graph || !containerRef.value) return
      const newWidth = containerRef.value.clientWidth
      const newHeight = containerRef.value.clientHeight

      // 1. 调整画布物理尺寸
      graph.resize(newWidth, newHeight)

      // 2. 响应式重排所有节点
      const nodes = graph.getNodes()
      nodes.forEach(node => {
        const data = node.getData() || {}
        if (data.xRatio !== undefined && data.yRatio !== undefined) {
          node.position(data.xRatio * newWidth, data.yRatio * newHeight)
        }
        if (data.wRatio !== undefined && data.hRatio !== undefined) {
          node.resize(data.wRatio * newWidth, data.hRatio * newHeight)
        }
      })
    }
    window.addEventListener('resize', handleResize)

    // 退出卸载时清理所有活跃动画与资源
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      edgeTokenTimers.forEach(timer => window.clearInterval(timer))
      edgeTokenTimers.clear()
      if (graph) {
        graph.dispose()
        editorStore.initGraph(null)
      }
    })
  }

  return {
    containerRef,
    initGraph,
    getGraph: () => graph
  }
}
