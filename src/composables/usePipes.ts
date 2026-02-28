import * as fabric from 'fabric'
import { ref, onUnmounted } from 'vue'

export function usePipes(canvas: fabric.Canvas | null) {
  const isAnimating = ref(false)
  let animationId: number | null = null

  /**
   * 创建工业级拟真管道 (V4 - 解决图层冗余与显示问题)
   * 采用 Group 模式，但内部子对象手动联动 width 以保护端点圆角
   */
  function createPipeV4(options: any = {}) {
    if (!canvas) return null

    const length = 200
    const pipeWidth = options.width || 24
    const pipeColor = options.pipeColor || '#64748b'
    const fluidColor = options.fluidColor || '#0ea5e9'
    const flowDirection = options.flowDirection || 1

    // 1. 管身背景渐变
    const pipeGradient = new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'pixels',
      coords: { x1: 0, y1: 0, x2: 0, y2: pipeWidth },
      colorStops: [
        { offset: 0, color: '#1e293b' },
        { offset: 0.2, color: pipeColor },
        { offset: 0.5, color: '#ffffff' },
        { offset: 0.8, color: pipeColor },
        { offset: 1, color: '#0f172a' }
      ]
    })

    // 2. 主管道 (外壁) - 使用 Rect 模拟 Path 效果以便缩放处理
    const body = new fabric.Rect({
      left: -length / 2,
      top: -pipeWidth / 2,
      width: length,
      height: pipeWidth,
      rx: pipeWidth / 2,
      ry: pipeWidth / 2,
      fill: pipeGradient,
      stroke: '#0f172a',
      strokeWidth: 1,
      strokeUniform: true,
    })

    // 3. 流体层 (内芯)
    const fluid = new fabric.Rect({
      left: -length / 2 + 6,
      top: -pipeWidth / 2 + 4,
      width: length - 12,
      height: pipeWidth - 8,
      rx: (pipeWidth - 8) / 2,
      ry: (pipeWidth - 8) / 2,
      fill: 'transparent',
      stroke: fluidColor,
      strokeWidth: pipeWidth - 10,
      strokeDashArray: [20, 30],
      strokeLineCap: 'round',
      opacity: 0.8,
    })

    // 4. 封装为一个 Group，这样图层管理只会显示一个
    const group = new fabric.Group([body, fluid], {
      left: 200,
      top: 200,
      selectable: true,
      hasControls: true,
      lockScalingY: true,
      originX: 'center',
      originY: 'center',
      transparentCorners: false,
      cornerColor: '#0ea5e9',
      cornerStyle: 'circle',
      cornerSize: 8,
      strokeUniform: true
    })

    // 注入元数据
    const g = group as any
    g.workshopType = 'pipe'
    g.body = body
    g.fluidLayer = fluid
    g.fluidSpeed = options.speed || 2
    g.flowDirection = flowDirection

    // 核心：处理缩放（9-Slice 逻辑）
    // 我们拦截 scaling 事件，手动更新内部组件的宽度，而不是让 group 整体缩放产生变形
    group.on('scaling', () => {
      const scaleX = group.scaleX || 1
      const newLength = length * scaleX

      // 更新子对象
      body.set({
        width: newLength,
        left: -newLength / 2,
        rx: pipeWidth / 2, // 保护圆角
        ry: pipeWidth / 2
      })
      fluid.set({
        width: newLength - 12,
        left: -newLength / 2 + 6,
        rx: (pipeWidth - 8) / 2,
        ry: (pipeWidth - 8) / 2
      })

      // 重置 Group 的缩放倍率，将其转化为内部对象的 width 变化
      group.set({
        scaleX: 1,
        width: newLength
      })

      canvas.requestRenderAll()
    })

    canvas.add(group)
    canvas.requestRenderAll()
    return group
  }

  function startFluidAnimation() {
    if (isAnimating.value) return
    isAnimating.value = true

    const animate = () => {
      if (!canvas || !isAnimating.value) return
      const objects = canvas.getObjects()
      let hasPipes = false

      objects.forEach(obj => {
        const p = obj as any
        if (p.workshopType === 'pipe' && p.fluidLayer) {
          hasPipes = true
          const speed = (p.fluidSpeed || 2) * (p.flowDirection || 1)
          const currentOffset = p.fluidLayer.strokeDashOffset || 0
          p.fluidLayer.set('strokeDashOffset', currentOffset - speed)
        }
      })

      if (hasPipes) canvas.requestRenderAll()
      animationId = fabric.util.requestAnimFrame(animate)
    }
    animate()
  }

  function stopFluidAnimation() {
    isAnimating.value = false
    if (animationId) {
      fabric.util.cancelAnimFrame(animationId)
      animationId = null
    }
  }

  onUnmounted(() => stopFluidAnimation())

  return {
    createPipe: createPipeV4,
    startFluidAnimation,
    stopFluidAnimation,
    isAnimating
  }
}
