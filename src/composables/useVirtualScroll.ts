import { ref, computed, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'

/**
 * 虚拟滚动配置
 */
export interface VirtualScrollOptions {
  itemHeight: number
  overscan?: number
  containerHeight?: number
}

/**
 * 虚拟滚动 Composable
 * 用于大数据量列表的渲染优化
 */
export function useVirtualScroll<T>(
  items: Ref<T[]>,
  options: VirtualScrollOptions
) {
  const { itemHeight, overscan = 5, containerHeight = 400 } = options

  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement | null>(null)

  /**
   * 计算可见范围
   */
  const visibleRange = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(start + visibleCount + overscan, items.value.length)

    return {
      start: Math.max(0, start - overscan),
      end,
    }
  })

  /**
   * 可见的列表项
   */
  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    return items.value.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      style: {
        position: 'absolute' as const,
        top: `${(start + index) * itemHeight}px`,
        height: `${itemHeight}px`,
        left: 0,
        right: 0,
      },
    }))
  })

  /**
   * 总高度
   */
  const totalHeight = computed(() => {
    return items.value.length * itemHeight
  })

  /**
   * 偏移量
   */
  const offsetY = computed(() => {
    return visibleRange.value.start * itemHeight
  })

  /**
   * 处理滚动事件
   */
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  /**
   * 滚动到指定索引
   */
  const scrollToIndex = (index: number) => {
    if (containerRef.value) {
      containerRef.value.scrollTop = index * itemHeight
    }
  }

  /**
   * 滚动到顶部
   */
  const scrollToTop = () => {
    scrollToIndex(0)
  }

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    scrollToIndex(items.value.length - 1)
  }

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
  }
}

export default useVirtualScroll
