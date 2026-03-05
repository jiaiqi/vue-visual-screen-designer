<script setup lang="ts">
/**
 * ToolbarV2：适配 v2 store 的图元工具栏
 * 通过桥接方式将 editorStoreV2 的 graph 同步到 v1 Toolbar 所依赖的 editorStore
 */
import { watch } from 'vue'
import type { Graph } from '@antv/x6'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import { useEditorStore } from '@/stores/editor'
import Toolbar from '../../editor/Toolbar.vue'

const editorStoreV2 = useEditorStoreV2()
const editorStoreV1 = useEditorStore()

/**
 * 核心桥接：当 v2 graph 实例变化时，同步到 v1 store
 * 这样 v1 Toolbar 的 DnD 拖拽逻辑能直接操作同一个 graph 实例
 */
watch(() => editorStoreV2.graph, (graph) => {
  editorStoreV1.initGraph(graph as Graph | null)
}, { immediate: true })
</script>

<template>
  <!-- 直接复用 v1 Toolbar，桥接层已同步 graph 实例 -->
  <Toolbar />
</template>
