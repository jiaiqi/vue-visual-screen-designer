<script setup lang="ts">
import { computed } from 'vue'
import { useSelectionStore } from '@/stores/selection'
import { useEditorStore } from '@/stores/editor'

const selectionStore = useSelectionStore()
const editorStore = useEditorStore()

// 取出单选节点（暂时不处理多选复杂属性面板）
const activeObject = computed(() => {
  const selected = selectionStore.selectedObjects
  if (selected.length === 1) return selected[0]
  return null
})

const objectProps = computed({
  get: () => {
    if (!activeObject.value) return null
    return {
      x: Math.round(activeObject.value.left || 0),
      y: Math.round(activeObject.value.top || 0),
      width: Math.round((activeObject.value.width || 0) * (activeObject.value.scaleX || 1)),
      height: Math.round((activeObject.value.height || 0) * (activeObject.value.scaleY || 1)),
      angle: Math.round(activeObject.value.angle || 0),
      fill: activeObject.value.fill?.toString() || '#000000',
      type: activeObject.value.get('workshopType') || activeObject.value.type, // 自定义类型
      text: (activeObject.value as any).text || '',
      fontSize: (activeObject.value as any).fontSize || 20
    }
  },
  set: () => {
    // 防止重复或非关联更新
  }
})

// 接受双向绑定的表单写入并映射到 Fabric 原生实例上
function handleValChange(prop: string, e: Event) {
  if (!activeObject.value || !editorStore.canvas) return

  const target = e.target as HTMLInputElement
  const rawValue = target.value
  const numVal = Number(rawValue)

  switch (prop) {
    case 'x':
      activeObject.value.set('left', numVal)
      break
    case 'y':
      activeObject.value.set('top', numVal)
      break
    case 'width':
      // fabric 的尺寸变化建议将 scale 置 1 并直接改变原始参数以防边框畸变
      activeObject.value.set('scaleX', 1)
      activeObject.value.set('width', numVal)
      break
    case 'height':
      activeObject.value.set('scaleY', 1)
      activeObject.value.set('height', numVal)
      break
    case 'angle':
      activeObject.value.set('angle', numVal)
      break
    case 'fill':
      activeObject.value.set('fill', rawValue)
      break
    case 'text':
      activeObject.value.set('text', rawValue)
      break
    case 'fontSize':
      activeObject.value.set('fontSize', numVal)
      break
  }

  activeObject.value.setCoords()
  editorStore.canvas.requestRenderAll()

  // 主动抛出修改钩子，保证外部历史记录/触发相关联动也能拿到，为了绕开 fabric ts 复杂的签名错误暂时把 activeObject 判做 any
  editorStore.canvas.fire('object:modified', { target: activeObject.value as any })
}

</script>

<template>
  <div class="flex flex-col shrink-0 h-full overflow-y-auto">
    <!-- Header -->
    <div class="p-4 border-b">
      <h2 class="text-sm font-semibold">属性设置</h2>
    </div>

    <!-- Empty State -->
    <div v-if="!objectProps" class="p-8 text-center text-sm text-muted-foreground">
      请选择单个对象以查看并编辑属性
    </div>

    <!-- Active State -->
    <div v-else class="p-4 flex flex-col gap-6">
      <!-- 基础类型特征信息块 -->
      <section class="flex flex-col gap-2">
        <label class="text-xs text-muted-foreground uppercase">对象标识</label>
        <div class="px-3 py-2 bg-muted/50 rounded-md text-sm font-medium border">
          {{ objectProps.type === 'machine' ? '设备 (Machine)' : objectProps.type === 'area' ? '区域 (Zone/Area)' : objectProps.type }}
        </div>
      </section>

      <!-- 位置参数区 -->
      <section class="flex flex-col gap-4">
        <label class="text-xs text-muted-foreground uppercase">位置与形变</label>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-muted-foreground">X 坐标 (px)</span>
            <input
              type="number"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              :value="objectProps.x"
              @change="(e) => handleValChange('x', e)"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-muted-foreground">Y 坐标 (px)</span>
            <input
              type="number"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              :value="objectProps.y"
              @change="(e) => handleValChange('y', e)"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-muted-foreground">Width 宽度</span>
            <input
              type="number"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              :value="objectProps.width"
              @change="(e) => handleValChange('width', e)"
              min="1"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-muted-foreground">Height 高度</span>
            <input
              type="number"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              :value="objectProps.height"
              @change="(e) => handleValChange('height', e)"
              min="1"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-muted-foreground">旋转角度 (°)</span>
            <input
              type="number"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              :value="objectProps.angle"
              @change="(e) => handleValChange('angle', e)"
              step="15"
            />
          </div>
        </div>
      </section>

      <!-- 样式区 -->
      <section class="flex flex-col gap-4">
        <label class="text-xs text-muted-foreground uppercase">外观样式</label>
        <div class="grid grid-cols-1 gap-3">
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-muted-foreground">填充颜色</span>
            <div class="flex items-center gap-2">
              <input
                type="color"
                class="h-9 w-12 rounded cursor-pointer border bg-transparent"
                :value="objectProps.fill"
                @input="(e) => handleValChange('fill', e)"
              />
              <span class="text-sm font-mono flex-1 uppercase">{{ objectProps.fill }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 文字专有属性区 -->
      <section v-if="objectProps.type === 'i-text' || objectProps.type === 'text'" class="flex flex-col gap-4">
        <label class="text-xs text-muted-foreground uppercase">文本设置</label>

        <div class="flex flex-col gap-1.5">
          <span class="text-xs text-muted-foreground">文本内容</span>
          <textarea
            class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y min-h-[60px]"
            :value="objectProps.text"
            @input="(e) => handleValChange('text', e)"
            placeholder="输入说明文字..."
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-1">
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-muted-foreground">字号 (px)</span>
            <input
              type="number"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              :value="objectProps.fontSize"
              @change="(e) => handleValChange('fontSize', e)"
              min="12"
              step="2"
            />
          </div>
        </div>
      </section>

    </div>
  </div>
</template>
