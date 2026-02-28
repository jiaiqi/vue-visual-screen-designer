<script setup lang="ts">
import CanvasEditor from './components/editor/CanvasEditor.vue'
import Toolbar from './components/editor/Toolbar.vue'
import { provide } from 'vue'

// 未来可以在这里 provide 核心依赖
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
    <!-- 顶部动作栏 (Header) -->
    <header class="h-12 border-b px-4 flex items-center justify-between shrink-0">
      <h1 class="font-bold text-lg select-none">车间平面规划图编辑器</h1>
      <div class="actions flex items-center gap-2">
      </div>
    </header>

    <!-- 工作台 -->
    <main class="flex-1 flex overflow-hidden">
      <!-- 左侧工具栏 -->
      <Toolbar />

      <!-- 中央绘图区域 -->
      <div class="flex-1 relative flex flex-col">
        <CanvasEditor />
      </div>

      <!-- 右侧属性面板 Placeholder -->
      <aside class="w-72 border-l bg-card flex flex-col shrink-0">
        <div class="p-3 border-b font-medium text-sm">属性设置</div>
        <div class="p-4 text-muted-foreground text-sm">选择对象以查看属性</div>
      </aside>
    </main>
  </div>
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

* {
  box-sizing: border-box;
}
</style>
