import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  AppEntityV2,
  AppStatusV2,
  PageEntityV2,
  PageStatusV2,
  ReleaseEntityV2,
  WorkspaceSnapshotV2,
} from '@/types/workspace'
import { createWorkspaceApi } from '@/api/workspace'
import { x6ToSchemaV2 } from '@vue-visual-screen/v2-shared'

function nowIso(): string {
  return new Date().toISOString()
}

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

const workspaceApi = createWorkspaceApi()

function defaultCanvasConfig(name: string) {
  return {
    name,
    category: '默认',
    width: 1920,
    height: 1080,
    backgroundColor: 'rgba(230, 230, 230, 0.1)',
    backgroundImage: '',
    showGrid: true,
    gridSize: 20,
    gridColor: 'rgba(230, 230, 230, 0.5)',
    snapToGrid: true,
    showRuler: true,
    previewScaleMode: 'contain',
    theme: 'dark',
  }
}

function emptyGraphData() {
  return {
    cells: [],
  }
}

function normalizeApp(app: Partial<AppEntityV2>): AppEntityV2 {
  const status = (app.status || 'draft') as AppStatusV2
  return {
    id: String(app.id || makeId('app')),
    name: String(app.name || '未命名应用'),
    description: String(app.description || ''),
    owner: String(app.owner || '未分配'),
    status,
    tags: Array.isArray(app.tags) ? app.tags.map((item) => String(item)).filter(Boolean) : [],
    themeColor: String(app.themeColor || '#0ea5e9'),
    homePageId: app.homePageId ? String(app.homePageId) : null,
    createdAt: String(app.createdAt || nowIso()),
    updatedAt: String(app.updatedAt || nowIso()),
  }
}

function normalizePage(page: Partial<PageEntityV2>, order: number): PageEntityV2 {
  const status = (page.status || 'draft') as PageStatusV2
  return {
    id: String(page.id || makeId('page')),
    appId: String(page.appId || ''),
    name: String(page.name || `页面 ${order + 1}`),
    path: String(page.path || `/page-${order + 1}`),
    status,
    order: Number.isFinite(page.order) ? Number(page.order) : order,
    isHome: Boolean(page.isHome),
    createdAt: String(page.createdAt || nowIso()),
    updatedAt: String(page.updatedAt || nowIso()),
    canvasConfig: (page.canvasConfig || defaultCanvasConfig(String(page.name || `页面 ${order + 1}`))) as Record<string, unknown>,
    graphData: (page.graphData || emptyGraphData()) as Record<string, unknown>,
  }
}

function normalizeRelease(release: Partial<ReleaseEntityV2>): ReleaseEntityV2 {
  return {
    id: String(release.id || makeId('rel')),
    appId: String(release.appId || ''),
    pageId: String(release.pageId || ''),
    version: String(release.version || 'v1'),
    note: String(release.note || '常规发布'),
    createdAt: String(release.createdAt || nowIso()),
    schema: release.schema ?? {},
    canvasConfig: (release.canvasConfig || defaultCanvasConfig('页面')) as Record<string, unknown>,
    graphData: (release.graphData || emptyGraphData()) as Record<string, unknown>,
  }
}

