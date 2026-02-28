<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { Stencil } from '@antv/x6-plugin-stencil'
import { useEditorStore } from '@/stores/editor'

const stencilContainer = ref<HTMLElement>()
const editorStore = useEditorStore()
let stencil: Stencil | null = null

// 监听 graph 实例就绪，因为 CanvasEditor 是在一个单独组件初始化的
watch(() => editorStore.graph, (graph) => {
  if (graph && stencilContainer.value && !stencil) {
    // 实例化官方拖拽面板组件
    stencil = new Stencil({
      title: '组件库',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target: graph as any, // 绑定到目标画布
      search(cell, keyword) {
        return cell.shape.indexOf(keyword) !== -1 || (cell.attr('text/text') as string)?.indexOf(keyword) !== -1
      },
      placeholder: '搜索组件...',
      notFoundText: '未找到匹配组件',
      collapsable: true,
      stencilGraphWidth: 260,
      stencilGraphHeight: 0, // 自适应高度
      groups: [
        {
          name: 'basic',
          title: '基础图形 (Base Shapes)',
          collapsable: true,
        },
        {
          name: 'advanced',
          title: '工业设备 (Industrial)',
          collapsable: true,
        },
      ],
      layoutOptions: {
        columns: 2,
        columnWidth: 125,
        rowHeight: 180, // 加大网格行高，避免高度为 160 的元件发生重叠
      },
    })

    stencilContainer.value.appendChild(stencil.container)

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

    // --- Floor Plan 场景适配业务组件 (暗黑工业风) ---
    const createFloorNode = (label: string, w: number, h: number, stroke: string, rx: number = 0) => {
      return graph.createNode({
        shape: 'rect',
        width: w,
        height: h,
        ports: commonPorts,
        attrs: {
          body: {
            fill: '#1e293b',    // Slate 800 基底
            stroke: stroke,     // 高辨识度外发光边框颜色
            strokeWidth: 2,
            rx: rx,
            ry: rx,
            filter: { name: 'dropShadow', args: { dx: 0, dy: 4, blur: 15, color: stroke.replace(')', ',0.2)').replace('rgb', 'rgba') } } // 简单阴影回落
          },
          text: { text: label, fill: '#e2e8f0', fontSize: 13, fontWeight: 'bold' }
        }
      })
    }

    const mArea = createFloorNode('设备区', 100, 100, '#f43f5e') // Rose
    const zArea = createFloorNode('功能区', 140, 100, '#10b981') // Emerald
    const sArea = createFloorNode('仓储区', 120, 90, '#3b82f6')  // Blue
    const pArea = createFloorNode('通道', 60, 60, '#8b5cf6', 4)  // Purple, rounded
    const rArea = createFloorNode('房间', 150, 120, '#fbbf24')   // Amber
    const tArea = graph.createNode({
      shape: 'text',
      width: 100,
      height: 40,
      ports: commonPorts,
      attrs: {
        body: { fill: 'transparent', stroke: 'transparent' },
        text: { text: '文本标签', fill: '#94a3b8', fontSize: 16 }
      }
    })

    // 加载至左侧面板
    stencil.load([mArea, zArea, sArea, pArea, rArea, tArea], 'basic')

    // 渲染高级 Vue 设备图元
    const fan = graph.createNode({
      shape: 'cooling-fan',
      width: 100,
      height: 100,
      ports: commonPorts,
      attrs: {
        body: { fill: 'transparent', stroke: 'transparent' } // Vue 内部接管渲染
      }
    })

    const tank = graph.createNode({
      shape: 'storage-tank',
      width: 120,
      height: 160,
      ports: commonPorts,
    })

    stencil.load([fan, tank], 'advanced')
  }
}, { immediate: true })

onUnmounted(() => {
  // 注意释放内存，避免热更新溢出
})
</script>

<template>
  <div
    class="w-[280px] h-full bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 stencil-dark-theme z-20 shadow-xl">
    <div ref="stencilContainer" class="flex-1 w-full h-full relative"></div>
  </div>
</template>

<style>
/* 深度修改 Stencil 内置系统样式以绝配 Dark 工业风（X6自身样式挂在 document body 且没有暗黑预设） */
.stencil-dark-theme .x6-widget-stencil {
  background-color: transparent !important;
}

.stencil-dark-theme .x6-widget-stencil-title {
  background-color: #0f172a !important;
  color: #f1f5f9 !important;
  border-bottom: 1px solid #1e293b !important;
  font-weight: 800 !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
}

.stencil-dark-theme .x6-widget-stencil-group-title {
  background-color: #0f172a !important;
  color: #94a3b8 !important;
  border-bottom: 1px solid #1e293b !important;
  font-weight: 600 !important;
}

/* 搜索框强行魔改 */
.stencil-dark-theme .x6-widget-stencil .x6-widget-stencil-search {
  background-color: #0f172a !important;
  padding: 12px 16px !important;
}

.stencil-dark-theme .x6-widget-stencil .x6-widget-stencil-search-input {
  background-color: #1e293b !important;
  border: 1px solid #334155 !important;
  color: #f1f5f9 !important;
  border-radius: 6px !important;
  padding-left: 12px !important;
}

.stencil-dark-theme .x6-widget-stencil .x6-widget-stencil-search-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}

.stencil-dark-theme .x6-widget-stencil-group.collapsed .x6-widget-stencil-group-title {
  border-bottom: none !important;
}
</style>