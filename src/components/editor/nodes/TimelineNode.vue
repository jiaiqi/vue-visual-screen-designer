<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, computed } from 'vue'
import { Node } from '@antv/x6'

const getNode = inject('getNode') as () => Node
const node = getNode()

const timelineType = ref<'horizontal' | 'vertical'>('horizontal')
const timelineNodes = ref<Array<{ id: string; label: string; time: string }>>([])
const lineColor = ref('#3b82f6')
const bgColor = ref('#1e293b')
const nodeColor = ref('#3b82f6')

const updateData = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (node.getData() || {}) as any
  timelineType.value = data.timelineType || 'horizontal'
  timelineNodes.value = data.timelineNodes || [
    { id: '1', label: '阶段一', time: '09:00' },
    { id: '2', label: '阶段二', time: '10:00' },
    { id: '3', label: '阶段三', time: '11:00' },
  ]
  lineColor.value = data.lineColor || node.attr('body/stroke') || '#3b82f6'
  bgColor.value = data.bgColor || node.attr('body/fill') || '#1e293b'
  nodeColor.value = data.nodeColor || data.lineColor || node.attr('body/stroke') || '#3b82f6'
}

onMounted(() => {
  updateData()
  node.on('change:data', updateData)
  node.on('change:attrs', () => {
    const stroke = node.attr('body/stroke')
    const fill = node.attr('body/fill')
    if (stroke && stroke !== lineColor.value) {
      lineColor.value = stroke as string
      nodeColor.value = stroke as string
    }
    if (fill && fill !== bgColor.value) {
      bgColor.value = fill as string
    }
  })
})

onUnmounted(() => {
  node.off('change:data', updateData)
})

const containerClass = computed(() => {
  return timelineType.value === 'horizontal'
    ? 'timeline-container-horizontal'
    : 'timeline-container-vertical'
})
</script>

<template>
  <div
    class="timeline-container w-full h-full relative overflow-hidden"
    :class="containerClass"
    :style="{ backgroundColor: bgColor }">
    
    <!-- 横向时间轴 -->
    <template v-if="timelineType === 'horizontal'">
      <div class="timeline-line-horizontal absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2"
        :style="{ backgroundColor: lineColor }">
      </div>
      <div class="timeline-nodes-horizontal absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-4">
        <div
          v-for="(item, index) in timelineNodes"
          :key="item.id"
          class="timeline-node flex flex-col items-center relative z-10">
          <div class="node-circle w-4 h-4 rounded-full border-2 flex items-center justify-center"
            :style="{ 
              backgroundColor: bgColor,
              borderColor: nodeColor,
              boxShadow: `0 0 8px ${nodeColor}80`
            }">
          </div>
          <div class="node-label mt-2 text-[10px] text-center whitespace-nowrap" :style="{ color: nodeColor }">
            {{ item.label }}
          </div>
          <div class="node-time mt-0.5 text-[8px] text-slate-400">
            {{ item.time }}
          </div>
        </div>
      </div>
    </template>

    <!-- 纵向时间轴 -->
    <template v-else>
      <div class="timeline-line-vertical absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2"
        :style="{ backgroundColor: lineColor }">
      </div>
      <div class="timeline-nodes-vertical absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-between items-center py-4">
        <div
          v-for="(item, index) in timelineNodes"
          :key="item.id"
          class="timeline-node flex flex-col items-center relative z-10">
          <div class="node-circle w-4 h-4 rounded-full border-2 flex items-center justify-center"
            :style="{ 
              backgroundColor: bgColor,
              borderColor: nodeColor,
              boxShadow: `0 0 8px ${nodeColor}80`
            }">
          </div>
          <div class="node-label mt-1 text-[10px] text-center whitespace-nowrap" :style="{ color: nodeColor }">
            {{ item.label }}
          </div>
          <div class="node-time mt-0.5 text-[8px] text-slate-400">
            {{ item.time }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.timeline-container {
  pointer-events: none;
}

.timeline-container * {
  pointer-events: none;
}

.timeline-node {
  cursor: pointer;
}

.node-circle {
  transition: transform 0.2s ease;
}

.timeline-node:hover .node-circle {
  transform: scale(1.2);
}
</style>
