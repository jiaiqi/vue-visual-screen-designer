import { ref, computed, watch } from 'vue'
import type { ThemeConfig, ThemeType } from '@/types/schema'

/**
 * 预设主题配置
 */
export const presetThemes: Record<ThemeType, ThemeConfig> = {
  dark: {
    name: '深色工业',
    type: 'dark',
    colors: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      background: '#0f172a',
      surface: '#1e293b',
      border: '#334155',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
    },
    canvas: {
      background: '#0b1120',
      grid: '#1e293b',
      gridDot: '#334155',
      ruler: '#475569',
      guideline: '#0ea5e9',
    },
  },
  light: {
    name: '浅色明亮',
    type: 'light',
    colors: {
      primary: '#0284c7',
      secondary: '#64748b',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#2563eb',
      background: '#ffffff',
      surface: '#f8fafc',
      border: '#e2e8f0',
      text: '#0f172a',
      textSecondary: '#64748b',
    },
    canvas: {
      background: '#f8fafc',
      grid: '#e2e8f0',
      gridDot: '#cbd5e1',
      ruler: '#94a3b8',
      guideline: '#0ea5e9',
    },
  },
  cyber: {
    name: '赛博朋克',
    type: 'cyber',
    colors: {
      primary: '#00f0ff',
      secondary: '#ff00ff',
      success: '#00ff9d',
      warning: '#ffee00',
      danger: '#ff0055',
      info: '#00f0ff',
      background: '#0a0a0f',
      surface: '#12121a',
      border: '#00f0ff33',
      text: '#e0e0e0',
      textSecondary: '#888888',
    },
    canvas: {
      background: '#050508',
      grid: '#00f0ff22',
      gridDot: '#00f0ff44',
      ruler: '#ff00ff66',
      guideline: '#00f0ff',
    },
  },
  industrial: {
    name: '工业暗色',
    type: 'industrial',
    colors: {
      primary: '#f97316',
      secondary: '#78716c',
      success: '#22c55e',
      warning: '#eab308',
      danger: '#dc2626',
      info: '#3b82f6',
      background: '#1c1917',
      surface: '#292524',
      border: '#44403c',
      text: '#fafaf9',
      textSecondary: '#a8a29e',
    },
    canvas: {
      background: '#181615',
      grid: '#292524',
      gridDot: '#44403c',
      ruler: '#57534e',
      guideline: '#f97316',
    },
  },
}

/**
 * CSS 变量映射
 */
const cssVariableMap: Record<string, string> = {
  'colors.primary': '--theme-primary',
  'colors.secondary': '--theme-secondary',
  'colors.success': '--theme-success',
  'colors.warning': '--theme-warning',
  'colors.danger': '--theme-danger',
  'colors.info': '--theme-info',
  'colors.background': '--theme-bg',
  'colors.surface': '--theme-surface',
  'colors.border': '--theme-border',
  'colors.text': '--theme-text',
  'colors.textSecondary': '--theme-text-secondary',
  'canvas.background': '--canvas-bg',
  'canvas.grid': '--canvas-grid',
  'canvas.gridDot': '--canvas-grid-dot',
  'canvas.ruler': '--canvas-ruler',
  'canvas.guideline': '--canvas-guideline',
}

/**
 * 将主题配置应用到 CSS 变量
 */
function applyThemeToCSS(theme: ThemeConfig) {
  const root = document.documentElement

  Object.entries(cssVariableMap).forEach(([path, cssVar]) => {
    const value = path.split('.').reduce((obj, key) => {
      return (obj as Record<string, unknown>)?.[key]
    }, theme as unknown)

    if (typeof value === 'string') {
      root.style.setProperty(cssVar, value)
    }
  })
}

/**
 * 主题管理 Composable
 */
export function useTheme() {
  const currentTheme = ref<ThemeType>('dark')
  const customThemes = ref<Record<string, ThemeConfig>>({})

  const theme = computed<ThemeConfig>(() => {
    return customThemes.value[currentTheme.value] || presetThemes[currentTheme.value]
  })

  /**
   * 切换主题
   */
  const setTheme = (themeType: ThemeType) => {
    currentTheme.value = themeType
    applyThemeToCSS(theme.value)
    localStorage.setItem('designer-theme', themeType)
  }

  /**
   * 注册自定义主题
   */
  const registerCustomTheme = (name: string, config: ThemeConfig) => {
    customThemes.value[name] = config
  }

  /**
   * 获取主题 CSS 变量
   */
  const getCSSVariable = (name: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(name)
  }

  /**
   * 初始化主题
   */
  const initTheme = () => {
    const savedTheme = localStorage.getItem('designer-theme') as ThemeType
    if (savedTheme && presetThemes[savedTheme]) {
      setTheme(savedTheme)
    } else {
      applyThemeToCSS(presetThemes.dark)
    }
  }

  // 监听主题变化自动应用
  watch(theme, (newTheme) => {
    applyThemeToCSS(newTheme)
  }, { immediate: true })

  return {
    currentTheme,
    theme,
    presetThemes,
    customThemes,
    setTheme,
    registerCustomTheme,
    getCSSVariable,
    initTheme,
  }
}

export default useTheme
