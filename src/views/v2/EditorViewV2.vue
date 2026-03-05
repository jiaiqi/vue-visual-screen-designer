<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditorStoreV2 } from '@/stores/v2/editorStoreV2'
import ToolbarV2 from '@/components/v2/editor/ToolbarV2.vue'
import CanvasEditorV2 from '@/components/v2/editor/CanvasEditorV2.vue'
import PropertyPanelV2 from '@/components/v2/editor/PropertyPanelV2.vue'
import HeaderV2 from '@/components/v2/editor/HeaderV2.vue'
import JsonEditorModal from '@/components/editor/JsonEditorModal.vue'

const editorStore = useEditorStoreV2()
const showJsonEditor = ref(false)

const toolbarWidth = computed(() => editorStore.isToolbarCollapsed ? '60px' : '280px')
const propertyPanelWidth = computed(() => editorStore.isPropertyPanelCollapsed ? '24px' : '300px')
</script>

<template>
  <div class="editor-view-v2">
    <!-- 顶部导航 -->
    <HeaderV2 @open-json-editor="showJsonEditor = true" />

    <!-- 主内容区 -->
    <main class="editor-main">
      <!-- 左侧图元库 -->
      <div
        class="editor-toolbar"
        :style="{ width: toolbarWidth }"
      >
        <ToolbarV2 />
      </div>

      <!-- 中部画布区 -->
      <div class="editor-canvas-area">
        <CanvasEditorV2 />
      </div>

      <!-- 右侧属性面板 -->
      <div
        class="editor-property-panel"
        :style="{ width: propertyPanelWidth }"
      >
        <PropertyPanelV2 />
      </div>
    </main>

    <!-- JSON 编辑器弹窗 -->
    <JsonEditorModal v-if="showJsonEditor" @close="showJsonEditor = false" />
  </div>
</template>

<style scoped>
.editor-view-v2 {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #020617;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-toolbar {
  height: 100%;
  flex-shrink: 0;
  transition: width 0.3s ease;
  overflow: hidden;
}

.editor-canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.editor-property-panel {
  height: 100%;
  flex-shrink: 0;
  transition: width 0.3s ease;
  overflow: hidden;
}
</style>
