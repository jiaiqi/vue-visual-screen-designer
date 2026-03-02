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

void register

export interface GroupInfo {
  isGroup: boolean
  groupChildren?: string[]
  groupId?: string
}

export interface LockInfo {
  isLocked: boolean
}

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
          return (this as Graph).createEdge({
            shape: 'fluid-pipe',
            zIndex: -1,
          })
        },
        validateConnection({ targetMagnet }) {
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
        rubberband: true,
        strict: false,
        showNodeSelectionBox: true,
        showEdgeSelectionBox: true,
        modifiers: ['shift', 'ctrl', 'meta'],
      }))
      .use(new Keyboard())
      .use(new History({ enabled: true }))
      .use(new Snapline({
        enabled: editorStore.snaplineConfig.enabled,
        sharp: editorStore.snaplineConfig.sharp,
        tolerance: editorStore.snaplineConfig.tolerance,
        className: 'my-snapline',
      }))
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
      // X6 v3 移除了 stopTransition API
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

    // --- 间距提示系统 (Spacing Hints) ---
    let spacingOverlay: HTMLDivElement | null = null

    const createSpacingOverlay = () => {
      if (spacingOverlay) return spacingOverlay
      const overlay = document.createElement('div')
      overlay.id = 'spacing-overlay'
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
        font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `
      el.appendChild(overlay)
      spacingOverlay = overlay
      return overlay
    }

    const removeSpacingOverlay = () => {
      if (spacingOverlay) {
        spacingOverlay.innerHTML = ''
      }
    }

    const calculateSpacingHints = (movingNode: Node) => {
      if (!editorStore.snaplineConfig.showSpacing) return []
      const allNodes = graph?.getNodes().filter(n => n.id !== movingNode.id && !n.getData()?.isGroup) || []
      if (allNodes.length === 0) return []

      const movingBBox = {
        x: movingNode.getPosition().x,
        y: movingNode.getPosition().y,
        width: movingNode.getSize().width,
        height: movingNode.getSize().height,
        right: movingNode.getPosition().x + movingNode.getSize().width,
        bottom: movingNode.getPosition().y + movingNode.getSize().height,
        centerX: movingNode.getPosition().x + movingNode.getSize().width / 2,
        centerY: movingNode.getPosition().y + movingNode.getSize().height / 2,
      }

      const hints: Array<{
        type: 'horizontal' | 'vertical'
        distance: number
        x: number
        y: number
        node: Node
        equalHighlight: boolean
      }> = []

      const horizontalDistances: Array<{ distance: number, node: Node }> = []
      const verticalDistances: Array<{ distance: number, node: Node }> = []

      allNodes.forEach(node => {
        const nodeBBox = {
          x: node.getPosition().x,
          y: node.getPosition().y,
          width: node.getSize().width,
          height: node.getSize().height,
          right: node.getPosition().x + node.getSize().width,
          bottom: node.getPosition().y + node.getSize().height,
          centerX: node.getPosition().x + node.getSize().width / 2,
          centerY: node.getPosition().y + node.getSize().height / 2,
        }

        const leftSpacing = movingBBox.x - nodeBBox.right
        if (leftSpacing > 0 && leftSpacing < 200) {
          hints.push({
            type: 'horizontal',
            distance: Math.round(leftSpacing),
            x: nodeBBox.right,
            y: Math.max(movingBBox.y, nodeBBox.y),
            node,
            equalHighlight: false,
          })
          horizontalDistances.push({ distance: Math.round(leftSpacing), node })
        }

        const rightSpacing = nodeBBox.x - movingBBox.right
        if (rightSpacing > 0 && rightSpacing < 200) {
          hints.push({
            type: 'horizontal',
            distance: Math.round(rightSpacing),
            x: movingBBox.right,
            y: Math.max(movingBBox.y, nodeBBox.y),
            node,
            equalHighlight: false,
          })
          horizontalDistances.push({ distance: Math.round(rightSpacing), node })
        }

        const topSpacing = movingBBox.y - nodeBBox.bottom
        if (topSpacing > 0 && topSpacing < 200) {
          hints.push({
            type: 'vertical',
            distance: Math.round(topSpacing),
            x: Math.max(movingBBox.x, nodeBBox.x),
            y: nodeBBox.bottom,
            node,
            equalHighlight: false,
          })
          verticalDistances.push({ distance: Math.round(topSpacing), node })
        }

        const bottomSpacing = nodeBBox.y - movingBBox.bottom
        if (bottomSpacing > 0 && bottomSpacing < 200) {
          hints.push({
            type: 'vertical',
            distance: Math.round(bottomSpacing),
            x: Math.max(movingBBox.x, nodeBBox.x),
            y: movingBBox.bottom,
            node,
            equalHighlight: false,
          })
          verticalDistances.push({ distance: Math.round(bottomSpacing), node })
        }
      })

      const findEqualDistances = (distances: Array<{ distance: number, node: Node }>) => {
        const distanceGroups = new Map<number, Array<{ node: Node }>>()
        distances.forEach(d => {
          const group = distanceGroups.get(d.distance) || []
          group.push(d)
          distanceGroups.set(d.distance, group)
        })
        distanceGroups.forEach((group, distance) => {
          if (group.length > 1) {
            hints.forEach(hint => {
              if (hint.distance === distance && group.some(g => g.node.id === hint.node.id)) {
                hint.equalHighlight = true
              }
            })
          }
        })
      }

      findEqualDistances(horizontalDistances)
      findEqualDistances(verticalDistances)

      return hints
    }

    const renderSpacingHints = (hints: Array<{
      type: 'horizontal' | 'vertical'
      distance: number
      x: number
      y: number
      node: Node
      equalHighlight: boolean
    }>) => {
      const overlay = createSpacingOverlay()
      overlay.innerHTML = ''

      const containerEl = graph?.container
      const containerRect = containerEl?.getBoundingClientRect()
      const graphPos = { x: containerRect?.left || 0, y: containerRect?.top || 0 }
      const zoom = graph?.zoom() || 1

      hints.forEach(hint => {
        const label = document.createElement('div')
        const screenX = hint.x * zoom + graphPos.x
        const screenY = hint.y * zoom + graphPos.y

        label.style.cssText = `
          position: absolute;
          left: ${screenX}px;
          top: ${screenY}px;
          background: ${hint.equalHighlight ? '#22c55e' : 'rgba(249, 115, 22, 0.95)'};
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transform: translate(-50%, -50%);
        `
        label.textContent = `${hint.distance}px`
        overlay.appendChild(label)
      })
    }

    graph.on('node:moving', ({ node }: { node: Node }) => {
      if (!editorStore.snaplineConfig.showSpacing) {
        removeSpacingOverlay()
        return
      }
      const hints = calculateSpacingHints(node)
      renderSpacingHints(hints)
    })

    graph.on('node:moved', () => {
      removeSpacingOverlay()
    })
  }

  // --- 统筹销毁逻辑 (移出 initGraph 闭包，确保在 setup 顶层运行) ---
  const handleResize = () => {
    if (!graph || !containerRef.value) return

    // 编辑器容器尺寸改变时，如果是"铺满"模式或手动 Resize，
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

  const groupCells = (cells: Cell[]) => {
    if (!graph || cells.length < 2) return null

    const nodes = cells.filter(c => c.isNode()) as Node[]
    if (nodes.length < 2) return null

    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    nodes.forEach(node => {
      const pos = node.getPosition()
      const size = node.getSize()
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x + size.width)
      maxY = Math.max(maxY, pos.y + size.height)
    })

    const padding = 10
    const groupWidth = maxX - minX + padding * 2
    const groupHeight = maxY - minY + padding * 2

    const groupNode = graph.createNode({
      shape: 'rect',
      x: minX - padding,
      y: minY - padding,
      width: groupWidth,
      height: groupHeight,
      attrs: {
        body: {
          fill: 'rgba(59, 130, 246, 0.05)',
          stroke: '#3b82f6',
          strokeWidth: 2,
          strokeDasharray: '5,5',
          rx: 4,
          ry: 4,
        },
        label: {
          text: '组合',
          fill: '#3b82f6',
          fontSize: 10,
          refX: '100%',
          refY: 0,
          textAnchor: 'end',
          textVerticalAnchor: 'top',
          refX2: -4,
          refY2: 4,
        }
      },
      data: {
        isGroup: true,
        groupChildren: nodes.map(n => n.id),
      },
      zIndex: -1,
    })

    nodes.forEach(node => {
      const currentData = node.getData() || {}
      node.setData({
        ...currentData,
        groupId: groupNode.id,
      }, { overwrite: false })
    })

    graph.addCell(groupNode)
    graph.cleanSelection()
    graph.select([groupNode, ...nodes])

    return groupNode
  }

  const ungroupCells = (groupNode: Node) => {
    if (!graph) return []

    const groupData = groupNode.getData() || {}
    if (!groupData.isGroup) return []

    const childIds: string[] = groupData.groupChildren || []
    const children: Node[] = []

    childIds.forEach(id => {
      const node = graph!.getCellById(id) as Node
      if (node && node.isNode()) {
        const currentData = node.getData() || {}
        delete currentData.groupId
        node.setData(currentData, { overwrite: true })
        children.push(node)
      }
    })

    graph.removeCell(groupNode)
    graph.cleanSelection()
    graph.select(children)

    return children
  }

  const lockNode = (node: Node) => {
    if (!node || !node.isNode()) return

    node.setData({
      isLocked: true,
    }, { overwrite: false })

    node.attr('body/style/pointer-events', 'none')
    node.attr('body/strokeDasharray', '3,3')
    node.addTools([
      {
        name: 'button',
        args: {
          x: '100%',
          y: 0,
          offset: { x: -8, y: 8 },
          markup: [
            {
              tagName: 'circle',
              selector: 'bg',
              attrs: {
                r: 8,
                fill: '#1e293b',
                stroke: '#f59e0b',
                strokeWidth: 1,
              },
            },
            {
              tagName: 'text',
              selector: 'icon',
              textContent: '🔒',
              attrs: {
                'font-size': 10,
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
              },
            },
          ],
        },
      },
    ])
  }

  const unlockNode = (node: Node) => {
    if (!node || !node.isNode()) return

    const currentData = node.getData() || {}
    delete currentData.isLocked
    node.setData(currentData, { overwrite: true })

    node.attr('body/style/pointer-events', 'auto')
    node.attr('body/strokeDasharray', null)
    node.removeTools()
  }

  const isNodeLocked = (node: Node): boolean => {
    if (!node) return false
    const data = node.getData() || {}
    return !!data.isLocked
  }

  const isGroupNode = (node: Node): boolean => {
    if (!node) return false
    const data = node.getData() || {}
    return !!data.isGroup
  }

  const getGroupChildren = (groupNode: Node): Node[] => {
    if (!graph || !groupNode) return []
    const data = groupNode.getData() || {}
    if (!data.isGroup || !data.groupChildren) return []

     
    return data.groupChildren
      .map((id: string) => graph!.getCellById(id) as Node)
      .filter((n: any): n is Node => !!n && n.isNode())
  }

  return {
    containerRef,
    initGraph,
    getGraph: () => graph,
    groupCells,
    ungroupCells,
    lockNode,
    unlockNode,
    isNodeLocked,
    isGroupNode,
    getGroupChildren,
  }
}
