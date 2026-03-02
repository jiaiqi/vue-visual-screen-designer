<script setup lang="ts">
import { computed, markRaw } from 'vue'
import { useEditorStore } from '@/stores/editor'
import {
  NForm, NFormItem, NInput, NSelect, NInputNumber,
  NColorPicker, NCheckbox, NText, NDivider,
  NRadioGroup, NRadio, NUpload, NIcon, NCollapse, NCollapseItem,
  NButton, NSlider, NSwitch
} from 'naive-ui'
import { Upload } from 'lucide-vue-next'

const editorStore = useEditorStore()

const UploadIcon = markRaw(Upload)

const config = computed(() => editorStore.canvasConfig)
const snaplineConfig = computed(() => editorStore.snaplineConfig)

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

const snaplineColorOptions = [
  { label: '橙色', value: '#f97316' },
  { label: '红色', value: '#ef4444' },
  { label: '青色', value: '#06b6d4' },
  { label: '紫色', value: '#a855f7' },
  { label: '绿色', value: '#22c55e' },
]

function handleUpdate(partial: Record<string, unknown>) {
  if (editorStore) {
    editorStore.updateCanvasConfig(partial)
  }
}

function handleSnaplineUpdate(partial: Record<string, unknown>) {
  if (editorStore) {
    editorStore.updateSnaplineConfig(partial)
  }
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
      <div class="flex items-center gap-2 mb-6 pb-2" style="border-bottom: 1px solid rgba(14, 165, 233, 0.3);">
        <span class="text-xs font-bold uppercase tracking-widest" style="color: var(--color-accent-sky);">画布</span>
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
              style="border-color: var(--color-border-primary); background-color: rgba(30, 41, 59, 0.1);">
              <template v-if="config.backgroundImage">
                <img :src="config.backgroundImage" class="w-full h-full object-contain p-2" />
                <div
                  class="absolute inset-0 flex items-center justify-center transition-opacity"
                  style="background-color: rgba(0, 0, 0, 0.4);">
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
          <n-checkbox :checked="config.snapToGrid" @update:checked="v => handleUpdate({ snapToGrid: v })" />
          <n-checkbox :checked="false" disabled />
          <n-input-number :value="config.gridSize" :min="5" :max="100" :show-button="false" class="w-12 ml-auto"
            @update:value="v => handleUpdate({ gridSize: v || 20 })" />
        </div>
      </n-form-item>

      <n-form-item label="主题">
        <n-select :value="config.theme" :options="themeOptions" @update:value="v => handleUpdate({ theme: v })" />
      </n-form-item>

      <n-collapse :default-expanded-names="['preview']" style="margin-top: 24px">
        <n-collapse-item title="预览设置" name="preview">
          <div class="preview-settings px-1">
            <div class="label text-[11px] mb-3 tracking-wide" style="color: var(--color-text-muted);">缩放方式</div>
            <n-radio-group :value="config.previewScale" @update:value="v => handleUpdate({ previewScale: v })"
              name="preview-scale">
              <div class="flex flex-col gap-3">
                <n-radio value="auto"><span class="text-xs">自动铺满</span></n-radio>
                <n-radio value="width"><span class="text-xs">宽度铺满</span></n-radio>
                <n-radio value="height"><span class="text-xs">高度铺满</span></n-radio>
              </div>
            </n-radio-group>

            <div class="flex flex-col gap-4 mt-8">
              <div class="flex items-center gap-3">
                <n-checkbox :checked="config.showScrollbar" @update:checked="v => handleUpdate({ showScrollbar: v })" />
                <n-text class="text-xs" style="color: var(--color-text-tertiary);">显示滚动条</n-text>
              </div>
              <div class="flex items-center gap-3">
                <n-checkbox :checked="config.lockMove" @update:checked="v => handleUpdate({ lockMove: v })" />
                <n-text class="text-xs" style="color: var(--color-text-tertiary);">禁止移动</n-text>
              </div>
              <div class="flex items-center gap-3">
                <n-checkbox :checked="config.lockZoom" @update:checked="v => handleUpdate({ lockZoom: v })" />
                <n-text class="text-xs" style="color: var(--color-text-tertiary);">禁止缩放</n-text>
              </div>
            </div>
          </div>
        </n-collapse-item>

        <n-collapse-item title="对齐辅助" name="snapline">
          <div class="snapline-settings px-1">
            <div class="flex items-center justify-between mb-4">
              <n-text class="text-xs" style="color: var(--color-text-tertiary);">启用对齐线</n-text>
              <n-switch :value="snaplineConfig.enabled" @update:value="v => handleSnaplineUpdate({ enabled: v })" />
            </div>

            <div class="flex items-center justify-between mb-4">
              <n-text class="text-xs" style="color: var(--color-text-tertiary);">显示间距提示</n-text>
              <n-switch :value="snaplineConfig.showSpacing" @update:value="v => handleSnaplineUpdate({ showSpacing: v })" />
            </div>

            <div class="flex items-center justify-between mb-4">
              <n-text class="text-xs" style="color: var(--color-text-tertiary);">精确对齐模式</n-text>
              <n-switch :value="snaplineConfig.sharp" @update:value="v => handleSnaplineUpdate({ sharp: v })" />
            </div>

            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <n-text class="text-xs" style="color: var(--color-text-tertiary);">对齐灵敏度</n-text>
                <n-text class="text-xs" style="color: var(--color-accent-sky);">{{ snaplineConfig.tolerance }}px</n-text>
              </div>
              <n-slider
                :value="snaplineConfig.tolerance"
                :min="5"
                :max="30"
                :step="1"
                @update:value="v => handleSnaplineUpdate({ tolerance: v })"
              />
            </div>

            <div class="mb-2">
              <n-text class="text-xs block mb-2" style="color: var(--color-text-tertiary);">对齐线颜色</n-text>
              <n-select
                :value="snaplineConfig.color"
                :options="snaplineColorOptions"
                @update:value="v => handleSnaplineUpdate({ color: v })"
              />
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
  color: #94a3b8 !important;
  /* slate-400 */
}

:deep(.n-input),
:deep(.n-input-number),
:deep(.n-select) {
  --n-border-radius: 4px !important;
  background-color: #0f172a !important;
}

.upload-area {
  position: relative;
}

:deep(.n-collapse-item__header-main) {
  font-size: 11px !important;
  font-weight: bold;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

:deep(.n-collapse-item) {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
