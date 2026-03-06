<script setup lang="ts">
import { inject } from 'vue'

// (可选) 通过 inject 拿到节点实例，可以监听数据变动
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNode = inject<() => unknown>('getNode')
</script>

<template>
  <div
    class="fan-root w-full h-full rounded-lg border flex items-center justify-center relative overflow-hidden group">
    <!-- 发光环境背景 -->
    <div class="fan-glow-bg absolute inset-0 transition-colors"></div>

    <!-- 旋转风扇主体 -->
    <div
      class="fan-wheel relative w-14 h-14 rounded-full border flex items-center justify-center shadow-inner">
      <div
        class="fan-wheel-icon w-12 h-12 flex items-center justify-center origin-center">
        <!-- 用户提供的三叶风扇 SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="w-full h-full">
          <!-- 底盘 -->
          <g opacity="0.3">
            <circle cx="128" cy="128" r="128" fill="currentColor" />
          </g>
          <!-- 旋转飞轮与叶片 -->
          <g fill="currentColor">
            <animateTransform attributeName="transform" type="rotate" from="0 128 128" to="360 128 128" dur="1s"
              repeatCount="indefinite" />
            <path
              d="m241.14,85.54l-61.32,23.01c-5.6-14.93-17.46-26.79-32.39-32.38l23-61.33c-13.2-4.96-27.5-7.66-42.43-7.66s-29.25,2.72-42.47,7.68l23.01,61.32c-14.92,5.6-26.78,17.45-32.37,32.38l-61.32-23c-4.96,13.2-7.67,27.5-7.67,42.44s2.71,29.23,7.67,42.44l61.33-23c5.59,14.91,17.44,26.77,32.36,32.37l-23.01,61.33c13.21,4.96,27.52,7.68,42.47,7.68s29.22-2.71,42.43-7.66l-23-61.33c14.92-5.59,26.79-17.45,32.38-32.38l61.33,23.01c4.73-12.59,7.42-26.18,7.65-40.38v-4.15c-.24-14.2-2.93-27.79-7.65-40.38Zm-105.05,64.05c-2.52.95-5.24,1.46-8.09,1.46s-5.59-.52-8.12-1.47c-6.21-2.33-11.15-7.28-13.48-13.49-.94-2.52-1.46-5.25-1.46-8.1s.52-5.58,1.46-8.1c2.33-6.21,7.27-11.16,13.48-13.49,2.53-.95,5.26-1.47,8.12-1.47s5.57.51,8.09,1.46c6.23,2.32,11.18,7.27,13.51,13.49.94,2.52,1.46,5.26,1.46,8.11s-.52,5.59-1.47,8.11c-2.33,6.22-7.28,11.17-13.5,13.49Z" />
          </g>
        </svg>
      </div>
    </div>

    <!-- 硬件状态指示标示 -->
    <div class="status-dot absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full"
      style="animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>

    <!-- 机器铭牌与数据仪表 -->
    <div
      class="label-id absolute top-1 left-2 text-[9px] font-mono font-bold tracking-widest leading-none select-none">
      FAN-01</div>
    <div
      class="label-rpm absolute bottom-1 left-2 text-[10px] font-mono font-bold select-none">
      1200 RPM</div>
  </div>
</template>

<style scoped>
.fan-root {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-secondary);
  box-shadow: var(--ui-shadow);
}

.fan-wheel {
  background: var(--color-bg-secondary);
  border-color: var(--color-border-secondary);
}

.fan-glow-bg {
  background: color-mix(in oklab, var(--ui-success) 8%, transparent);
}

.group:hover .fan-glow-bg {
  background: color-mix(in oklab, var(--ui-success) 14%, transparent);
}

.fan-wheel-icon {
  color: color-mix(in oklab, var(--ui-success) 82%, #ffffff);
  filter: drop-shadow(0 0 8px color-mix(in oklab, var(--ui-success) 60%, transparent));
}

.status-dot {
  background: var(--ui-success);
  box-shadow: 0 0 8px color-mix(in oklab, var(--ui-success) 70%, transparent);
}

.label-id {
  color: var(--color-text-tertiary);
}

.label-rpm {
  color: var(--ui-success);
  filter: drop-shadow(0 0 2px color-mix(in oklab, var(--ui-success) 75%, transparent));
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }
}
</style>
