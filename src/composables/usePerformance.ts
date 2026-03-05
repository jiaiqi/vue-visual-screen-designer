import { ref, onUnmounted, type UnwrapRef } from 'vue'

/**
 * 防抖
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: number | null = null

  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

/**
 * 节流
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 性能监控
 */
export function usePerformanceMonitor() {
  const metrics = ref({
    fps: 0,
    memory: 0,
    nodes: 0,
    edges: 0,
  })

  let rafId: number | null = null
  let lastTime = performance.now()
  let frameCount = 0

  /**
   * 计算 FPS
   */
  const calculateFPS = () => {
    const now = performance.now()
    frameCount++

    if (now - lastTime >= 1000) {
      metrics.value.fps = frameCount
      frameCount = 0
      lastTime = now

      // 获取内存信息
      const perf = performance as { memory?: { usedJSHeapSize: number } }
      if (perf.memory) {
        metrics.value.memory = perf.memory.usedJSHeapSize / 1024 / 1024
      }
    }

    rafId = requestAnimationFrame(calculateFPS)
  }

  /**
   * 开始监控
   */
  const start = () => {
    rafId = requestAnimationFrame(calculateFPS)
  }

  /**
   * 停止监控
   */
  const stop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  /**
   * 更新节点/边数量
   */
  const updateCounts = (nodes: number, edges: number) => {
    metrics.value.nodes = nodes
    metrics.value.edges = edges
  }

  onUnmounted(() => {
    stop()
  })

  return {
    metrics,
    start,
    stop,
    updateCounts,
  }
}

/**
 * 数据缓存
 */
export function useDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60000
) {
  const cache = ref<Map<string, { data: T; timestamp: number }>>(new Map())
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 获取数据
   */
  const getData = async (): Promise<T> => {
    const cached = cache.value.get(key)
    const now = Date.now()

    // 检查缓存是否有效
    if (cached && now - cached.timestamp < ttl) {
      return cached.data as T
    }

    // 获取新数据
    loading.value = true
    error.value = null

    try {
      const data = await fetcher()
      cache.value.set(key, { data: data as unknown as UnwrapRef<T>, timestamp: now })
      return data
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除缓存
   */
  const clearCache = () => {
    cache.value.delete(key)
  }

  /**
   * 清除所有缓存
   */
  const clearAllCache = () => {
    cache.value.clear()
  }

  return {
    getData,
    clearCache,
    clearAllCache,
    loading,
    error,
  }
}

/**
 * 懒加载
 */
export function useLazyLoad(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  /**
   * 开始观察
   */
  const observe = () => {
    if (!targetRef.value) return

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback()
          // 触发后停止观察
          observer?.unobserve(entry.target)
        }
      })
    }, options)

    observer.observe(targetRef.value)
  }

  /**
   * 停止观察
   */
  const unobserve = () => {
    if (observer && targetRef.value) {
      observer.unobserve(targetRef.value)
      observer.disconnect()
      observer = null
    }
  }

  onUnmounted(() => {
    unobserve()
  })

  return {
    targetRef,
    observe,
    unobserve,
  }
}

export default {
  useDebounce,
  useThrottle,
  usePerformanceMonitor,
  useDataCache,
  useLazyLoad,
}
