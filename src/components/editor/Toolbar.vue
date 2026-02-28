<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
// 这里临时先用原生按钮样式, 待 shadcn 安装完后可以重构
import {
  Type,
  Square,
  Circle,
  MousePointer2,
  Hand,
  Combine,
  LayoutGrid
} from 'lucide-vue-next'

const editorStore = useEditorStore()

function selectTool(tool: string) {
  editorStore.setCurrentTool(tool)
}

function handleDragStart(event: DragEvent, type: string) {
  event.dataTransfer?.setData('application/x-shape-type', type)
}
</script>

<template>
  <aside class="w-[60px] border-r bg-card flex flex-col items-center py-4 gap-4 shrink-0 z-10">

    <!-- 基础交互选择 -->
    <div class="group flex flex-col gap-2">
      <button
        class="w-10 h-10 rounded flex items-center justify-center transition-colors"
        :class="editorStore.currentTool === 'select' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'"
        @click="selectTool('select')"
        title="选择 (V)"
      >
        <MousePointer2 class="w-5 h-5" />
      </button>

      <button
        class="w-10 h-10 rounded flex items-center justify-center transition-colors"
        :class="editorStore.currentTool === 'pan' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'"
        @click="selectTool('pan')"
        title="抓手 (H)"
      >
        <Hand class="w-5 h-5" />
      </button>
    </div>

    <hr class="w-8 border-t" />

    <!-- 绘制与创建组 -->
    <div class="group flex flex-col gap-2">
      <!-- 拖拽创建：CNC 数控机床 -->
      <div
        draggable="true"
        @dragstart="handleDragStart($event, 'composite:cnc-machine')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖动放置：CNC 数控机床"
      >
        <Combine class="w-5 h-5 text-slate-500" />
      </div>

      <!-- 拖拽创建：装配作业台 -->
      <div
        draggable="true"
        @dragstart="handleDragStart($event, 'composite:assembly-station')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖动放置：双工位装配台"
      >
        <Combine class="w-5 h-5 text-blue-500" />
      </div>

      <!-- 拖拽创建区域 -->
      <div
        draggable="true"
        @dragstart="handleDragStart($event, 'area')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖拽规划区域"
      >
        <LayoutGrid class="w-5 h-5" />
      </div>

      <button
        class="w-10 h-10 rounded flex items-center justify-center transition-colors"
        :class="editorStore.currentTool === 'rectangle' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'"
        @click="selectTool('rectangle')"
        title="矩形 (R)"
      >
        <Square class="w-5 h-5" />
      </button>

      <button
        class="w-10 h-10 rounded flex items-center justify-center transition-colors"
        :class="editorStore.currentTool === 'circle' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'"
        @click="selectTool('circle')"
        title="圆形 (O)"
      >
        <Circle class="w-5 h-5" />
      </button>

      <button
        class="w-10 h-10 rounded flex items-center justify-center transition-colors"
        :class="editorStore.currentTool === 'text' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'"
        @click="selectTool('text')"
        title="文字 (T)"
      >
        <Type class="w-5 h-5" />
      </button>
    </div>
  </aside>
</template>
