<script setup lang="ts">
import { inject } from 'vue'

const getNode = inject<() => any>('getNode')
</script>

<template>
  <div
    class="tank-root w-full h-full rounded-xl border flex flex-col relative overflow-hidden group">
    <!-- 顶部工业盖板 -->
    <div class="tank-cap h-4 w-full border-b rounded-t-xl relative shrink-0 z-10">
      <div class="tank-cap-head absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-t-md shadow-inner"></div>
    </div>

    <!-- 罐身透明玻璃面与水位动画 -->
    <div class="tank-body flex-1 relative flex flex-col justify-end p-1 inset-shadow">
      <!-- 容积刻度线 -->
      <div
        class="scale-line absolute left-1.5 top-2 bottom-2 w-1 border-l flex flex-col justify-between py-1 opacity-50 z-10">
        <div class="w-2 h-[1px] scale-tick"></div>
        <div class="w-1.5 h-[1px] scale-tick"></div>
        <div class="w-2 h-[1px] scale-tick"></div>
        <div class="w-1.5 h-[1px] scale-tick"></div>
        <div class="w-2 h-[1px] scale-tick"></div>
      </div>

      <!-- 原生动效：发光液面高度指示 (65%) -->
      <div
        class="liquid-level w-full h-[65%] rounded-sm opacity-90 relative overflow-hidden transition-all duration-1000 ease-in-out group-hover:h-[75%]">
        <!-- 玻璃高光反光 -->
        <div class="glass-highlight absolute top-0 left-2 w-2 h-full skew-x-12"></div>
        <!-- 涌动的水波纹边缘 -->
        <div class="wave-edge absolute top-0 left-0 w-full h-[2px]"></div>
      </div>
    </div>

    <!-- OLED 数字显示屏 -->
    <div
      class="oled absolute top-6 right-2 text-right select-none z-20 px-1.5 py-0.5 rounded border backdrop-blur-sm">
      <div class="text-[8px] oled-subtitle font-bold uppercase tracking-wider leading-tight">Storage</div>
      <div
        class="text-[12px] oled-main font-mono font-bold leading-tight">
        65%</div>
    </div>
  </div>
</template>

<style scoped>
.tank-root {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-secondary);
  box-shadow: var(--ui-shadow);
}

.tank-cap {
  background: color-mix(in oklab, var(--color-bg-quaternary) 85%, transparent);
  border-color: var(--color-border-secondary);
}

.tank-cap-head {
  background: var(--color-bg-quaternary);
}

.tank-body {
  background: color-mix(in oklab, var(--color-bg-secondary) 70%, transparent);
}

.inset-shadow {
  box-shadow: inset 0 0 10px color-mix(in oklab, var(--color-bg-primary) 50%, transparent);
}

.scale-line {
  border-color: color-mix(in oklab, var(--color-text-tertiary) 60%, transparent);
}

.scale-tick {
  background: color-mix(in oklab, var(--color-text-tertiary) 60%, transparent);
}

.liquid-level {
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--theme-primary) 82%, #ffffff),
    color-mix(in oklab, var(--theme-primary) 64%, var(--color-bg-secondary)),
    color-mix(in oklab, var(--theme-primary) 46%, var(--color-bg-primary))
  );
  box-shadow: 0 0 20px color-mix(in oklab, var(--theme-primary) 50%, transparent);
}

.glass-highlight {
  background: color-mix(in oklab, var(--color-text-primary) 12%, transparent);
}

.wave-edge {
  background: color-mix(in oklab, var(--theme-primary) 45%, #ffffff);
}

.oled {
  background: color-mix(in oklab, var(--color-bg-primary) 66%, transparent);
  border-color: color-mix(in oklab, var(--color-border-secondary) 64%, transparent);
}

.oled-subtitle {
  color: var(--color-text-tertiary);
}

.oled-main {
  color: var(--theme-primary);
  filter: drop-shadow(0 0 5px color-mix(in oklab, var(--theme-primary) 70%, transparent));
}
</style>
