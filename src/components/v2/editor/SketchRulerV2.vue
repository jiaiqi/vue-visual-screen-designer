<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { Lock, Unlock, Grid3X3, LayoutGrid, Trash2 } from 'lucide-vue-next'
import RulerV2 from './RulerV2.vue'

interface Props {
  scale: number
  startX: number
  startY: number
  thick?: number
  width: number
  height: number
  canvasWidth: number
  canvasHeight: number
  lines: {
    h: number[]
    v: number[]
  }
  showRuler?: boolean
  showReferLine?: boolean
  lockLine?: boolean
  palette?: {
    bgColor?: string
    longfgColor?: string
    shortfgColor?: string
    fontColor?: string
    lineColor?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  thick: 20,
  showRuler: true,
  showReferLine: true,
  lockLine: false,
  palette: () => ({
    bgColor: 'rgba(2, 6, 23, 0.9)',
    longfgColor: '#475569',
    shortfgColor: '#334155',
    fontColor: '#94a3b8',
    lineColor: '#22c55e'
  })
})

const emit = defineEmits(['update:lines', 'update:lockLine', 'update:showReferLine'])

const containerRef = ref<HTMLElement>()

// 拖拽辅助线状态
const dragStatus = reactive({
  isDragging: false,
  type: 'h' as 'h' | 'v',
  index: -1, // -1 表示新生成的线
  currentPos: 0
})

const onRulerMouseDown = (type: 'h' | 'v', e: MouseEvent) => {
  if (props.lockLine) return
  dragStatus.isDragging = true
  dragStatus.type = type // h -> 顶部标尺产生横线, v -> 左侧标尺产生纵线
  dragStatus.index = -1

  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  dragStatus.currentPos = type === 'h' ? e.clientY - rect.top : e.clientX - rect.left
}

const onLineMouseDown = (type: 'h' | 'v', index: number, e: MouseEvent) => {
  if (props.lockLine) return
  e.stopPropagation()
  dragStatus.isDragging = true
  dragStatus.type = type
  dragStatus.index = index

  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  dragStatus.currentPos = type === 'h' ? e.clientY - rect.top : e.clientX - rect.left
}

