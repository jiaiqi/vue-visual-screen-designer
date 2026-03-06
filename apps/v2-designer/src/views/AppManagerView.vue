<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStoreV2 } from '@/stores/v2/workspaceStoreV2'
import { useNotifier } from '@/composables/useNotifier'
import GlobalToast from '@/components/v2/common/GlobalToast.vue'

const router = useRouter()
const workspace = useWorkspaceStoreV2()
const notifier = useNotifier()

const appSearch = ref('')
const appCreate = reactive({
  name: '',
  description: '',
})
const pageCreateName = ref('')
const releaseNote = ref('')
const pageDrafts = ref<Record<string, { name: string; path: string; status: 'draft' | 'published' }>>({})

const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'testing', label: '测试中' },
  { value: 'online', label: '已上线' },
  { value: 'archived', label: '归档' },
] as const

const filteredApps = computed(() => {
  const q = appSearch.value.trim().toLowerCase()
  const list = workspace.apps
  if (!q) return list
  return list.filter((app) => {
    return app.name.toLowerCase().includes(q)
      || app.owner.toLowerCase().includes(q)
      || app.tags.join(',').toLowerCase().includes(q)
  })
})

const selectedApp = computed(() => workspace.activeApp)
const selectedPages = computed(() => workspace.currentPages)
const selectedReleases = computed(() => workspace.currentReleases)

const appForm = reactive({
  name: '',
  description: '',
  owner: '',
  status: 'draft',
  tags: '',
  themeColor: '#0ea5e9',
})

const currentEditorRoute = computed(() => {
  if (!workspace.activeAppId || !workspace.activePageId)
    return '/apps'
  return `/app/${workspace.activeAppId}/page/${workspace.activePageId}/editor`
})

function formatTime(value: string) {
  return new Date(value).toLocaleString()
}

function statusLabel(value: string) {
  return statusOptions.find((item) => item.value === value)?.label || value
}

function hydrateAppForm() {
  const app = selectedApp.value
  if (!app) return
  appForm.name = app.name
  appForm.description = app.description
  appForm.owner = app.owner
  appForm.status = app.status
  appForm.tags = app.tags.join(', ')
  appForm.themeColor = app.themeColor
}

function hydratePageDrafts() {
  const next: Record<string, { name: string; path: string; status: 'draft' | 'published' }> = {}
  for (const page of selectedPages.value) {
    next[page.id] = {
      name: page.name,
      path: page.path,
      status: page.status,
    }
  }
  pageDrafts.value = next
}

watch(() => workspace.activeAppId, () => {
  hydrateAppForm()
  hydratePageDrafts()
}, { immediate: true })

watch(() => workspace.currentPages, () => {
  hydratePageDrafts()
}, { deep: true })

onMounted(async () => {
  await workspace.init()
  if (!workspace.activeAppId && workspace.apps[0]) {
    await workspace.setActiveApp(workspace.apps[0].id)
  }
  hydrateAppForm()
  hydratePageDrafts()
})

async function createApp() {
  const app = await workspace.createApp(appCreate.name, appCreate.description)
  appCreate.name = ''
  appCreate.description = ''
  notifier.success('应用已创建', `已创建应用 ${app.name}`)
}

async function selectApp(appId: string) {
  await workspace.setActiveApp(appId)
}

async function saveAppMeta() {
  const app = selectedApp.value
  if (!app) return
  await workspace.updateAppMeta(app.id, {
    name: appForm.name,
    description: appForm.description,
    owner: appForm.owner,
    status: appForm.status as 'draft' | 'testing' | 'online' | 'archived',
    tags: appForm.tags.split(','),
    themeColor: appForm.themeColor,
  })
  notifier.success('应用已更新', '应用信息已保存')
}

async function removeSelectedApp() {
  const app = selectedApp.value
  if (!app) return
  await workspace.removeApp(app.id)
  notifier.success('应用已删除', '应用及页面数据已移除')
}

async function createPage() {
  const app = selectedApp.value
  if (!app) return
  const page = await workspace.createPage(app.id, pageCreateName.value)
  pageCreateName.value = ''
  notifier.success('页面已创建', `已创建页面 ${page.name}`)
}

async function savePageMeta(pageId: string) {
  const draft = pageDrafts.value[pageId]
  if (!draft) return
  await workspace.updatePageMeta(pageId, {
    name: draft.name,
    path: draft.path,
    status: draft.status,
  })
  notifier.success('页面已更新', '页面配置已保存')
}

async function setHome(pageId: string) {
  const app = selectedApp.value
  if (!app) return
  await workspace.setHomePage(app.id, pageId)
  notifier.success('首页已切换', '已更新应用首页')
}

async function removePage(pageId: string) {
  try {
    await workspace.removePage(pageId)
    notifier.success('页面已删除', '页面与发布记录已移除')
  } catch (error) {
    notifier.warning('无法删除页面', error instanceof Error ? error.message : '删除失败')
  }
}

async function openEditor(pageId: string) {
  const app = selectedApp.value
  if (!app) return
  await workspace.setActivePage(pageId)
  await router.push(`/app/${app.id}/page/${pageId}/editor`)
}

