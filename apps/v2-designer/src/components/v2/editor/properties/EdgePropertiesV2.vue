<script setup lang="ts">
import { ref, watch } from 'vue'
import { Edge } from '@antv/x6'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'

const props = defineProps<{
  edge: Edge
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const editorStore = useEditorStoreV2()

// 所有预设的工业化连线类型
const edgePresets = [
  { value: 'water-flow', label: '流体管道 (Water)' },
  { value: 'electric-flow', label: '发光电流 (Electric)' },
  { value: 'arrow-flow', label: '跑马箭头 (Arrow)' },
  { value: 'particle-flow', label: '粒子流 (Particle)' },
  { value: 'pulse-flow', label: '脉冲波 (Pulse)' },
  { value: 'fluid-pipe', label: '基础 3D 管道' },
  { value: 'electric-line', label: '基础发光线' },
  { value: 'edge', label: '标准实线' }
]

const currentShape = ref('fluid-pipe')
const errorMessage = ref('')

const loadEdgeConfig = () => {
  if (props.edge) {
    currentShape.value = props.edge.shape || 'edge'
  }
}

watch(() => props.edge, loadEdgeConfig, { immediate: true })

/**
 * 修改连线类型
 * 由于 X6 中 Edge 的 shape (包括其 markup) 是创建时决定的，
 * 若要彻底改变一种带特殊动画结构 (markup) 的边，最稳妥的做法是删旧建新
 */
const changeEdgeShape = (newShape: string) => {
  if (currentShape.value === newShape) return

  const graph = editorStore.graph
  if (!graph || !props.edge) return

  errorMessage.value = ''
  const oldEdge = props.edge
  const source = JSON.parse(JSON.stringify(oldEdge.getSource() || {}))
  const target = JSON.parse(JSON.stringify(oldEdge.getTarget() || {}))
  const vertices = oldEdge.getVertices() ? JSON.parse(JSON.stringify(oldEdge.getVertices())) : []

  // 对于可能被默认省去的路由和连接器，要 fallback 到全局默认值
  const router = oldEdge.getRouter() || { name: 'orth' }
  const connector = oldEdge.getConnector() || { name: 'rounded' }
  const labels = oldEdge.getLabels() ? JSON.parse(JSON.stringify(oldEdge.getLabels())) : []
  const data = oldEdge.getData() ? JSON.parse(JSON.stringify(oldEdge.getData())) : {}
  const zIndex = oldEdge.getZIndex()

  try {
    // 先创建新边，确保成功后再删旧边，避免失败时连线直接丢失
    const newEdge = graph.addEdge({
      shape: newShape,
      source,
      target,
      vertices,
      router,
      connector,
      labels,
      zIndex,
      data,
    })

    // 新边创建成功后再清理旧边
    editorStore.deselect([oldEdge.id])
    graph.unselect(oldEdge)
    oldEdge.removeTools()
    oldEdge.remove()

    // 重新对新边挂载选中态
    editorStore.select([newEdge.id])
    currentShape.value = newShape
    emit('update')
  } catch (error) {
    console.error('[EdgePropertiesV2] changeEdgeShape failed:', error)
    const message = error instanceof Error ? error.message : String(error)
    errorMessage.value = `切换失败：${message}`
  }
}
</script>

<template>
  <div class="edge-properties-v2">
    <div class="panel-section">
      <div class="section-title">连线类型 (动态重构)</div>

      <div class="preset-list">
        <button v-for="preset in edgePresets" :key="preset.value" class="preset-btn"
          :class="{ active: currentShape === preset.value }" @click="changeEdgeShape(preset.value)">
          <div class="icon-indicator" :class="preset.value"></div>
          <span>{{ preset.label }}</span>
        </button>
      </div>

      <div class="help-text">
        选择上述类型后，会实时重构画布中选中的连线为目标工业动效。
      </div>

      <Transition name="edge-error">
        <div v-if="errorMessage" class="error-tip">
          <div class="error-title">切换连线类型失败</div>
          <div class="error-message">{{ errorMessage }}</div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.edge-properties-v2 {
  padding: 16px;
  color: #e2e8f0;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 4px;
}

.preset-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.preset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 6px;
  padding: 8px 12px;
  color: #cbd5e1;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.preset-btn:hover {
  background: rgba(51, 65, 85, 0.6);
  border-color: rgba(71, 85, 105, 0.8);
}

.preset-btn.active {
  background: rgba(14, 165, 233, 0.15);
  border-color: #0ea5e9;
  color: #38bdf8;
}

.icon-indicator {
  width: 12px;
  height: 2px;
  border-radius: 2px;
  background: #64748b;
}

/* 简单的类型颜色指示器 */
.water-flow {
  background: #38bdf8;
}

.electric-flow {
  background: #ffab00;
  box-shadow: 0 0 4px #ffab00;
}

.arrow-flow {
  background: #00e676;
}

.particle-flow {
  background: #c084fc;
  border-style: dotted;
}

.pulse-flow {
  background: #ff4081;
}

.help-text {
  margin-top: 8px;
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
}

.error-tip {
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(251, 113, 133, 0.4);
  background: linear-gradient(135deg, rgba(70, 14, 28, 0.92), rgba(36, 10, 22, 0.92));
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}

.error-title {
  font-size: 12px;
  font-weight: 700;
  color: #fecdd3;
  margin-bottom: 4px;
}

.error-message {
  font-size: 11px;
  line-height: 1.45;
  color: #fda4af;
  word-break: break-word;
}

.edge-error-enter-active,
.edge-error-leave-active {
  transition: all 0.2s ease;
}

.edge-error-enter-from,
.edge-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
