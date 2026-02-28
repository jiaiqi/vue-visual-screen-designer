import * as fabric from 'fabric'

/**
 * 智能辅助对齐线系统
 * 核心逻辑：在 object:moving 时，计算当前对象与画布上其他对象的 6 个对齐点（左、中、右、顶、中、底）
 */
export function useAlignmentGuides(canvas: fabric.Canvas) {
  const margin = 5 // 吸附阈值 (px)
  const aligningLineColor = 'rgba(255, 0, 0, 0.5)'
  const aligningLineWidth = 1

  // 用于存储动态生成的辅助线，避免重复创建销毁的开销
  let verticalLine: fabric.Line | null = null
  let horizontalLine: fabric.Line | null = null

  function initLines() {
    verticalLine = new fabric.Line([0, -1e6, 0, 1e6], {
      stroke: aligningLineColor,
      strokeWidth: aligningLineWidth,
      selectable: false,
      evented: false,
      visible: false,
      excludeFromExport: true
    })
    horizontalLine = new fabric.Line([-1e6, 0, 1e6, 0], {
      stroke: aligningLineColor,
      strokeWidth: aligningLineWidth,
      selectable: false,
      evented: false,
      visible: false,
      excludeFromExport: true
    })
    canvas.add(verticalLine, horizontalLine)
  }

  function onObjectMoving(opt: any) {
    const activeObject = opt.target as fabric.Object
    if (!activeObject) return

    const canvasObjects = canvas.getObjects().filter(obj =>
      obj !== activeObject &&
      obj !== verticalLine &&
      obj !== horizontalLine &&
      obj.visible &&
      obj.evented
    )

    const activeBounds = activeObject.getBoundingRect()
    const activeCenter = activeObject.getCenterPoint()

    let verticalInSnap = false
    let horizontalInSnap = false

    // 垂直对齐检查 (X 轴)
    const activeXPoints = [activeBounds.left, activeCenter.x, activeBounds.left + activeBounds.width]

    // 水平对齐检查 (Y 轴)
    const activeYPoints = [activeBounds.top, activeCenter.y, activeBounds.top + activeBounds.height]

    let snapX: number | null = null
    let snapY: number | null = null

    for (const obj of canvasObjects) {
      const b = obj.getBoundingRect()
      const c = obj.getCenterPoint()
      const taskXPoints = [b.left, c.x, b.left + b.width]
      const taskYPoints = [b.top, c.y, b.top + b.height]

      // 检查 X
      for (const activeX of activeXPoints) {
        for (const targetX of taskXPoints) {
          if (Math.abs(activeX - targetX) < margin) {
            snapX = targetX
            // 计算偏移量并修正位置
            activeObject.set('left', targetX - (activeX - activeObject.left))
            verticalInSnap = true
            break
          }
        }
        if (verticalInSnap) break
      }

      // 检查 Y
      for (const activeY of activeYPoints) {
        for (const targetY of taskYPoints) {
          if (Math.abs(activeY - targetY) < margin) {
            snapY = targetY
            activeObject.set('top', targetY - (activeY - activeObject.top))
            horizontalInSnap = true
            break
          }
        }
        if (horizontalInSnap) break
      }
    }

    // 更新辅助线状态
    if (verticalInSnap && snapX !== null && verticalLine) {
      verticalLine.set({ left: snapX, visible: true })
      canvas.bringObjectToFront(verticalLine)
    } else if (verticalLine) {
      verticalLine.visible = false
    }

    if (horizontalInSnap && snapY !== null && horizontalLine) {
      horizontalLine.set({ top: snapY, visible: true })
      canvas.bringObjectToFront(horizontalLine)
    } else if (horizontalLine) {
      horizontalLine.visible = false
    }

    canvas.requestRenderAll()
  }

  function onObjectModified() {
    if (verticalLine) verticalLine.visible = false
    if (horizontalLine) horizontalLine.visible = false
    canvas.requestRenderAll()
  }

  function setup() {
    initLines()
    canvas.on('object:moving', onObjectMoving)
    canvas.on('object:modified', onObjectModified)
    canvas.on('selection:cleared', onObjectModified)
  }

  return { setup }
}
