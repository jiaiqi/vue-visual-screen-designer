<script setup lang="ts">
/* eslint-disable vue/multi-word-component-names */
import {
  Type,
  Square,
  Circle,
  LayoutGrid,
  MoveHorizontal,
  MoveRight,
  ScanLine
} from 'lucide-vue-next'

function handleDragStart(event: DragEvent, type: string) {
  event.dataTransfer?.setData('application/x-shape-type', type)
}
</script>

<template>
  <aside class="w-[60px] border-r bg-card flex flex-col items-center py-4 gap-4 shrink-0 z-10">

    <hr class="w-8 border-t" />

    <!-- 绘制与创建组 -->
    <div class="group flex flex-col gap-2">
      <!-- 拖拽创建区域 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'area')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖拽规划区域">
        <LayoutGrid class="w-5 h-5" />
      </div>

      <!-- 拖拽创建：矩形 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'rectangle')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖动放置：矩形 (R)">
        <Square class="w-5 h-5" />
      </div>

      <!-- 拖拽创建：圆形 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'circle')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖动放置：圆形 (O)">
        <Circle class="w-5 h-5" />
      </div>

      <!-- 拖拽创建：椭圆 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'ellipse')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖动放置：椭圆">
        <div class="w-6 h-4 border-2 border-current rounded-[50%]" />
      </div>

      <!-- 拖拽创建：梯形 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'trapezoid')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖动放置：梯形">
        <ScanLine class="w-5 h-5" />
      </div>

      <!-- 拖拽创建：单向箭头 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'arrow-single')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖动放置：单向箭头">
        <MoveRight class="w-5 h-5" />
      </div>

      <!-- 拖拽创建：双向箭头 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'arrow-double')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖动放置：双向箭头">
        <MoveHorizontal class="w-5 h-5" />
      </div>

      <!-- 拖拽创建：文字标签 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'text')"
        class="w-10 h-10 rounded flex items-center justify-center border border-dashed border-primary cursor-grab active:cursor-grabbing hover:bg-accent text-foreground transition-colors"
        title="拖动放置：可编辑文字 (T)">
        <Type class="w-5 h-5" />
      </div>
    </div>
  </aside>
</template>