async function openPreview(pageId: string) {
  const app = selectedApp.value
  if (!app) return
  await workspace.setActivePage(pageId)
  await router.push(`/app/${app.id}/page/${pageId}/preview`)
}

async function publishFromManager(pageId: string) {
  const app = selectedApp.value
  if (!app) return
  await workspace.setActivePage(pageId)
  const release = await workspace.publishCurrentPage(releaseNote.value)
  releaseNote.value = ''
  notifier.success('发布成功', `已创建 ${release.version}`)
}
</script>

<template>
  <div class="manager-root">
    <header class="topbar">
      <div class="headline">
        <h1>应用与页面管理</h1>
        <p>一个应用可管理多个页面、首页路由、发布记录和元数据。</p>
      </div>
      <div class="topbar-actions">
        <button class="btn ghost" @click="router.push(currentEditorRoute)">
          返回编辑器
        </button>
      </div>
    </header>

    <section class="workspace-grid">
      <aside class="app-column">
        <div class="panel-head">
          <h2>应用列表</h2>
        </div>
        <div class="app-create">
          <input v-model="appCreate.name" placeholder="新应用名称" />
          <input v-model="appCreate.description" placeholder="描述（可选）" />
          <button class="btn primary" @click="createApp">
            创建应用
          </button>
        </div>
        <input v-model="appSearch" class="search" placeholder="搜索应用 / 负责人 / 标签" />
        <div class="app-list">
          <button
            v-for="app in filteredApps"
            :key="app.id"
            class="app-item"
            :class="{ active: app.id === workspace.activeAppId }"
            @click="selectApp(app.id)"
          >
            <span class="dot" :style="{ background: app.themeColor }" />
            <div class="meta">
              <strong>{{ app.name }}</strong>
              <small>{{ app.owner }} · {{ statusLabel(app.status) }}</small>
            </div>
            <span class="count">{{ workspace.pages.filter((p) => p.appId === app.id).length }}</span>
          </button>
        </div>
      </aside>

      <main class="detail-column">
        <template v-if="selectedApp">
          <section class="summary-cards">
            <article class="card">
              <p>页面数</p>
              <h3>{{ selectedPages.length }}</h3>
            </article>
            <article class="card">
              <p>发布数</p>
              <h3>{{ selectedReleases.length }}</h3>
            </article>
            <article class="card">
              <p>最近更新</p>
              <h3>{{ formatTime(selectedApp.updatedAt) }}</h3>
            </article>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>应用信息</h2>
              <div class="head-actions">
                <button class="btn danger" @click="removeSelectedApp">
                  删除应用
                </button>
                <button class="btn success" @click="saveAppMeta">
                  保存应用信息
                </button>
              </div>
            </div>
            <div class="form-grid">
              <label>
                <span>应用名称</span>
                <input v-model="appForm.name" />
              </label>
              <label>
                <span>负责人</span>
                <input v-model="appForm.owner" />
              </label>
              <label>
                <span>状态</span>
                <select v-model="appForm.status">
                  <option v-for="item in statusOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </option>
                </select>
              </label>
              <label>
                <span>主题色</span>
                <input v-model="appForm.themeColor" />
              </label>
              <label class="full">
                <span>标签（逗号分隔）</span>
                <input v-model="appForm.tags" placeholder="iot, production, demo" />
              </label>
              <label class="full">
                <span>描述</span>
                <textarea v-model="appForm.description" rows="3" />
              </label>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>页面管理</h2>
              <div class="head-actions">
                <input v-model="pageCreateName" placeholder="新页面名称" />
                <button class="btn primary" @click="createPage">
                  新建页面
                </button>
              </div>
            </div>

            <div class="page-table">
              <div class="row head">
                <span>页面名称</span>
                <span>路径</span>
                <span>状态</span>
                <span>首页</span>
                <span>更新时间</span>
                <span>操作</span>
              </div>
              <div v-for="page in selectedPages" :key="page.id" class="row">
                <span><input v-model="pageDrafts[page.id]!.name" /></span>
                <span><input v-model="pageDrafts[page.id]!.path" /></span>
                <span>
                  <select v-model="pageDrafts[page.id]!.status">
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                  </select>
                </span>
                <span>
                  <button class="mini" :class="{ on: page.isHome }" @click="setHome(page.id)">
                    {{ page.isHome ? '已设为首页' : '设为首页' }}
                  </button>
                </span>
                <span class="time">{{ formatTime(page.updatedAt) }}</span>
                <span class="actions">
                  <button class="mini" @click="savePageMeta(page.id)">保存</button>
                  <button class="mini" @click="openEditor(page.id)">编辑</button>
                  <button class="mini" @click="openPreview(page.id)">预览</button>
                  <button class="mini danger" @click="removePage(page.id)">删除</button>
                </span>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>发布管理</h2>
              <div class="head-actions">
                <input v-model="releaseNote" placeholder="发布说明（对当前选中页面生效）" />
              </div>
            </div>
            <div class="release-grid">
              <button
                v-for="page in selectedPages"
                :key="`pub-${page.id}`"
                class="release-btn"
                @click="publishFromManager(page.id)"
              >
                发布 {{ page.name }}
              </button>
            </div>
            <ul class="release-list">
              <li v-for="release in selectedReleases.slice(0, 12)" :key="release.id">
                <strong>{{ release.version }}</strong>
                <span>{{ release.note }}</span>
                <small>{{ formatTime(release.createdAt) }}</small>
              </li>
            </ul>
          </section>
        </template>
      </main>
    </section>
  </div>
  <GlobalToast />
