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
  <nav
    class="absolute left-6 top-1/2 -translate-y-1/2 w-14 py-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex flex-col items-center gap-5 z-40 transition-all hover:shadow-[0_12px_48px_rgba(0,0,0,0.18)]">

    <!-- 绘图工具组 -->
    <div class="flex flex-col gap-4">
      <!-- 拖拽创建：规划区域 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'area')"
        class="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white hover:scale-110 active:scale-95 cursor-grab transition-all duration-200 shadow-sm"
        title="拖拽规划区域">
        <LayoutGrid class="w-5 h-5 shadow-inner" />
        <div
          class="absolute left-14 scale-0 group-hover:scale-100 origin-left px-2 py-1 bg-slate-800 text-white text-[10px] rounded pointer-events-none transition-transform z-50 whitespace-nowrap shadow-xl font-bold">
          区域规划 (A)</div>
      </div>

      <!-- 拖拽创建：机床/矩形 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'rectangle')"
        class="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white hover:scale-110 active:scale-95 cursor-grab transition-all duration-200 shadow-sm"
        title="拖拽添加机床">
        <Square class="w-5 h-5" />
        <div
          class="absolute left-14 scale-0 group-hover:scale-100 origin-left px-2 py-1 bg-slate-800 text-white text-[10px] rounded pointer-events-none transition-transform z-50 whitespace-nowrap shadow-xl font-bold">
          标准机床 (R)</div>
      </div>

      <!-- 拖拽创建：圆形设备 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'circle')"
        class="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-sky-500 hover:text-white hover:scale-110 active:scale-95 cursor-grab transition-all duration-200 shadow-sm"
        title="拖拽添加圆柱体设备">
        <Circle class="w-5 h-5" />
        <div
          class="absolute left-14 scale-0 group-hover:scale-100 origin-left px-2 py-1 bg-slate-800 text-white text-[10px] rounded pointer-events-none transition-transform z-50 whitespace-nowrap shadow-xl font-bold">
          圆柱机组 (C)</div>
      </div>

      <div class="w-6 h-[1px] bg-slate-100 mx-auto my-1"></div>

      <!-- 拖拽创建：椭圆 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'ellipse')"
        class="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-violet-500 hover:text-white hover:scale-110 active:scale-95 cursor-grab transition-all duration-200 shadow-sm"
        title="拖拽添加椭圆">
        <div class="w-6 h-3.5 border-2 border-current rounded-[50%] transition-colors" />
        <div
          class="absolute left-14 scale-0 group-hover:scale-100 origin-left px-2 py-1 bg-slate-800 text-white text-[10px] rounded pointer-events-none transition-transform z-50 whitespace-nowrap shadow-xl font-bold">
          椭圆模型 (E)</div>
      </div>

      <!-- 拖拽创建：梯形 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'trapezoid')"
        class="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-indigo-500 hover:text-white hover:scale-110 active:scale-95 cursor-grab transition-all duration-200 shadow-sm"
        title="拖拽添加梯形/斜台">
        <ScanLine class="w-5 h-5" />
        <div
          class="absolute left-14 scale-0 group-hover:scale-100 origin-left px-2 py-1 bg-slate-800 text-white text-[10px] rounded pointer-events-none transition-transform z-50 whitespace-nowrap shadow-xl font-bold">
          梯形工位</div>
      </div>

      <div class="w-6 h-[1px] bg-slate-100 mx-auto my-1"></div>

      <!-- 拖拽创建：单向箭头 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'arrow-single')"
        class="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white hover:scale-110 active:scale-95 cursor-grab transition-all duration-200 shadow-sm"
        title="拖拽标注单向流向">
        <MoveRight class="w-5 h-5" />
        <div
          class="absolute left-14 scale-0 group-hover:scale-100 origin-left px-2 py-1 bg-slate-800 text-white text-[10px] rounded pointer-events-none transition-transform z-50 whitespace-nowrap shadow-xl font-bold">
          单向流向</div>
      </div>

      <!-- 拖拽创建：双向箭头 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'arrow-double')"
        class="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white hover:scale-110 active:scale-95 cursor-grab transition-all duration-200 shadow-sm"
        title="拖拽标注双向物流">
        <MoveHorizontal class="w-5 h-5" />
        <div
          class="absolute left-14 scale-0 group-hover:scale-100 origin-left px-2 py-1 bg-slate-800 text-white text-[10px] rounded pointer-events-none transition-transform z-50 whitespace-nowrap shadow-xl font-bold">
          双向通道</div>
      </div>

      <!-- 拖拽创建：流动管道 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'pipe')"
        class="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-sky-500 hover:bg-sky-500 hover:text-white hover:scale-110 active:scale-95 cursor-grab transition-all duration-200 shadow-sm"
        title="拖拽添加流动管道">
        <div class="relative w-6 h-6 flex items-center justify-center">
          <div class="absolute inset-0 border-2 border-current rounded-full opacity-20 scale-75"></div>
          <div class="w-4 h-1 bg-current rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
        </div>
        <div
          class="absolute left-14 scale-0 group-hover:scale-100 origin-left px-2 py-1 bg-slate-800 text-white text-[10px] rounded pointer-events-none transition-transform z-50 whitespace-nowrap shadow-xl font-bold">
          流动管道 (P)</div>
      </div>

      <div class="w-6 h-[1px] bg-slate-100 mx-auto my-1"></div>

      <!-- 拖拽创建：文字标签 -->
      <div draggable="true" @dragstart="handleDragStart($event, 'text')"
        class="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-900 hover:text-white hover:scale-110 active:scale-95 cursor-grab transition-all duration-200 shadow-sm font-serif italic text-lg"
        title="拖拽添加铭牌文字">
        <Type class="w-5 h-5" />
        <div
          class="absolute left-14 scale-0 group-hover:scale-100 origin-left px-2 py-1 bg-slate-800 text-white text-[10px] rounded pointer-events-none transition-transform z-50 whitespace-nowrap shadow-xl font-bold">
          文本标注 (T)</div>
      </div>
    </div>
  </nav>
</template>