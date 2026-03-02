import { ref, onUnmounted } from 'vue'
import {
  Graph,
  Cell,
  Node,
  Edge,
  History,
  Scroller,
  Selection,
  Snapline,
  Transform,
  Keyboard,
  Clipboard,
  Export
} from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import { useEditorStore } from '@/stores/editor'

// 标记 register 已使用以消除 lint 错误
void register

export function useGraph() {
  const containerRef = ref<HTMLElement>()
  const editorStore = useEditorStore()
  let graph: Graph | null = null

  const initGraph = (el: HTMLElement) => {
    if (graph) return

    // 初始化 X6 引擎
    graph = new Graph({
      container: el,
      autoResize: true,
      background: {
        color: '#0f172a',
      },
      grid: {
        size: 20,
        visible: true,
        type: 'dot',
        args: {
          color: '#334155',
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
        snap: true,
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
          return (this as any).createEdge({
            shape: 'fluid-pipe',
            zIndex: -1,
          })
        },
        validateConnection({ targetMagnet }: { targetMagnet: any }) {
          return !!targetMagnet
        },
      }
    })

    // 挂载插件生态
    graph
      .use(new Scroller({
        enabled: true,
        pannable: true,
        pageVisible: false,
        pageBreak: false,
        padding: 50,
        modifiers: ['space'],
      }))
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

    // --- 数据自愈与持久化闭环 (Auto-Recovery) ---
    const recoverData = () => {
      const saved = localStorage.getItem('preview_graph_data')
      if (saved && graph) {
        try {
          const json = JSON.parse(saved)
          if (json && json.cells && json.cells.length > 0) {
            graph.fromJSON(json)
            // 恢复后重新适配一次视野
            graph.centerContent()
          }
        } catch (e) {
          console.error('自动恢复画布数据失败', e)
        }
      }
    }

    // 延迟执行恢复，确保插件加载完毕
    setTimeout(recoverData, 50)

    // 实时静默快照：任何变动都同步到快照，确保护航预览与返回
    graph.on('cell:changed', () => {
      if (graph) {
        const data = graph.toJSON()
        localStorage.setItem('preview_graph_data', JSON.stringify(data))
      }
    })

    graph.on('node:added', () => {
      const data = graph?.toJSON()
      if (data) localStorage.setItem('preview_graph_data', JSON.stringify(data))
    })

    graph.on('node:removed', () => {
      const data = graph?.toJSON()
      if (data) localStorage.setItem('preview_graph_data', JSON.stringify(data))
    })

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

    graph.on('node:added', ({ node }: { node: Node }) => {
      applyNodeAnimation(node)
      applyNodeStatus(node)
      // 首次添加时触发进场动画
      const data = node.getData() || {}
      if (data.entranceType && data.entranceType !== 'none') {
        playTransition(node, data.entranceType)
      }
    })

    graph.on('node:change:data', ({ cell }: { cell: Cell }) => {
      if (cell.isNode()) {
        const node = cell as Node
        applyNodeAnimation(node)
        applyNodeStatus(node)
      }
    })

    graph.on('node:added', ({ node }: { node: Node }) => {
      applyNodeAnimation(node)
      applyNodeStatus(node)
      // 首次添加时触发进场动画
      const data = node.getData() || {}
      if (data.entranceType && data.entranceType !== 'none') {
        playTransition(node, data.entranceType)
      }
    })

    graph.on('edge:removed', ({ edge }: { edge: Edge }) => {
      // 停止所有标签相关的过渡
      edge.stopTransition('labels')
      edge.off('transition:finish')
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

    const updateNodeRatios = (node: Node) => {
      const { width: cW, height: cH } = editorStore.canvasConfig
      const pos = node.getPosition()
      const size = node.getSize()

      // 存储相对于“业务画布尺寸 (如 1920x1080)”的比例
      node.setData({
        xRatio: pos.x / cW,
        yRatio: pos.y / cH,
        wRatio: size.width / cW,
        hRatio: size.height / cH
      }, { overwrite: false })
    }

    graph.on('node:moved', ({ node }: { node: Node }) => updateNodeRatios(node))
    graph.on('node:resized', ({ node }: { node: Node }) => updateNodeRatios(node))
    graph.on('node:added', ({ node }: { node: Node }) => updateNodeRatios(node))
  }

  // --- 统筹销毁逻辑 (移出 initGraph 闭包，确保在 setup 顶层运行) ---
  const handleResize = () => {
    if (!graph || !containerRef.value) return
    const { width: cW, height: cH } = editorStore.canvasConfig

    // 编辑器容器尺寸改变时，如果是“铺满”模式或手动 Resize，
    // 我们在此不自动改变 node 坐标，除非用户显式要求“重布局”。
    // 但在预览模式下，这种重平衡是必须的。
    // 这里保持 Graph 的 resize 即可
    graph.resize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  }

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (graph) {
      graph.dispose()
      editorStore.initGraph(null)
    }
  })

  return {
    containerRef,
    initGraph,
    getGraph: () => graph
  }
}
