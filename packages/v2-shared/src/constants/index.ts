/**
 * V2 Shared package - Constants
 * This module provides v2-specific constants
 */

/**
 * Default Canvas Size
 */
export const DEFAULT_CANVAS_SIZE = {
  width: 1920,
  height: 1080,
}

/**
 * Default Grid Configuration
 */
export const DEFAULT_GRID_CONFIG = {
  enabled: true,
  size: 20,
  snap: true,
}

/**
 * Component Categories
 */
export const COMPONENT_CATEGORIES = [
  'chart',
  'map',
  'data',
  'decoration',
  'container',
  'media',
  'graph',
] as const

/**
 * Event Types
 */
export const EVENT_TYPES = {
  NODE_CLICK: 'node:click',
  NODE_DRAG: 'node:drag',
  EDGE_CLICK: 'edge:click',
  CANVAS_CLICK: 'canvas:click',
  SELECTION_CHANGE: 'selection:change',
} as const

/**
 * Keyboard Shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  DELETE: 'Delete',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  SAVE: 'Ctrl+S',
  SELECT_ALL: 'Ctrl+A',
} as const
