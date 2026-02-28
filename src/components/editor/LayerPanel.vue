<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useSelectionStore } from '@/stores/selection'
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Square,
  Circle,
  Type,
  MoveRight,
  ScanLine,
  LayoutGrid,
  Lock,
  Unlock
} from 'lucide-vue-next'

const editorStore = useEditorStore()
const selectionStore = useSelectionStore()

const layers = ref<any[]>([])

function updateLayers() {
  if (!editorStore.canvas) return
  const objects = editorStore.canvas.getObjects().filter(o => o.evented !== false)
  layers.value = objects.map(obj => ({
    id: (obj as any).id || Math.random().toString(36).slice(2),
    name: (obj as any).id || obj.type,
    type: obj.type || 'unknown',
    visible: obj.visible,
    locked: (obj as any).locked || !obj.selectable,
    selected: selectionStore.selectedObjects.includes(obj),
    raw: obj
  })).reverse()
}

function getIcon(type: string) {
  const t = type.toLowerCase()
  if (t.includes('rect')) return Square
  if (t.includes('circle')) return Circle
  if (t.includes('ellipse')) return Circle
  if (t.includes('text')) return Type
  if (t.includes('polygon')) return ScanLine
  if (t.includes('path')) return MoveRight
  if (t.includes('group')) return LayoutGrid
  return Square
}

function selectLayer(rawObj: any) {
  if (!editorStore.canvas) return
  editorStore.canvas.discardActiveObject()
  editorStore.canvas.setActiveObject(rawObj)
  editorStore.canvas.requestRenderAll()
}

function toggleVisible(rawObj: any) {
  rawObj.set('visible', !rawObj.visible)
  editorStore.canvas?.requestRenderAll()
  updateLayers()
}

function toggleLock(rawObj: any) {
  const isLocked = !(rawObj as any).locked
  rawObj.set({
    locked: isLocked,
    selectable: !isLocked,
    evented: true,
    hasControls: !isLocked,
    lockMovementX: isLocked,
    lockMovementY: isLocked,
    lockRotation: isLocked,
    lockScalingX: isLocked,
    lockScalingY: isLocked
  } as any)
  if (isLocked) {
    editorStore.canvas?.discardActiveObject()
  }
  editorStore.canvas?.requestRenderAll()
  updateLayers()
}

function deleteLayer(rawObj: any) {
  editorStore.canvas?.remove(rawObj)
  editorStore.canvas?.requestRenderAll()
  updateLayers()
}

onMounted(() => {
  const checkCanvas = setInterval(() => {
    if (editorStore.canvas) {
      clearInterval(checkCanvas)
      const canvas = editorStore.canvas
      canvas.on('after:render', updateLayers)
      updateLayers()
    }
  }, 100)

  onUnmounted(() => {
    clearInterval(checkCanvas)
    editorStore.canvas?.off('after:render', updateLayers)
  })
})
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50/40">
    <div
      class="p-4 border-b bg-white/50 backdrop-blur-sm flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-2">
        <div class="w-1 h-4 bg-slate-900 rounded-full"></div>
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">图层管理</h3>
      </div>
      <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{{ layers.length }}</span>
    </div>

    <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
      <div v-if="layers.length === 0" class="flex flex-col items-center justify-center h-40 text-slate-300 opacity-60">
        <Layers class="w-10 h-10 mb-2 stroke-[1.5]" />
        <p class="text-xs font-medium">暂无图形图层</p>
      </div>

      <div v-for="layer in layers" :key="layer.id" @click="selectLayer(layer.raw)"
        class="group flex items-center justify-between p-3 rounded-xl border bg-white cursor-pointer transition-all duration-200 hover:border-slate-900 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
        :class="[
          layer.selected ? 'border-slate-900 shadow-sm ring-1 ring-slate-900 ring-offset-1' : 'border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]',
          layer.locked ? 'opacity-60 bg-slate-50/50 grayscale-[0.2]' : ''
        ]">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors"
            :class="{ '!bg-amber-100 !text-amber-600': layer.locked }">
            <component :is="getIcon(layer.type)" class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-700 truncate max-w-[120px]"
              :class="{ 'line-through text-slate-400': layer.locked }">{{ layer.name }}</span>
            <span class="text-[10px] text-slate-400 uppercase tracking-tight">{{ layer.type }}</span>
          </div>
        </div>

        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          :class="{ 'opacity-100': layer.locked }">
          <button @click.stop="toggleLock(layer.raw)"
            class="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900"
            :class="{ 'text-amber-600 bg-amber-50': layer.locked }" :title="layer.locked ? '解锁' : '锁定'">
            <component :is="layer.locked ? Lock : Unlock" class="w-3.5 h-3.5" />
          </button>
          <button @click.stop="toggleVisible(layer.raw)"
            class="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900"
            :title="layer.visible ? '隐藏' : '显示'">
            <component :is="layer.visible ? Eye : EyeOff" class="w-3.5 h-3.5" />
          </button>
          <button @click.stop="deleteLayer(layer.raw)"
            class="p-1 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600" title="删除">
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>