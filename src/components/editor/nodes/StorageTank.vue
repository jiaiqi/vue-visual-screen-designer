<script setup lang="ts">
import { inject } from 'vue'

const getNode = inject<() => any>('getNode')
</script>

<template>
  <div
    class="w-full h-full bg-slate-800 rounded-xl border border-slate-700 shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden group">
    <!-- 顶部工业盖板 -->
    <div class="h-4 w-full bg-slate-700/80 border-b border-slate-600 rounded-t-xl relative shrink-0 z-10">
      <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-slate-600 rounded-t-md shadow-inner"></div>
    </div>

    <!-- 罐身透明玻璃面与水位动画 -->
    <div class="flex-1 relative bg-slate-900/40 flex flex-col justify-end p-1 inset-shadow">
      <!-- 容积刻度线 -->
      <div
        class="absolute left-1.5 top-2 bottom-2 w-1 border-l border-slate-600 flex flex-col justify-between py-1 opacity-50 z-10">
        <div class="w-2 h-[1px] bg-slate-500"></div>
        <div class="w-1.5 h-[1px] bg-slate-500"></div>
        <div class="w-2 h-[1px] bg-slate-500"></div>
        <div class="w-1.5 h-[1px] bg-slate-500"></div>
        <div class="w-2 h-[1px] bg-slate-500"></div>
      </div>

      <!-- 原生动效：发光液面高度指示 (65%) -->
      <div
        class="w-full h-[65%] bg-gradient-to-t from-sky-700 via-sky-500 to-sky-400 rounded-sm opacity-90 shadow-[0_0_20px_rgba(56,189,248,0.5)] relative overflow-hidden transition-all duration-1000 ease-in-out group-hover:h-[75%]">
        <!-- 玻璃高光反光 -->
        <div class="absolute top-0 left-2 w-2 h-full bg-white/10 skew-x-12"></div>
        <!-- 涌动的水波纹边缘 -->
        <div class="absolute top-0 left-0 w-full h-[2px] bg-sky-200/80"></div>
      </div>
    </div>

    <!-- OLED 数字显示屏 -->
    <div
      class="absolute top-6 right-2 text-right select-none z-20 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/50 backdrop-blur-sm">
      <div class="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-tight">Storage</div>
      <div
        class="text-[12px] text-sky-400 font-mono font-bold leading-tight drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]">
        65%</div>
    </div>
  </div>
</template>

<style scoped>
.inset-shadow {
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>