import * as fabric from 'fabric'
import { useEditorStore } from '@/stores/editor'
import { useHistoryStore } from '@/stores/history'

export function useExport() {
  const editorStore = useEditorStore()
  const historyStore = useHistoryStore()

  /**
   * 导出当前画布为带水印或透明通道的 PNG 格式
   */
  async function exportToPNG(filename: string = 'workshop-plan.png') {
    const canvas = editorStore.canvas
    if (!canvas) return

    // 可以在导出前做一些处理，例如清除选中框
    canvas.discardActiveObject()
    canvas.requestRenderAll()

    // 生成 Base64 图片
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2 // 导出两倍高清图
    })

    downloadFile(dataUrl, filename)
  }

  /**
   * 将当前工程完整导出为 JSON 描述文件
   */
  function exportToJSON(filename: string = 'workshop-project.json') {
    const canvas = editorStore.canvas
    if (!canvas) return

    const json = canvas.toJSON()

    // 包含一些元数据版本特征
    const projectData = {
      version: '1.0.0',
      timestamp: Date.now(),
      canvasObj: json
    }

    const jsonString = JSON.stringify(projectData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    downloadFile(url, filename)
    URL.revokeObjectURL(url)
  }

  /**
   * 打开系统文件选择器并恢复保存好的 JSON 工程
   */
  async function importFromJSON(file: File) {
    const canvas = editorStore.canvas
    if (!canvas) return

    try {
      const text = await file.text()
      const projectData = JSON.parse(text)

      const jsonObj = projectData.canvasObj || projectData // 兼容不同结构

      // 清除历史，防止误操作
      historyStore.clear()

      canvas.clear()
      await canvas.loadFromJSON(jsonObj)
      canvas.requestRenderAll()

      // 强行注入首张快照
      historyStore.save()
    } catch (error) {
      console.error('导入工程失败:', error)
      alert('无法解析此工程文件，请检查格式是否正确。')
    }
  }

  /**
   * 触发浏览器原生下载流
   */
  function downloadFile(url: string, filename: string) {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    exportToPNG,
    exportToJSON,
    importFromJSON
  }
}
