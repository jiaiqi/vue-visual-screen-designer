import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import type { Graph } from '@antv/x6'
import type { ThemeMode } from '@/types/editor'
import { transformNodePosition } from '@/utils/coordinate-transform'
import { getItem, setItem } from '@/utils/storage'

export interface RecentShapeItem {
  type: string
  iconName?: string
  timestamp: number
}

interface EditorState {
  mode: 'select' | 'draw' | 'pan' | 'edit'
  currentTool: string
  graph: Graph | null
  theme: ThemeMode
  hasSeenGuide: boolean
  isToolbarCollapsed: boolean
  isPropertyPanelCollapsed: boolean
  showMinimap: boolean
  recentShapes: RecentShapeItem[]
  favoriteShapes: string[]
  canvasConfig: {
    name: string
    category: string
    width: number
    height: number
    backgroundColor: string
    backgroundImage: string
    showGrid: boolean
    gridSize: number
    gridColor: string
    snapToGrid: boolean
    theme: 'light' | 'dark'
    previewScale: 'auto' | 'width' | 'height' | 'none'
    showScrollbar: boolean
    lockMove: boolean
    lockZoom: boolean
    showRuler: boolean
  }
  snaplineConfig: {
    enabled: boolean
    tolerance: number
    color: string
    sharp: boolean
    showSpacing: boolean
  }
  coordinateSystem: 'top-left' | 'center'
  unit: 'px' | 'percent'
}

const GUIDE_STORAGE_KEY = 'vue-fabric-editor-guide-completed'
const RECENT_SHAPES_KEY = 'vue-fabric-editor-recent-shapes'
const FAVORITE_SHAPES_KEY = 'vue-fabric-editor-favorite-shapes'
const THEME_KEY = 'theme'
const MAX_RECENT_SHAPES = 6

// 异步加载数据
async function loadRecentShapesAsync(): Promise<RecentShapeItem[]> {
  try {
    const saved = await getItem<RecentShapeItem[]>(RECENT_SHAPES_KEY, 'recentShapes')
    return saved || []
  } catch {
    return []
  }
}

async function loadFavoriteShapesAsync(): Promise<string[]> {
  try {
    const saved = await getItem<string[]>(FAVORITE_SHAPES_KEY, 'favoriteShapes')
    return saved || []
  } catch {
    return []
  }
}

async function saveRecentShapesAsync(shapes: RecentShapeItem[]) {
  await setItem(RECENT_SHAPES_KEY, shapes, 'recentShapes')
}

