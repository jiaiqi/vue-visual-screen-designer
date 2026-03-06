<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Props {
  thick: number
  lockLine: boolean
  lines: {
    h: number[]
    v: number[]
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['update:lines'])

// 简单的参考线添加逻辑 (后续可扩展拖拽)
const handleRulerClick = (type: 'h' | 'v', e: MouseEvent) => {
  if (props.lockLine) return
  // 暂时仅作结构占位
  console.log('Ruler click:', type, e)
}
</script>

<template>
  <div class="refer-line-layer">
    <!-- 水平线 -->
    <div v-for="(y, index) in lines.h" :key="'h-' + index" class="refer-line horizontal" :style="{ top: y + 'px' }">
      <div class="line-label">{{ y }}</div>
    </div>

    <!-- 垂直线 -->
    <div v-for="(x, index) in lines.v" :key="'v-' + index" class="refer-line vertical" :style="{ left: x + 'px' }">
      <div class="line-label">{{ x }}</div>
    </div>
  </div>
</template>

<style scoped>
.refer-line-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.refer-line {
  position: absolute;
  background-color: #22c55e;
  z-index: 100;
  pointer-events: auto;
}

.refer-line.horizontal {
  left: 0;
  width: 100%;
  height: 1px;
  cursor: ns-resize;
}

.refer-line.vertical {
  top: 0;
  height: 100%;
  width: 1px;
  cursor: ew-resize;
}

.line-label {
  position: absolute;
  font-size: 10px;
  color: #22c55e;
  background: rgba(15, 23, 42, 0.8);
  padding: 0 2px;
}

.refer-line.horizontal .line-label {
  left: 4px;
  top: -12px;
}

.refer-line.vertical .line-label {
  top: 4px;
  left: 4px;
}
</style>
