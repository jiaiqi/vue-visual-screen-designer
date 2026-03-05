import { ref, computed, onMounted, onUnmounted } from 'vue'

export type ScaleMode = 'contain' | 'cover' | 'stretch' | 'none'

export interface ScaleAdapterOptions {
  canvasWidth: number
  canvasHeight: number
  mode?: ScaleMode
}

/**
 * CSS Scale 缩放适配器
 * 根据容器尺寸和画布设计尺寸，计算 transform: scale() 比例
 *
 * - contain：保持宽高比，整体适应（默认）
 * - cover：保持宽高比，覆盖整个容器
 * - stretch：拉伸铺满，不保持宽高比
 * - none：不缩放（固定1:1）
 */
export function useScaleAdapter(options: ScaleAdapterOptions) {
  const { canvasWidth, canvasHeight, mode = 'contain' } = options

  const containerRef = ref<HTMLElement | null>(null)
  const containerWidth = ref(window.innerWidth)
  const containerHeight = ref(window.innerHeight)

  /**
   * 等比适应（contain）缩放比例
   */
  const containScale = computed(() => {
    const scaleX = containerWidth.value / canvasWidth
    const scaleY = containerHeight.value / canvasHeight
    return Math.min(scaleX, scaleY)
  })

  /**
   * 覆盖（cover）缩放比例
   */
  const coverScale = computed(() => {
    const scaleX = containerWidth.value / canvasWidth
    const scaleY = containerHeight.value / canvasHeight
    return Math.max(scaleX, scaleY)
  })

  /**
   * 最终生效的缩放比例
   */
  const scale = computed(() => {
    switch (mode) {
      case 'contain':
        return containScale.value
      case 'cover':
        return coverScale.value
      case 'stretch':
        return null // stretch 模式不用 scale，用 width/height 100%
      case 'none':
        return 1
      default:
        return containScale.value
    }
  })

  /**
   * 画布在容器中居中时的偏移量
   * 仅在 contain 模式下需要计算
   */
  const offset = computed(() => {
    if (mode !== 'contain' || scale.value === null) return { x: 0, y: 0 }
    const s = scale.value
    const scaledW = canvasWidth * s
    const scaledH = canvasHeight * s
    return {
      x: (containerWidth.value - scaledW) / 2,
      y: (containerHeight.value - scaledH) / 2,
    }
  })

  /**
   * 生成 transform style 字符串
   */
  const transformStyle = computed(() => {
    if (mode === 'stretch') {
      return {
        width: '100%',
        height: '100%',
        transformOrigin: '0 0',
      }
    }
    if (scale.value === null) return {}
    return {
      transform: `scale(${scale.value})`,
      transformOrigin: '0 0',
      position: 'absolute' as const,
      left: `${offset.value.x}px`,
      top: `${offset.value.y}px`,
    }
  })

  /**
   * 更新容器尺寸
   */
  function updateContainerSize() {
    if (containerRef.value) {
      containerWidth.value = containerRef.value.clientWidth
      containerHeight.value = containerRef.value.clientHeight
    } else {
      containerWidth.value = window.innerWidth
      containerHeight.value = window.innerHeight
    }
  }

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    updateContainerSize()

    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => updateContainerSize())
      resizeObserver.observe(containerRef.value)
    } else {
      window.addEventListener('resize', updateContainerSize)
    }
  })

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    } else {
      window.removeEventListener('resize', updateContainerSize)
    }
  })

  return {
    containerRef,
    containerWidth,
    containerHeight,
    scale,
    offset,
    transformStyle,
    updateContainerSize,
  }
}