export const useWorkspaceStoreV2 = defineStore('workspaceV2', () => {
  const initialized = ref(false)
  const loading = ref(false)

  const apps = ref<AppEntityV2[]>([])
  const pages = ref<PageEntityV2[]>([])
  const releases = ref<ReleaseEntityV2[]>([])

  const activeAppId = ref<string | null>(null)
  const activePageId = ref<string | null>(null)

  const activeApp = computed(() => apps.value.find((item) => item.id === activeAppId.value) || null)
  const activePage = computed(() => pages.value.find((item) => item.id === activePageId.value) || null)

  const currentPages = computed(() => {
    if (!activeAppId.value)
      return []
    return pages.value
      .filter((page) => page.appId === activeAppId.value)
      .sort((a, b) => a.order - b.order)
  })

  const currentReleases = computed(() => {
    if (!activeAppId.value)
      return []
    return releases.value
      .filter((item) => item.appId === activeAppId.value)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  function snapshot(): WorkspaceSnapshotV2 {
    return {
      apps: apps.value,
      pages: pages.value,
      releases: releases.value,
      activeAppId: activeAppId.value,
      activePageId: activePageId.value,
    }
  }

  async function persist() {
    await workspaceApi.saveSnapshot(snapshot())
  }

  function normalizeWorkspace(data: WorkspaceSnapshotV2): WorkspaceSnapshotV2 {
    const normalizedApps = data.apps.map((item) => normalizeApp(item))
    const normalizedPages = data.pages.map((item, index) => normalizePage(item, index))

    for (const app of normalizedApps) {
      const appPages = normalizedPages.filter((page) => page.appId === app.id).sort((a, b) => a.order - b.order)
      if (appPages.length === 0)
        continue

      const home = appPages.find((page) => page.id === app.homePageId)
        || appPages.find((page) => page.isHome)
        || appPages[0]
      if (!home)
        continue

      app.homePageId = home.id
      for (const page of appPages) {
        page.isHome = page.id === home.id
      }
    }

    return {
      apps: normalizedApps,
      pages: normalizedPages,
      releases: (data.releases || []).map((item) => normalizeRelease(item)),
      activeAppId: data.activeAppId,
      activePageId: data.activePageId,
    }
  }

  async function bootstrapDefaultWorkspace() {
    const app: AppEntityV2 = {
      id: makeId('app'),
      name: '默认应用',
      description: 'v2 本地演示应用',
      owner: '管理员',
      status: 'draft',
      tags: ['demo'],
      themeColor: '#0ea5e9',
      homePageId: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    const page: PageEntityV2 = {
      id: makeId('page'),
      appId: app.id,
      name: '页面 1',
      path: '/page-1',
      status: 'draft',
      order: 0,
      isHome: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      canvasConfig: defaultCanvasConfig('页面 1'),
      graphData: emptyGraphData(),
    }

    app.homePageId = page.id

    apps.value = [app]
    pages.value = [page]
    releases.value = []
    activeAppId.value = app.id
    activePageId.value = page.id
    await persist()
  }

  async function init() {
    if (initialized.value || loading.value)
      return

    loading.value = true
    try {
      const data = await workspaceApi.loadSnapshot()
      if (!data || data.apps.length === 0 || data.pages.length === 0) {
        await bootstrapDefaultWorkspace()
      } else {
        const normalized = normalizeWorkspace(data)
        apps.value = normalized.apps
        pages.value = normalized.pages
        releases.value = normalized.releases
        activeAppId.value = normalized.activeAppId
        activePageId.value = normalized.activePageId

        if (!activeApp.value) {
          activeAppId.value = apps.value[0]?.id || null
        }
        if (!activePage.value) {
          const fallbackPage = pages.value.find((item) => item.appId === activeAppId.value) || pages.value[0]
          activePageId.value = fallbackPage?.id || null
        }

        await persist()
      }
      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  async function createApp(name: string, description = ''): Promise<AppEntityV2> {
    const app: AppEntityV2 = {
      id: makeId('app'),
      name: name.trim() || '未命名应用',
      description: description.trim(),
      owner: '未分配',
      status: 'draft',
      tags: [],
      themeColor: '#0ea5e9',
      homePageId: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    const page: PageEntityV2 = {
      id: makeId('page'),
      appId: app.id,
      name: '页面 1',
      path: '/page-1',
      status: 'draft',
      order: 0,
      isHome: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      canvasConfig: defaultCanvasConfig('页面 1'),
      graphData: emptyGraphData(),
    }

    app.homePageId = page.id

    apps.value.unshift(app)
    pages.value.unshift(page)
    activeAppId.value = app.id
    activePageId.value = page.id
    await persist()
    return app
  }

  async function updateAppMeta(appId: string, patch: Partial<Pick<AppEntityV2, 'name' | 'description' | 'owner' | 'status' | 'themeColor'>> & { tags?: string[] }) {
    const app = apps.value.find((item) => item.id === appId)
    if (!app)
      return

    if (patch.name !== undefined)
      app.name = patch.name.trim() || app.name
    if (patch.description !== undefined)
      app.description = patch.description
    if (patch.owner !== undefined)
      app.owner = patch.owner.trim() || '未分配'
    if (patch.status !== undefined)
      app.status = patch.status
    if (patch.themeColor !== undefined)
      app.themeColor = patch.themeColor
    if (patch.tags !== undefined)
      app.tags = patch.tags.map((item) => item.trim()).filter(Boolean)

    app.updatedAt = nowIso()
    await persist()
  }

  async function renameApp(appId: string, name: string, description: string) {
    await updateAppMeta(appId, { name, description })
  }

  async function removeApp(appId: string) {
    const remainApps = apps.value.filter((item) => item.id !== appId)
    const remainPages = pages.value.filter((item) => item.appId !== appId)
    const remainReleases = releases.value.filter((item) => item.appId !== appId)

    apps.value = remainApps
    pages.value = remainPages
    releases.value = remainReleases

    if (apps.value.length === 0 || pages.value.length === 0) {
      await bootstrapDefaultWorkspace()
      return
    }

    if (activeAppId.value === appId) {
      activeAppId.value = apps.value[0]?.id || null
      activePageId.value = pages.value.find((item) => item.appId === activeAppId.value)?.id || null
    }

    await persist()
  }

  async function setActiveApp(appId: string) {
    if (!apps.value.some((item) => item.id === appId))
      return

    activeAppId.value = appId
    const nextPage = pages.value.find((item) => item.appId === appId)
    if (nextPage) {
      activePageId.value = nextPage.id
    }
    await persist()
  }

  async function setHomePage(appId: string, pageId: string) {
    const app = apps.value.find((item) => item.id === appId)
    if (!app)
      return

    const appPages = pages.value.filter((item) => item.appId === appId)
    for (const page of appPages) {
      page.isHome = page.id === pageId
    }
    app.homePageId = pageId
    app.updatedAt = nowIso()
    await persist()
  }

  async function createPage(appId: string, name: string): Promise<PageEntityV2> {
    const app = apps.value.find((item) => item.id === appId)
    if (!app)
      throw new Error('应用不存在')

    const pagesOfApp = pages.value.filter((item) => item.appId === appId).sort((a, b) => a.order - b.order)
    const pageIndex = pagesOfApp.length + 1
    const pageName = name.trim() || `页面 ${pageIndex}`

    const page: PageEntityV2 = {
      id: makeId('page'),
      appId,
      name: pageName,
      path: `/${pageName.toLowerCase().replace(/\s+/g, '-')}`,
      status: 'draft',
      order: pageIndex - 1,
      isHome: pagesOfApp.length === 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      canvasConfig: defaultCanvasConfig(pageName),
      graphData: emptyGraphData(),
    }

    pages.value.push(page)
    activeAppId.value = appId
    activePageId.value = page.id
    if (page.isHome) {
      app.homePageId = page.id
    }
    app.updatedAt = nowIso()
    await persist()
    return page
  }

  async function duplicatePage(pageId: string): Promise<PageEntityV2> {
    const source = pages.value.find((item) => item.id === pageId)
    if (!source)
      throw new Error('页面不存在')

    const app = apps.value.find((item) => item.id === source.appId)
    if (!app)
      throw new Error('应用不存在')

    const appPages = pages.value
      .filter((item) => item.appId === source.appId)
      .sort((a, b) => a.order - b.order)
    const nextOrder = appPages.length

    const copy: PageEntityV2 = {
      id: makeId('page'),
      appId: source.appId,
      name: `${source.name} 副本`,
      path: `${source.path}-copy-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      order: nextOrder,
      isHome: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      canvasConfig: JSON.parse(JSON.stringify(source.canvasConfig)) as Record<string, unknown>,
      graphData: JSON.parse(JSON.stringify(source.graphData)) as Record<string, unknown>,
    }

    pages.value.push(copy)
    activeAppId.value = copy.appId
    activePageId.value = copy.id
    app.updatedAt = nowIso()
    await persist()
    return copy
  }

  async function renamePage(pageId: string, name: string, path: string) {
    const page = pages.value.find((item) => item.id === pageId)
    if (!page)
      return

    page.name = name.trim() || page.name
    page.path = path.trim() || page.path
    page.updatedAt = nowIso()
    await persist()
  }

  async function updatePageMeta(pageId: string, patch: Partial<Pick<PageEntityV2, 'name' | 'path' | 'status'>>) {
    const page = pages.value.find((item) => item.id === pageId)
    if (!page)
      return

    if (patch.name !== undefined)
      page.name = patch.name.trim() || page.name
    if (patch.path !== undefined)
      page.path = patch.path.trim() || page.path
    if (patch.status !== undefined)
      page.status = patch.status

    page.updatedAt = nowIso()
    await persist()
  }

  async function movePage(pageId: string, direction: 'up' | 'down') {
    const page = pages.value.find((item) => item.id === pageId)
    if (!page)
      return

    const appPages = pages.value
      .filter((item) => item.appId === page.appId)
      .sort((a, b) => a.order - b.order)

    const index = appPages.findIndex((item) => item.id === pageId)
    if (index < 0)
      return

    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= appPages.length)
      return

    const target = appPages[swapIndex]
    if (!target)
      return

    const oldOrder = page.order
    page.order = target.order
    target.order = oldOrder
    page.updatedAt = nowIso()
    target.updatedAt = nowIso()
    await persist()
  }

  async function removePage(pageId: string) {
    const target = pages.value.find((item) => item.id === pageId)
    if (!target)
      return

    const siblingPages = pages.value.filter((item) => item.appId === target.appId)
    if (siblingPages.length <= 1)
      throw new Error('每个应用至少保留一个页面')

    pages.value = pages.value.filter((item) => item.id !== pageId)
    releases.value = releases.value.filter((item) => item.pageId !== pageId)

    if (activePageId.value === pageId) {
      activePageId.value = pages.value.find((item) => item.appId === target.appId)?.id || null
    }

    const app = apps.value.find((item) => item.id === target.appId)
    if (app) {
      const appPages = pages.value.filter((item) => item.appId === app.id).sort((a, b) => a.order - b.order)
      if (app.homePageId === pageId) {
        app.homePageId = appPages[0]?.id || null
        for (const page of appPages) {
          page.isHome = page.id === app.homePageId
        }
      }
      app.updatedAt = nowIso()
    }

    await persist()
  }

  async function setActivePage(pageId: string) {
    const page = pages.value.find((item) => item.id === pageId)
    if (!page)
      return

    activePageId.value = pageId
    activeAppId.value = page.appId
    await persist()
  }

  async function saveCurrentPageSnapshot(payload: { canvasConfig: Record<string, unknown>; graphData: Record<string, unknown> }) {
    const pageId = activePageId.value
    if (!pageId)
      return

    const page = pages.value.find((item) => item.id === pageId)
    if (!page)
      return

    page.canvasConfig = payload.canvasConfig
    page.graphData = payload.graphData
    page.updatedAt = nowIso()

    const app = apps.value.find((item) => item.id === page.appId)
    if (app)
      app.updatedAt = nowIso()

    await persist()
  }

  async function publishCurrentPage(note: string) {
    const page = activePage.value
    if (!page)
      throw new Error('当前页面不存在')

    const pageReleases = releases.value.filter((item) => item.pageId === page.id)
    const version = `v${pageReleases.length + 1}`

    const schema = x6ToSchemaV2(page.graphData, {
      width: Number((page.canvasConfig.width as number) || 1920),
      height: Number((page.canvasConfig.height as number) || 1080),
      backgroundColor: String((page.canvasConfig.backgroundColor as string) || '#0f172a'),
    })

    const release: ReleaseEntityV2 = {
      id: makeId('rel'),
      appId: page.appId,
      pageId: page.id,
      version,
      note: note.trim() || '常规发布',
      createdAt: nowIso(),
      schema,
      canvasConfig: JSON.parse(JSON.stringify(page.canvasConfig)) as Record<string, unknown>,
      graphData: JSON.parse(JSON.stringify(page.graphData)) as Record<string, unknown>,
    }

    page.status = 'published'
    page.updatedAt = nowIso()
    releases.value.unshift(release)
    await persist()
    return release
  }

  async function rollbackRelease(releaseId: string) {
    const release = releases.value.find((item) => item.id === releaseId)
    if (!release)
      throw new Error('发布记录不存在')

    const page = pages.value.find((item) => item.id === release.pageId)
    if (!page)
      throw new Error('目标页面不存在')

    page.canvasConfig = JSON.parse(JSON.stringify(release.canvasConfig)) as Record<string, unknown>
    page.graphData = JSON.parse(JSON.stringify(release.graphData)) as Record<string, unknown>
    page.status = 'published'
    page.updatedAt = nowIso()

    activeAppId.value = page.appId
    activePageId.value = page.id
    await persist()
    return page
  }

  function findPageByRoute(appId: string, pageId: string): PageEntityV2 | null {
    return pages.value.find((item) => item.id === pageId && item.appId === appId) || null
  }

  function findReleaseById(releaseId: string): ReleaseEntityV2 | null {
    return releases.value.find((item) => item.id === releaseId) || null
  }

  function findPreviousRelease(releaseId: string): ReleaseEntityV2 | null {
    const target = releases.value.find((item) => item.id === releaseId)
    if (!target)
      return null

    const pageReleases = releases.value
      .filter((item) => item.pageId === target.pageId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const index = pageReleases.findIndex((item) => item.id === target.id)
    if (index <= 0)
      return null
    return pageReleases[index - 1] || null
  }

  return {
    initialized,
    loading,
    apps,
    pages,
    releases,
    activeAppId,
    activePageId,
    activeApp,
    activePage,
    currentPages,
    currentReleases,
    init,
    createApp,
    renameApp,
    updateAppMeta,
    removeApp,
    setActiveApp,
    setHomePage,
    createPage,
    duplicatePage,
    renamePage,
    updatePageMeta,
    movePage,
    removePage,
    setActivePage,
    saveCurrentPageSnapshot,
    publishCurrentPage,
    rollbackRelease,
    findPageByRoute,
    findReleaseById,
    findPreviousRelease,
  }
})
