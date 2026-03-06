import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import { useNotifier } from '@/composables/useNotifier'

export function useExport() {
  const editorStore = useEditorStoreV2()
  const canvasStore = useCanvasStoreV2()
  const notifier = useNotifier()

  /**
   * 导出当前画布为带水印或透明通道的 PNG 格式
   */
  async function exportToPNG(filename: string = 'workshop-plan.png') {
    const graph = editorStore.graph
    if (!graph) return

    try {
      // 读取当前画布背景色（避免硬编码）
      const bgColor = canvasStore.config.backgroundColor || '#0f172a'
      graph.toPNG((dataUri: string) => {
        downloadFile(dataUri, filename)
      }, {
        quality: 1,
        backgroundColor: bgColor
      })
    } catch (e) {
      console.error('[Export] PNG 导出失败，请确保 @antv/x6 Export 插件已挂载:', e)
      notifier.error('PNG 导出失败', '请确认导出插件已挂载并重试。')
    }
  }

  /**
   * 导出当前画布为真实矢量 SVG 格式
   */
  async function exportToSVG(filename: string = 'workshop-plan.svg') {
    const graph = editorStore.graph
    if (!graph) return

    try {
      graph.toSVG((dataUri: string) => {
        // 由于 VITE 插件和各种开发环境扩展偶尔会深度污染或者将整个 html 页面作为 foreign 包裹进来
        // 我们只需确保取到单纯的纯净 <svg> XML 即可，这也能阻断 "xmlParseEntityRef"
        let svgContent = dataUri

        // 如果是 base64 或 utf-8 的 uri 前缀，先剔除转回纯文本
        if (svgContent.startsWith('data:image/svg+xml;utf8,')) {
          const splitData = svgContent.split('data:image/svg+xml;utf8,')[1] || ''
          svgContent = decodeURIComponent(splitData)
        }

        // 解剖截取核心 SVG 内容（规避前置的 <!DOCTYPE 等导致浏览器当成 HTML 执行脚本报错）
        const svgStart = svgContent.indexOf('<svg')
        const svgEnd = svgContent.lastIndexOf('</svg>') + 6
        if (svgStart !== -1 && svgEnd !== -1) {
          svgContent = svgContent.substring(svgStart, svgEnd)
          // 清洗混入的各类异常 script 标签
          svgContent = svgContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        }

        // 把洗干净的 SVG 转为新的 data URI 再执行下载
        const cleanUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent)
        downloadFile(cleanUri, filename)
      }, {
        preserveDimensions: true,
        // 由于第三方如 vite-dev-server 或 console-ninja 等热更新注入会导致极高概率的 XML 非法字符注入且无法单纯用 stylesheet 回调处理
        // 所以我们转为拦截生成的 SVG 内容
        copyStyles: false
      })
    } catch {
      notifier.error('SVG 导出失败', '由于导出插件不可用，当前无法导出 SVG。')
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

      graph.clearCells()
      graph.fromJSON(jsonObj)
    } catch (error) {
      console.error('导入工程失败:', error)
      notifier.error('导入工程失败', '无法解析该工程文件，请检查 JSON 格式。')
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
    exportToSVG,
    exportToJSON,
    importFromJSON
  }
}
