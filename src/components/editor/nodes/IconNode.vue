<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, shallowRef } from 'vue'
import type { Component } from 'vue'
import { Node } from '@antv/x6'
import * as LucideIcons from 'lucide-vue-next'

const getNode = inject('getNode') as () => Node
const node = getNode()

const iconName = ref('Image')
const color = ref('#94a3b8')

const CurrentIcon = shallowRef<Component | null>(null)

// 动态解析图标组件
const updateIcon = () => {
  const name = iconName.value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as any
  const iconComp = icons[name]
  if (iconComp) {
    CurrentIcon.value = iconComp
  } else {
    // 找不到时兜底用图片占位符或其他
    CurrentIcon.value = icons['Image'] || null
  }
}

// 绑定节点数据
const updateData = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (node.getData() || {}) as any
  iconName.value = data.iconName || 'Image'

  // 颜色可以从 data 中取，也可以尝试从 node.attr('body/stroke') 或 fill 中取
  // 为了独立出来，我们使用 data.color 作为主色调
  const strokeColor = node.attr('body/stroke')
  color.value = data.color || (typeof strokeColor === 'string' ? strokeColor : undefined) || '#94a3b8'
  updateIcon()
}

onMounted(() => {
  updateData()
  node.on('change:data', updateData)
  // 如果颜色也可能存在 attr 里，可以监听 attrs:
  node.on('change:attrs', () => {
    const stroke = node.attr('body/stroke')
    if (stroke && stroke !== color.value) {
      color.value = stroke as string
    }
  })
})

onUnmounted(() => {
  node.off('change:data', updateData)
  // node.off('change:attrs') // 在 x6 中统一销毁可省略或者精细解绑
})
</script>

<template>
  <div class="icon-node-container w-full h-full flex items-center justify-center relative">
    <component v-if="CurrentIcon" :is="CurrentIcon" class="w-full h-full" :style="{ color: String(color) }"
      stroke-width="1.5" />
  </div>
</template>

<style scoped>
.icon-node-container {
  /* 允许鼠标穿透以便在 X6 背景中交互, 但图标本身需要响应 */
  pointer-events: none;
}

.icon-node-container>* {
  pointer-events: auto;
}
</style>
