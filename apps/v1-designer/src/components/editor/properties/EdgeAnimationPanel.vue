<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Edge } from '@antv/x6'
import { getEdgeAnimationTypes, applyEdgeAnimation } from '@/plugins/x6-edges'
import type { EdgeAnimation } from '@/types/schema'
import { Play, Pause, RotateCcw, Zap, Waves, Signal, Activity, ArrowLeftRight } from 'lucide-vue-next'

const props = defineProps<{
  edge: Edge
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const animationTypes = getEdgeAnimationTypes()

const animationConfig = ref<EdgeAnimation>({
  type: 'none',
  speed: 1,
  color: '',
  reverse: false,
  paused: false,
})

const animationIcons: Record<string, typeof Zap> = {
  none: Activity,
  waterFlow: Waves,
  electric: Zap,
  signal: Signal,
  pulse: Activity,
  dashed: ArrowLeftRight,
  bidirectional: ArrowLeftRight,
  particle: Activity,
  dataPacket: Activity,
}

const animationLabels: Record<string, string> = {
  none: '无动画',
  waterFlow: '水流动画',
  electric: '电流动画',
  signal: '信号传输',
  pulse: '脉冲效果',
  dashed: '虚线流动',
  bidirectional: '双向流动',
  particle: '粒子流动',
  dataPacket: '数据包传输',
}

const loadAnimationConfig = () => {
  const data = props.edge.getData()
  if (data?.animation) {
    animationConfig.value = { ...animationConfig.value, ...data.animation }
  }
}

watch(() => props.edge, loadAnimationConfig, { immediate: true })

const applyAnimation = () => {
  const config = animationConfig.value
  
  // 保存到边数据
  props.edge.setData({
    ...props.edge.getData(),
    animation: config,
  })

  // 应用动画
  applyEdgeAnimation(props.edge, {
    type: config.type,
    speed: config.speed,
    color: config.color,
    reverse: config.reverse,
  })

  emit('update')
}

const togglePause = () => {
  animationConfig.value.paused = !animationConfig.value.paused
  if (animationConfig.value.paused) {
    props.edge.attr('line/style/animation-play-state', 'paused')
  } else {
    props.edge.attr('line/style/animation-play-state', 'running')
  }
  emit('update')
}

const resetAnimation = () => {
  animationConfig.value = {
    type: 'none',
    speed: 1,
    color: '',
    reverse: false,
    paused: false,
  }
  applyAnimation()
}
</script>

<template>
  <div class="edge-animation-panel p-4 space-y-4">
    <!-- 动画类型选择 -->
    <div>
      <label class="block text-xs text-slate-400 mb-2">动画类型</label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="type in animationTypes"
          :key="type.value"
          @click="animationConfig.type = type.value; applyAnimation()"
          class="flex flex-col items-center gap-1 p-2 rounded-lg border transition-all"
          :class="{
            'border-sky-500 bg-sky-500/20 text-sky-400': animationConfig.type === type.value,
            'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600': animationConfig.type !== type.value,
          }"
        >
          <component :is="animationIcons[type.value] || Activity" class="w-4 h-4" />
          <span class="text-[10px]">{{ animationLabels[type.value] || type.label }}</span>
        </button>
      </div>
    </div>

    <!-- 动画配置 -->
    <template v-if="animationConfig.type !== 'none'">
      <!-- 颜色 -->
      <div>
        <label class="block text-xs text-slate-400 mb-1.5">动画颜色</label>
        <div class="flex items-center gap-2">
          <input
            v-model="animationConfig.color"
            type="color"
            @change="applyAnimation"
            class="w-8 h-8 rounded cursor-pointer bg-slate-900 border border-slate-700"
          />
          <input
            v-model="animationConfig.color"
            type="text"
            @change="applyAnimation"
            placeholder="#0ea5e9"
            class="flex-1 px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 focus:border-sky-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- 速度 -->
      <div>
        <label class="block text-xs text-slate-400 mb-1.5">
          动画速度: {{ animationConfig.speed }}x
        </label>
        <input
          v-model.number="animationConfig.speed"
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          @input="applyAnimation"
          class="w-full accent-sky-500"
        />
        <div class="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>慢</span>
          <span>快</span>
        </div>
      </div>

      <!-- 方向 -->
      <div class="flex items-center justify-between">
        <label class="text-xs text-slate-400">反向动画</label>
        <button
          @click="animationConfig.reverse = !animationConfig.reverse; applyAnimation()"
          class="relative w-10 h-5 rounded-full transition-colors"
          :class="animationConfig.reverse ? 'bg-sky-500' : 'bg-slate-700'"
        >
          <span
            class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
            :class="animationConfig.reverse ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- 控制按钮 -->
      <div class="flex gap-2 pt-2 border-t border-slate-700">
        <button
          @click="togglePause"
          class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-colors"
          :class="animationConfig.paused 
            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'"
        >
          <component :is="animationConfig.paused ? Play : Pause" class="w-3.5 h-3.5" />
          {{ animationConfig.paused ? '继续' : '暂停' }}
        </button>
        <button
          @click="resetAnimation"
          class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          重置
        </button>
      </div>
    </template>

    <!-- 预设样式 -->
    <div class="pt-2 border-t border-slate-700">
      <label class="block text-xs text-slate-400 mb-2">快速预设</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="animationConfig = { type: 'waterFlow', speed: 1, color: '#22c55e', reverse: false, paused: false }; applyAnimation()"
          class="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors text-left"
        >
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
            水流管道
          </div>
        </button>
        <button
          @click="animationConfig = { type: 'electric', speed: 1.5, color: '#f59e0b', reverse: false, paused: false }; applyAnimation()"
          class="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-amber-500/50 hover:text-amber-400 transition-colors text-left"
        >
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-amber-500"></div>
            电力传输
          </div>
        </button>
        <button
          @click="animationConfig = { type: 'signal', speed: 1, color: '#3b82f6', reverse: false, paused: false }; applyAnimation()"
          class="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-400 transition-colors text-left"
        >
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
            信号传输
          </div>
        </button>
        <button
          @click="animationConfig = { type: 'pulse', speed: 1, color: '#8b5cf6', reverse: false, paused: false }; applyAnimation()"
          class="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-violet-500/50 hover:text-violet-400 transition-colors text-left"
        >
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-violet-500"></div>
            脉冲效果
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edge-animation-panel {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.edge-animation-panel::-webkit-scrollbar {
  width: 4px;
}

.edge-animation-panel::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 2px;
}
</style>
