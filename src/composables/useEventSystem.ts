import { ref } from 'vue'
import type { EventBinding, Action } from '@/types/schema'
import type { Node as X6Node, Edge as X6Edge } from '@antv/x6'
import { useDataSource } from './useDataSource'

// 简单的事件总线实现
interface EventBus {
  emit: <T>(event: string, data: T) => void
  on: <T>(event: string, handler: (data: T) => void) => void
  off: <T>(event: string, handler: (data: T) => void) => void
}

const eventBus: EventBus = {
  emit: (event, data) => {
    const customEvent = new CustomEvent(event, { detail: data })
    window.dispatchEvent(customEvent)
  },
  on: (event, handler) => {
    window.addEventListener(event, (e: Event) => {
      handler((e as CustomEvent).detail)
    })
  },
  off: (event, handler) => {
    window.removeEventListener(event, handler as EventListener)
  },
}

/**
 * 事件类型定义
 */
export type EditorEvent =
  | 'node:click'
  | 'node:dblclick'
  | 'node:mouseenter'
  | 'node:mouseleave'
  | 'node:selected'
  | 'node:unselected'
  | 'edge:click'
  | 'edge:dblclick'
  | 'edge:selected'
  | 'edge:unselected'
  | 'canvas:click'
  | 'canvas:blank'
  | 'data:update'
  | 'variable:change'
  | 'custom:event'

/**
 * 事件数据
 */
export interface EventData {
  'node:click': { nodeId: string; node: X6Node; event: MouseEvent }
  'node:dblclick': { nodeId: string; node: X6Node; event: MouseEvent }
  'node:mouseenter': { nodeId: string; node: X6Node; event: MouseEvent }
  'node:mouseleave': { nodeId: string; node: X6Node; event: MouseEvent }
  'node:selected': { nodeId: string; node: X6Node }
  'node:unselected': { nodeId: string; node: X6Node }
  'edge:click': { edgeId: string; edge: X6Edge; event: MouseEvent }
  'edge:dblclick': { edgeId: string; edge: X6Edge; event: MouseEvent }
  'edge:selected': { edgeId: string; edge: X6Edge }
  'edge:unselected': { edgeId: string; edge: X6Edge }
  'canvas:click': { event: MouseEvent }
  'canvas:blank': { event: MouseEvent }
  'data:update': { sourceId: string; data: unknown }
  'variable:change': { name: string; value: unknown }
  'custom:event': { name: string; data: unknown }
}

/**
 * 事件系统管理器
 */
