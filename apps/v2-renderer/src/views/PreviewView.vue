<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { SchemaEdge, SchemaNode, SchemaV2 } from '@vue-visual-screen/v2-shared'
import { x6ToSchemaV2 } from '@vue-visual-screen/v2-shared'

const schema = ref<SchemaV2 | null>(null)
const loadError = ref('')

const nodeMap = computed(() => {
  const map = new Map<string, SchemaNode>()
  const nodes = schema.value?.nodes || []
  nodes.forEach((node) => map.set(node.id, node))
  return map
})

const canvasStyle = computed(() => {
  const canvas = schema.value?.canvas
  if (!canvas) return {}
  return {
    width: `${canvas.width}px`,
    height: `${canvas.height}px`,
    background: canvas.background || '#0f172a',
  }
})

function edgePath(edge: SchemaEdge): string {
  const source = nodeMap.value.get(edge.source)
  const target = nodeMap.value.get(edge.target)
  if (!source || !target) return ''

  const sx = source.layout.x + source.layout.width / 2
  const sy = source.layout.y + source.layout.height / 2
  const tx = target.layout.x + target.layout.width / 2
  const ty = target.layout.y + target.layout.height / 2

  return `M ${sx} ${sy} L ${tx} ${ty}`
}

onMounted(() => {
  try {
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

    loadError.value = '未找到可预览数据，请从设计器点击“预览”后重试。'
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    loadError.value = `预览数据解析失败：${msg}`
  }
})
</script>

<template>
  <div class="v2-renderer">
    <div class="renderer-header">
      <h1>Vue Visual Screen Renderer v2</h1>
      <span class="renderer-sub">Schema Driven Preview</span>
    </div>

    <div class="renderer-canvas">
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
          <div class="node-label">{{ node.type }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v2-renderer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.renderer-header {
  height: 60px;
  background: #1a1a1a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #333;
}

.renderer-header h1 {
  font-size: 18px;
  margin: 0;
}

.renderer-sub {
  font-size: 12px;
  color: #38bdf8;
}

.renderer-canvas {
  flex: 1;
  background: #0a0a0a;
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
  color: #666;
}

.canvas-placeholder h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.canvas-placeholder p {
  font-size: 14px;
  margin: 5px 0;
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
