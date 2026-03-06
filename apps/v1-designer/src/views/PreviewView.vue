<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { Graph } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import { useRouter } from 'vue-router'
import { ArrowLeft, Maximize, Minimize, AlertCircle } from 'lucide-vue-next'

const editorStore = useEditorStore()
const router = useRouter()
const containerRef = ref<HTMLElement>()
let previewGraph: Graph | null = null

const isFullscreen = ref(false)
const renderError = ref('')

onMounted(async () => {
  await nextTick() // 等待路由过渡稳定

  if (containerRef.value) {
    try {
      const config = editorStore.canvasConfig

      // 初始化只读预览 Graph
      previewGraph = new Graph({
        container: containerRef.value,
        width: config.width || 800,
        height: config.height || 600,
        background: {
          color: config.backgroundColor || '#0f172a',
          image: config.backgroundImage,
          repeat: 'no-repeat',
          position: 'center',
          size: 'cover',
        },
        grid: config.showGrid ? {
          size: config.gridSize || 20,
          visible: true,
          type: 'dot',
          args: {
            color: config.gridColor || '#334155',
            thickness: 1,
          },
        } : false,
        interacting: false,
        panning: true,
        mousewheel: {
          enabled: true,
          modifiers: ['ctrl', 'meta'],
        },
        connecting: {
          router: {
            name: 'orth',
            args: { padding: 15 },
          },
          connector: {
            name: 'rounded',
            args: { radius: 8 },
          },
        }
      })

      // 强制从 localStorage 取，不再依赖不稳定的 store 实例引用
      const rawData = localStorage.getItem('preview_graph_data')
      if (rawData) {
        const json = JSON.parse(rawData)
        if (json && json.cells) {
          previewGraph.fromJSON(json)
        } else {
          renderError.value = '暂无画布内容数据'
        }
      } else {
        renderError.value = '未找到缓存的预览数据'
      }

      // --- 关键注入：百分比坐标系还原 (Percentage Restoration) ---
      const nodes = previewGraph.getNodes()
      const { clientWidth: viewW, clientHeight: viewH } = containerRef.value!

      nodes.forEach(node => {
        const data = node.getData() || {}
        if (data.xRatio !== undefined && data.yRatio !== undefined) {
          // 根据预览容器的实际物理尺寸，按比例还原位置
          node.position(data.xRatio * viewW, data.yRatio * viewH)
        }
        if (data.wRatio !== undefined && data.hRatio !== undefined) {
          // 根据比例还原大小
          node.resize(data.wRatio * viewW, data.hRatio * viewH)
        }

        // --- 重新触发动画 (保持与编辑器一致) ---
        const selector = node.shape === 'image' ? 'image' : 'body'
        if (data.animationType && data.animationType !== 'none') {
          const duration = data.animationDuration || 1
          const easing = data.animationType === 'spin' ? 'linear' : 'ease-in-out'
          node.attr(`${selector}/class`, 'node-anim-trigger')
          node.attr(`${selector}/style/animation`, `anim-${data.animationType} ${duration}s ${easing} infinite ${data.animationReverse ? 'reverse' : 'normal'}`)
        }

        if (node.shape === 'image' && data.states && data.currentStatus !== undefined) {
          const stateItem = data.states.find((st: any) => String(st.value) === String(data.currentStatus))
          if (stateItem && stateItem.url) node.attr('image/xlink:href', stateItem.url)
        }
      })

      // --- 视口适配策略 (Viewport Strategy) ---
      if (config.previewScale === 'auto') {
        previewGraph.zoomToFit({ padding: 20, maxScale: 1 })
        previewGraph.centerContent()
      } else if (config.previewScale === 'width') {
        // 宽度铺满：计算缩放倍数使得内容宽度等于容器宽度
        const contentBBox = previewGraph.getContentBBox()
        const scale = viewW / (contentBBox.width || 1)
        previewGraph.zoom(Math.min(scale, 1))
        previewGraph.centerContent()
      } else if (config.previewScale === 'height') {
        // 高度铺满
        const contentBBox = previewGraph.getContentBBox()
        const scale = viewH / (contentBBox.height || 1)
        previewGraph.zoom(Math.min(scale, 1))
        previewGraph.centerContent()
      } else {
        // 原始比例 (none)
        previewGraph.zoom(1)
        previewGraph.centerContent()
      }

      // --- 交互锁定 (Interaction Locks) ---
      if (config.lockMove) {
        previewGraph.disablePanning()
      } else {
        previewGraph.enablePanning()
      }

      if (config.lockZoom) {
        previewGraph.disableMouseWheel()
      } else {
        previewGraph.enableMouseWheel()
      }

    } catch (err: any) {
      console.error('预览渲染崩溃:', err)
      renderError.value = `渲染失败: ${err.message || '未知错误'}`
    }
  }
})

