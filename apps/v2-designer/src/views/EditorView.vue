<script setup lang="ts">
/**
 * EditorViewV2 — v2 编辑器主视图
 *
 * ui-ux-pro-max 设计规范：
 *   - Dark Dashboard 风格：深层次色阶 #020617 / #0f1629 / #1e293b
 *   - 科技蓝主色调：#0ea5e9 / #38bdf8
 *   - 玻璃态侧边栏、细腻边框、微妙光晕效果
 */
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import { useWorkspaceStoreV2 } from '@/stores/v2/workspaceStoreV2'
import { useNotifier } from '@/composables/useNotifier'
import ToolbarV2 from '@/components/v2/editor/ToolbarV2.vue'
import CanvasEditorV2 from '@/components/v2/editor/CanvasEditorV2.vue'
import PropertyPanelV2 from '@/components/v2/editor/PropertyPanelV2.vue'
import HeaderV2 from '@/components/v2/editor/HeaderV2.vue'
import GlobalToast from '@/components/v2/common/GlobalToast.vue'

const editorStore = useEditorStoreV2()
const canvasStore = useCanvasStoreV2()
const workspaceStore = useWorkspaceStoreV2()
const notifier = useNotifier()
const route = useRoute()
const router = useRouter()

// JSON 编辑器弹窗（简化版）
const showJsonEditor = ref(false)
const jsonEditorContent = ref('')
const isBootstrapping = ref(true)
const isHydrating = ref(false)

function hydrateGraphFromActivePage() {
  const graph = editorStore.graph
  const page = workspaceStore.activePage
  if (!graph || !page)
    return
  isHydrating.value = true
  editorStore.importData(page.graphData)
  isHydrating.value = false
}

function openJsonEditor() {
  const graph = editorStore.graph
  if (graph) jsonEditorContent.value = JSON.stringify(graph.toJSON(), null, 2)
  showJsonEditor.value = true
}

function applyJson() {
  try {
    const data = JSON.parse(jsonEditorContent.value)
    editorStore.importData(data)
    showJsonEditor.value = false
  } catch (e) {
    alert('JSON 格式错误，请检查后重试')
  }
}

async function syncRouteWorkspace() {
  await workspaceStore.init()
  const appId = String(route.params.appId || '')
  const pageId = String(route.params.pageId || '')
  if (!appId || !pageId) {
    isBootstrapping.value = false
    await router.replace('/apps')
    return
  }

  const page = workspaceStore.findPageByRoute(appId, pageId)
  if (!page) {
    notifier.warning('页面不存在', '请从应用管理页重新进入编辑。')
    isBootstrapping.value = false
    await router.replace('/apps')
    return
  }

  await workspaceStore.setActiveApp(appId)
  await workspaceStore.setActivePage(pageId)
  canvasStore.importConfig(page.canvasConfig as unknown as Parameters<typeof canvasStore.importConfig>[0])
  hydrateGraphFromActivePage()
  isBootstrapping.value = false
}

watch(
  () => [route.params.appId, route.params.pageId],
  () => {
    void syncRouteWorkspace()
  },
  { immediate: true },
)

watch(
  () => editorStore.graph,
  (graph, _, onCleanup) => {
    if (!graph || !workspaceStore.activePage)
      return

    hydrateGraphFromActivePage()

    let timer: ReturnType<typeof setTimeout> | null = null
    const persist = () => {
      if (isHydrating.value)
        return
      if (timer)
        clearTimeout(timer)
      timer = setTimeout(() => {
        void workspaceStore.saveCurrentPageSnapshot({
          canvasConfig: canvasStore.exportConfig() as Record<string, unknown>,
          graphData: graph.toJSON() as Record<string, unknown>,
        })
      }, 700)
    }

    graph.on('cell:added', persist)
    graph.on('cell:removed', persist)
    graph.on('cell:changed', persist)
    graph.on('node:moved', persist)
    graph.on('node:resized', persist)

    onCleanup(() => {
      if (timer)
        clearTimeout(timer)
      graph.off('cell:added', persist)
      graph.off('cell:removed', persist)
      graph.off('cell:changed', persist)
      graph.off('node:moved', persist)
      graph.off('node:resized', persist)
    })
  },
)

