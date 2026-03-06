import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 画布尺寸预设
 */
export const CANVAS_PRESETS = [
  { label: '1920×1080 (16:9 FHD)', width: 1920, height: 1080 },
  { label: '2560×1440 (16:9 2K)', width: 2560, height: 1440 },
  { label: '3840×2160 (16:9 4K)', width: 3840, height: 2160 },
  { label: '1280×720 (16:9 HD)', width: 1280, height: 720 },
  { label: '1366×768 (16:9)', width: 1366, height: 768 },
  { label: '1024×768 (4:3)', width: 1024, height: 768 },
  { label: '800×600 (4:3)', width: 800, height: 600 },
  { label: '自定义', width: 0, height: 0 },
] as const

/**
 * 预览缩放模式
 */
export type ScaleMode = 'contain' | 'cover' | 'stretch' | 'none'

/**
 * 画布配置接口
 */
export interface CanvasConfig {
  // 画布名称
  name: string
  // 画布分类
  category: string
  // 画布尺寸
  width: number
  height: number
  // 背景设置
  backgroundColor: string
  backgroundImage: string
  // 网格设置
  showGrid: boolean
  gridSize: number
  gridColor: string
  snapToGrid: boolean
  // 标尺设置
  showRuler: boolean
  // 预览设置
  previewScaleMode: ScaleMode
  // 主题
  theme: 'light' | 'dark'
}

/**
 * 编辑器视口状态
 */
export interface ViewportState {
  // 缩放比例（编辑器内查看大画布时使用）
  zoom: number
  // 平移偏移
  panX: number
  panY: number
}

/**
 * 画布 Store V2
 * 管理大屏设计器的画布配置和视口状态
 */
export const useCanvasStoreV2 = defineStore('canvasV2', () => {
  // ==================== State ====================

  /**
   * 画布配置
   */
  const config = ref<CanvasConfig>({
    name: '未命名大屏',
    category: '默认',
    width: 1920,
    height: 1080,
    backgroundColor: 'rgba(230, 230, 230, 0.1)',
    backgroundImage: '',
    showGrid: true,
    gridSize: 20,
    gridColor: 'rgba(230, 230, 230, 0.5)',
    snapToGrid: true,
    showRuler: true,
    previewScaleMode: 'contain',
    theme: 'dark',
  })

  /**
   * 视口状态
   */
  const viewport = ref<ViewportState>({
    zoom: 1,
    panX: 0,
    panY: 0,
  })

  // ==================== Getters ====================

  /**
   * 画布宽高比
   */
  const aspectRatio = computed(() => {
    return config.value.width / config.value.height
  })

  /**
   * 画布尺寸描述
   */
  const sizeDescription = computed(() => {
    const { width, height } = config.value
    // 计算宽高比
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    const g = gcd(width, height)
    const ratioW = width / g
    const ratioH = height / g
    return `${width} × ${height} (${ratioW}:${ratioH})`
  })

  // ==================== Actions ====================

  /**
   * 更新画布配置
   */
  function updateConfig(partial: Partial<CanvasConfig>) {
    config.value = { ...config.value, ...partial }
  }

  /**
   * 设置画布尺寸
   */
  function setSize(width: number, height: number) {
    config.value.width = width
    config.value.height = height
  }

  /**
   * 应用尺寸预设
   */
  function applyPreset(preset: typeof CANVAS_PRESETS[number]) {
    if (preset.width > 0 && preset.height > 0) {
      setSize(preset.width, preset.height)
    }
  }

  /**
   * 设置缩放比例
   */
  function setZoom(zoom: number) {
    viewport.value.zoom = Math.max(0.1, Math.min(5, zoom))
  }

  /**
   * 设置平移
   */
  function setPan(x: number, y: number) {
    viewport.value.panX = x
    viewport.value.panY = y
  }

  /**
   * 重置滚动偏移（兼容属性面板调用）
   */
  function resetScroll() {
    viewport.value.panX = 0
    viewport.value.panY = 0
  }

  /**
   * 重置视口
   */
  function resetViewport() {
    viewport.value = {
      zoom: 1,
      panX: 0,
      panY: 0,
    }
  }

  /**
   * 导出配置
   */
  function exportConfig() {
    return JSON.parse(JSON.stringify(config.value))
  }

  /**
   * 导入配置
   */
  function importConfig(data: CanvasConfig) {
    config.value = { ...config.value, ...data }
  }

  return {
    // State
    config,
    viewport,
    // Getters
    aspectRatio,
    sizeDescription,
    // Actions
    updateConfig,
    setSize,
    applyPreset,
    setZoom,
    setPan,
    resetScroll,
    resetViewport,
    exportConfig,
    importConfig,
  }
})