onUnmounted(() => {
  if (previewGraph) {
    previewGraph.dispose()
    previewGraph = null
  }
})

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function handleBack() {
  router.push('/') // 强制显式跳转根路径，比 back() 更稳定
}
</script>

<template>
  <div class="preview-view w-full h-full flex flex-col overflow-hidden font-sans">
    <header
      class="h-14 flex items-center justify-between px-6 shrink-0 z-50"
      style="background-color: rgba(15, 23, 42, 0.4); border-bottom: 1px solid rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px);">
      <div class="flex items-center gap-4">
        <button @click="handleBack"
          class="p-2 rounded-full transition-all active:scale-90"
          style="color: var(--color-text-muted);">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex flex-col">
          <span class="text-xs font-bold leading-tight tracking-wide" style="color: var(--color-text-primary);">{{ editorStore.canvasConfig.name || '未命名图纸'
            }}</span>
          <div class="flex items-center gap-1.5 mt-0.5">
            <div class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: var(--color-accent-emerald);"></div>
            <span class="text-[9px] uppercase font-black tracking-tighter" style="color: var(--color-text-muted);">Live Preview Mode</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button @click="toggleFullscreen"
          class="flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95"
          style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);">
          <component :is="isFullscreen ? Minimize : Maximize" class="w-3.5 h-3.5" style="color: var(--color-accent-sky);" />
          {{ isFullscreen ? '退出全屏' : '全屏预览' }}
        </button>
      </div>
    </header>

    <main
      class="flex-1 relative overflow-auto flex items-center justify-center p-12 select-none"
      style="background-color: var(--color-bg-primary); background-image: radial-gradient(circle, var(--color-bg-tertiary) 1px, transparent 1px); background-size: 20px 20px;">

      <div v-if="renderError"
        class="absolute inset-0 z-[60] flex flex-col items-center justify-center p-10 text-center"
        style="background-color: rgba(2, 6, 23, 0.8); backdrop-filter: blur(12px);">
        <AlertCircle class="w-12 h-12 mb-4 animate-bounce" style="color: var(--color-accent-rose);" />
        <h3 class="text-lg font-bold mb-2" style="color: var(--color-text-primary);">糟糕，无法渲染预览图</h3>
        <p class="text-xs max-w-sm leading-relaxed mb-6" style="color: var(--color-text-muted);">{{ renderError }}</p>
        <button @click="handleBack"
          class="px-6 py-2 font-bold rounded-lg text-xs transition-all"
          style="background-color: var(--color-accent-sky); color: var(--color-bg-primary);">返回编辑器重试</button>
      </div>

      <div ref="containerRef"
        class="preview-container transition-transform duration-500 ease-out"
        style="background-color: var(--color-bg-secondary); border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);"
        :style="{
          width: (editorStore.canvasConfig.width || 800) + 'px',
          height: (editorStore.canvasConfig.height || 600) + 'px'
        }"></div>
    </main>

    <div
      class="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full shadow-2xl pointer-events-none z-50"
      style="background-color: rgba(15, 23, 42, 0.9); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1);">
      <span class="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style="color: var(--color-text-muted);">
        <kbd class="px-1.5 py-0.5 rounded font-mono" style="background-color: var(--color-bg-tertiary); color: var(--color-text-secondary);">Ctrl</kbd> + Scroll to Zoom
      </span>
    </div>
  </div>
</template>

<style scoped>
.preview-view {
  height: 100vh;
  width: 100vw;
}

.preview-container {
  flex-shrink: 0;
  transform-origin: center;
}

:deep(.x6-port) {
  display: none !important;
}

/* 即使没有全局样式，预览也要确保动画可用 */
:deep(.node-anim-trigger) {
  transform-origin: center;
}
</style>
