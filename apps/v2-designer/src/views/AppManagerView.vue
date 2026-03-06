<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStoreV2 } from '@/stores/v2/workspaceStoreV2'
import { useThemeStoreV2 } from '@/stores/v2/themeStoreV2'
import { useNotifier } from '@/composables/useNotifier'
import GlobalToast from '@/components/v2/common/GlobalToast.vue'

const router = useRouter()
const workspace = useWorkspaceStoreV2()
const themeStore = useThemeStoreV2()
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
const pageNameMap = computed(() => {
  const map = new Map<string, string>()
  workspace.pages.forEach((page) => map.set(page.id, page.name))
  return map
})

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
const isDark = computed(() => themeStore.mode === 'dark')
const globalThemeColor = computed({
  get: () => themeStore.primaryColor,
  set: (value: string) => {
    void themeStore.setPrimaryColor(value)
  },
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
  await themeStore.init()
  await workspace.init()
  if (!workspace.activeAppId && workspace.apps[0]) {
    await workspace.setActiveApp(workspace.apps[0].id)
  }
  hydrateAppForm()
  hydratePageDrafts()
})

function toggleTheme() {
  void themeStore.toggleMode()
}

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

async function movePage(pageId: string, direction: 'up' | 'down') {
  await workspace.movePage(pageId, direction)
}

async function duplicatePage(pageId: string) {
  try {
    const page = await workspace.duplicatePage(pageId)
    notifier.success('页面已复制', `已创建 ${page.name}`)
  } catch (error) {
    notifier.error('复制失败', error instanceof Error ? error.message : '复制失败')
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

async function rollbackRelease(releaseId: string) {
  try {
    const page = await workspace.rollbackRelease(releaseId)
    notifier.success('回滚成功', `已恢复到页面 ${page.name}`)
  } catch (error) {
    notifier.error('回滚失败', error instanceof Error ? error.message : '回滚失败')
  }
}

async function openReleaseDetail(releaseId: string) {
  const release = workspace.releases.find((item) => item.id === releaseId)
  if (!release)
    return
  await router.push(`/app/${release.appId}/page/${release.pageId}/release/${release.id}`)
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
        <button class="btn ghost" @click="toggleTheme">
          {{ isDark ? '浅色' : '深色' }}
        </button>
        <input v-model="globalThemeColor" class="theme-color" type="color" title="全局主题色" />
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
        <div class="app-list scrollbar-theme scrollbar-thin">
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

      <main class="detail-column scrollbar-theme">
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

            <div class="page-table scrollbar-theme">
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
                  <button class="mini" @click="movePage(page.id, 'up')">上移</button>
                  <button class="mini" @click="movePage(page.id, 'down')">下移</button>
                  <button class="mini" @click="duplicatePage(page.id)">复制</button>
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
                <span>{{ pageNameMap.get(release.pageId) || '未知页面' }} · {{ release.note }}</span>
                <small>{{ formatTime(release.createdAt) }}</small>
                <button class="mini" @click="openReleaseDetail(release.id)">详情</button>
                <button class="mini" @click="rollbackRelease(release.id)">回滚</button>
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
    radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--theme-primary) 24%, transparent), transparent 35%),
    radial-gradient(circle at 95% 5%, var(--ui-success-bg), transparent 30%),
    var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: 16px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-color {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 90%, transparent);
  background: transparent;
  padding: 2px;
}

.headline h1 {
  margin: 0;
  font-size: 24px;
  letter-spacing: 0.02em;
}

.headline p {
  margin: 6px 0 0;
  color: var(--color-text-tertiary);
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
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 88%, transparent);
  border-radius: 14px;
  background: color-mix(in oklab, var(--color-bg-secondary) 84%, transparent);
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
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 88%, transparent);
  background: color-mix(in oklab, var(--color-bg-secondary) 88%, transparent);
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
  border-bottom: 1px solid color-mix(in oklab, var(--color-border-secondary) 72%, transparent);
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
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 78%, transparent);
  background: color-mix(in oklab, var(--color-bg-primary) 56%, transparent);
  border-radius: 10px;
  padding: 8px;
  color: var(--color-text-secondary);
  text-align: left;
  cursor: pointer;
}

.app-item.active {
  border-color: var(--ui-info-border);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--theme-primary) 35%, transparent);
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
  color: var(--color-text-tertiary);
}

.count {
  font-size: 11px;
  color: var(--theme-primary);
  background: var(--ui-info-bg);
  border: 1px solid var(--ui-info-border);
  border-radius: 999px;
  padding: 2px 8px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.card {
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 78%, transparent);
  border-radius: 12px;
  background: color-mix(in oklab, var(--color-bg-secondary) 82%, transparent);
  padding: 12px;
}

.card p {
  margin: 0;
  color: var(--color-text-tertiary);
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
  color: var(--color-text-tertiary);
}

.page-table {
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 65%, transparent);
  border-radius: 10px;
  overflow: auto;
}

.row {
  display: grid;
  grid-template-columns: 180px 180px 120px 120px 170px 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid color-mix(in oklab, var(--color-border-secondary) 52%, transparent);
}

.row.head {
  background: color-mix(in oklab, var(--color-bg-tertiary) 62%, transparent);
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.row .time {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mini {
  height: 28px;
  border-radius: 7px;
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 85%, transparent);
  background: color-mix(in oklab, var(--color-bg-tertiary) 80%, transparent);
  color: var(--color-text-secondary);
  padding: 0 10px;
  cursor: pointer;
  font-size: 12px;
}

.mini.on {
  color: var(--ui-success);
  border-color: var(--ui-success-border);
  background: var(--ui-success-bg);
}

.mini.danger {
  color: var(--ui-danger-text);
  border-color: var(--ui-danger-border);
  background: var(--ui-danger-bg);
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
  border: 1px solid color-mix(in oklab, var(--theme-primary) 56%, transparent);
  background: color-mix(in oklab, var(--theme-primary) 16%, transparent);
  color: var(--theme-primary);
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
  grid-template-columns: 64px 1fr auto auto;
  gap: 8px;
  padding: 8px;
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 62%, transparent);
  border-radius: 8px;
  font-size: 12px;
}

input,
textarea,
select {
  height: 34px;
  border-radius: 8px;
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 90%, transparent);
  background: color-mix(in oklab, var(--color-bg-tertiary) 90%, transparent);
  color: var(--color-text-primary);
  padding: 0 10px;
}

textarea {
  height: auto;
  padding: 8px 10px;
}

.btn {
  height: 34px;
  border-radius: 8px;
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 90%, transparent);
  background: color-mix(in oklab, var(--color-bg-tertiary) 90%, transparent);
  color: var(--color-text-primary);
  padding: 0 12px;
  cursor: pointer;
}

.btn.primary {
  border-color: color-mix(in oklab, var(--theme-primary) 58%, transparent);
  background: color-mix(in oklab, var(--theme-primary) 18%, transparent);
  color: var(--theme-primary);
}

.btn.success {
  border-color: var(--ui-success-border);
  background: var(--ui-success-bg);
  color: var(--ui-success);
}

.btn.danger {
  border-color: var(--ui-danger-border);
  background: var(--ui-danger-bg);
  color: var(--ui-danger-text);
}

.btn.ghost {
  background: color-mix(in oklab, var(--color-bg-secondary) 62%, transparent);
}

@media (max-width: 1200px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}
</style>
