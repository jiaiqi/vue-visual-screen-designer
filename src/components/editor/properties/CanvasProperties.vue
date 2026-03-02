<script setup lang="ts">
import { computed, markRaw } from 'vue'
import { useEditorStore } from '@/stores/editor'
import {
  NForm, NFormItem, NInput, NSelect, NInputNumber,
  NColorPicker, NCheckbox, NText, NDivider,
  NRadioGroup, NRadio, NUpload, NIcon, NCollapse, NCollapseItem,
  NButton
} from 'naive-ui'
import { Upload } from 'lucide-vue-next'

const editorStore = useEditorStore()

// 图标图标加固：使用 markRaw 且避免直接在模板中使用标签，改用 component 属性
const UploadIcon = markRaw(Upload)

const config = computed(() => editorStore.canvasConfig)

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

function handleUpdate(partial: any) {
  if (editorStore) {
    editorStore.updateCanvasConfig(partial)
  }
}

function handleImageUpload(options: { file: { file: File } }) {
  const file = options.file.file
  if (!file) return false

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    if (dataUrl) {
      handleUpdate({ backgroundImage: dataUrl })
    }
  }
  reader.readAsDataURL(file)
  return false
}
</script>

<template>
  <div v-if="config" class="canvas-properties p-4 select-none">
    <n-form label-placement="left" label-width="80" size="small">
      <!-- 画布页签标题 -->
      <div class="flex items-center gap-2 mb-6 border-b border-sky-500/30 pb-2">
        <span class="text-xs font-bold text-sky-400 uppercase tracking-widest">画布</span>
      </div>

      <!-- 基础信息 -->
      <n-form-item label="文件名">
        <n-input :value="config.name" @update:value="v => handleUpdate({ name: v })" placeholder="输入图纸名称" />
      </n-form-item>

      <n-form-item label="分类">
        <n-select :value="config.category" :options="categoryOptions"
          @update:value="v => handleUpdate({ category: v })" />
      </n-form-item>

      <n-divider style="margin: 16px 0" />

      <!-- 画布尺寸 -->
      <div class="flex items-center gap-4 mb-4">
        <n-text depth="3" class="text-[11px] shrink-0 w-[80px]">画布尺寸</n-text>
        <div class="flex items-center gap-2 flex-1">
          <div class="flex items-center gap-1 flex-1">
            <n-text depth="3" class="text-[10px] uppercase font-bold text-slate-500">W</n-text>
            <n-input-number :value="config.width" :min="400" :max="5000" :step="10" :show-button="false" class="w-full"
              @update:value="v => handleUpdate({ width: v || 1920 })" />
          </div>
          <div class="flex items-center gap-1 flex-1">
            <n-text depth="3" class="text-[10px] uppercase font-bold text-slate-500">H</n-text>
            <n-input-number :value="config.height" :min="300" :max="4000" :step="10" :show-button="false" class="w-full"
              @update:value="v => handleUpdate({ height: v || 1080 })" />
          </div>
        </div>
      </div>

      <!-- 背景颜色 -->
      <n-form-item label="背景颜色">
        <n-color-picker :value="config.backgroundColor" :show-alpha="true"
          @update:value="v => handleUpdate({ backgroundColor: v })" />
      </n-form-item>

      <!-- 背景图片 -->
      <n-form-item label="背景图片">
        <div class="w-full">
          <n-upload accept="image/*" :show-file-list="false" @before-upload="handleImageUpload">
            <div
              class="upload-area border-2 border-dashed border-slate-700 hover:border-sky-500/50 rounded-lg h-32 flex flex-col items-center justify-center bg-slate-800/10 transition-all cursor-pointer overflow-hidden group">
              <template v-if="config.backgroundImage">
                <img :src="config.backgroundImage" class="w-full h-full object-contain p-2" />
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <n-text class="text-white text-[10px]">点击更换图片</n-text>
                </div>
              </template>
              <template v-else>
                <div class="flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity">
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

      <!-- 背景网格 -->
      <n-form-item label="背景网格">
        <div class="flex items-center gap-2 w-full">
          <n-checkbox :checked="config.showGrid" @update:checked="v => handleUpdate({ showGrid: v })" />
          <n-checkbox :checked="config.snapToGrid" @update:checked="v => handleUpdate({ snapToGrid: v })" />
          <n-checkbox :checked="false" disabled />
          <n-input-number :value="config.gridSize" :min="5" :max="100" :show-button="false" class="w-12 ml-auto"
            @update:value="v => handleUpdate({ gridSize: v || 20 })" />
        </div>
      </n-form-item>

      <!-- 主题 -->
      <n-form-item label="主题">
        <n-select :value="config.theme" :options="themeOptions" @update:value="v => handleUpdate({ theme: v })" />
      </n-form-item>

      <!-- 预览设置 -->
      <n-collapse :default-expanded-names="['preview']" style="margin-top: 24px">
        <n-collapse-item title="预览设置" name="preview">
          <div class="preview-settings px-1">
            <div class="label text-[11px] text-slate-500 mb-3 tracking-wide">缩放方式</div>
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
                <n-text class="text-xs text-slate-300">显示滚动条</n-text>
              </div>
              <div class="flex items-center gap-3">
                <n-checkbox :checked="config.lockMove" @update:checked="v => handleUpdate({ lockMove: v })" />
                <n-text class="text-xs text-slate-300">禁止移动</n-text>
              </div>
              <div class="flex items-center gap-3">
                <n-checkbox :checked="config.lockZoom" @update:checked="v => handleUpdate({ lockZoom: v })" />
                <n-text class="text-xs text-slate-300">禁止缩放</n-text>
              </div>
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
