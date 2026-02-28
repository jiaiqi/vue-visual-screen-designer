import * as fabric from 'fabric'
import { WorkshopObjectType } from '@/types/editor'
import { usePipes } from './usePipes'

export function useDragDrop(canvas: fabric.Canvas | null) {
  const { createPipe, startFluidAnimation } = usePipes(canvas)

  function handleDragOver(e: DragEvent) {
    if (!canvas) return
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  function handleDrop(e: DragEvent) {
    if (!canvas) return
    e.preventDefault()

    const type = e.dataTransfer?.getData('application/x-shape-type')
    if (!type) return

    const rect = canvas.getElement().getBoundingClientRect()
    // 获取相对 canvas 元素的坐标
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 经由画布视区矩阵转换后的世界坐标
    const pointer = canvas.getScenePoint(e)

    createShape(type as WorkshopObjectType, { x: pointer.x, y: pointer.y })
  }


  function createShape(type: WorkshopObjectType, position: { x: number; y: number }) {
    if (!canvas) return
    let shape: fabric.Object

    switch (type) {
      case WorkshopObjectType.MACHINE:
        shape = new fabric.Rect({
          left: position.x,
          top: position.y,
          width: 100,
          height: 80,
          fill: '#ffb6c1',
          stroke: '#333',
          strokeWidth: 1,
          originX: 'center',
          originY: 'center'
        })
        break

      case WorkshopObjectType.AREA:
        shape = new fabric.Rect({
          left: position.x,
          top: position.y,
          width: 200,
          height: 150,
          fill: '#98fb98',
          stroke: '#333',
          strokeWidth: 1,
          opacity: 0.8,
          originX: 'center',
          originY: 'center'
        })
        break

      case 'circle' as WorkshopObjectType:
        shape = new fabric.Circle({
          left: position.x,
          top: position.y,
          radius: 40,
          fill: '#87cefa',
          stroke: '#333',
          strokeWidth: 1,
          originX: 'center',
          originY: 'center'
        })
        break

      case 'ellipse' as WorkshopObjectType:
        shape = new fabric.Ellipse({
          left: position.x,
          top: position.y,
          rx: 60,
          ry: 30,
          fill: '#dda0dd',
          stroke: '#333',
          strokeWidth: 1,
          originX: 'center',
          originY: 'center'
        })
        break

      case 'text' as WorkshopObjectType:
        shape = new fabric.IText('双击输入文字', {
          left: position.x,
          top: position.y,
          fontSize: 24,
          fill: '#333',
          fontFamily: 'sans-serif',
          originX: 'center',
          originY: 'center'
        })
        break

      case 'trapezoid' as WorkshopObjectType:
        // 通过多边形顶点制造梯形 (顶边 60, 底边 100, 高 60)
        shape = new fabric.Polygon([
          { x: 20, y: 0 },
          { x: 80, y: 0 },
          { x: 100, y: 60 },
          { x: 0, y: 60 }
        ], {
          left: position.x,
          top: position.y,
          fill: '#f0e68c',
          stroke: '#333',
          strokeWidth: 1,
          originX: 'center',
          originY: 'center'
        })
        break

      case 'arrow-single' as WorkshopObjectType:
        // 创建能拉长的块状单向箭头
        shape = new fabric.Polygon([
          { x: 0, y: 15 },
          { x: 60, y: 15 },
          { x: 60, y: 0 },
          { x: 100, y: 25 }, // 箭头尖点
          { x: 60, y: 50 },
          { x: 60, y: 35 },
          { x: 0, y: 35 }
        ], {
          left: position.x,
          top: position.y,
          fill: '#ffdab9',
          stroke: '#333',
          strokeWidth: 1,
          originX: 'center',
          originY: 'center'
        })
        break

      case 'arrow-double' as WorkshopObjectType:
        // 创建双向交互箭头：模拟左宽30，连接杆，右宽30
        shape = new fabric.Polygon([
          { x: 30, y: 0 },
          { x: 30, y: 15 },
          { x: 90, y: 15 },
          { x: 90, y: 0 },
          { x: 120, y: 25 }, // 右箭头
          { x: 90, y: 50 },
          { x: 90, y: 35 },
          { x: 30, y: 35 },
          { x: 30, y: 50 },
          { x: 0, y: 25 }   // 左箭头
        ], {
          left: position.x,
          top: position.y,
          fill: '#98fb98',
          stroke: '#333',
          strokeWidth: 1,
          originX: 'center',
          originY: 'center'
        })
        break

      case 'pipe' as any:
        shape = createPipe({
          pipeColor: '#64748b',
          fluidColor: '#0ea5e9',
          width: 24,
          speed: 2
        }) as any
        startFluidAnimation()
        break

      case 'rectangle' as WorkshopObjectType:
      default:
        shape = new fabric.Rect({
          left: position.x,
          top: position.y,
          width: 100,
          height: 100,
          fill: '#ddd',
          originX: 'center',
          originY: 'center'
        })
    }

    // 自定义数据注入
    shape.set('workshopType', type)

    canvas.add(shape)
    canvas.setActiveObject(shape)
    canvas.requestRenderAll()
    canvas.fire('object:added', { target: shape })
  }

  function setupDragDrop(wrapperElement: HTMLElement) {
    wrapperElement.addEventListener('dragover', handleDragOver)
    wrapperElement.addEventListener('drop', handleDrop)

    return () => {
      wrapperElement.removeEventListener('dragover', handleDragOver)
      wrapperElement.removeEventListener('drop', handleDrop)
    }
  }

  return {
    setupDragDrop,
    createShape
  }
}