const handleMouseMove = (e: MouseEvent) => {
  if (!dragStatus.isDragging || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  if (dragStatus.type === 'h') {
    dragStatus.currentPos = e.clientY - rect.top
  } else {
    dragStatus.currentPos = e.clientX - rect.left
  }
}

const handleMouseUp = () => {
  if (!dragStatus.isDragging) return

  const pos = dragStatus.currentPos
  const isH = dragStatus.type === 'h'
  const isDelete = pos < props.thick

  const newLines = JSON.parse(JSON.stringify(props.lines))
  const targetArray = isH ? newLines.h : newLines.v
  const logicStart = isH ? props.startY : props.startX
  const logicPos = Math.round(logicStart + (pos - props.thick) / props.scale)

  // 越界删除逻辑：如果逻辑坐标不在画布 [0, width/height] 范围内，也视为删除
  const isOutOfRange = isH
    ? (logicPos < 0 || logicPos > props.canvasHeight)
    : (logicPos < 0 || logicPos > props.canvasWidth)

  if (dragStatus.index === -1) {
    if (!isDelete && !isOutOfRange) {
      targetArray.push(logicPos)
    }
  } else {
    if (isDelete || isOutOfRange) {
      targetArray.splice(dragStatus.index, 1)
    } else {
      targetArray[dragStatus.index] = logicPos
    }
  }

  emit('update:lines', newLines)
  dragStatus.isDragging = false
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="sketch-ruler-v2" ref="containerRef" :style="{ '--thick': thick + 'px' }">
    <!-- 标尺层 -->
    <div v-if="showRuler" class="ruler-wrapper">
      <!-- 水平标尺 -->
      <div class="ruler-h" :style="{ left: thick + 'px', width: `calc(100% - ${thick}px)` }"
        @mousedown="onRulerMouseDown('h', $event)">
        <RulerV2 type="horizontal" :thick="thick" :scale="scale" :start="startX" :width="width - thick"
          :palette="palette" />
      </div>
      <!-- 垂直标尺 -->
      <div class="ruler-v" :style="{ top: thick + 'px', height: `calc(100% - ${thick}px)` }"
        @mousedown="onRulerMouseDown('v', $event)">
        <RulerV2 type="vertical" :thick="thick" :scale="scale" :start="startY" :height="height - thick"
          :palette="palette" />
      </div>
      <!-- 角落控制 -->
      <div class="ruler-corner" @click="emit('update:lockLine', !lockLine)">
        <Unlock v-if="!lockLine" class="w-3 h-3 text-slate-500" />
        <Lock v-else class="w-3 h-3 text-slate-500" />
      </div>

      <!-- 工具栏 -->
      <div class="ruler-toolbar">
        <button class="tool-btn" @click="emit('update:showReferLine', !showReferLine)"
          :title="showReferLine ? '隐藏参考线' : '显示参考线'">
          <Grid3X3 v-if="showReferLine" class="w-3.5 h-3.5" />
          <LayoutGrid v-else class="w-3.5 h-3.5 opacity-40" />
        </button>
        <button class="tool-btn" @click="emit('update:lines', { h: [], v: [] })" title="清空参考线">
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- 辅助线展示层 (仅在 drag 容器内绝对定位) -->
    <div v-if="showReferLine" class="lines-container" :style="{ left: thick + 'px', top: thick + 'px' }">
      <div v-for="(y, i) in lines.h" :key="'h' + i" class="line horizontal"
        :style="{ top: (y - startY) * scale + 'px', backgroundColor: palette.lineColor }"
        @mousedown="onLineMouseDown('h', i, $event)">
        <div class="line-handle" />
      </div>
      <div v-for="(x, i) in lines.v" :key="'v' + i" class="line vertical"
        :style="{ left: (x - startX) * scale + 'px', backgroundColor: palette.lineColor }"
        @mousedown="onLineMouseDown('v', i, $event)">
        <div class="line-handle" />
      </div>
    </div>

    <!-- 拖拽预览 -->
    <Teleport to="body">
      <div v-if="dragStatus.isDragging && containerRef" class="drag-preview-overlay">
        <div :class="['preview-line', dragStatus.type === 'h' ? 'horizontal' : 'vertical']" :style="dragStatus.type === 'h' ? { top: dragStatus.currentPos + containerRef.getBoundingClientRect().top + 'px' }
          : { left: dragStatus.currentPos + containerRef.getBoundingClientRect().left + 'px' }">
          <span class="pos-label">
            {{ Math.round(dragStatus.type === 'h' ? startY + (dragStatus.currentPos - thick) / scale : startX +
              (dragStatus.currentPos - thick) / scale) }}
          </span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.sketch-ruler-v2 {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}

.ruler-wrapper {
  position: absolute;
  inset: 0;
}

.ruler-h,
.ruler-v,
.ruler-corner {
  position: absolute;
  pointer-events: auto;
  background: rgba(2, 6, 23, 0.95);
}

.ruler-h {
  top: 0;
  height: var(--thick);
  cursor: ns-resize;
  border-bottom: 1px solid #1e293b;
}

.ruler-v {
  left: 0;
  width: var(--thick);
  cursor: ew-resize;
  border-right: 1px solid #1e293b;
}

.ruler-corner {
  top: 0;
  left: 0;
  width: var(--thick);
  height: var(--thick);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  border-right: 1px solid #1e293b;
  border-bottom: 1px solid #1e293b;
}

.lock-icon {
  font-size: 10px;
  color: #94a3b8;
}

.ruler-toolbar {
  position: absolute;
  top: 4px;
  right: 12px;
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(51, 65, 85, 0.5);
  background: rgba(30, 41, 59, 0.9);
  color: #94a3b8;
  cursor: pointer;
}

.lines-container {
  position: absolute;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.line {
  position: absolute;
  z-index: 100;
  pointer-events: auto;
}

.line.horizontal {
  left: 0;
  width: 100%;
  height: 1px;
  cursor: ns-resize;
}

.line.vertical {
  top: 0;
  height: 100%;
  width: 1px;
  cursor: ew-resize;
}

.line-handle {
  position: absolute;
  inset: -4px;
  background: transparent;
}

.drag-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.preview-line {
  position: absolute;
  background-color: #4ade80;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.preview-line.horizontal {
  left: 0;
  width: 100%;
  height: 1px;
}

.preview-line.vertical {
  top: 0;
  height: 100%;
  width: 1px;
}

.pos-label {
  position: absolute;
  background: #22c55e;
  color: white;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 2px;
}

.horizontal .pos-label {
  right: 20px;
  top: -18px;
}

.vertical .pos-label {
  bottom: 20px;
  left: 4px;
}
</style>
