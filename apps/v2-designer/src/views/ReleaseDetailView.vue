<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStoreV2 } from '@/stores/v2/workspaceStoreV2'
import { useNotifier } from '@/composables/useNotifier'
import GlobalToast from '@/components/v2/common/GlobalToast.vue'

const route = useRoute()
const router = useRouter()
const workspace = useWorkspaceStoreV2()
const notifier = useNotifier()

const confirmRollback = ref(false)

const appId = computed(() => String(route.params.appId || ''))
const pageId = computed(() => String(route.params.pageId || ''))
const releaseId = computed(() => String(route.params.releaseId || ''))

const release = computed(() => workspace.findReleaseById(releaseId.value))
const previousRelease = computed(() => workspace.findPreviousRelease(releaseId.value))
const page = computed(() => workspace.pages.find((item) => item.id === pageId.value) || null)
const app = computed(() => workspace.apps.find((item) => item.id === appId.value) || null)

function formatTime(value: string) {
  return new Date(value).toLocaleString()
}

function summarizeGraph(graphData: Record<string, unknown> | undefined) {
  const cells = Array.isArray((graphData as { cells?: unknown[] } | undefined)?.cells)
    ? ((graphData as { cells: unknown[] }).cells)
    : []
  let nodeCount = 0
  let edgeCount = 0
  for (const item of cells) {
    const cell = item as Record<string, unknown>
    const shape = String(cell.shape || '')
    const hasSource = typeof cell.source === 'object' && cell.source !== null
    const hasTarget = typeof cell.target === 'object' && cell.target !== null
    if (shape.includes('edge') || (hasSource && hasTarget)) edgeCount += 1
    else nodeCount += 1
  }
  return { nodeCount, edgeCount, totalCount: cells.length }
}

const currentGraphSummary = computed(() => summarizeGraph(release.value?.graphData as Record<string, unknown>))
const previousGraphSummary = computed(() => summarizeGraph(previousRelease.value?.graphData as Record<string, unknown>))

const graphDiff = computed(() => ({
  nodeDelta: currentGraphSummary.value.nodeCount - previousGraphSummary.value.nodeCount,
  edgeDelta: currentGraphSummary.value.edgeCount - previousGraphSummary.value.edgeCount,
  totalDelta: currentGraphSummary.value.totalCount - previousGraphSummary.value.totalCount,
}))

const canvasDiff = computed(() => {
  const fields = ['width', 'height', 'backgroundColor', 'showGrid', 'gridSize', 'gridColor', 'snapToGrid']
  const curr = (release.value?.canvasConfig || {}) as Record<string, unknown>
  const prev = (previousRelease.value?.canvasConfig || {}) as Record<string, unknown>
  return fields
    .map((field) => ({
      field,
      before: prev[field],
      after: curr[field],
      changed: JSON.stringify(prev[field]) !== JSON.stringify(curr[field]),
    }))
    .filter((item) => item.changed)
})

async function goBack() {
  if (appId.value && pageId.value) {
    await router.push(`/app/${appId.value}/page/${pageId.value}/editor`)
    return
  }
  await router.push('/apps')
}

async function doRollback() {
  if (!release.value)
    return
  try {
    const restoredPage = await workspace.rollbackRelease(release.value.id)
    confirmRollback.value = false
    notifier.success('回滚成功', `页面 ${restoredPage.name} 已恢复到 ${release.value.version}`)
  } catch (error) {
    notifier.error('回滚失败', error instanceof Error ? error.message : '未知错误')
  }
}

onMounted(async () => {
  await workspace.init()
  if (!release.value) {
    notifier.warning('发布记录不存在', '该版本可能已被删除')
  }
})
</script>

