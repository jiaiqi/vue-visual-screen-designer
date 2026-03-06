<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, computed } from 'vue'
import { Node } from '@antv/x6'

const getNode = inject('getNode') as () => Node
const node = getNode()

const tableTitle = ref('表格标题')
const headerBgColor = ref('var(--color-bg-tertiary)')
const headerTextColor = ref('var(--theme-primary)')
const rowBgColor = ref('var(--color-bg-secondary)')
const rowAltBgColor = ref('var(--color-bg-tertiary)')
const rowTextColor = ref('var(--color-text-tertiary)')
const borderColor = ref('var(--color-border-secondary)')
const showBorder = ref(true)

const headerData = ref(['列1', '列2', '列3'])
const bodyData = ref([
  ['数据1-1', '数据1-2', '数据1-3'],
  ['数据2-1', '数据2-2', '数据2-3'],
  ['数据3-1', '数据3-2', '数据3-3'],
])

const updateData = () => {
  const data = node.getData() || {} as any
  tableTitle.value = data.tableTitle || '表格标题'
  headerBgColor.value = data.headerBgColor || 'var(--color-bg-tertiary)'
  headerTextColor.value = data.headerTextColor || 'var(--theme-primary)'
  rowBgColor.value = data.rowBgColor || 'var(--color-bg-secondary)'
  rowAltBgColor.value = data.rowAltBgColor || 'var(--color-bg-tertiary)'
  rowTextColor.value = data.rowTextColor || 'var(--color-text-tertiary)'
  borderColor.value = data.borderColor || 'var(--color-border-secondary)'
  showBorder.value = data.showBorder !== false
  headerData.value = data.headerData || ['列1', '列2', '列3']
  bodyData.value = data.bodyData || [
    ['数据1-1', '数据1-2', '数据1-3'],
    ['数据2-1', '数据2-2', '数据2-3'],
    ['数据3-1', '数据3-2', '数据3-3'],
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
  <div class="table-node-container w-full h-full flex flex-col overflow-hidden" :style="containerStyle">
    <!-- 表格标题 -->
    <div v-if="tableTitle" class="table-title px-3 py-2 text-sm font-bold" :style="{
      backgroundColor: headerBgColor,
      color: headerTextColor,
      borderBottom: showBorder ? `1px solid ${borderColor}` : 'none'
    }">
      {{ tableTitle }}
    </div>

    <!-- 表头 -->
    <div class="table-header flex" :style="{
      backgroundColor: headerBgColor,
      borderBottom: showBorder ? `1px solid ${borderColor}` : 'none'
    }">
      <div
        v-for="(header, index) in headerData"
        :key="index"
        class="header-cell flex-1 px-3 py-2 text-xs font-semibold text-center"
        :style="{ color: headerTextColor }"
      >
        {{ header }}
      </div>
    </div>

    <!-- 表格主体 -->
    <div class="table-body flex-1 overflow-hidden">
      <div
        v-for="(row, rowIndex) in bodyData"
        :key="rowIndex"
        class="table-row flex"
        :style="{
          backgroundColor: rowIndex % 2 === 0 ? rowBgColor : rowAltBgColor,
          borderBottom: showBorder ? `1px solid ${borderColor}` : 'none'
        }"
      >
        <div
          v-for="(cell, cellIndex) in row"
          :key="cellIndex"
          class="table-cell flex-1 px-3 py-2 text-xs text-center"
          :style="{ color: rowTextColor }"
        >
          {{ cell }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-node-container {
  pointer-events: none;
  user-select: none;
}

.table-node-container > * {
  pointer-events: auto;
}

.table-title {
  flex-shrink: 0;
}

.table-header {
  flex-shrink: 0;
}

.header-cell,
.table-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
