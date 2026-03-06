<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, LayoutTemplate, FolderOpen, ArrowRight, Check, AlertTriangle, Search } from 'lucide-vue-next'
import { templates, templateCategories, getTemplatesByCategory, type Template } from '@/data/templates'
import { useEditorStore } from '@/stores/editor'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const editorStore = useEditorStore()

const selectedCategory = ref('all')
const searchQuery = ref('')
const hoveredTemplate = ref<Template | null>(null)
const confirmDialog = ref(false)
const pendingTemplate = ref<Template | null>(null)

const filteredTemplates = computed(() => {
  let result = getTemplatesByCategory(selectedCategory.value)
  const query = searchQuery.value.toLowerCase().trim()
  if (query) {
    result = result.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    )
  }
  return result
})

const handleSelectTemplate = (template: Template) => {
  pendingTemplate.value = template
  confirmDialog.value = true
}

const handleConfirmApply = () => {
  if (!pendingTemplate.value) return

  const graph = editorStore.graph
  if (!graph) return

  graph.clearCells()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graph.fromJSON(pendingTemplate.value.data as any)
  graph.centerContent()

  confirmDialog.value = false
  pendingTemplate.value = null
  emit('close')
}

const handleCancelApply = () => {
  confirmDialog.value = false
  pendingTemplate.value = null
}

const getThumbnailIcon = (thumbnail: string) => {
  const iconMap: Record<string, typeof LayoutTemplate> = {
    flow: ArrowRight,
    network: FolderOpen,
    industrial: LayoutTemplate,
    dashboard: Check,
    microservice: FolderOpen,
  }
  return iconMap[thumbnail] || LayoutTemplate
}

const getThumbnailGradient = (thumbnail: string) => {
  const gradientMap: Record<string, string> = {
    flow: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    network: 'from-sky-500/20 to-blue-500/20 border-sky-500/30',
    industrial: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
    dashboard: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    microservice: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
  }
  return gradientMap[thumbnail] || 'from-slate-500/20 to-gray-500/20 border-slate-500/30'
}

const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    flow: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    network: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    industrial: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    dashboard: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  }
  return colorMap[category] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'
}
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 cursor-pointer"
    @click.self="emit('close')">
    <div
      class="bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden cursor-default transition-all">

      <div class="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
            <LayoutTemplate class="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-200">模板库</h3>
            <p class="text-[10px] text-slate-500 mt-0.5">选择预设模板快速开始设计，应用后将清空当前画布</p>
          </div>
        </div>

        <button @click="emit('close')"
          class="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
          <X :size="18" />
        </button>
      </div>

      <div class="flex items-center gap-3 px-5 py-3 bg-slate-800/30 border-b border-slate-800">
        <div class="relative flex-1 max-w-xs">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-4 w-4 text-slate-500" />
          </div>
          <input type="text" v-model="searchQuery" placeholder="搜索模板..."
            class="block w-full pl-9 pr-3 py-1.5 border border-slate-700 rounded-lg text-xs bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors" />
        </div>

        <div class="flex items-center gap-1.5">
          <button v-for="cat in templateCategories" :key="cat.key" @click="selectedCategory = cat.key"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
              selectedCategory === cat.key
                ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:text-slate-300'
            ]">
            {{ cat.label }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-5">
        <div v-if="filteredTemplates.length === 0" class="flex flex-col items-center justify-center h-full text-slate-500">
          <FolderOpen class="w-12 h-12 mb-3 opacity-50" />
          <p class="text-sm">未找到匹配的模板</p>
        </div>

        <div v-else class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="template in filteredTemplates" :key="template.id"
            @click="handleSelectTemplate(template)"
            @mouseenter="hoveredTemplate = template"
            @mouseleave="hoveredTemplate = null"
            class="group relative bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden cursor-pointer hover:border-violet-500/50 hover:bg-slate-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10">

            <div :class="[
              'h-32 bg-gradient-to-br flex items-center justify-center relative overflow-hidden',
              getThumbnailGradient(template.thumbnail)
            ]">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]"></div>
              <component :is="getThumbnailIcon(template.thumbnail)" class="w-12 h-12 text-slate-400/60 group-hover:scale-110 group-hover:text-slate-300/80 transition-all duration-300" />

              <div v-if="hoveredTemplate === template"
                class="absolute inset-0 bg-violet-500/10 flex items-center justify-center backdrop-blur-[2px]">
                <div class="px-3 py-1.5 bg-violet-500 rounded-lg text-xs font-bold text-white shadow-lg">
                  应用模板
                </div>
              </div>
            </div>

            <div class="p-3">
              <div class="flex items-center justify-between mb-1.5">
                <h4 class="text-sm font-semibold text-slate-200 truncate">{{ template.name }}</h4>
                <span :class="[
                  'text-[10px] px-1.5 py-0.5 rounded border',
                  getCategoryColor(template.category)
                ]">
                  {{ templateCategories.find(c => c.key === template.category)?.label || template.category }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{{ template.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div class="text-xs text-slate-500">
          共 <span class="text-slate-400 font-medium">{{ templates.length }}</span> 个模板可用
        </div>
        <button @click="emit('close')"
          class="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
          关闭
        </button>
      </div>
    </div>

    <div v-if="confirmDialog"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
      @click.self="handleCancelApply">
      <div class="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="p-5 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle class="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-200">确认应用模板</h3>
              <p class="text-xs text-slate-500 mt-0.5">此操作将清空当前画布内容</p>
            </div>
          </div>
        </div>

        <div class="p-5">
          <p class="text-sm text-slate-400 leading-relaxed">
            确定要应用模板 <span class="text-violet-400 font-medium">「{{ pendingTemplate?.name }}」</span> 吗？
            当前画布中的所有内容将被清除，此操作不可撤销。
          </p>
        </div>

        <div class="px-5 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button @click="handleCancelApply"
            class="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
            取消
          </button>
          <button @click="handleConfirmApply"
            class="px-4 py-2 text-xs font-bold rounded-lg bg-violet-500 text-white hover:bg-violet-600 transition-colors shadow-lg shadow-violet-500/20">
            确认应用
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.2);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
