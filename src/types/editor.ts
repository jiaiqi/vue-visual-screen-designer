export type ObjectId = string

export enum ObjectType {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  PATH = 'path',
  TEXT = 'text',
  GROUP = 'group',
  IMAGE = 'image'
}

export enum WorkshopObjectType {
  MACHINE = 'machine',
  AREA = 'area',
  PATH = 'path',
  DOOR = 'door',
  LABEL = 'label'
}

export interface BaseObject {
  id: ObjectId
  type: ObjectType
  workshopType?: WorkshopObjectType
  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  visible: boolean
  locked: boolean
  zIndex: number
  name?: string
  description?: string
  createdAt: number
  updatedAt: number
}

// Additional specific object interfaces can extend BaseObject
// Canvas and Editor configurations...

export interface CanvasConfig {
  width: number
  height: number
  backgroundColor: string
  grid: {
    enabled: boolean
    size: number
    color: string
    subdivisions: number
  }
  rulers: {
    enabled: boolean
    unit: 'px' | 'mm' | 'cm'
  }
}

export interface EditorState {
  mode: 'select' | 'draw' | 'pan' | 'edit'
  currentTool: string
  selectedIds: ObjectId[]
  hoveredId?: ObjectId
}

export interface ProjectData {
  version: string
  name: string
  description?: string
  canvas: CanvasConfig
  objects: any[]
  createdAt: number
  updatedAt: number
}
