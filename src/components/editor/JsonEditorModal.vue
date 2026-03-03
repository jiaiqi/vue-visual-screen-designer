<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useHistoryStore } from '@/stores/history'
import { X, Copy, Download, Upload, CheckCircle2, Play, AlertCircle } from 'lucide-vue-next'

// 采用 v-if 控制外部挂载以确保每次打开触发生命周期

const emit = defineEmits<{
  (e: 'close'): void
}>()

const editorStore = useEditorStore()
const historyStore = useHistoryStore()

const jsonContent = ref('')
const copySuccess = ref(false)
const parseError = ref('')

// DOM 引用
const textareaRef = ref<HTMLTextAreaElement>()
const fileInputRef = ref<HTMLInputElement>()

onMounted(() => {
  // 挂载时抓取当前画布数据
  const graph = editorStore.graph
  if (graph) {
    const data = graph.toJSON()
    jsonContent.value = JSON.stringify(data, null, 2)
  }
  nextTick(() => {
    textareaRef.value?.focus()
  })
})

// 处理复制
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(jsonContent.value)
    copySuccess.value = true
    setTimeout(() => copySuccess.value = false, 2000)
  } catch {
    console.error('复制失败')
    parseError.value = '剪贴板访问失败，请手动复制'
  }
}

// 处理下载
const handleDownload = () => {
  try {
    // 验证一下格式
    JSON.parse(jsonContent.value)

    const projectData = {
      version: '1.2.0',
      timestamp: Date.now(),
      canvasObj: JSON.parse(jsonContent.value)
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `workshop-project-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch {
    parseError.value = 'JSON 格式错误，无法下载'
  }
}

// 触发读取本地文件
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 读取本地文件解析入框
const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    // 兼容可能包裹了元数据的工程文件或纯画布节点数组
    const canvasData = parsed.canvasObj || parsed
    jsonContent.value = JSON.stringify(canvasData, null, 2)
    parseError.value = ''
    target.value = '' // 清空 input
  } catch {
    parseError.value = '读取失败：文件不是合法的 JSON 格式'
  }
}

// 应用到画布
const handleApply = () => {
  const graph = editorStore.graph
  if (!graph) return

  parseError.value = ''
  try {
    const data = JSON.parse(jsonContent.value)
    // 兼容层：如果贴入的是包含了元数据的完整项目工程
    const rawData = data.canvasObj || data

    // 执行全量覆盖
    historyStore.clear()
    graph.clearCells()
    graph.fromJSON(rawData)

    // 成功后自动关闭
    emit('close')
  } catch {
    parseError.value = '解析失败：JSON 内容存在语法错误，请检查！'
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 cursor-pointer"
    @click.self="$emit('close')">
    <div
      class="bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden cursor-default transition-all">

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
            <span class="text-sky-400 font-mono font-bold text-sm">{ }</span>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-200">JSON 数据</h3>
            <p class="text-[10px] text-slate-500 mt-0.5">查看当前画布状态、复制数据片段或直接从外部源重新导入覆盖绘图区。</p>
          </div>
        </div>

        <button @click="$emit('close')"
          class="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
          <X :size="18" />
        </button>
      </div>

      <!-- Toolbar -->
      <div class="flex items-center justify-between px-5 py-2.5 bg-slate-800/30 border-b border-slate-800">
        <!-- 左侧：导出功能 -->
        <div class="flex items-center gap-2">
          <button @click="handleCopy"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700">
            <CheckCircle2 v-if="copySuccess" :size="14" class="text-emerald-400" />
            <Copy v-else :size="14" class="text-sky-400" />
            {{ copySuccess ? '已复制' : '复制 JSON' }}
          </button>

          <button @click="handleDownload"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700">
            <Download :size="14" class="text-indigo-400" />
            下载为文件
          </button>
        </div>

        <!-- 右侧：导入功能 -->
        <div class="flex items-center gap-2">
          <button @click="triggerFileInput"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700">
            <Upload :size="14" class="text-amber-400" />
            上传本地文件
          </button>
          <input type="file" ref="fileInputRef" accept=".json" class="hidden" @change="handleFileUpload" />

          <div class="w-px h-4 bg-slate-700 mx-1"></div>

          <button @click="handleApply"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-colors border border-emerald-500/30">
            <Play :size="14" />
            应用到画布
          </button>
        </div>
      </div>

      <!-- Editor Area -->
      <div class="flex-1 relative p-4 bg-[#0f111a] overflow-hidden flex flex-col">
        <!-- 错误提示带 -->
        <div v-if="parseError"
          class="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg shadow-lg z-10 animate-in fade-in slide-in-from-top-4">
          <AlertCircle :size="14" />
          {{ parseError }}
        </div>

        <textarea ref="textareaRef" v-model="jsonContent" spellcheck="false" @input="parseError = ''"
          class="flex-1 w-full bg-transparent border-none outline-none text-[13px] leading-relaxed font-mono text-emerald-300/90 resize-none custom-scrollbar"></textarea>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 定制纯粹代码框的滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 5px;
  border: 2px solid #0f111a;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.2);
}

.custom-scrollbar::-webkit-corner {
  background: transparent;
}
</style>
