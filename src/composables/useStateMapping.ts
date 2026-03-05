import { ref, watch, computed } from 'vue'
import type { Node as X6Node } from '@antv/x6'
import type { StateMapping, StateRule, NodeStyle } from '@/types/schema'
import { useDataSource } from './useDataSource'

/**
 * 状态映射管理器
 * 根据数据源动态更新节点样式
 */

interface MappedNode {
  node: X6Node
  mapping: StateMapping
  currentState?: string
  unsubscribe?: () => void
}

export function useStateMapping() {
  const { subscribe, getVariable } = useDataSource()
  const mappedNodes = ref<Map<string, MappedNode>>(new Map())

  /**
   * 为节点绑定状态映射
   */
  const bindStateMapping = (node: X6Node, mapping: StateMapping) => {
    const nodeId = node.id

    // 清理之前的绑定
    unbindStateMapping(nodeId)

    const mappedNode: MappedNode = {
      node,
      mapping,
    }

    // 订阅数据源
    mappedNode.unsubscribe = subscribe(mapping.dataSourceId, (data) => {
      updateNodeState(mappedNode, data)
    })

    mappedNodes.value.set(nodeId, mappedNode)

    // 立即执行一次更新
    const currentData = getVariable(mapping.dataSourceId)
    if (currentData !== undefined) {
      updateNodeState(mappedNode, currentData)
    }
  }

  /**
   * 解绑节点的状态映射
   */
  const unbindStateMapping = (nodeId: string) => {
    const mappedNode = mappedNodes.value.get(nodeId)
    if (mappedNode) {
      mappedNode.unsubscribe?.()
      mappedNodes.value.delete(nodeId)
    }
  }

  /**
   * 更新节点状态
   */
  const updateNodeState = (mappedNode: MappedNode, data: unknown) => {
    const { node, mapping } = mappedNode
    const value = extractValue(data, mapping.field)

    // 查找匹配的规则
    const matchedRule = findMatchingRule(value, mapping.rules)

    if (matchedRule) {
      applyStyle(node, matchedRule.style)

      if (matchedRule.animation) {
        applyAnimation(node, matchedRule.animation)
      }

      if (matchedRule.tooltip) {
        node.setData({ tooltip: matchedRule.tooltip })
      }

      mappedNode.currentState = matchedRule.condition
    }
  }

  /**
   * 从数据中提取字段值
   */
  const extractValue = (data: unknown, field: string): unknown => {
    if (data === null || data === undefined) return undefined

    const keys = field.split('.')
    let result: unknown = data

    for (const key of keys) {
      if (result === null || result === undefined) return undefined

      // 处理数组索引，如 items[0]
      const match = key.match(/^([^\[]+)\[(\d+)\]$/)
      if (match) {
        const prop = match[1]!
        const index = match[2]!
        const record = result as Record<string, unknown>
        const propValue = record[prop]
        if (Array.isArray(propValue)) {
          result = propValue[parseInt(index)]
        } else {
          result = propValue
        }
      } else {
        const record = result as Record<string, unknown>
        result = record[key]
      }
    }

    return result
  }

  /**
   * 查找匹配的规则
   */
  const findMatchingRule = (value: unknown, rules: StateRule[]): StateRule | undefined => {
    for (const rule of rules) {
      if (evaluateCondition(value, rule.condition, rule.value)) {
        return rule
      }
    }
    return undefined
  }

  /**
   * 评估条件
   */
  const evaluateCondition = (
    value: unknown,
    condition: StateRule['condition'],
    targetValue: unknown
  ): boolean => {
    switch (condition) {
      case 'eq':
        return value === targetValue
      case 'gt':
        return typeof value === 'number' && typeof targetValue === 'number' && value > targetValue
      case 'lt':
        return typeof value === 'number' && typeof targetValue === 'number' && value < targetValue
      case 'gte':
        return typeof value === 'number' && typeof targetValue === 'number' && value >= targetValue
      case 'lte':
        return typeof value === 'number' && typeof targetValue === 'number' && value <= targetValue
      case 'range':
        if (Array.isArray(targetValue) && targetValue.length === 2) {
          const [min, max] = targetValue
          return typeof value === 'number' &&
            typeof min === 'number' &&
            typeof max === 'number' &&
            value >= min && value <= max
        }
        return false
      case 'regex':
        if (typeof targetValue === 'string' && typeof value === 'string') {
          const regex = new RegExp(targetValue)
          return regex.test(value)
        }
        return false
      default:
        return false
    }
  }

  /**
   * 应用样式到节点
   */
  const applyStyle = (node: X6Node, style: Partial<NodeStyle>) => {
    const attrs: Record<string, string | number> = {}

    if (style.background) {
      attrs['body/fill'] = style.background
    }
    if (style.backgroundOpacity !== undefined) {
      attrs['body/fill-opacity'] = style.backgroundOpacity
    }
    if (style.borderColor) {
      attrs['body/stroke'] = style.borderColor
    }
    if (style.borderWidth !== undefined) {
      attrs['body/stroke-width'] = style.borderWidth
    }
    if (style.borderStyle) {
      attrs['body/stroke-dasharray'] = getStrokeDashArray(style.borderStyle)
    }
    if (style.borderRadius !== undefined) {
      attrs['body/rx'] = style.borderRadius
      attrs['body/ry'] = style.borderRadius
    }
    if (style.opacity !== undefined) {
      attrs['body/opacity'] = style.opacity
    }
    if (style.shadow) {
      attrs['body/filter'] = style.shadow
    }

    // 逐个设置属性
    Object.entries(attrs).forEach(([key, value]) => {
      node.attr(key, value)
    })
  }

  /**
   * 获取 stroke-dasharray
   */
  const getStrokeDashArray = (style: string): string => {
    switch (style) {
      case 'dashed':
        return '5, 5'
      case 'dotted':
        return '2, 2'
      default:
        return '0'
    }
  }

  /**
   * 应用动画
   */
  const applyAnimation = (node: X6Node, animation: string) => {
    const animations: Record<string, string> = {
      'blink': 'blink 1s ease-in-out infinite',
      'pulse': 'pulse 2s ease-in-out infinite',
      'shake': 'shake 0.5s ease-in-out infinite',
      'glow': 'glow 1.5s ease-in-out infinite',
    }

    const animationStyle = animations[animation]
    if (animationStyle) {
      node.attr('body/style/animation', animationStyle)
    }
  }

  /**
   * 获取节点的当前状态
   */
  const getNodeState = (nodeId: string): string | undefined => {
    return mappedNodes.value.get(nodeId)?.currentState
  }

  /**
   * 获取所有映射的节点
   */
  const getAllMappedNodes = () => {
    return Array.from(mappedNodes.value.values()).map(mn => ({
      nodeId: mn.node.id,
      dataSourceId: mn.mapping.dataSourceId,
      field: mn.mapping.field,
      currentState: mn.currentState,
    }))
  }

  /**
   * 清理所有映射
   */
  const clearAllMappings = () => {
    mappedNodes.value.forEach((mappedNode) => {
      mappedNode.unsubscribe?.()
    })
    mappedNodes.value.clear()
  }

  return {
    bindStateMapping,
    unbindStateMapping,
    getNodeState,
    getAllMappedNodes,
    clearAllMappings,
  }
}

export default useStateMapping
