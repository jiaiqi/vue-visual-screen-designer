import { ref, computed, watch } from 'vue'
import type {
  DataSourceConfig,
  DataSourceType,
  RESTConfig,
  WebSocketConfig,
  MQTTConfig,
  StaticConfig,
  SQLConfig,
  DataPipeline,
} from '@/types/schema'

/**
 * 数据源状态
 */
interface DataSourceState {
  config: DataSourceConfig
  data: unknown
  loading: boolean
  error: Error | null
  lastUpdated: number
  subscribers: Set<(data: unknown) => void>
  ws?: WebSocket
  interval?: number
}

/**
 * 全局变量状态
 */
const globalVariables = ref<Record<string, unknown>>({})

/**
 * 数据源管理 Composable
 */
export function useDataSource() {
  const sources = ref<Map<string, DataSourceState>>(new Map())
  const activeRequests = ref<Map<string, AbortController>>(new Map())

  /**
   * 创建数据源
   */
  const createSource = (config: DataSourceConfig): DataSourceState => {
    const state: DataSourceState = {
      config,
      data: null,
      loading: false,
      error: null,
      lastUpdated: 0,
      subscribers: new Set(),
    }
    sources.value.set(config.id, state)
    return state
  }

  /**
   * 删除数据源
   */
  const deleteSource = (id: string) => {
    const state = sources.value.get(id)
    if (state) {
      // 清理 WebSocket
      if (state.ws) {
        state.ws.close()
      }
      // 清理轮询
      if (state.interval) {
        clearInterval(state.interval)
      }
      // 清理请求
      const controller = activeRequests.value.get(id)
      if (controller) {
        controller.abort()
        activeRequests.value.delete(id)
      }
      sources.value.delete(id)
    }
  }

  /**
   * 获取数据源
   */
  const getSource = (id: string): DataSourceState | undefined => {
    return sources.value.get(id)
  }

  /**
   * 获取数据源数据
   */
  const getData = (id: string): unknown => {
    return sources.value.get(id)?.data ?? null
  }

  /**
   * 获取数据源加载状态
   */
  const isLoading = (id: string): boolean => {
    return sources.value.get(id)?.loading ?? false
  }

  /**
   * 获取数据源错误
   */
  const getError = (id: string): Error | null => {
    return sources.value.get(id)?.error ?? null
  }

  /**
   * 订阅数据源更新
   */
  const subscribe = (id: string, callback: (data: unknown) => void): (() => void) => {
    const state = sources.value.get(id)
    if (!state) {
      console.warn(`DataSource ${id} not found`)
      return () => {}
    }

    state.subscribers.add(callback)

    // 立即返回当前数据
    if (state.data !== null) {
      callback(state.data)
    }

    // 返回取消订阅函数
    return () => {
      state.subscribers.delete(callback)
    }
  }

  /**
   * 通知订阅者
   */
  const notifySubscribers = (id: string, data: unknown) => {
    const state = sources.value.get(id)
    if (state) {
      state.subscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in subscriber callback:', error)
        }
      })
    }
  }

  /**
   * 执行 REST 请求
   */
  const executeREST = async (config: RESTConfig, signal?: AbortSignal): Promise<unknown> => {
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
      signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * 连接 WebSocket
   */
  const connectWebSocket = (id: string, config: WebSocketConfig) => {
    const state = sources.value.get(id)
    if (!state) return

    const ws = new WebSocket(config.url, config.protocols)
    state.ws = ws

    ws.onopen = () => {
      console.log(`WebSocket ${id} connected`)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        state.data = data
        state.lastUpdated = Date.now()
        notifySubscribers(id, data)
      } catch (error) {
        console.error('WebSocket message parse error:', error)
      }
    }

    ws.onerror = (error) => {
      console.error(`WebSocket ${id} error:`, error)
      state.error = new Error('WebSocket connection error')
    }

    ws.onclose = () => {
      console.log(`WebSocket ${id} closed`)
      // 自动重连
      if (config.reconnect !== false) {
        setTimeout(() => {
          connectWebSocket(id, config)
        }, config.reconnectInterval ?? 3000)
      }
    }
  }

  /**
   * 获取静态数据
   */
  const getStaticData = (config: StaticConfig): unknown => {
    return config.data
  }

  /**
   * 刷新数据源
   */
  const refresh = async (id: string): Promise<unknown> => {
    const state = sources.value.get(id)
    if (!state) {
      throw new Error(`DataSource ${id} not found`)
    }

    const { config } = state
    state.loading = true
    state.error = null

    try {
      let data: unknown

      switch (config.type) {
        case 'rest':
          // 取消之前的请求
          const existingController = activeRequests.value.get(id)
          if (existingController) {
            existingController.abort()
          }
          const controller = new AbortController()
          activeRequests.value.set(id, controller)
          data = await executeREST(config.config as RESTConfig, controller.signal)
          activeRequests.value.delete(id)
          break

        case 'websocket':
          if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
            connectWebSocket(id, config.config as WebSocketConfig)
          }
          data = state.data
          break

        case 'static':
          data = getStaticData(config.config as StaticConfig)
          break

        case 'graphql':
          // TODO: 实现 GraphQL 支持
          throw new Error('GraphQL not implemented yet')

        case 'mqtt':
          // TODO: 实现 MQTT 支持
          throw new Error('MQTT not implemented yet')

        case 'mysql':
        case 'postgresql':
        case 'influxdb':
          // TODO: 实现 SQL 数据库支持（需要后端代理）
          throw new Error('SQL datasource not implemented yet')

        default:
          throw new Error(`Unknown datasource type: ${config.type}`)
      }

      state.data = data
      state.lastUpdated = Date.now()
      state.loading = false
      notifySubscribers(id, data)

      return data
    } catch (error) {
      state.error = error instanceof Error ? error : new Error(String(error))
      state.loading = false
      throw error
    }
  }

  /**
   * 启动轮询
   */
  const startPolling = (id: string) => {
    const state = sources.value.get(id)
    if (!state || !state.config.polling?.enabled) return

    const { interval } = state.config.polling

    // 清理现有轮询
    if (state.interval) {
      clearInterval(state.interval)
    }

    // 立即执行一次
    refresh(id)

    // 启动轮询
    state.interval = window.setInterval(() => {
      refresh(id)
    }, interval * 1000)
  }

  /**
   * 停止轮询
   */
  const stopPolling = (id: string) => {
    const state = sources.value.get(id)
    if (state?.interval) {
      clearInterval(state.interval)
      state.interval = undefined
    }
  }

  /**
   * 设置全局变量
   */
  const setVariable = (name: string, value: unknown) => {
    globalVariables.value[name] = value
  }

  /**
   * 获取全局变量
   */
  const getVariable = (name: string): unknown => {
    return globalVariables.value[name]
  }

  /**
   * 获取所有全局变量
   */
  const getAllVariables = (): Record<string, unknown> => {
    return { ...globalVariables.value }
  }

  /**
   * 处理数据管道
   */
  const processPipeline = (data: unknown, pipeline: DataPipeline): unknown => {
    let result = data

    // JSONPath 提取
    if (pipeline.jsonPath) {
      result = extractByJsonPath(result, pipeline.jsonPath)
    }

    // JS 过滤器
    if (pipeline.filter) {
      result = executeFilter(result, pipeline.filter)
    }

    // 字段映射
    if (pipeline.mapping) {
      result = mapFields(result, pipeline.mapping)
    }

    return result
  }

  /**
   * JSONPath 提取（简化版）
   */
  const extractByJsonPath = (data: unknown, path: string): unknown => {
    if (!path || path === '$') return data

    const keys = path.replace(/^\$\./, '').split('.')
    let result = data

    for (const key of keys) {
      if (result === null || result === undefined) return undefined

      // 处理数组索引，如 items[0]
      const match = key.match(/^([^\[]+)\[(\d+)\]$/)
      if (match) {
        const prop = match[1]!
        const index = match[2]!
        result = (result as Record<string, unknown>)[prop]
        if (Array.isArray(result)) {
          result = result[parseInt(index)]
        }
      } else {
        result = (result as Record<string, unknown>)[key]
      }
    }

    return result
  }

  /**
   * 执行 JS 过滤器（沙箱环境）
   */
  const executeFilter = (data: unknown, filterCode: string): unknown => {
    try {
      // 创建安全的沙箱函数
      const sandbox = new Function(
        'data', 'vars', 'dayjs', '_',
        `
          'use strict';
          const filter = ${filterCode};
          return typeof filter === 'function' ? filter(data, vars, dayjs, _) : data;
        `
      )

      return sandbox(
        data,
        globalVariables.value,
        // 这里可以注入 dayjs 和 lodash
        null,
        null
      )
    } catch (error) {
      console.error('Filter execution error:', error)
      return data
    }
  }

  /**
   * 字段映射
   */
  const mapFields = (data: unknown, mapping: Record<string, string>): unknown => {
    if (!Array.isArray(data)) {
      // 单条数据映射
      const result: Record<string, unknown> = {}
      for (const [newKey, oldKey] of Object.entries(mapping)) {
        result[newKey] = extractByJsonPath(data, oldKey)
      }
      return result
    }

    // 数组数据映射
    return data.map(item => mapFields(item, mapping))
  }

  /**
   * 销毁所有数据源
   */
  const destroyAll = () => {
    sources.value.forEach((_, id) => {
      deleteSource(id)
    })
    sources.value.clear()
  }

  return {
    // 数据源管理
    sources: computed(() => Array.from(sources.value.values()).map(s => s.config)),
    createSource,
    deleteSource,
    getSource,
    getData,
    isLoading,
    getError,
    subscribe,
    refresh,
    startPolling,
    stopPolling,

    // 全局变量
    globalVariables,
    setVariable,
    getVariable,
    getAllVariables,

    // 数据处理
    processPipeline,

    // 清理
    destroyAll,
  }
}

export default useDataSource
