import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import { useExport } from '@/composables/useExport'

export function useEditorCommands() {
  const editorStore = useEditorStoreV2()
  const canvasStore = useCanvasStoreV2()
  const exportApi = useExport()

  function zoomBy(delta: number) {
    canvasStore.setZoom(canvasStore.viewport.zoom + delta)
  }

  function resetZoom() {
    canvasStore.setZoom(1)
  }

  function clearCanvas() {
    editorStore.clearCanvas()
  }

  return {
    undo: editorStore.undo,
    redo: editorStore.redo,
    canUndo: editorStore.canUndo,
    canRedo: editorStore.canRedo,
    zoomBy,
    resetZoom,
    clearCanvas,
    exportToPNG: exportApi.exportToPNG,
    exportToSVG: exportApi.exportToSVG,
    exportToJSON: exportApi.exportToJSON,
    importFromJSON: exportApi.importFromJSON,
  }
}
