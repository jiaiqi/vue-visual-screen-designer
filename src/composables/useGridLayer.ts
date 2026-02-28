import * as fabric from 'fabric'
import { useEditorStore } from '@/stores/editor'

export function useGridLayer(canvas: fabric.Canvas | null) {
  const editorStore = useEditorStore()

  let gridGroup: fabric.Group | null = null

  // 绘制无限网格线 (覆盖当前视窗并随动)
  function drawGrid() {
    if (!canvas) return
    const config = editorStore.config

    // 如果不需要显示网格线或者不存在实例
    if (!config.showGrid) {
      if (gridGroup) {
        gridGroup.visible = false
        canvas.requestRenderAll()
      }
      return
    }

    const gridSize = config.gridSize
    // 生成网格需要考虑当前的变换矩阵
    const vpt = canvas.viewportTransform
    if (!vpt) return

    // 清理旧网格 (或者更高级的做法是更新线条对象，这里为了简便先重建重绘)
    if (gridGroup) {
      canvas.remove(gridGroup)
    }

    const lines: fabric.Line[] = []

    // 假设一个极限的画布尺寸来画线 20000x20000
    const limit = 4000
    const start = -limit

    for (let i = start; i <= limit; i += gridSize) {
      lines.push(
        new fabric.Line([i, start, i, limit], {
          stroke: i === 0 ? '#ccc' : '#e0e0e0',
          strokeWidth: i === 0 ? 1.5 : 1,
          selectable: false,
          evented: false
        })
      )
      lines.push(
        new fabric.Line([start, i, limit, i], {
          stroke: i === 0 ? '#ccc' : '#e0e0e0',
          strokeWidth: i === 0 ? 1.5 : 1,
          selectable: false,
          evented: false
        })
      )
    }

    gridGroup = new fabric.Group(lines, {
      selectable: false,
      evented: false,
      excludeFromExport: true // 导出时不包含网格
    })

    canvas.insertAt(0, gridGroup) // 始终放在底层

    canvas.requestRenderAll()
  }

  function setupGridSystem() {
    if (!canvas) return
    drawGrid()
  }

  return {
    setupGridSystem,
    drawGrid
  }
}
