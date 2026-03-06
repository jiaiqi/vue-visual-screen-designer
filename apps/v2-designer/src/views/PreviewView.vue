<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStoreV2 } from '@/stores/v2/workspaceStoreV2'
import { useThemeStoreV2 } from '@/stores/v2/themeStoreV2'
import type { SchemaEdge, SchemaNode, SchemaV2 } from '@vue-visual-screen/v2-shared'
import { x6ToSchemaV2 } from '@vue-visual-screen/v2-shared'

const schema = ref<SchemaV2 | null>(null)
const loadError = ref('')
const route = useRoute()
const router = useRouter()
const workspace = useWorkspaceStoreV2()
const themeStore = useThemeStoreV2()
const isDark = computed(() => themeStore.mode === 'dark')
const globalThemeColor = computed({
  get: () => themeStore.primaryColor,
  set: (value: string) => {
    void themeStore.setPrimaryColor(value)
  },
})
const backRoute = computed(() => {
  const appId = String(route.params.appId || '')
  const pageId = String(route.params.pageId || '')
  if (!appId || !pageId)
    return '/apps'
  return `/app/${appId}/page/${pageId}/editor`
})

const nodeMap = computed(() => {
  const map = new Map<string, SchemaNode>()
  const nodes = schema.value?.nodes || []
  nodes.forEach((node) => map.set(node.id, node))
  return map
})

const canvasStyle = computed(() => {
  const canvas = schema.value?.canvas
  if (!canvas)
    return {}

  return {
    width: `${canvas.width}px`,
    height: `${canvas.height}px`,
    background: canvas.background || '#0f172a',
  }
})

function edgePath(edge: SchemaEdge): string {
  const source = nodeMap.value.get(edge.source)
  const target = nodeMap.value.get(edge.target)
  if (!source || !target)
    return ''

  const sx = source.layout.x + source.layout.width / 2
  const sy = source.layout.y + source.layout.height / 2
  const tx = target.layout.x + target.layout.width / 2
  const ty = target.layout.y + target.layout.height / 2

  return `M ${sx} ${sy} L ${tx} ${ty}`
}

onMounted(() => {
  void (async () => {
    try {
      await themeStore.init()
      await workspace.init()
      const appId = String(route.params.appId || '')
      const pageId = String(route.params.pageId || '')

      if (appId && pageId) {
        const page = workspace.findPageByRoute(appId, pageId)
        if (page) {
          schema.value = x6ToSchemaV2(page.graphData, {
            width: Number((page.canvasConfig.width as number) || 1920),
            height: Number((page.canvasConfig.height as number) || 1080),
            backgroundColor: String((page.canvasConfig.backgroundColor as string) || '#0f172a'),
          })
          return
        }
      }

      const schemaText = localStorage.getItem('v2_preview_schema_data')
      if (schemaText) {
        schema.value = JSON.parse(schemaText) as SchemaV2
        return
      }

      const graphText = localStorage.getItem('v2_preview_graph_data')
      if (graphText) {
        const graphJson = JSON.parse(graphText) as Record<string, unknown>
        schema.value = x6ToSchemaV2(graphJson, {
          width: 1920,
          height: 1080,
          backgroundColor: '#0f172a',
        })
        return
      }

      loadError.value = '未找到可预览数据，请回到设计器点击“预览”后重试。'
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      loadError.value = `预览数据解析失败：${msg}`
    }
  })()
})

function toggleTheme() {
  void themeStore.toggleMode()
}
</script>

<template>
  <div class="v2-preview">
    <header class="preview-header">
      <h1>V2 预览</h1>
      <div class="preview-header-actions">
        <button class="back-btn" @click="toggleTheme">
          {{ isDark ? '浅色' : '深色' }}
        </button>
        <input v-model="globalThemeColor" class="theme-color" type="color" title="主题色" />
        <button class="back-btn" @click="router.push(backRoute)">
          返回设计器
        </button>
      </div>
    </header>

    <div class="preview-canvas-wrap scrollbar-theme">
      <div v-if="loadError" class="canvas-placeholder">
        <h2>无法预览</h2>
        <p>{{ loadError }}</p>
      </div>

      <div v-else-if="schema" class="schema-canvas" :style="canvasStyle">
        <svg class="edge-layer" :width="schema.canvas.width" :height="schema.canvas.height">
          <path
            v-for="edge in schema.edges"
            :key="edge.id"
            :d="edgePath(edge)"
            :stroke="edge.style.stroke || '#38bdf8'"
            :stroke-width="edge.style.strokeWidth || 2"
            :stroke-dasharray="edge.style.strokeDasharray || undefined"
            fill="none"
            stroke-linecap="round"
          />
        </svg>

        <div
          v-for="node in schema.nodes"
          :key="node.id"
          class="node-item"
          :style="{
            left: `${node.layout.x}px`,
            top: `${node.layout.y}px`,
            width: `${node.layout.width}px`,
            height: `${node.layout.height}px`,
            borderColor: node.style?.borderColor || '#3b82f6',
            background: node.style?.background || 'rgba(30,41,59,0.8)',
            zIndex: String(node.layout.zIndex || 1),
          }"
        >
          <div class="node-label">
            {{ node.type }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v2-preview {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
}

.preview-header {
  height: 56px;
  flex-shrink: 0;
  border-bottom: 1px solid color-mix(in oklab, var(--color-border-secondary) 90%, transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  color: var(--color-text-primary);
}

.preview-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-header h1 {
  font-size: 14px;
  margin: 0;
}

.back-btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid color-mix(in oklab, var(--theme-primary) 56%, transparent);
  background: color-mix(in oklab, var(--theme-primary) 16%, transparent);
  color: var(--theme-primary);
  cursor: pointer;
}

.theme-color {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 90%, transparent);
  background: transparent;
  padding: 2px;
}

.preview-canvas-wrap {
  flex: 1;
  overflow: auto;
  position: relative;
}

.canvas-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.schema-canvas {
  position: relative;
  margin: 24px;
  box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.25), 0 20px 50px rgba(0, 0, 0, 0.55);
}

.edge-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.node-item {
  position: absolute;
  border: 1px solid;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e2e8f0;
  font-size: 12px;
}

.node-label {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.45);
}
</style>
