const BUILTIN_NODE_SHAPES = new Set([
  'rect',
  'circle',
  'polygon',
  'image',
  'path',
])

export const CUSTOM_NODE_SHAPES = [
  'border-tech',
  'border-glow',
  'border-gradient',
  'divider-h',
  'divider-v',
  'decoration-corner',
  'decoration-line',
  'button-primary',
  'button-default',
  'flow-start',
  'flow-end',
  'flow-process',
  'flow-decision',
  'dashboard-container',
  'cooling-fan',
  'storage-tank',
  'icon-node',
  'progress-node',
  'digital-node',
  'chart-node',
  'table-basic',
  'list-rank',
  'timeline-h',
  'countdown',
  'gauge-node',
  'alert-node',
] as const

const CUSTOM_NODE_SHAPE_SET = new Set<string>(CUSTOM_NODE_SHAPES)

export function isKnownNodeShape(shape: string): boolean {
  return BUILTIN_NODE_SHAPES.has(shape) || CUSTOM_NODE_SHAPE_SET.has(shape)
}

export function isCustomNodeShape(shape: string): boolean {
  return CUSTOM_NODE_SHAPE_SET.has(shape)
}