export function useEventSystem() {
  const { setVariable, refresh } = useDataSource()
  const bindings = ref<Map<string, EventBinding[]>>(new Map())

  /**
   * 注册事件绑定
   */
  const registerBinding = (binding: EventBinding) => {
    const key = `${binding.sourceId}:${binding.eventName}`
    const existing = bindings.value.get(key) || []
    existing.push(binding)
    bindings.value.set(key, existing)
  }

  /**
   * 注销事件绑定
   */
  const unregisterBinding = (sourceId: string, eventName: string) => {
    const key = `${sourceId}:${eventName}`
    bindings.value.delete(key)
  }

  /**
   * 执行动作
   */
  const executeAction = async (action: Action, context: Record<string, unknown>) => {
    // 检查条件
    if (action.condition) {
      const conditionMet = evaluateCondition(action.condition, context)
      if (!conditionMet) return
    }

    // 延迟执行
    if (action.delay && action.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, action.delay))
    }

    switch (action.type) {
      case 'updateData':
        if (action.targetId && action.params?.data) {
          // 更新数据源数据
          console.log('Update data:', action.targetId, action.params.data)
        }
        break

      case 'showHide':
        if (action.targetId !== undefined) {
          const visible = action.params?.visible as boolean
          eventBus.emit('custom:event', {
            name: 'showHide',
            data: { targetId: action.targetId, visible },
          })
        }
        break

      case 'openModal':
        eventBus.emit('custom:event', {
          name: 'openModal',
          data: {
            title: action.params?.title,
            content: action.params?.content,
            width: action.params?.width,
          },
        })
        break

      case 'navigate':
        if (action.params?.url) {
          window.open(action.params.url as string, action.params.target as string || '_blank')
        }
        break

      case 'triggerAnimation':
        if (action.targetId) {
          eventBus.emit('custom:event', {
            name: 'triggerAnimation',
            data: {
              targetId: action.targetId,
              animation: action.params?.animation,
            },
          })
        }
        break

      case 'setVariable':
        if (action.params?.name !== undefined) {
          setVariable(action.params.name as string, action.params.value)
        }
        break

      case 'refresh':
        if (action.targetId) {
          await refresh(action.targetId)
        }
        break

      default:
        console.warn('Unknown action type:', action.type)
    }
  }

  /**
   * 评估条件表达式
   */
  const evaluateCondition = (condition: string, context: Record<string, unknown>): boolean => {
    try {
      // 简单的条件表达式解析
      // 支持: $var > 10, $data.status === 'active', etc.
      const fn = new Function('context', `
        with (context) {
          return ${condition};
        }
      `)
      return fn(context)
    } catch (error) {
      console.error('Condition evaluation error:', error)
      return false
    }
  }

  /**
   * 处理事件
   */
  const handleEvent = async (
    eventName: EditorEvent,
    data: EventData[EditorEvent],
    sourceId: string
  ) => {
    const key = `${sourceId}:${eventName}`
    const eventBindings = bindings.value.get(key)

    if (!eventBindings) return

    const context = {
      $event: data,
      $sourceId: sourceId,
      ...getContextFromEvent(eventName, data),
    }

    for (const binding of eventBindings) {
      for (const action of binding.actions) {
        try {
          await executeAction(action, context)
        } catch (error) {
          console.error('Action execution error:', error)
        }
      }
    }
  }

  /**
   * 从事件数据构建上下文
   */
  const getContextFromEvent = (
    eventName: EditorEvent,
    data: EventData[EditorEvent]
  ): Record<string, unknown> => {
    const context: Record<string, unknown> = {}

    switch (eventName) {
      case 'node:click':
      case 'node:dblclick':
      case 'node:mouseenter':
      case 'node:mouseleave':
        {
          const nodeData = data as EventData['node:click']
          context.$nodeId = nodeData.nodeId
          context.$node = nodeData.node
        }
        break
      case 'edge:click':
      case 'edge:dblclick':
        {
          const edgeData = data as EventData['edge:click']
          context.$edgeId = edgeData.edgeId
          context.$edge = edgeData.edge
        }
        break
      case 'data:update':
        {
          const dataUpdate = data as EventData['data:update']
          context.$sourceId = dataUpdate.sourceId
          context.$data = dataUpdate.data
        }
        break
      case 'variable:change':
        {
          const varChange = data as EventData['variable:change']
          context.$name = varChange.name
          context.$value = varChange.value
        }
        break
    }

    return context
  }

  /**
   * 监听节点事件
   */
  const listenNodeEvents = (node: X6Node) => {
    const nodeId = node.id

    node.on('click', (args: { e: MouseEvent }) => {
      eventBus.emit('node:click', { nodeId, node, event: args.e })
      handleEvent('node:click', { nodeId, node, event: args.e }, nodeId)
    })

    node.on('dblclick', (args: { e: MouseEvent }) => {
      eventBus.emit('node:dblclick', { nodeId, node, event: args.e })
      handleEvent('node:dblclick', { nodeId, node, event: args.e }, nodeId)
    })

    node.on('mouseenter', (args: { e: MouseEvent }) => {
      eventBus.emit('node:mouseenter', { nodeId, node, event: args.e })
      handleEvent('node:mouseenter', { nodeId, node, event: args.e }, nodeId)
    })

    node.on('mouseleave', (args: { e: MouseEvent }) => {
      eventBus.emit('node:mouseleave', { nodeId, node, event: args.e })
      handleEvent('node:mouseleave', { nodeId, node, event: args.e }, nodeId)
    })

    node.on('selected', () => {
      eventBus.emit('node:selected', { nodeId, node })
      handleEvent('node:selected', { nodeId, node }, nodeId)
    })

    node.on('unselected', () => {
      eventBus.emit('node:unselected', { nodeId, node })
      handleEvent('node:unselected', { nodeId, node }, nodeId)
    })
  }

  /**
   * 监听边事件
   */
  const listenEdgeEvents = (edge: X6Edge) => {
    const edgeId = edge.id

    edge.on('click', (args: { e: MouseEvent }) => {
      eventBus.emit('edge:click', { edgeId, edge, event: args.e })
      handleEvent('edge:click', { edgeId, edge, event: args.e }, edgeId)
    })

    edge.on('dblclick', (args: { e: MouseEvent }) => {
      eventBus.emit('edge:dblclick', { edgeId, edge, event: args.e })
      handleEvent('edge:dblclick', { edgeId, edge, event: args.e }, edgeId)
    })

    edge.on('selected', () => {
      eventBus.emit('edge:selected', { edgeId, edge })
      handleEvent('edge:selected', { edgeId, edge }, edgeId)
    })

    edge.on('unselected', () => {
      eventBus.emit('edge:unselected', { edgeId, edge })
      handleEvent('edge:unselected', { edgeId, edge }, edgeId)
    })
  }

  /**
   * 批量注册事件绑定
   */
  const registerBindings = (bindingsList: EventBinding[]) => {
    bindingsList.forEach(binding => registerBinding(binding))
  }

  /**
   * 获取所有绑定
   */
  const getAllBindings = () => {
    return Array.from(bindings.value.values()).flat()
  }

  /**
   * 清理所有绑定
   */
  const clearAllBindings = () => {
    bindings.value.clear()
  }

  return {
    eventBus,
    registerBinding,
    unregisterBinding,
    registerBindings,
    executeAction,
    listenNodeEvents,
    listenEdgeEvents,
    getAllBindings,
    clearAllBindings,
  }
}

export default useEventSystem
