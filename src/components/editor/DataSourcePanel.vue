<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDataSource } from '@/composables/useDataSource'
import type { DataSourceConfig, DataSourceType } from '@/types/schema'
import { Plus, Trash2, RefreshCw, Database, Globe, Wifi, FileText } from 'lucide-vue-next'

const { sources, createSource, deleteSource, refresh } = useDataSource()

const showModal = ref(false)
const editingSource = ref<Partial<DataSourceConfig>>({
  type: 'rest',
  name: '',
  config: {},
  polling: { enabled: false, interval: 5 },
})

const sourceTypeIcons: Record<DataSourceType, typeof Database> = {
  rest: Globe,
  websocket: Wifi,
  graphql: Database,
  mqtt: Wifi,
  static: FileText,
  mysql: Database,
  postgresql: Database,
  influxdb: Database,
}

const sourceTypeLabels: Record<DataSourceType, string> = {
  rest: 'REST API',
  websocket: 'WebSocket',
  graphql: 'GraphQL',
  mqtt: 'MQTT',
  static: '静态数据',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  influxdb: 'InfluxDB',
}

const openCreateModal = () => {
  editingSource.value = {
    type: 'rest',
    name: '',
    config: { url: '', method: 'GET' },
    polling: { enabled: false, interval: 5 },
  }
  showModal.value = true
}

const openEditModal = (source: DataSourceConfig) => {
  editingSource.value = { ...source }
  showModal.value = true
}

const saveSource = () => {
  if (!editingSource.value.name) return

  const config: DataSourceConfig = {
    id: editingSource.value.id || `ds_${Date.now()}`,
    name: editingSource.value.name,
    type: editingSource.value.type || 'rest',
    config: editingSource.value.config || {},
    polling: editingSource.value.polling,
    cache: editingSource.value.cache,
  }

  createSource(config)
  showModal.value = false
}

const handleDelete = (id: string) => {
  if (confirm('确定要删除这个数据源吗？')) {
    deleteSource(id)
  }
}

const handleRefresh = async (id: string) => {
  try {
    await refresh(id)
  } catch (error) {
    console.error('刷新失败:', error)
  }
}
</script>

<template>
  <div class="datasource-panel h-full flex flex-col bg-slate-900">
    <!-- 头部 -->
    <div class="p-4 border-b border-slate-800 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-200">数据源管理</h3>
      <button
        @click="openCreateModal"
        class="flex items-center gap-1 px-3 py-1.5 text-xs bg-sky-500/20 text-sky-400 rounded-lg hover:bg-sky-500/30 transition-colors"
      >
        <Plus class="w-3.5 h-3.5" />
        新建
      </button>
    </div>

    <!-- 数据源列表 -->
    <div class="flex-1 overflow-y-auto p-2 space-y-2">
      <div
        v-for="source in sources"
        :key="source.id"
        class="group p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
              <component
                :is="sourceTypeIcons[source.type]"
                class="w-4 h-4 text-slate-400"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-200">{{ source.name }}</p>
              <p class="text-xs text-slate-500">{{ sourceTypeLabels[source.type] }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="handleRefresh(source.id)"
              class="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors"
              title="刷新"
            >
              <RefreshCw class="w-3.5 h-3.5" />
            </button>
            <button
              @click="openEditModal(source)"
              class="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors"
              title="编辑"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="handleDelete(source.id)"
              class="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
              title="删除"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- 轮询状态 -->
        <div v-if="source.polling?.enabled" class="mt-2 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs text-slate-500">每 {{ source.polling.interval }} 秒刷新</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="sources.length === 0" class="text-center py-8">
        <Database class="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <p class="text-sm text-slate-500">暂无数据源</p>
        <p class="text-xs text-slate-600 mt-1">点击上方按钮创建</p>
      </div>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showModal = false"
    >
      <div class="w-[500px] max-h-[80vh] bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
        <!-- 弹窗头部 -->
        <div class="p-4 border-b border-slate-700 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-slate-200">
            {{ editingSource.id ? '编辑数据源' : '新建数据源' }}
          </h4>
          <button
            @click="showModal = false"
            class="p-1 rounded hover:bg-slate-700 text-slate-400"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <!-- 名称 -->
          <div>
            <label class="block text-xs text-slate-400 mb-1.5">名称</label>
            <input
              v-model="editingSource.name"
              type="text"
              placeholder="输入数据源名称"
              class="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <!-- 类型 -->
          <div>
            <label class="block text-xs text-slate-400 mb-1.5">类型</label>
            <select
              v-model="editingSource.type"
              class="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option v-for="(label, type) in sourceTypeLabels" :key="type" :value="type">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- REST 配置 -->
          <template v-if="editingSource.type === 'rest'">
            <div>
              <label class="block text-xs text-slate-400 mb-1.5">URL</label>
              <input
                v-model="(editingSource.config as any).url"
                type="text"
                placeholder="https://api.example.com/data"
                class="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-1.5">请求方法</label>
              <select
                v-model="(editingSource.config as any).method"
                class="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </template>

          <!-- WebSocket 配置 -->
          <template v-if="editingSource.type === 'websocket'">
            <div>
              <label class="block text-xs text-slate-400 mb-1.5">WebSocket URL</label>
              <input
                v-model="(editingSource.config as any).url"
                type="text"
                placeholder="wss://ws.example.com/stream"
                class="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </template>

          <!-- 静态数据配置 -->
          <template v-if="editingSource.type === 'static'">
            <div>
              <label class="block text-xs text-slate-400 mb-1.5">JSON 数据</label>
              <textarea
                :value="JSON.stringify((editingSource.config as any).data || {}, null, 2)"
                @input="(e) => { try { (editingSource.config as any).data = JSON.parse((e.target as HTMLTextAreaElement).value) } catch {} }"
                rows="6"
                placeholder="输入 JSON 数据"
                class="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none font-mono"
              />
            </div>
          </template>

          <!-- 轮询配置 -->
          <div class="pt-4 border-t border-slate-700">
            <label class="flex items-center gap-2 mb-3">
              <input
                v-model="editingSource.polling.enabled"
                type="checkbox"
                class="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500"
              />
              <span class="text-sm text-slate-300">启用轮询</span>
            </label>
            <div v-if="editingSource.polling?.enabled" class="flex items-center gap-2">
              <span class="text-xs text-slate-500">每</span>
              <input
                v-model.number="editingSource.polling.interval"
                type="number"
                min="1"
                class="w-20 px-2 py-1 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:border-sky-500 focus:outline-none"
              />
              <span class="text-xs text-slate-500">秒刷新</span>
            </div>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="p-4 border-t border-slate-700 flex justify-end gap-2">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            取消
          </button>
          <button
            @click="saveSource"
            class="px-4 py-2 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.datasource-panel {
  --scrollbar-thumb: #475569;
  --scrollbar-track: transparent;
}

.datasource-panel ::-webkit-scrollbar {
  width: 4px;
}

.datasource-panel ::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 2px;
}

.datasource-panel ::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}
</style>
