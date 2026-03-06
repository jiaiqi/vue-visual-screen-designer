<script setup lang="ts">
/**
 * v2 画布属性面板
 * 适配 useCanvasStoreV2 和 useEditorStoreV2
 */
import { computed, markRaw } from 'vue'
import { useCanvasStoreV2 } from '@/stores/v2/canvasStoreV2'
import {
  NForm, NFormItem, NInput, NSelect, NInputNumber,
  NColorPicker, NCheckbox, NText, NDivider,
  NUpload, NIcon, NCollapse, NCollapseItem,
  NButton, NSlider
} from 'naive-ui'
import { Upload } from 'lucide-vue-next'

const canvasStore = useCanvasStoreV2()

const UploadIcon = markRaw(Upload)

const config = computed(() => canvasStore.config)
const viewport = computed(() => canvasStore.viewport)

const categoryOptions = [
  { label: '基础底图', value: '基础底图' },
  { label: '智慧物联', value: '智慧物联' },
  { label: '电力系统', value: '电力系统' },
  { label: '暖通空调', value: '暖通空调' },
]

const themeOptions = [
  { label: '暗黑', value: 'dark' },
  { label: '明亮', value: 'light' },
]

function handleUpdate(partial: Partial<typeof canvasStore.config>) {
  canvasStore.updateConfig(partial)
}

function handleImageUpload({ file }: { file: { file: File | null } }) {
  const fileObj = file.file
  if (!fileObj) return false

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    if (dataUrl) {
      handleUpdate({ backgroundImage: dataUrl })
    }
  }
  reader.readAsDataURL(fileObj)
  return false
}
</script>

<template>
  <div v-if="config" class="canvas-properties p-4 select-none">
    <n-form label-placement="left" label-width="80" size="small">
      <div class="flex items-center gap-2 mb-6 pb-2" style="border-bottom: 1px solid color-mix(in oklab, var(--theme-primary) 45%, transparent);">
        <span class="text-xs font-bold uppercase tracking-widest" style="color: var(--color-accent-sky);">画布 (V2)</span>
      </div>

      <n-form-item label="文件名">
        <n-input :value="config.name" @update:value="v => handleUpdate({ name: v })" placeholder="输入图纸名称" />
      </n-form-item>

      <n-form-item label="分类">
        <n-select :value="config.category" :options="categoryOptions"
          @update:value="v => handleUpdate({ category: v })" />
      </n-form-item>

      <n-divider style="margin: 16px 0" />

      <div class="flex items-center gap-4 mb-4">
        <n-text depth="3" class="text-[11px] shrink-0 w-[80px]">画布尺寸</n-text>
        <div class="flex items-center gap-2 flex-1">
          <div class="flex items-center gap-1 flex-1">
            <n-text depth="3" class="text-[10px] uppercase font-bold" style="color: var(--color-text-muted);">W</n-text>
            <n-input-number :value="config.width" :min="400" :max="5000" :step="10" :show-button="false" class="w-full"
              @update:value="v => handleUpdate({ width: v || 1920 })" />
          </div>
          <div class="flex items-center gap-1 flex-1">
            <n-text depth="3" class="text-[10px] uppercase font-bold" style="color: var(--color-text-muted);">H</n-text>
            <n-input-number :value="config.height" :min="300" :max="4000" :step="10" :show-button="false" class="w-full"
              @update:value="v => handleUpdate({ height: v || 1080 })" />
          </div>
        </div>
      </div>

      <n-form-item label="背景颜色">
        <n-color-picker :value="config.backgroundColor" :show-alpha="true"
          @update:value="v => handleUpdate({ backgroundColor: v })" />
      </n-form-item>

      <n-form-item label="背景图片">
        <div class="w-full">
          <n-upload accept="image/*" :show-file-list="false" @before-upload="handleImageUpload">
            <div
              class="upload-area border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden group"
              style="border-color: var(--color-border-primary); background-color: color-mix(in oklab, var(--color-bg-tertiary) 70%, transparent);">
              <template v-if="config.backgroundImage">
                <img :src="config.backgroundImage" class="w-full h-full object-contain p-2" />
                <div
                  class="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
                  style="background-color: color-mix(in oklab, var(--color-bg-primary) 45%, transparent);">
                  <n-text class="text-white text-[10px]">点击更换图片</n-text>
                </div>
              </template>
              <template v-else>
                <div class="flex flex-col items-center transition-opacity" style="opacity: 0.4;">
                  <n-icon size="24" :component="UploadIcon" />
                  <n-text class="mt-2 text-[10px]">点击上传图片</n-text>
                </div>
              </template>
            </div>
          </n-upload>
          <n-button v-if="config.backgroundImage" size="tiny" quaternary type="error" class="mt-2 w-full"
            @click="handleUpdate({ backgroundImage: '' })">
            清除背景图
          </n-button>
        </div>
      </n-form-item>

      <n-form-item label="背景网格">
        <div class="flex items-center gap-2 w-full">
          <n-checkbox :checked="config.showGrid" @update:checked="v => handleUpdate({ showGrid: v })" />
          <n-text class="text-[10px] text-slate-500">显示</n-text>
          <n-checkbox :checked="config.snapToGrid" @update:checked="v => handleUpdate({ snapToGrid: v })" />
          <n-text class="text-[10px] text-slate-500">吸附线</n-text>
          <n-input-number :value="config.gridSize" :min="5" :max="100" :show-button="false" class="w-12 ml-auto"
            @update:value="v => handleUpdate({ gridSize: v || 20 })" />
        </div>
      </n-form-item>

      <n-form-item label="主题">
        <n-select :value="config.theme" :options="themeOptions" @update:value="v => handleUpdate({ theme: v })" />
      </n-form-item>

      <n-collapse :default-expanded-names="['viewport']" style="margin-top: 24px">
        <n-collapse-item title="视图状态" name="viewport">
          <div class="px-1 space-y-4">
            <div class="flex items-center justify-between">
              <n-text class="text-xs" style="color: var(--color-text-tertiary);">缩放比例</n-text>
              <n-text class="text-xs font-bold" style="color: var(--color-accent-sky);">{{ (viewport.zoom *
                100).toFixed(0)
                }}%</n-text>
            </div>
            <n-slider :value="viewport.zoom" :min="0.1" :max="3" :step="0.01"
              @update:value="v => canvasStore.setZoom(v)" />

            <div class="grid grid-cols-2 gap-2">
              <n-button size="tiny" secondary @click="canvasStore.setZoom(1)">1:1 重置</n-button>
              <n-button size="tiny" secondary @click="canvasStore.resetScroll()">位置归零</n-button>
            </div>
          </div>
        </n-collapse-item>
      </n-collapse>
    </n-form>
  </div>
</template>

<style scoped>
.canvas-properties {
  height: 100%;
  overflow-y: auto;
}

:deep(.n-form-item-label) {
  font-size: 11px !important;
  color: var(--color-text-tertiary) !important;
}

:deep(.n-input),
:deep(.n-input-number),
:deep(.n-select) {
  --n-border-radius: 4px !important;
  background-color: var(--color-bg-secondary) !important;
}

.upload-area {
  position: relative;
}

:deep(.n-collapse-item__header-main) {
  font-size: 11px !important;
  font-weight: bold;
  color: var(--ui-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

:deep(.n-collapse-item) {
  border-top: 1px solid var(--ui-border);
}
</style>
