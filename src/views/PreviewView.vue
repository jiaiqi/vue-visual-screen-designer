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
  <div class="preview-view w-full h-full bg-[#020617] flex flex-col overflow-hidden text-slate-100 font-sans">
    <!-- 预览控制条 -->
    <header
      class="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/40 backdrop-blur-xl shrink-0 z-50">
      <div class="flex items-center gap-4">
        <button @click="handleBack"
          class="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90 text-slate-400 hover:text-white">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex flex-col">
          <span class="text-xs font-bold leading-tight tracking-wide">{{ editorStore.canvasConfig.name || '未命名图纸'
            }}</span>
          <div class="flex items-center gap-1.5 mt-0.5">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Live Preview Mode</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button @click="toggleFullscreen"
          class="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] font-bold transition-all active:scale-95">
          <component :is="isFullscreen ? Minimize : Maximize" class="w-3.5 h-3.5 text-sky-400" />
          {{ isFullscreen ? '退出全屏' : '全屏预览' }}
        </button>
      </div>
    </header>

    <!-- 预览主体 -->
    <main
      class="flex-1 relative overflow-auto flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] bg-slate-950 p-12 select-none">

      <!-- 渲染错误提示 -->
      <div v-if="renderError"
        class="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md p-10 text-center">
        <AlertCircle class="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h3 class="text-lg font-bold text-white mb-2">糟糕，无法渲染预览图</h3>
        <p class="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">{{ renderError }}</p>
        <button @click="handleBack"
          class="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-all">返回编辑器重试</button>
      </div>

      <!-- 画布容器 -->
      <div ref="containerRef"
        class="preview-container shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] bg-slate-900 border border-white/5 transition-transform duration-500 ease-out"
        :style="{
          width: (editorStore.canvasConfig.width || 800) + 'px',
          height: (editorStore.canvasConfig.height || 600) + 'px'
        }"></div>
    </main>

    <!-- 操作提示 -->
    <div
      class="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-full shadow-2xl pointer-events-none z-50">
      <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
        <kbd class="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono">Ctrl</kbd> + Scroll to Zoom
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
