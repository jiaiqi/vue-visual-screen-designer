export interface EdgePreset {
  value: string
  label: string
}

export const EDGE_PRESETS: EdgePreset[] = [
  { value: 'water-flow', label: '流体管道 (Water)' },
  { value: 'electric-flow', label: '发光电流 (Electric)' },
  { value: 'arrow-flow', label: '跑马箭头 (Arrow)' },
  { value: 'particle-flow', label: '粒子流 (Particle)' },
  { value: 'pulse-flow', label: '脉冲波 (Pulse)' },
  { value: 'fluid-pipe', label: '基础 3D 管道' },
  { value: 'electric-line', label: '基础发光线' },
  { value: 'signal-line', label: '基础信号线' },
  { value: 'edge', label: '标准实线' },
]

export const REGISTERED_EDGE_SHAPES = EDGE_PRESETS
  .map((preset) => preset.value)
  .filter((shape) => shape !== 'edge')

export function isSupportedEdgeShape(shape: string): boolean {
  return EDGE_PRESETS.some((preset) => preset.value === shape)
}
