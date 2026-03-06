/**
 * V2 Shared package - Validators
 * This module provides validation utilities for v2-specific data
 */

import type { CanvasSchema, CanvasNode } from '@vue-visual-screen/core'

/**
 * Validate Canvas Schema
 */
export function validateCanvasSchema(schema: CanvasSchema): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!schema.version) {
    errors.push('Schema version is required')
  }

  if (!schema.canvas) {
    errors.push('Canvas configuration is required')
  }

  if (!Array.isArray(schema.nodes)) {
    errors.push('Nodes must be an array')
  }

  if (!Array.isArray(schema.edges)) {
    errors.push('Edges must be an array')
  }

  // Validate node IDs are unique
  const nodeIds = new Set<string>()
  schema.nodes.forEach((node) => {
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node ID: ${node.id}`)
    }
    nodeIds.add(node.id)
  })

  // Validate edge references
  schema.edges.forEach((edge) => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge references non-existent source node: ${edge.source}`)
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge references non-existent target node: ${edge.target}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate Node Layout
 */
export function validateNodeLayout(node: CanvasNode): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!node.id) {
    errors.push('Node ID is required')
  }

  if (typeof node.layout.x !== 'number') {
    errors.push('Node layout x must be a number')
  }

  if (typeof node.layout.y !== 'number') {
    errors.push('Node layout y must be a number')
  }

  if (typeof node.layout.width !== 'number' || node.layout.width <= 0) {
    errors.push('Node layout width must be a positive number')
  }

  if (typeof node.layout.height !== 'number' || node.layout.height <= 0) {
    errors.push('Node layout height must be a positive number')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate Component Props
 */
export function validateComponentProps(
  props: Record<string, unknown>,
  schema?: Record<string, unknown>
): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!schema) {
    // If no schema provided, just check if props is an object
    if (typeof props !== 'object' || props === null) {
      errors.push('Props must be an object')
    }
    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // Validate against schema
  Object.keys(schema).forEach((key) => {
    const expectedType = (schema[key] as { type?: string })?.type
    const value = props[key]

    if (value === undefined) {
      // Optional field
      return
    }

    if (expectedType && typeof value !== expectedType) {
      errors.push(`Prop ${key} should be of type ${expectedType}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
