import * as fabric from 'fabric'

export interface CompositeMachineSpec {
  id: string
  name: string
  width: number
  height: number
  objects: fabric.Object[]
}

export const MachineLibrary: Record<string, () => CompositeMachineSpec> = {
  // 示例 1：CNC 数控机床（一个深灰色底座组合一个浅色操作台和指示灯）
  'cnc-machine': () => {
    const base = new fabric.Rect({
      left: 0,
      top: 0,
      width: 120,
      height: 100,
      fill: '#475569',
      rx: 4,
      ry: 4,
    })

    const panel = new fabric.Rect({
      left: 10,
      top: 10,
      width: 40,
      height: 80,
      fill: '#94a3b8',
      rx: 2,
      ry: 2,
    })

    const screen = new fabric.Rect({
      left: 15,
      top: 20,
      width: 30,
      height: 25,
      fill: '#0f172a',
    })

    // 绿色可运行状态灯
    const statusLight = new fabric.Circle({
      left: 30,
      top: 60,
      radius: 5,
      fill: '#22c55e',
    })

    // 加工台面
    const workbed = new fabric.Rect({
      left: 60,
      top: 20,
      width: 50,
      height: 60,
      fill: '#cbd5e1',
    })

    const text = new fabric.Text('CNC', {
      left: 85,
      top: 50,
      fontSize: 14,
      fill: '#64748b',
      originX: 'center',
      originY: 'center',
      fontWeight: 'bold'
    })

    return {
      id: 'cnc-machine',
      name: '数控机床',
      width: 120,
      height: 100,
      objects: [base, panel, screen, statusLight, workbed, text]
    }
  },

  // 示例 2：装配作业台（双工位圆角桌子）
  'assembly-station': () => {
    const table = new fabric.Rect({
      left: 0,
      top: 0,
      width: 200,
      height: 80,
      fill: '#fde047',
      rx: 8,
      ry: 8,
    })

    const worker1Zone = new fabric.Circle({
      left: 50,
      top: 80,
      radius: 12,
      fill: '#3b82f6',
      originX: 'center',
      originY: 'center'
    })

    const worker2Zone = new fabric.Circle({
      left: 150,
      top: 80,
      radius: 12,
      fill: '#3b82f6',
      originX: 'center',
      originY: 'center'
    })

    const text = new fabric.Text('装配作业台', {
      left: 100,
      top: 40,
      fontSize: 16,
      fill: '#854d0e',
      originX: 'center',
      originY: 'center',
      fontWeight: 'bold'
    })

    return {
      id: 'assembly-station',
      name: '装配站',
      width: 200,
      height: 80,
      objects: [table, worker1Zone, worker2Zone, text]
    }
  }
}
