import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import type { Graph } from '@antv/x6'
import type { ThemeMode } from '@/types/editor'

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
}

const GUIDE_STORAGE_KEY = 'vue-fabric-editor-guide-completed'
const RECENT_SHAPES_KEY = 'vue-fabric-editor-recent-shapes'
const FAVORITE_SHAPES_KEY = 'vue-fabric-editor-favorite-shapes'
const MAX_RECENT_SHAPES = 6

function loadRecentShapes(): RecentShapeItem[] {
  try {
    const saved = localStorage.getItem(RECENT_SHAPES_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function loadFavoriteShapes(): string[] {
  try {
    const saved = localStorage.getItem(FAVORITE_SHAPES_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveRecentShapes(shapes: RecentShapeItem[]) {
  localStorage.setItem(RECENT_SHAPES_KEY, JSON.stringify(shapes))
}

function saveFavoriteShapes(favorites: string[]) {
  localStorage.setItem(FAVORITE_SHAPES_KEY, JSON.stringify(favorites))
}

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null
    const hasSeenGuide = localStorage.getItem(GUIDE_STORAGE_KEY) === 'true'
    return {
      mode: 'select',
      currentTool: 'select',
      graph: null,
      theme: savedTheme || 'dark',
      hasSeenGuide,
      isToolbarCollapsed: false,
      isPropertyPanelCollapsed: false,
      showMinimap: true,
      recentShapes: loadRecentShapes(),
      favoriteShapes: loadFavoriteShapes(),
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
      }
    }
  },
  actions: {
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
      localStorage.setItem('theme', theme)
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
      localStorage.setItem(GUIDE_STORAGE_KEY, 'true')
    },
    resetGuide() {
      this.hasSeenGuide = false
      localStorage.removeItem(GUIDE_STORAGE_KEY)
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

      saveRecentShapes(this.recentShapes)
    },
    toggleFavorite(type: string, iconName?: string) {
      const key = iconName ? `${type}:${iconName}` : type
      const index = this.favoriteShapes.indexOf(key)

      if (index === -1) {
        this.favoriteShapes.push(key)
      } else {
        this.favoriteShapes.splice(index, 1)
      }

      saveFavoriteShapes(this.favoriteShapes)
    },
    isFavorite(type: string, iconName?: string): boolean {
      const key = iconName ? `${type}:${iconName}` : type
      return this.favoriteShapes.includes(key)
    }
  }
})
