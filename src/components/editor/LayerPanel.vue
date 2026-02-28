<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useSelectionStore } from '@/stores/selection'
import * as fabric from 'fabric'
import { Layers } from 'lucide-vue-next'

const editorStore = useEditorStore()
const selectionStore = useSelectionStore()

const layers = ref<fabric.Object[]>([])

function updateLayers() {
  if (!editorStore.canvas) return
  // 取出真正的可见对象，排除不可见或锁定的底层网格
  const objects = editorStore.canvas.getObjects().filter(o => o.evented !== false)
  // 底部元素在上，显示层级关系所以逆序排列展示
  layers.value = [...objects].reverse()
}

function selectLayer(obj: any) {
  if (!editorStore.canvas) return
  editorStore.canvas.discardActiveObject()
  editorStore.canvas.setActiveObject(obj)
  editorStore.canvas.requestRenderAll()
}

// 监听画布添加/删除对象
let listeners: any = null

onMounted(() => {
  // 等待 canvas 注入
  const checkCanvas = setInterval(() => {
    if (editorStore.canvas) {
      clearInterval(checkCanvas)
      const canvas = editorStore.canvas

      const refresh = () => updateLayers()

      canvas.on('object:added', refresh)
      canvas.on('object:removed', refresh)
      canvas.on('object:modified', refresh)

      listeners = refresh
      refresh()
    }
  }, 500)

  onUnmounted(() => {
    clearInterval(checkCanvas)
    if (editorStore.canvas && listeners) {
      editorStore.canvas.off('object:added', listeners)
      editorStore.canvas.off('object:removed', listeners)
      editorStore.canvas.off('object:modified', listeners)
    }
  })
})

function getLayerName(obj: any, index: number) {
  const name = obj.get('machineName') || obj.get('workshopType') || obj.type
  return name === 'composite' ? '预设设备' : name || `图层 ${index}`
}

// Vue 响应式的 target 追踪
function isSelected(obj: any) {
  return selectionStore.selectedObjects.some(o => o === obj)
}

function moveUp(obj: any, e: Event) {
  e.stopPropagation()
  if (!editorStore.canvas) return
  editorStore.canvas.bringObjectForward(obj)
  editorStore.canvas.requestRenderAll()
  updateLayers()
}

function moveDown(obj: any, e: Event) {
  e.stopPropagation()
  if (!editorStore.canvas) return
  editorStore.canvas.sendObjectBackwards(obj)
  editorStore.canvas.requestRenderAll()
  updateLayers()
}
</script>

<template>
  <div class="flex flex-col h-full bg-card relative">
    <div class="p-3 border-b flex items-center gap-2 bg-muted/20 shrink-0">
      <Layers class="w-4 h-4 text-muted-foreground" />
      <h2 class="text-sm font-semibold">图层管理</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-2 content-start">
      <div v-if="layers.length === 0" class="text-xs text-muted-foreground text-center p-4">
        暂无图形图层
      </div>
      <div class="flex flex-col gap-1">
        <div
          v-for="(layer, index) in layers"
          :key="(layer as any).id || index"
          @click="selectLayer(layer)"
          class="group flex items-center justify-between p-2 rounded text-sm cursor-pointer transition-all border border-transparent"
          :class="[
            isSelected(layer) ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'hover:bg-accent text-foreground'
          ]"
        >
          <div class="truncate flex-1 select-none">
            {{ getLayerName(layer, layers.length - index) }}
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" :class="{ 'opacity-100': isSelected(layer) }">
            <button @click="(e) => moveUp(layer, e)" title="上移一层" class="hover:bg-background rounded p-1 text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </button>
            <button @click="(e) => moveDown(layer, e)" title="下移一层" class="hover:bg-background rounded p-1 text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
