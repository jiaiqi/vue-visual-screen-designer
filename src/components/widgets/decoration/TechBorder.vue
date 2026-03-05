<script setup lang="ts">
interface Props {
  variant?: 'default' | 'corner' | 'full'
  glow?: boolean
  animated?: boolean
  color?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  glow: true,
  animated: true,
  color: '#0ea5e9',
  title: '',
})
</script>

<template>
  <div
    class="tech-border relative p-6 rounded-lg"
    :class="{
      'tech-border-glow': glow,
      'tech-border-animated': animated,
    }"
    :style="{ '--border-color': color }"
  >
    <!-- 边框装饰 -->
    <div class="absolute inset-0 rounded-lg border-2 border-opacity-30" :style="{ borderColor: color }"></div>
    
    <!-- 角标装饰 -->
    <template v-if="variant === 'corner' || variant === 'full'">
      <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" :style="{ borderColor: color }"></div>
      <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" :style="{ borderColor: color }"></div>
      <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" :style="{ borderColor: color }"></div>
      <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" :style="{ borderColor: color }"></div>
    </template>

    <!-- 标题 -->
    <div v-if="title" class="mb-4 flex items-center gap-2">
      <div class="w-1 h-4 rounded-full" :style="{ backgroundColor: color }"></div>
      <span class="text-lg font-semibold text-slate-100">{{ title }}</span>
    </div>

    <!-- 内容插槽 -->
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.tech-border {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
}

.tech-border-glow {
  box-shadow: 
    0 0 20px rgba(var(--border-color), 0.1),
    inset 0 0 20px rgba(var(--border-color), 0.05);
}

.tech-border-animated::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--border-color),
    transparent
  );
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: border-rotate 4s linear infinite;
  opacity: 0.5;
}

@keyframes border-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
