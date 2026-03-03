<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Copy, Trash2, ArrowUpFromLine, ArrowDownToLine, ArrowUp, ArrowDown, MousePointerSquareDashed, ClipboardPaste, Layers, Unlink, Group, Ungroup, Lock, Unlock } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import { Node } from '@antv/x6'
// @ts-expect-error: polybooljs 没有提供 typescript types
import PolyBool from 'polybooljs'

const editorStore = useEditorStore()

const isVisible = ref(false)
const position = ref({ x: 0, y: 0 })
const contextType = ref<'node' | 'blank'>('blank')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const targetNode = ref<any>(null)

// 暴露给父组件调用
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const open = (e: MouseEvent, type: 'node' | 'blank', node?: any) => {
  e.preventDefault()
  contextType.value = type
  targetNode.value = node || null
  position.value = { x: e.clientX, y: e.clientY }
  isVisible.value = true
}

const close = () => {
  isVisible.value = false
}

// 供模板依据进行多选状态研判
const isMultiSelection = computed(() => {
  return (editorStore.graph?.getSelectedCells().filter(c => c.isNode()).length || 0) > 1
})

// 研判当前节点是否为曾经被合并过的联合体
const isUnionNode = computed(() => {
  return contextType.value === 'node' && targetNode.value && targetNode.value.data?.isUnionShape
})

// 研判当前节点是否为组合节点
const isGroupNode = computed(() => {
  return contextType.value === 'node' && targetNode.value && targetNode.value.data?.isGroup
})

// 研判当前节点是否被锁定
const isLockedNode = computed(() => {
  return contextType.value === 'node' && targetNode.value && targetNode.value.data?.isLocked
})

