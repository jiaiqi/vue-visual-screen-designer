<script setup lang="ts">
import { ref, onMounted } from 'vue'

const canvasRef = ref<HTMLDivElement>()

onMounted(() => {
  console.log('V2 Renderer mounted')
})
</script>

<template>
  <div class="v2-renderer">
    <div class="renderer-header">
      <h1>Vue Visual Screen Renderer v2</h1>
    </div>
    <div ref="canvasRef" class="renderer-canvas">
      <!-- Rendering area -->
      <div class="canvas-placeholder">
        <h2>渲染区域</h2>
        <p>V2渲染器架构已搭建完成</p>
        <p>用于预览和生产环境渲染</p>
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
  padding: 0 20px;
  border-bottom: 1px solid #333;
}

.renderer-header h1 {
  font-size: 18px;
  margin: 0;
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
</style>