watch(
  () => workspaceStore.activePageId,
  () => {
    hydrateGraphFromActivePage()
  },
)
</script>

<template>
  <div class="ev2-root">
    <div v-if="isBootstrapping" class="booting-layer">正在加载应用页面...</div>

    <!-- 顶部导航栏 -->
    <HeaderV2 @open-json-editor="openJsonEditor" />

    <!-- 主工作区 -->
    <main class="ev2-main">
      <!-- 左侧图元库 -->
      <aside class="ev2-sidebar-left" :class="{ collapsed: editorStore.isToolbarCollapsed }">
        <ToolbarV2 />
      </aside>

      <!-- 中部画布 -->
      <section class="ev2-canvas-area">
        <CanvasEditorV2 />
      </section>

      <!-- 右侧属性面板 -->
      <aside class="ev2-sidebar-right" :class="{ collapsed: editorStore.isPropertyPanelCollapsed }">
        <PropertyPanelV2 />
      </aside>
    </main>

    <!-- JSON 编辑器弹窗 -->
    <Teleport to="body">
      <div v-if="showJsonEditor" class="json-modal-overlay" @click.self="showJsonEditor = false">
        <div class="json-modal">
          <div class="json-modal-header">
            <span>JSON 数据编辑器</span>
            <button class="json-modal-close" @click="showJsonEditor = false">✕</button>
          </div>
          <textarea v-model="jsonEditorContent" class="json-modal-editor scrollbar-theme" spellcheck="false" />
          <div class="json-modal-footer">
            <button class="json-btn cancel" @click="showJsonEditor = false">取消</button>
            <button class="json-btn apply" @click="applyJson">应用</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
  <GlobalToast />
</template>

<style scoped>
/* ===== 根布局 ===== */
.ev2-root {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg-primary);
  font-family: 'Inter', system-ui, sans-serif;
}

/* ===== 主工作区 ===== */
.ev2-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* ===== 左侧边栏 ===== */
.ev2-sidebar-left {
  height: 100%;
  flex-shrink: 0;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 10;
  width: 260px;
  /* 玻璃态侧边栏 */
  background: color-mix(in oklab, var(--color-bg-secondary) 94%, transparent);
  backdrop-filter: blur(12px);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.4);
}

.ev2-sidebar-left.collapsed {
  width: 56px;
}

/* ===== 画布区 ===== */
.ev2-canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, var(--theme-primary) 12%, transparent) 0%, transparent 65%),
    var(--color-bg-primary);
}

/* ===== 右侧属性面板 ===== */
.ev2-sidebar-right {
  height: 100%;
  flex-shrink: 0;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 10;
  width: 300px;
  background: color-mix(in oklab, var(--color-bg-secondary) 94%, transparent);
  backdrop-filter: blur(12px);
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.4);
}

.ev2-sidebar-right.collapsed {
  width: 24px;
}

/* ===== JSON 弹窗 ===== */
.json-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.json-modal {
  width: 700px;
  max-width: 90vw;
  height: 70vh;
  background: #0f172a;
  border: 1px solid rgba(51, 65, 85, 0.6);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.json-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.json-modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: rgba(51, 65, 85, 0.4);
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}

.json-modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.json-modal-editor {
  flex: 1;
  resize: none;
  padding: 16px;
  background: #020617;
  border: none;
  outline: none;
  color: #94a3b8;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
}

.json-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid rgba(51, 65, 85, 0.5);
}

.json-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
}

.json-btn.cancel {
  background: rgba(51, 65, 85, 0.3);
  color: #94a3b8;
  border-color: rgba(51, 65, 85, 0.5);
}

.json-btn.cancel:hover {
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
}

.json-btn.apply {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border-color: rgba(14, 165, 233, 0.3);
}

.json-btn.apply:hover {
  background: #0ea5e9;
  color: #020617;
}

.booting-layer {
  position: absolute;
  top: 56px;
  right: 20px;
  z-index: 120;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(51, 65, 85, 0.6);
  color: #94a3b8;
  font-size: 12px;
}
</style>
