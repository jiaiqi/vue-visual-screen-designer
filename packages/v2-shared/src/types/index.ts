/**
 * V2 Shared package - Types
 * This module provides v2-specific type definitions
 */

import type { CanvasSchema, CanvasNode, EdgeSchema } from '@vue-visual-screen/core'

/**
 * V2 Designer Configuration
 */
export interface V2DesignerConfig {
  canvas: {
    width: number
    height: number
    scale: number
  }
  grid: {
    enabled: boolean
    size: number
    snap: boolean
  }
  theme: 'dark' | 'light'
}

/**
 * V2 Editor State
 */
export interface V2EditorState {
  schema: CanvasSchema
  selectedNodes: string[]
  selectedEdges: string[]
  history: {
    past: CanvasSchema[]
    present: CanvasSchema
    future: CanvasSchema[]
  }
}

/**
 * V2 Component Metadata
 */
export interface V2ComponentMeta {
  type: string
  name: string
  category: string
  icon: string
  description?: string
  defaultProps: Record<string, unknown>
  defaultSize: {
    width: number
    height: number
  }
}

/**
 * V2 Canvas Event
 */
export interface V2CanvasEvent {
  type: 'node:click' | 'node:drag' | 'edge:click' | 'canvas:click' | 'selection:change'
  payload: unknown
  timestamp: number
}