</template>

<style scoped>
.manager-root {
  min-height: 100vh;
  background:
    radial-gradient(circle at 0% 0%, rgba(14, 165, 233, 0.16), transparent 35%),
    radial-gradient(circle at 95% 5%, rgba(34, 197, 94, 0.12), transparent 30%),
    #020617;
  color: #e2e8f0;
  padding: 16px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.headline h1 {
  margin: 0;
  font-size: 24px;
  letter-spacing: 0.02em;
}

.headline p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.workspace-grid {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 14px;
  min-height: calc(100vh - 92px);
}

.app-column,
.detail-column {
  min-height: 0;
}

.app-column {
  border: 1px solid rgba(51, 65, 85, 0.65);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-column {
  display: grid;
  gap: 12px;
  overflow: auto;
}

.panel,
.summary-cards,
.panel-head {
  border-radius: 14px;
}

.panel {
  border: 1px solid rgba(51, 65, 85, 0.65);
  background: rgba(15, 23, 42, 0.8);
  padding: 12px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.panel-head h2 {
  margin: 0;
  font-size: 16px;
}

.head-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.app-create {
  padding: 10px;
  display: grid;
  gap: 8px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.45);
}

.search {
  margin: 10px;
}

.app-list {
  overflow: auto;
  padding: 0 10px 10px;
  display: grid;
  gap: 8px;
}

.app-item {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  border: 1px solid rgba(51, 65, 85, 0.6);
  background: rgba(2, 6, 23, 0.55);
  border-radius: 10px;
  padding: 8px;
  color: #e2e8f0;
  text-align: left;
  cursor: pointer;
}

.app-item.active {
  border-color: rgba(14, 165, 233, 0.75);
  box-shadow: inset 0 0 0 1px rgba(14, 165, 233, 0.35);
}

.dot {
  width: 8px;
  height: 28px;
  border-radius: 4px;
}

.meta {
  display: grid;
  gap: 4px;
}

.meta strong {
  font-size: 13px;
}

.meta small {
  font-size: 11px;
  color: #94a3b8;
}

.count {
  font-size: 11px;
  color: #38bdf8;
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(14, 165, 233, 0.35);
  border-radius: 999px;
  padding: 2px 8px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.card {
  border: 1px solid rgba(51, 65, 85, 0.65);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.82);
  padding: 12px;
}

.card p {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
}

.card h3 {
  margin: 8px 0 0;
  font-size: 18px;
  line-height: 1.2;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.form-grid label {
  display: grid;
  gap: 6px;
}

.form-grid label.full {
  grid-column: 1 / -1;
}

.form-grid span {
  font-size: 12px;
  color: #94a3b8;
}

.page-table {
  border: 1px solid rgba(51, 65, 85, 0.4);
  border-radius: 10px;
  overflow: auto;
}

.row {
  display: grid;
  grid-template-columns: 180px 180px 120px 120px 170px 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.3);
}

.row.head {
  background: rgba(30, 41, 59, 0.55);
  font-size: 12px;
  color: #94a3b8;
}

.row .time {
  font-size: 11px;
  color: #94a3b8;
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mini {
  height: 28px;
  border-radius: 7px;
  border: 1px solid rgba(51, 65, 85, 0.8);
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  padding: 0 10px;
  cursor: pointer;
  font-size: 12px;
}

.mini.on {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.7);
  background: rgba(34, 197, 94, 0.12);
}

.mini.danger {
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.6);
}

.release-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.release-btn {
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.5);
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  padding: 0 10px;
  cursor: pointer;
}

.release-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.release-list li {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 8px;
  padding: 8px;
  border: 1px solid rgba(51, 65, 85, 0.4);
  border-radius: 8px;
  font-size: 12px;
}

input,
textarea,
select {
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(51, 65, 85, 0.8);
  background: rgba(15, 23, 42, 0.75);
  color: #e2e8f0;
  padding: 0 10px;
}

textarea {
  height: auto;
  padding: 8px 10px;
}

.btn {
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(51, 65, 85, 0.8);
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  padding: 0 12px;
  cursor: pointer;
}

.btn.primary {
  border-color: rgba(14, 165, 233, 0.6);
  background: rgba(14, 165, 233, 0.18);
  color: #38bdf8;
}

.btn.success {
  border-color: rgba(34, 197, 94, 0.6);
  background: rgba(34, 197, 94, 0.18);
  color: #4ade80;
}

.btn.danger {
  border-color: rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.18);
  color: #f87171;
}

.btn.ghost {
  background: rgba(15, 23, 42, 0.6);
}

@media (max-width: 1200px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}
</style>
