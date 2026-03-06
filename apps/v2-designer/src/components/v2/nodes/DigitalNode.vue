<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, watch } from 'vue'
import { Node } from '@antv/x6'

const getNode = inject('getNode') as () => Node
const node = getNode()

// 原始数值
const numberValue = ref(0)
const displayValue = ref(0)

// 格式化参数
const numberFormat = ref<'none' | 'auto'>('none')
const decimalPlaces = ref(0)
const useGrouping = ref(true)
const animateRoll = ref(true)

// 字体外观参数
const textColor = ref('var(--theme-primary)')
const fontSize = ref(24)
const fontWeight = ref('bold')

let animationFrameId: number | null = null

const startAnimation = (from: number, to: number, duration: number = 1000) => {
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)

  if (duration <= 0) {
    displayValue.value = to
    return
  }

  const startTime = performance.now()
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // easeOutExpo 缓动
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

    displayValue.value = from + (to - from) * easeProgress

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      displayValue.value = to
    }
  }
  animationFrameId = requestAnimationFrame(animate)
}

watch(numberValue, (newVal) => {
  if (animateRoll.value) {
    startAnimation(displayValue.value, newVal, 1500)
  } else {
    displayValue.value = newVal
  }
})

// 负责进行格式大数的计算与修饰
const formatNumberStr = (val: number) => {
  let num = val
  let suffix = ''

  if (numberFormat.value === 'auto') {
    if (Math.abs(num) >= 1_000_000_000) {
      num = num / 1_000_000_000
      suffix = ' 亿'
    } else if (Math.abs(num) >= 10_000) {
      num = num / 10_000
      suffix = ' 万'
    }
  }

  // 保留小数位
  const fixedStr = num.toFixed(decimalPlaces.value)
  let finalStr = fixedStr

  // 千分位
  if (useGrouping.value) {
    const parts = fixedStr.split('.')
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    finalStr = parts.join('.')
  }

  return finalStr + suffix
}

const updateData = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (node.getData() || {}) as any

  const nextVal = typeof data.numberValue === 'number' ? data.numberValue : 0
  if (numberValue.value !== nextVal) {
    numberValue.value = nextVal
  }

  numberFormat.value = data.numberFormat || 'none'
  decimalPlaces.value = typeof data.decimalPlaces === 'number' ? data.decimalPlaces : 0
  useGrouping.value = data.useGrouping !== false
  animateRoll.value = data.animateRoll !== false

  textColor.value = data.textColor || node.attr('text/fill') || 'var(--theme-primary)'
  fontSize.value = typeof data.fontSize === 'number' ? data.fontSize : 24
  fontWeight.value = data.fontWeight || 'bold'
}

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initData = (node.getData() || {}) as any
  displayValue.value = initData.numberValue || 0 // 首次呈现避免总是从 0 跳动，保持安静状态

  updateData()
  node.on('change:data', updateData)

  node.on('change:attrs', () => {
    const fill = node.attr('text/fill')
    const size = node.attr('text/fontSize')
    if (fill && fill !== textColor.value) {
      textColor.value = fill as string
    }
    if (size) {
      fontSize.value = Number(size)
    }
  })
})

onUnmounted(() => {
  node.off('change:data', updateData)
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
})
</script>

<template>
  <div
    class="digital-node-container w-full h-full flex items-center justify-center relative bg-transparent overflow-hidden">
    <span class="digital-text select-none whitespace-nowrap" :style="{
      color: textColor,
      fontSize: `${fontSize}px`,
      fontWeight: fontWeight,
      fontVariantNumeric: 'tabular-nums'
    }">
      {{ formatNumberStr(displayValue) }}
    </span>
  </div>
</template>

<style scoped>
.digital-node-container {
  pointer-events: none;
}

.digital-node-container>* {
  pointer-events: auto;
}

.digital-text {
  text-shadow: 0 0 10px currentColor;
  /* 增加大屏发光感 */
}
</style>