async function saveFavoriteShapesAsync(favorites: string[]) {
  await setItem(FAVORITE_SHAPES_KEY, favorites, 'favoriteShapes')
}

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => {
    // 使用同步方式初始化，异步数据在 onMounted 中加载
    return {
      mode: 'select',
      currentTool: 'select',
      graph: null,
      theme: 'dark',
      hasSeenGuide: false,
      isToolbarCollapsed: false,
      isPropertyPanelCollapsed: false,
      showMinimap: true,
      recentShapes: [],
      favoriteShapes: [],
      canvasConfig: {
        name: '暖通',
        category: '智慧物联',
        width: 1920,
        height: 1080,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        backgroundImage: '',
        showGrid: true,
        gridSize: 20,
        gridColor: '#1e293b',
        snapToGrid: true,
        theme: 'dark',
        previewScale: 'auto',
        showScrollbar: false,
        lockMove: false,
        lockZoom: false,
        showRuler: true
      },
      snaplineConfig: {
        enabled: true,
        tolerance: 10,
        color: '#f97316',
        sharp: true,
        showSpacing: true
      },
      coordinateSystem: 'top-left',
      unit: 'px'
    }
  },
  actions: {
    async initializeStore() {
      // 异步加载存储的数据
      const [savedTheme, hasSeenGuide, recentShapes, favoriteShapes] = await Promise.all([
        getItem<ThemeMode>(THEME_KEY, 'theme'),
        getItem<boolean>(GUIDE_STORAGE_KEY, 'guide'),
        loadRecentShapesAsync(),
        loadFavoriteShapesAsync()
      ])

      if (savedTheme) {
        this.theme = savedTheme
        this.applyTheme()
      }
      this.hasSeenGuide = hasSeenGuide || false
      this.recentShapes = recentShapes
      this.favoriteShapes = favoriteShapes
    },
    initGraph(graphInstance: Graph | null) {
      this.graph = graphInstance ? markRaw(graphInstance) : null

      if (this.graph) {
        this.applyCanvasConfig()
      }
    },
    setMode(mode: EditorState['mode']) {
      this.mode = mode
    },
    setCurrentTool(tool: string) {
      this.currentTool = tool
      if (['select', 'pan'].includes(tool)) {
        this.setMode(tool as 'select' | 'pan')
      } else {
        this.setMode('draw')
      }
    },
    setTheme(theme: ThemeMode) {
      this.theme = theme
      setItem(THEME_KEY, theme, 'theme').catch(console.error)
      this.applyTheme()
    },
    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark')
    },
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
    },
    applyCanvasConfig() {
      if (!this.graph) return

      const { width, height, backgroundColor, showGrid, gridSize, gridColor } = this.canvasConfig

      this.graph.resize(width, height)

      this.graph.drawBackground({
        color: backgroundColor,
      })

      if (showGrid) {
        this.graph.showGrid()
        this.graph.setGridSize(gridSize)
        this.graph.drawGrid({
          type: 'dot',
          args: {
            color: gridColor,
            thickness: 1,
          },
        })
      } else {
        this.graph.hideGrid()
      }
    },
    updateCanvasConfig(partial: Partial<EditorState['canvasConfig']>) {
      this.canvasConfig = { ...this.canvasConfig, ...partial }
      this.applyCanvasConfig()
    },
    updateSnaplineConfig(partial: Partial<EditorState['snaplineConfig']>) {
      this.snaplineConfig = { ...this.snaplineConfig, ...partial }
      this.applySnaplineConfig()
    },
    applySnaplineConfig() {
      this.updateSnaplineStyle()
    },
    updateSnaplineStyle() {
      const style = document.getElementById('snapline-dynamic-style')
      const cssContent = `
        .my-snapline {
          stroke: ${this.snaplineConfig.color} !important;
          stroke-width: 1px !important;
          stroke-dasharray: 4px 2px !important;
        }
        .my-snapline.x6-snapline-horizontal,
        .my-snapline.x6-snapline-vertical {
          stroke: ${this.snaplineConfig.color} !important;
        }
      `
      if (style) {
        style.textContent = cssContent
      } else {
        const newStyle = document.createElement('style')
        newStyle.id = 'snapline-dynamic-style'
        newStyle.textContent = cssContent
        document.head.appendChild(newStyle)
      }
    },
    completeGuide() {
      this.hasSeenGuide = true
      setItem(GUIDE_STORAGE_KEY, true, 'guide').catch(console.error)
    },
    resetGuide() {
      this.hasSeenGuide = false
      // localForage 不直接支持 removeItem，使用 setItem 设置为 null
      setItem(GUIDE_STORAGE_KEY, null as any, 'guide').catch(console.error)
    },
    toggleToolbar() {
      this.isToolbarCollapsed = !this.isToolbarCollapsed
    },
    togglePropertyPanel() {
      this.isPropertyPanelCollapsed = !this.isPropertyPanelCollapsed
    },
    setToolbarCollapsed(collapsed: boolean) {
      this.isToolbarCollapsed = collapsed
    },
    setPropertyPanelCollapsed(collapsed: boolean) {
      this.isPropertyPanelCollapsed = collapsed
    },
    toggleMinimap() {
      this.showMinimap = !this.showMinimap
    },
    setMinimapVisible(visible: boolean) {
      this.showMinimap = visible
    },
    addRecentShape(type: string, iconName?: string) {
      const key = iconName ? `${type}:${iconName}` : type
      const existing = this.recentShapes.findIndex(item => {
        const itemKey = item.iconName ? `${item.type}:${item.iconName}` : item.type
        return itemKey === key
      })

      if (existing !== -1) {
        this.recentShapes.splice(existing, 1)
      }

      this.recentShapes.unshift({
        type,
        iconName,
        timestamp: Date.now()
      })

      if (this.recentShapes.length > MAX_RECENT_SHAPES) {
        this.recentShapes = this.recentShapes.slice(0, MAX_RECENT_SHAPES)
      }

      saveRecentShapesAsync(this.recentShapes).catch(console.error)
    },
    toggleFavorite(type: string, iconName?: string) {
      const key = iconName ? `${type}:${iconName}` : type
      const index = this.favoriteShapes.indexOf(key)

      if (index === -1) {
        this.favoriteShapes.push(key)
      } else {
        this.favoriteShapes.splice(index, 1)
      }

      saveFavoriteShapesAsync(this.favoriteShapes).catch(console.error)
    },
    isFavorite(type: string, iconName?: string): boolean {
      const key = iconName ? `${type}:${iconName}` : type
      return this.favoriteShapes.includes(key)
    },
    switchCoordinateSystem(system: 'top-left' | 'center') {
      const oldSystem = this.coordinateSystem
      this.coordinateSystem = system

      // 如果坐标系发生变化，转换所有图元位置
      if (oldSystem !== system && this.graph) {
        const { width, height } = this.canvasConfig
        const nodes = this.graph.getNodes()

        nodes.forEach(node => {
          const oldX = node.getPosition().x
          const oldY = node.getPosition().y

          const newPos = transformNodePosition(
            oldX,
            oldY,
            width,
            height,
            oldSystem,
            system
          )

          node.setPosition(newPos.x, newPos.y)
        })
      }
    },
    switchUnit(unit: 'px' | 'percent') {
      this.unit = unit
    }
  }
})
