<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as icons from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  currentIcon: string // 优先定位并高亮当前使用项
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'select', iconName: string): void
}>()

// ================= 全局获取图标名称集 =================
// 过滤掉创建渲染上下文之类的非大写驼峰组件方法
const allIconNames = Object.keys(icons).filter(key =>
  key !== 'default' && key !== 'createLucideIcon' && /^[A-Z]/.test(key)
)

const searchQuery = ref('')
const isVisible = ref(false)

// 为了优化长列渲染挂载卡顿，通过 lazy & batch
// 考虑到网格是响应式 CSS Grid，在简单实现中我们通过显示总数控制来避免初次挂载超 1400 个 DOM 时微卡顿。
const visibleCount = ref(150)

watch(() => props.show, (newVal) => {
  isVisible.value = newVal
  if (newVal) {
    searchQuery.value = ''
    visibleCount.value = 150 // 重置可见数
  }
})

const closeModal = () => {
  emit('update:show', false)
}

// 检索过滤
const filteredIcons = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return allIconNames
  return allIconNames.filter(name => name.toLowerCase().includes(query))
})

// 当前要挂载展现的切片池
const displayIcons = computed(() => {
  return filteredIcons.value.slice(0, visibleCount.value)
})

// 底部滚动触底侦测
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  // 判断是否到底
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
    if (visibleCount.value < filteredIcons.value.length) {
      visibleCount.value += 150
    }
  }
}

const selectIcon = (iconName: string) => {
  emit('select', iconName)
  closeModal()
}
</script>

<template>
  <Transition name="fade">
    <!-- 黑色大屏遮罩 -->
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <!-- 极度模糊的环境模糊背景层 (backdrop-blur 只能模糊其背后的 DOM，本身是半透明黑色) -->
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="closeModal"></div>

      <!-- 选择器实体容器层 -->
      <div
        class="relative w-full max-w-4xl max-h-[85vh] h-[720px] bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl flex flex-col flex-shrink-0 animate-in zoom-in-95 duration-200">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-slate-100 mb-0.5 tracking-wide">全库组件选择 (Lucide 图标)</h3>
            <p class="text-xs text-slate-400">选取内置任意标准图形或架构符号，选中即刻生效并覆盖</p>
          </div>
          <button @click="closeModal"
            class="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <component :is="icons.X" class="w-5 h-5" />
          </button>
        </div>

        <!-- Toolbar (Search) -->
        <div class="p-4 bg-slate-900/50 flex gap-4 items-center border-b border-slate-800 shrink-0">
          <div class="relative w-full max-w-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <component :is="icons.Search" class="h-4 w-4 text-slate-500" />
            </div>
            <input type="text" v-model="searchQuery" placeholder="搜索图元英文库名，例：Router，Server，Terminal..."
              class="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm transition-colors" />
          </div>

          <div class="ml-auto text-xs text-slate-500 font-mono">
            共 <span class="text-sky-400 font-bold">{{ filteredIcons.length }}</span> 个结果匹配
          </div>
        </div>

        <!-- 内部结果虚拟滚动与长量渲染区 -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar" @scroll="handleScroll">
          <div v-if="displayIcons.length === 0"
            class="h-full flex flex-col items-center justify-center text-slate-500 pb-10">
            <component :is="icons.Ghost" class="w-12 h-12 mb-3 opacity-20" />
            <p class="text-sm">没有匹配到相关图元名字</p>
          </div>

          <div v-else class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            <template v-for="name in displayIcons" :key="name">
              <div @click="selectIcon(name)" :class="[
                'group flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer',
                props.currentIcon === name
                  ? 'icon-card-active'
                  : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-500 hover:scale-105'
              ]">
                <!-- 这里我们从图标库按名字直接抽取出对应的 component -->
                <!-- 如果当前被选中展示亮色高亮，如果是常规则采用灰化但悬停高亮 -->
                <component :is="(icons as any)[name]" :class="[
                  'w-7 h-7 mb-2 transition-colors',
                  props.currentIcon === name ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-100'
                ]" />
                <!-- 超出截断，避免名称撑破卡片。显示 hover 时原名 -->
                <span class="text-[10px] w-full text-center truncate font-mono"
                  :class="props.currentIcon === name ? 'text-sky-300 font-bold' : 'text-slate-500'" :title="name">
                  {{ name }}
                </span>
              </div>
            </template>
          </div>

          <!-- Loading 指示器（当我们还没到底部，表示仍有懒切片未渲染） -->
          <div v-if="visibleCount < filteredIcons.length"
            class="flex justify-center py-6 mt-4 border-t border-slate-800">
            <component :is="icons.Loader2" class="w-5 h-5 text-slate-500 animate-spin" />
            <span class="ml-2 text-xs text-slate-500">向下滑动加载更多...</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.icon-card-active {
  background: var(--ui-info-bg);
  border-color: var(--ui-info-border);
  box-shadow: 0 0 15px color-mix(in oklab, var(--theme-primary) 30%, transparent);
}
</style>
