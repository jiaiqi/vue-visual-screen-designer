/**
 * Core package - Core types
 * This module exports all core type definitions for the visual screen designer
 */

// Re-export all types from schema
export * from './schema'

// Core engine types
export interface CanvasManager {
  id: string
  schema: CanvasSchema
  nodes: Map<string, CanvasNode>
  edges: Map<string, EdgeSchema>
  datasources: Map<string, DataSourceConfig>
}

export interface RenderEngine {
  init(canvas: HTMLElement): void
  render(schema: CanvasSchema): void
  update(nodeId: string): void
  destroy(): void
}

export interface ComponentRegistry {
  register(meta: ComponentMeta): void
  get(type: string): ComponentMeta | undefined
  list(): ComponentMeta[]
  unregister(type: string): void
}

export interface GraphNodeRegistry {
  register(meta: GraphNodeMeta): void
  get(type: string): GraphNodeMeta | undefined
  list(): GraphNodeMeta[]
  unregister(type: string): void
}
