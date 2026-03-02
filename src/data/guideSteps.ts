export interface GuideStep {
  id: string
  target: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  shortcut?: string
}

export const guideSteps: GuideStep[] = [
  {
    id: 'welcome',
    target: '',
    title: '欢迎使用平面图编辑器',
    description: '这是一个功能强大的平面图设计工具，支持拖拽图元、连线布局、属性编辑等功能。让我们快速了解如何使用它！',
    position: 'center'
  },
  {
    id: 'toolbar',
    target: '[data-guide="toolbar"]',
    title: '左侧工具栏',
    description: '这里提供了各种基础图元和图标组件。你可以拖拽矩形、圆形、数据库、服务器等图元到画布中，也可以通过搜索快速找到需要的组件。',
    position: 'right'
  },
  {
    id: 'canvas',
    target: '[data-guide="canvas"]',
    title: '画布区域',
    description: '这是你的设计区域。点击选中图元，拖拽移动位置，双击编辑内容。支持多选、对齐、复制粘贴等操作。',
    position: 'left'
  },
  {
    id: 'property-panel',
    target: '[data-guide="property-panel"]',
    title: '右侧属性面板',
    description: '选中图元后，可以在这里调整位置、尺寸、颜色、边框等属性。未选中时显示画布全局设置。',
    position: 'left'
  },
  {
    id: 'header-actions',
    target: '[data-guide="header-actions"]',
    title: '顶部工具栏',
    description: '提供撤销重做、全选清空、缩放控制、导出图像等核心功能。支持导出为 PNG 或 SVG 格式。',
    position: 'bottom'
  },
  {
    id: 'shortcuts',
    target: '[data-guide="help-button"]',
    title: '快捷键支持',
    description: '编辑器支持丰富的快捷键操作：Ctrl+Z 撤销、Ctrl+Y 重做、Ctrl+C/V 复制粘贴、Delete 删除。点击此按钮可查看完整快捷键列表。',
    position: 'bottom',
    shortcut: 'Ctrl+Z / Ctrl+Y / Ctrl+C / Ctrl+V'
  }
]

export function getGuideSteps(): GuideStep[] {
  return guideSteps
}