<template>
  <div class="release-detail">
    <header class="header">
      <div>
        <h1>发布详情</h1>
        <p v-if="release && app && page">
          {{ app.name }} / {{ page.name }} / {{ release.version }}
        </p>
      </div>
      <div class="actions">
        <button class="btn" @click="goBack">返回</button>
        <button class="btn danger" :disabled="!release" @click="confirmRollback = true">回滚到该版本</button>
      </div>
    </header>

    <div v-if="release" class="grid">
      <section class="panel">
        <h2>版本信息</h2>
        <dl class="meta-list">
          <div><dt>版本号</dt><dd>{{ release.version }}</dd></div>
          <div><dt>发布时间</dt><dd>{{ formatTime(release.createdAt) }}</dd></div>
          <div><dt>发布说明</dt><dd>{{ release.note || '无' }}</dd></div>
          <div><dt>上一版本</dt><dd>{{ previousRelease?.version || '无' }}</dd></div>
        </dl>
      </section>

      <section class="panel">
        <h2>图元差异</h2>
        <div class="diff-grid">
          <article>
            <p>节点变化</p>
            <strong :class="{ plus: graphDiff.nodeDelta > 0, minus: graphDiff.nodeDelta < 0 }">
              {{ graphDiff.nodeDelta >= 0 ? '+' : '' }}{{ graphDiff.nodeDelta }}
            </strong>
          </article>
          <article>
            <p>连线变化</p>
            <strong :class="{ plus: graphDiff.edgeDelta > 0, minus: graphDiff.edgeDelta < 0 }">
              {{ graphDiff.edgeDelta >= 0 ? '+' : '' }}{{ graphDiff.edgeDelta }}
            </strong>
          </article>
          <article>
            <p>总图元变化</p>
            <strong :class="{ plus: graphDiff.totalDelta > 0, minus: graphDiff.totalDelta < 0 }">
              {{ graphDiff.totalDelta >= 0 ? '+' : '' }}{{ graphDiff.totalDelta }}
            </strong>
          </article>
        </div>
      </section>

      <section class="panel">
        <h2>画布配置 Diff</h2>
        <table class="diff-table">
          <thead>
            <tr>
              <th>字段</th>
              <th>上一版本</th>
              <th>当前版本</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="canvasDiff.length === 0">
              <td colspan="3">画布配置无变化</td>
            </tr>
            <tr v-for="item in canvasDiff" :key="item.field">
              <td>{{ item.field }}</td>
              <td>{{ String(item.before ?? '-') }}</td>
              <td>{{ String(item.after ?? '-') }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <section v-else class="panel empty">
      发布记录不存在或已删除。
    </section>

    <div v-if="confirmRollback" class="modal-mask">
      <div class="modal panel">
        <h3>确认回滚</h3>
        <p>
          将页面回滚到 <strong>{{ release?.version }}</strong>。此操作会覆盖当前页面画布内容，是否继续？
        </p>
        <div class="actions">
          <button class="btn" @click="confirmRollback = false">取消</button>
          <button class="btn danger" @click="doRollback">确认回滚</button>
        </div>
      </div>
    </div>
  </div>
  <GlobalToast />
</template>

<style scoped>
.release-detail {
  min-height: 100vh;
  padding: 16px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

h1 {
  margin: 0;
  font-size: 22px;
}

.header p {
  margin: 6px 0 0;
  color: var(--color-text-tertiary);
}

.grid {
  display: grid;
  gap: 12px;
}

.panel {
  border: 1px solid var(--ui-border);
  border-radius: 12px;
  background: var(--ui-panel-bg);
  padding: 12px;
}

.panel h2 {
  margin: 0 0 10px;
  font-size: 15px;
}

.meta-list {
  display: grid;
  gap: 8px;
}

.meta-list div {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 8px;
}

.meta-list dt {
  color: var(--color-text-tertiary);
}

.diff-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.diff-grid article {
  border: 1px solid var(--ui-border);
  border-radius: 10px;
  background: var(--ui-panel-bg-soft);
  padding: 10px;
}

.diff-grid p {
  margin: 0 0 6px;
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.diff-grid strong {
  font-size: 20px;
}

.plus {
  color: var(--color-accent-emerald);
}

.minus {
  color: var(--color-accent-rose);
}

.diff-table {
  width: 100%;
  border-collapse: collapse;
}

.diff-table th,
.diff-table td {
  border-bottom: 1px solid var(--ui-border);
  padding: 8px;
  text-align: left;
  font-size: 13px;
}

.diff-table th {
  color: var(--color-text-tertiary);
}

.empty {
  text-align: center;
  color: var(--color-text-tertiary);
}

.btn {
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--ui-border);
  background: var(--ui-panel-bg-soft);
  color: var(--color-text-primary);
  padding: 0 12px;
  cursor: pointer;
}

.btn.danger {
  border-color: var(--ui-danger-border);
  background: var(--ui-danger-bg);
  color: var(--ui-danger-text);
}

.actions {
  display: flex;
  gap: 8px;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: color-mix(in oklab, var(--color-bg-primary) 62%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal {
  width: min(520px, 100%);
}

.modal h3 {
  margin: 0 0 8px;
}

.modal p {
  margin: 0 0 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
</style>
