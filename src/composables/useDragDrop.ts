import * as fabric from 'fabric'
import { WorkshopObjectType } from '@/types/editor'
import { MachineLibrary } from '@/config/machines'

export function useDragDrop(canvas: fabric.Canvas | null) {

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

    if (type.startsWith('composite:')) {
      const machineId = type.split(':')[1]
      if (machineId) {
        createCompositeMachine(machineId, { x: pointer.x, y: pointer.y })
      }
    } else {
      createShape(type as WorkshopObjectType, { x: pointer.x, y: pointer.y })
    }
  }

  function createCompositeMachine(machineId: string, position: { x: number; y: number }) {
    if (!canvas) return
    const factory = MachineLibrary[machineId]
    if (!factory) return

    const spec = factory()
    const group = new fabric.Group(spec.objects, {
      left: position.x,
      top: position.y,
      originX: 'center',
      originY: 'center',
      subTargetCheck: true, // 允许事件穿透选择子元素
    })

    // 设置特有指代字段供属性面板解析
    group.set('workshopType', 'composite')
    group.set('machineId', spec.id)
    group.set('machineName', spec.name)

    canvas.add(group)
    canvas.setActiveObject(group)
    canvas.requestRenderAll()

    // 派发创建事件让外界（如履历）能监听到
    canvas.fire('object:added', { target: group })
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
