<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, computed } from 'vue'
import { Node } from '@antv/x6'

const getNode = inject('getNode') as () => Node
const node = getNode()

const listTitle = ref('排名列表')
const headerBgColor = ref('var(--color-bg-tertiary)')
const headerTextColor = ref('var(--theme-primary)')
const rowBgColor = ref('var(--color-bg-secondary)')
const rowAltBgColor = ref('var(--color-bg-tertiary)')
const rowTextColor = ref('var(--color-text-tertiary)')
const borderColor = ref('var(--color-border-secondary)')
const showBorder = ref(true)

const listData = ref([
  { rank: 1, name: '项目 A', value: 100 },
  { rank: 2, name: '项目 B', value: 95 },
  { rank: 3, name: '项目 C', value: 88 },
  { rank: 4, name: '项目 D', value: 75 },
  { rank: 5, name: '项目 E', value: 60 },
])

const updateData = () => {
  const data = node.getData() || {} as any
  listTitle.value = data.listTitle || '排名列表'
  headerBgColor.value = data.headerBgColor || 'var(--color-bg-tertiary)'
  headerTextColor.value = data.headerTextColor || 'var(--theme-primary)'
  rowBgColor.value = data.rowBgColor || 'var(--color-bg-secondary)'
  rowAltBgColor.value = data.rowAltBgColor || 'var(--color-bg-tertiary)'
  rowTextColor.value = data.rowTextColor || 'var(--color-text-tertiary)'
  borderColor.value = data.borderColor || 'var(--color-border-secondary)'
  showBorder.value = data.showBorder !== false
  listData.value = data.listData || [
    { rank: 1, name: '项目 A', value: 100 },
    { rank: 2, name: '项目 B', value: 95 },
    { rank: 3, name: '项目 C', value: 88 },
    { rank: 4, name: '项目 D', value: 75 },
    { rank: 5, name: '项目 E', value: 60 },
  ]
}

const containerStyle = computed(() => {
  const nodeWidth = node.size().width
  const nodeHeight = node.size().height
  return {
    width: `${nodeWidth}px`,
    height: `${nodeHeight}px`,
  }
})

onMounted(() => {
  updateData()
  node.on('change:data', updateData)
})

onUnmounted(() => {
  node.off('change:data', updateData)
})
</script>

<template>
  <div class="list-node-container w-full h-full flex flex-col overflow-hidden" :style="containerStyle">
    <div v-if="listTitle" class="list-title px-3 py-2 text-sm font-bold" :style="{
      backgroundColor: headerBgColor,
      color: headerTextColor,
      borderBottom: showBorder ? `1px solid ${borderColor}` : 'none'
    }">
      {{ listTitle }}
    </div>

    <div class="list-header flex" :style="{
      backgroundColor: headerBgColor,
      borderBottom: showBorder ? `1px solid ${borderColor}` : 'none'
    }">
      <div class="rank-cell px-2 py-2 text-xs font-semibold text-center" :style="{ color: headerTextColor, width: '40px' }">
        序号
      </div>
      <div class="name-cell flex-1 px-3 py-2 text-xs font-semibold" :style="{ color: headerTextColor }">
        名称
      </div>
      <div class="value-cell px-3 py-2 text-xs font-semibold text-center" :style="{ color: headerTextColor, width: '60px' }">
        数值
      </div>
    </div>

    <div class="list-body flex-1 overflow-hidden">
      <div
        v-for="(item, index) in listData"
        :key="index"
        class="list-row flex"
        :style="{
          backgroundColor: index % 2 === 0 ? rowBgColor : rowAltBgColor,
          borderBottom: showBorder ? `1px solid ${borderColor}` : 'none'
        }"
      >
        <div
          class="rank-cell px-2 py-2 text-xs text-center"
          :style="{ color: headerTextColor, width: '40px' }"
        >
          {{ item.rank }}
        </div>
        <div
          class="name-cell flex-1 px-3 py-2 text-xs"
          :style="{ color: rowTextColor }"
        >
          {{ item.name }}
        </div>
        <div
          class="value-cell px-3 py-2 text-xs text-center"
          :style="{ color: rowTextColor, width: '60px' }"
        >
          {{ item.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-node-container {
  pointer-events: none;
  user-select: none;
}

.list-node-container > * {
  pointer-events: auto;
}

.list-title {
  flex-shrink: 0;
}

.list-header {
  flex-shrink: 0;
}

.rank-cell,
.name-cell,
.value-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
