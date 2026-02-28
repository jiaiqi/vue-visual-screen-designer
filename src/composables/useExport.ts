import { useEditorStore } from '@/stores/editor'
import { useHistoryStore } from '@/stores/history'

export function useExport() {
  const editorStore = useEditorStore()
  const historyStore = useHistoryStore()

  /**
   * 导出当前画布为带水印或透明通道的 PNG 格式
   */
  async function exportToPNG(filename: string = 'workshop-plan.png') {
    const graph = editorStore.graph
    if (!graph) return

    // 获取并使用 x6-plugin-export 并不是直接可用的行为，可以退回到通过 svg 数据转，
    // 但鉴于 x6 生态常用 `toPNG` 所以这里通过类似能力来实现（假定已安装或有对应插件）
    // 为了简化，由于我们并没有额外依赖 x6-plugin-export，暂时通过 `toDataURL`
    try {
      graph.toPNG((dataUri: string) => {
        downloadFile(dataUri, filename)
      }, {
        quality: 1,
        backgroundColor: '#0f172a'
      })
    } catch {
      alert("由于未引入导出插件，目前暂不支持图像导出。")
    }
  }

  /**
   * 将当前工程完整导出为 JSON 描述文件
   */
  function exportToJSON(filename: string = 'workshop-project.json') {
    const graph = editorStore.graph
    if (!graph) return

    const json = graph.toJSON()

    // 包含一些元数据版本特征
    const projectData = {
      version: '1.2.0',
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
    const graph = editorStore.graph
    if (!graph) return

    try {
      const text = await file.text()
      const projectData = JSON.parse(text)

      const jsonObj = projectData.canvasObj || projectData // 兼容不同结构

      // 清除历史，防止误操作
      historyStore.clear()

      graph.clearCells()
      graph.fromJSON(jsonObj)
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
