<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useSelectionStore } from '@/stores/selection'
import {
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Trash2,
  Lock,
  Unlock,
  Layers
} from 'lucide-vue-next'

const editorStore = useEditorStore()
const selectionStore = useSelectionStore()

const visible = ref(false)
const top = ref(0)
const left = ref(0)

const activeObject = computed(() => selectionStore.selectedObjects[0])
const isLocked = computed(() => (activeObject.value as any)?.locked)

function show(e: MouseEvent) {
  e.preventDefault()
  visible.value = true
  top.value = e.clientY
  left.value = e.clientX
}

function hide() {
  visible.value = false
}

// 核心操作函数 - 适配 Fabric 6.x
function bringToFront() {
  const obj = activeObject.value
  const canvas = editorStore.canvas as any
  if (obj && canvas) {
    canvas.bringObjectToFront(obj)
    canvas.requestRenderAll()
  }
  hide()
}

function sendToBack() {
  const obj = activeObject.value
  const canvas = editorStore.canvas as any
  if (obj && canvas) {
    canvas.sendObjectToBack(obj)
    canvas.requestRenderAll()
  }
  hide()
}

function bringForward() {
  const obj = activeObject.value
  const canvas = editorStore.canvas as any
  if (obj && canvas) {
    canvas.bringObjectForward(obj)
    canvas.requestRenderAll()
  }
  hide()
}

function sendBackwards() {
  const obj = activeObject.value
  const canvas = editorStore.canvas as any
  if (obj && canvas) {
    canvas.sendObjectBackwards(obj)
    canvas.requestRenderAll()
  }
  hide()
}

function deleteObject() {
  const canvas = editorStore.canvas
  if (!canvas) return
  const activeObjects = canvas.getActiveObjects()
  activeObjects.forEach(obj => canvas.remove(obj))
  canvas.discardActiveObject()
  canvas.requestRenderAll()
  hide()
}

function toggleLock() {
  const obj = activeObject.value as any
  if (!obj || !editorStore.canvas) return

  const locked = !obj.locked
  obj.set({
    locked: locked,
    selectable: !locked,
    hasControls: !locked,
    evented: true,
    lockMovementX: locked,
    lockMovementY: locked,
    lockRotation: locked,
    lockScalingX: locked,
    lockScalingY: locked
  } as any)

  if (locked) {
    editorStore.canvas.discardActiveObject()
  }
  editorStore.canvas.requestRenderAll()
  editorStore.canvas.fire('after:render')
  hide()
}

onMounted(() => {
  window.addEventListener('click', hide)
})

onUnmounted(() => {
  window.removeEventListener('click', hide)
})

defineExpose({ show, hide })
</script>

<template>
  <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in"
    leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
    <div v-if="visible"
      class="fixed z-[9999] min-w-[180px] bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-2 py-2 flex flex-col gap-0.5"
      :style="{ top: top + 'px', left: left + 'px' }" @click.stop @contextmenu.prevent>
      <!-- 层级管理组 -->
      <div
        class="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        <Layers class="w-2.5 h-2.5" />
        层级排序
      </div>

      <button @click="bringToFront" class="menu-item group" :disabled="!activeObject">
        <ChevronsUp class="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
        <span>置于顶层</span>
      </button>

      <button @click="bringForward" class="menu-item group" :disabled="!activeObject">
        <ArrowUp class="w-4 h-4 text-blue-500 group-hover:-translate-y-0.5 transition-transform" />
        <span>上移一层</span>
      </button>

      <button @click="sendBackwards" class="menu-item group" :disabled="!activeObject">
        <ArrowDown class="w-4 h-4 text-orange-500 group-hover:translate-y-0.5 transition-transform" />
        <span>下移一层</span>
      </button>

      <button @click="sendToBack" class="menu-item group" :disabled="!activeObject">
        <ChevronsDown class="w-4 h-4 text-slate-400 group-hover:scale-90 transition-transform" />
        <span>置于底层</span>
      </button>

      <div class="my-1.5 h-[1px] bg-slate-100/80 mx-2"></div>

      <!-- 状态管理组 -->
      <button @click="toggleLock" class="menu-item group" :disabled="!activeObject"
        :class="{ 'text-amber-600 bg-amber-50/50 hover:bg-amber-100/50': isLocked }">
        <component :is="isLocked ? Unlock : Lock" class="w-4 h-4"
          :class="isLocked ? 'text-amber-500' : 'text-slate-400'" />
        <span>{{ isLocked ? '解锁对象' : '锁定对象' }}</span>
      </button>

      <div class="my-1.5 h-[1px] bg-slate-100/80 mx-2"></div>

      <!-- 危险组 -->
      <button @click="deleteObject" class="menu-item group hover:bg-red-50 hover:text-red-600 transition-colors"
        :disabled="!activeObject">
        <Trash2 class="w-4 h-4 text-slate-300 group-hover:text-red-500" />
        <span>删除选中</span>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.menu-item {
  @apply flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all active:scale-[0.98] text-left disabled:opacity-30 disabled:pointer-events-none;
}
</style>