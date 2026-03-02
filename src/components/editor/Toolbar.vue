<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dnd } from '@antv/x6-plugin-dnd'
import { useEditorStore } from '@/stores/editor'
import { CircleDot, Blocks, Box, ArrowLeftRight, Home, Type } from 'lucide-vue-next'

const dndContainer = ref<HTMLElement>()
const editorStore = useEditorStore()
const dndRef = ref<Dnd>()

// 端口通用配置
const commonPorts = {
  groups: {
    top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
    left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#3b82f6', fill: '#0f172a', strokeWidth: 2 } } },
  },
  items: [
    { id: 'port_top', group: 'top' },
    { id: 'port_right', group: 'right' },
    { id: 'port_bottom', group: 'bottom' },
    { id: 'port_left', group: 'left' },
  ],
}

// 定义基础图元组件映射表
const shapeTypes = [
  { type: 'machine', label: '设备区', icon: CircleDot, w: 100, h: 100, stroke: '#f43f5e', rx: 0 },
  { type: 'zone', label: '功能区', icon: Blocks, w: 140, h: 100, stroke: '#10b981', rx: 0 },
  { type: 'storage', label: '仓储区', icon: Box, w: 120, h: 90, stroke: '#3b82f6', rx: 0 },
  { type: 'passage', label: '通道', icon: ArrowLeftRight, w: 60, h: 60, stroke: '#8b5cf6', rx: 4 },
  { type: 'room', label: '房间', icon: Home, w: 150, h: 120, stroke: '#fbbf24', rx: 0 },
  { type: 'text', label: '文字', icon: Type, w: 100, h: 40, stroke: 'transparent', rx: 0 },
]

// 初始化 Dnd
watch(() => editorStore.graph, (graph) => {
  if (graph && dndContainer.value && !dndRef.value) {
    dndRef.value = new Dnd({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target: graph as any,
      scaled: false,
      dndContainer: dndContainer.value,
    })
  }
}, { immediate: true })

// 拖拽挂载
const startDrag = (e: MouseEvent, item: typeof shapeTypes[0]) => {
  const graph = editorStore.graph
  if (!graph || !dndRef.value) return

  let node

  if (item.type === 'text') {
    node = graph.createNode({
      shape: 'text',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      attrs: {
        body: { fill: 'transparent', stroke: 'transparent' },
        text: { text: '文本标签', fill: '#94a3b8', fontSize: 16 }
      }
    })
  } else {
    node = graph.createNode({
      shape: 'rect',
      width: item.w,
      height: item.h,
      ports: commonPorts,
      attrs: {
        body: {
          fill: '#1e293b',    // Slate 800 基底
          stroke: item.stroke,
          strokeWidth: 2,
          rx: item.rx,
          ry: item.rx,
          filter: { name: 'dropShadow', args: { dx: 0, dy: 4, blur: 15, color: item.stroke.replace(')', ',0.2)').replace('rgb', 'rgba') } }
        },
        text: { text: item.label, fill: '#e2e8f0', fontSize: 13, fontWeight: 'bold' }
      }
    })
  }

  // 开始将其挂载至原生外层 Drag
  dndRef.value.start(node, e)
}
</script>

<template>
  <div
    class="w-[280px] h-full bg-[#141824] border-r border-[#2a3045] flex flex-col shrink-0 z-20 shadow-xl overflow-hidden"
    ref="dndContainer">
    <!-- Vue 原生面板头部 -->
    <div class="px-4 py-3 text-sm font-semibold text-slate-400 uppercase tracking-widest border-b border-[#2a3045]">
      基础图元
    </div>

    <!-- 面板内容滚动区 -->
    <div class="flex-1 overflow-y-auto p-3">
      <div class="grid grid-cols-2 gap-3">
        <template v-for="item in shapeTypes" :key="item.type">
          <div
            class="flex flex-col items-center justify-center p-4 rounded-lg bg-[#1a1f2e] border border-[#2a3045] cursor-grab hover:-translate-y-0.5 hover:border-sky-500 hover:bg-[#1e2640] transition-all"
            @mousedown="startDrag($event, item)">
            <component :is="item.icon" class="w-6 h-6 mb-2"
              :style="{ color: item.stroke !== 'transparent' ? item.stroke : '#94a3b8' }" />
            <span class="text-xs text-slate-300 font-medium">{{ item.label }}</span>
          </div>
        </template>
      </div>

      <div class="mt-6 px-1">
        <div class="text-[11px] text-slate-500 mb-3 uppercase tracking-wider font-semibold">复杂设备及管线</div>
        <!-- 以后其他高级图元也可继续使用 v-for / dnd 追加在这里 -->
        <div class="text-xs text-slate-600 bg-slate-900/50 rounded p-3 border border-slate-800/50">
          更多高阶工业组件开发中...
        </div>
      </div>
    </div>
  </div>
</template>