// 全局点击自动关闭菜单
onMounted(() => {
  window.addEventListener('click', close)
  window.addEventListener('contextmenu', (e) => {
    // 防止默认右键菜单弹出
    if (isVisible.value) {
      e.preventDefault()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('click', close)
})

// 菜单基础操作动作
const action = (type: string) => {
  const graph = editorStore.graph
  if (!graph) return

  switch (type) {
    case 'copy':
      if (contextType.value === 'node' && targetNode.value) {
        graph.copy([targetNode.value])
      }
      break
    case 'paste':
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 32 })
        graph.cleanSelection()
        graph.select(cells)
      }
      break
    case 'union':
      {
        const selectedNodes = graph.getSelectedCells().filter(cell => cell.isNode())
        if (selectedNodes.length < 2) {
          alert('请至少选择两个重叠相交的图元进行合并。')
          break
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let resultRegion: any = null

        try {
          selectedNodes.forEach((node) => {
            const poly = { regions: [] as number[][][], inverted: false }
            const pos = node.position()
            const size = node.size()
            const shape = node.shape

            if (shape === 'rect' || shape === 'image') {
              const rx = Math.round(pos.x)
              const ry = Math.round(pos.y)
              const rw = Math.round(size.width)
              const rh = Math.round(size.height)
              poly.regions = [[[rx, ry], [rx + rw, ry], [rx + rw, ry + rh], [rx, ry + rh]]]
            } else if (shape === 'polygon') {
              const points = node.attr('body/refPoints') || node.prop('points')
              let ptsArray: number[][] = []
              if (typeof points === 'string') {
                ptsArray = points.split(' ').map((p: string) => {
                  const parts = p.split(',').map(Number)
                  const px = parts[0] || 0
                  const py = parts[1] || 0
                  return [Math.round(px + pos.x), Math.round(py + pos.y)]
                })
              } else if (Array.isArray(points)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ptsArray = points.map((p: any) => [Math.round(p.x + pos.x), Math.round(p.y + pos.y)])
              }
              if (ptsArray.length > 0) {
                poly.regions = [ptsArray]
              }
            } else if (shape === 'path') {
              const pathData = node.prop('path') || node.attr('body/refD')
              if (typeof pathData === 'string') {
                const subpaths = pathData.split('Z').map(s => s.trim()).filter(s => s.length > 0)
                subpaths.forEach(sub => {
                  const tokens = sub.split(' ').filter(s => s.trim().length > 0)
                  const currentRegion: number[][] = []
                  for (let i = 0; i < tokens.length; i++) {
                    if (tokens[i] === 'M' || tokens[i] === 'L') {
                      const px = Math.round(Number(tokens[i + 1]) + pos.x)
                      const py = Math.round(Number(tokens[i + 2]) + pos.y)
                      currentRegion.push([px, py])
                      i += 2
                    }
                  }
                  if (currentRegion.length > 0) {
                    poly.regions.push(currentRegion)
                  }
                })
              }
            }

            if (poly.regions.length > 0) {
              if (!resultRegion) {
                resultRegion = poly
              } else {
                resultRegion = PolyBool.union(resultRegion, poly)
              }
            }
          })

          if (resultRegion && resultRegion.regions.length > 0) {
            if (resultRegion.regions.length > 1) {
              alert('部分图元未发生重叠相交，或组合后将产生内部孔洞。当前仅支持合并为单一连续的实心图形。')
              return
            }

            let minX = Infinity
            let minY = Infinity
            let maxX = -Infinity
            let maxY = -Infinity

            resultRegion.regions.forEach((region: number[][]) => {
              region.forEach(p => {
                minX = Math.min(minX, p[0] ?? 0)
                minY = Math.min(minY, p[1] ?? 0)
                maxX = Math.max(maxX, p[0] ?? 0)
                maxY = Math.max(maxY, p[1] ?? 0)
              })
            })

            let pathData = ''
            resultRegion.regions.forEach((region: number[][]) => {
              const relativePoints = region.map(p => ({ x: (p[0] ?? 0) - minX, y: (p[1] ?? 0) - minY }))
              relativePoints.forEach((p, idx) => {
                if (idx === 0) {
                  pathData += `M ${p.x} ${p.y} `
                } else {
                  pathData += `L ${p.x} ${p.y} `
                }
              })
              pathData += 'Z '
            })

            const newNode = graph.createNode({
              shape: 'path',
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY,
              path: pathData.trim(),
              ports: {
                groups: {
                  top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
                  right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
                  bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
                  left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
                },
                items: [
                  { id: 'port_top', group: 'top' },
                  { id: 'port_right', group: 'right' },
                  { id: 'port_bottom', group: 'bottom' },
                  { id: 'port_left', group: 'left' },
                ],
              },
              attrs: {
                body: {
                  fill: selectedNodes[0]?.attr('body/fill') || '#1e293b',
                  stroke: selectedNodes[0]?.attr('body/stroke') || '#f59e0b',
                  strokeWidth: 2,
                  filter: selectedNodes[0]?.attr('body/filter')
                },
                label: {
                  text: '组合多边形',
                  fill: '#e2e8f0',
                  fontSize: 13,
                  refX: '50%',
                  refY: '50%',
                  textAnchor: 'middle',
                  textVerticalAnchor: 'middle'
                }
              },
              data: {
                isUnionShape: true,
                originalNodes: selectedNodes.map(n => n.toJSON())
              }
            })

            graph.addNode(newNode)
            graph.removeCells(selectedNodes)
            graph.cleanSelection()
            graph.select(newNode)
          }
        } catch (err) {
          console.error('合并运算失败:', err)
          alert('多边形运算失败。')
        }
      }
      break
    case 'split':
      if (contextType.value === 'node' && targetNode.value) {
        const originals = targetNode.value.data?.originalNodes
        if (Array.isArray(originals)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newCells = originals.map((json: any) => graph.createNode(json))
          graph.addCell(newCells)
          graph.removeCell(targetNode.value)
          graph.cleanSelection()
          graph.select(newCells)
        }
      }
      break
    case 'delete':
      if (contextType.value === 'node' && targetNode.value) {
        graph.removeCell(targetNode.value)
      } else {
        const cells = graph.getSelectedCells()
        graph.removeCells(cells)
      }
      break
    case 'toFront':
      if (contextType.value === 'node' && targetNode.value) {
        targetNode.value.toFront()
      }
      break
    case 'toBack':
      if (contextType.value === 'node' && targetNode.value) {
        targetNode.value.toBack()
      }
      break
    case 'forward':
      if (contextType.value === 'node' && targetNode.value) {
        targetNode.value.zIndex(targetNode.value.zIndex() + 1)
      }
      break
    case 'backward':
      if (contextType.value === 'node' && targetNode.value) {
        targetNode.value.zIndex(targetNode.value.zIndex() - 1)
      }
      break
    case 'selectAll':
      graph.select(graph.getCells())
      break
    case 'clearCanvas':
      if (confirm('确定清空整个画布吗？该操作不可逆转！')) {
        graph.clearCells()
      }
      break
    case 'group':
      {
        const selectedNodes = graph.getSelectedCells().filter(cell => cell.isNode()) as Node[]
        if (selectedNodes.length < 2) {
          alert('请至少选择两个图元进行组合。')
          break
        }

        let minX = Infinity, minY = Infinity
        let maxX = -Infinity, maxY = -Infinity

        selectedNodes.forEach(node => {
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
            groupChildren: selectedNodes.map(n => n.id),
          },
          zIndex: -1,
        })

        selectedNodes.forEach(node => {
          const currentData = node.getData() || {}
          node.setData({
            ...currentData,
            groupId: groupNode.id,
          }, { overwrite: false })
        })

        graph.addCell(groupNode)
        graph.cleanSelection()
        graph.select([groupNode, ...selectedNodes])
      }
      break
    case 'ungroup':
      if (contextType.value === 'node' && targetNode.value && targetNode.value.data?.isGroup) {
        const groupData = targetNode.value.data
        const childIds: string[] = groupData.groupChildren || []
        const children: Node[] = []

        childIds.forEach((id: string) => {
          const node = graph.getCellById(id) as Node
          if (node && node.isNode()) {
            const currentData = node.getData() || {}
            delete currentData.groupId
            node.setData(currentData, { overwrite: true })
            children.push(node)
          }
        })

        graph.removeCell(targetNode.value)
        graph.cleanSelection()
        graph.select(children)
      }
      break
    case 'lock':
      if (contextType.value === 'node' && targetNode.value) {
        const node = targetNode.value as Node

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
      break
    case 'unlock':
      if (contextType.value === 'node' && targetNode.value) {
        const node = targetNode.value as Node

        const currentData = node.getData() || {}
        delete currentData.isLocked
        node.setData(currentData, { overwrite: true })

        node.attr('body/style/pointer-events', 'auto')
        node.attr('body/strokeDasharray', null)
        node.removeTools()
      }
      break
  }
  close()
}

defineExpose({
  open,
  close
})
</script>

<template>
  <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in"
    leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
    <div v-if="isVisible"
      class="fixed z-[9999] min-w-[160px] bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/50 py-1.5 focus:outline-none"
      :style="{ left: `${position.x}px`, top: `${position.y}px` }" @click.stop @contextmenu.prevent>

      <!-- 操作 Nodes 时 -->
      <template v-if="contextType === 'node'">
        <button @click="action('copy')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-sky-400 transition-colors">
          <Copy class="w-3.5 h-3.5" /> 复制节点
        </button>
        <div class="h-[1px] bg-slate-800 my-1 mx-2"></div>
        
        <!-- 组合相关操作 -->
        <button v-if="isMultiSelection" @click="action('group')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-sky-400 hover:bg-slate-800 hover:text-sky-300 transition-colors">
          <Group class="w-3.5 h-3.5" /> 组合图元
        </button>
        <button v-if="isGroupNode" @click="action('ungroup')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-sky-400 hover:bg-slate-800 hover:text-sky-300 transition-colors">
          <Ungroup class="w-3.5 h-3.5" /> 取消组合
        </button>
        
        <!-- 锁定相关操作 -->
        <button v-if="!isLockedNode && !isGroupNode" @click="action('lock')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-amber-400 hover:bg-slate-800 hover:text-amber-300 transition-colors">
          <Lock class="w-3.5 h-3.5" /> 锁定图元
        </button>
        <button v-if="isLockedNode" @click="action('unlock')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors">
          <Unlock class="w-3.5 h-3.5" /> 解锁图元
        </button>
        
        <div class="h-[1px] bg-slate-800 my-1 mx-2"></div>
        
        <!-- 合并为多边形（原有功能） -->
        <button v-if="isMultiSelection" @click="action('union')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors">
          <Layers class="w-3.5 h-3.5" /> 合并为多边形
        </button>
        <button v-else-if="isUnionNode" @click="action('split')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-orange-400 hover:bg-slate-800 hover:text-orange-300 transition-colors">
          <Unlink class="w-3.5 h-3.5" /> 拆分为原图元
        </button>
        
        <!-- 层级操作 -->
        <button v-if="!isMultiSelection && !isGroupNode" @click="action('toFront')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-sky-400 transition-colors">
          <ArrowUpFromLine class="w-3.5 h-3.5" /> 置于顶层
        </button>
        <button v-if="!isMultiSelection && !isGroupNode" @click="action('forward')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-sky-400 transition-colors">
          <ArrowUp class="w-3.5 h-3.5" /> 上移一层
        </button>
        <button v-if="!isMultiSelection && !isGroupNode" @click="action('backward')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-sky-400 transition-colors">
          <ArrowDown class="w-3.5 h-3.5" /> 下移一层
        </button>
        <button v-if="!isMultiSelection && !isGroupNode" @click="action('toBack')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-sky-400 transition-colors">
          <ArrowDownToLine class="w-3.5 h-3.5" /> 置于底层
        </button>
        
        <div class="h-[1px] bg-slate-800 my-1 mx-2"></div>
        <button @click="action('delete')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors">
          <Trash2 class="w-3.5 h-3.5" /> 删除图元
        </button>
      </template>

      <!-- 操作空白画布时 -->
      <template v-else>
        <button @click="action('paste')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-sky-400 transition-colors">
          <ClipboardPaste class="w-3.5 h-3.5" /> 粘贴结构
        </button>
        <div class="h-[1px] bg-slate-800 my-1 mx-2"></div>
        <button @click="action('selectAll')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-sky-400 transition-colors">
          <MousePointerSquareDashed class="w-3.5 h-3.5" /> 全选画布
        </button>
        <button @click="action('clearCanvas')"
          class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-slate-800 hover:text-red-400 transition-colors">
          <Trash2 class="w-3.5 h-3.5" /> 清空画布
        </button>
      </template>
    </div>
  </Transition>
</template>