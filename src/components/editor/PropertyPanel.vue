<script setup lang="ts">
import { computed } from 'vue'
import { useSelectionStore } from '@/stores/selection'
import { useEditorStore } from '@/stores/editor'
import { Settings, Lock } from 'lucide-vue-next'

const selectionStore = useSelectionStore()
const editorStore = useEditorStore()

// 取出单选节点
const activeObject = computed(() => {
  const selected = selectionStore.selectedObjects
  if (selected.length === 1) return selected[0]
  return null
})

// 统一的属性映射计算属性
const objectProps = computed(() => {
  const obj = activeObject.value
  if (!obj) return null

  return {
    id: (obj as any).id || '',
    type: obj.type,
    locked: (obj as any).locked || !obj.selectable,
    left: Math.round(obj.left || 0),
    top: Math.round(obj.top || 0),
    width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
    height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
    angle: Math.round(obj.angle || 0),
    fill: obj.fill?.toString() || '#000000',
    stroke: obj.stroke?.toString() || '#000000',
    text: (obj as any).text || '',
    fontSize: (obj as any).fontSize || 20,
    // 管道特有
    isPipe: (obj as any).workshopType === 'pipe',
    fluidColor: (obj as any).fluidLayer?.stroke || '#3b82f6',
    fluidSpeed: (obj as any).fluidSpeed || 1,
    flowDirection: (obj as any).flowDirection || 1
  }
})

function updateProperty(prop: string, value: any) {
  const obj = activeObject.value as any
  if (!obj || !editorStore.canvas) return

  switch (prop) {
    case 'id':
      obj.id = value
      break
    case 'left':
    case 'top':
    case 'angle':
      obj.set(prop, value)
      break
    case 'fill':
    case 'stroke':
      if (obj.workshopType === 'pipe') {
        // 管道特殊处理：更新内部 body 的渐变背景或基础颜色
        const body = (obj as fabric.Group).getObjects().find((o: any) => o instanceof fabric.Rect)
        if (body) {
          // 由于使用了渐变，简单的 set fill 可能覆盖渐变，这里我们暂定更新管壁主色比较复杂
          // 后续可引入更精细的渐变色值计算。此处先直接设置。
          body.set('fill', value)
        }
      } else {
        obj.set(prop, value)
      }
      break
    case 'fluidColor':
      if (obj.fluidLayer) {
        obj.fluidLayer.set('stroke', value)
      }
      break
    case 'fluidSpeed':
      obj.fluidSpeed = value
      break
    case 'flowDirection':
      obj.flowDirection = value
      break
    case 'text':
    case 'fontSize':
      obj.set(prop, value)
      break
    case 'width':
      if (obj.workshopType === 'pipe') {
        // 管道通过 scaleX 触发内部联动
        obj.set('scaleX', value / (obj.width || 1))
        obj.fire('scaling') // 手动触发 scaling 监听器以同步内部 width
      } else {
        obj.set('scaleX', value / (obj.width || 1))
      }
      break
    case 'height':
      obj.set('scaleY', value / (obj.height || 1))
      break
  }

  obj.setCoords()
  editorStore.canvas.requestRenderAll()
  editorStore.canvas.fire('object:modified', { target: obj })
}
</script>

<template>
  <div class="h-full bg-white flex flex-col">
    <!-- Header -->
    <div
      class="p-4 border-b flex items-center justify-between bg-slate-50/50 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-2">
        <div class="w-1 h-4 bg-slate-900 rounded-full"></div>
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">
          {{ objectProps?.isPipe ? '管道参数' : '参数面板' }}
        </h3>
      </div>
      <div v-if="objectProps?.locked"
        class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[9px] font-bold flex items-center gap-1 animate-pulse">
        <Lock class="w-2.5 h-2.5" />
        LOCKED
      </div>
    </div>

    <!-- Active State -->
    <div v-if="objectProps" class="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar"
      :class="{ 'opacity-50 pointer-events-none': objectProps.locked }">

      <!-- 管道特有设置区 -->
      <section v-if="objectProps.isPipe"
        class="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
        <label class="text-[10px] font-extrabold text-sky-600 uppercase tracking-widest flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></div>
          流体动力设置
        </label>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <span class="text-[9px] font-bold text-slate-400 ml-1">内流颜色</span>
            <div class="flex items-center gap-2">
              <input type="color" :value="objectProps.fluidColor"
                @input="e => updateProperty('fluidColor', (e.target as HTMLInputElement).value)"
                class="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer rounded-full overflow-hidden shadow-sm hover:scale-110 transition-transform" />
              <span class="text-[9px] font-mono text-slate-400 uppercase">{{ objectProps.fluidColor }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-2 justify-center">
            <span class="text-[9px] font-bold text-slate-400 ml-1">流动速度 ({{ objectProps.fluidSpeed }})</span>
            <input type="range" min="0" max="10" step="0.5" :value="objectProps.fluidSpeed"
              @input="e => updateProperty('fluidSpeed', Number((e.target as HTMLInputElement).value))"
              class="w-full accent-sky-500 h-1.5 bg-sky-100 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>
      </section>

      <!-- 基础标识组 -->
      <section class="space-y-3">
        <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">对象名称 / ID</label>
        <div class="relative group">
          <input :value="objectProps.id" @input="e => updateProperty('id', (e.target as HTMLInputElement).value)"
            class="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all"
            placeholder="未命名对象" />
        </div>
      </section>

      <div v-if="objectProps.locked"
        class="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-[11px] leading-relaxed relative overflow-hidden">
        <div class="font-bold mb-1 flex items-center gap-1.5">
          <Lock class="w-3 h-3" />
          对象已锁定
        </div>
        请在图层面板中解锁后进行修改。
      </div>

      <div class="h-[1px] bg-slate-100"></div>

      <!-- 位置与尺寸组 -->
      <section class="space-y-4">
        <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">位置与几何属性</label>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <span class="text-[9px] font-bold text-slate-400 ml-1">X (px)</span>
            <input type="number" :value="objectProps.left"
              @input="e => updateProperty('left', Number((e.target as HTMLInputElement).value))"
              class="w-full h-9 px-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono font-bold text-slate-600 focus:border-slate-900 focus:bg-white transition-all outline-none" />
          </div>
          <div class="space-y-1.5">
            <span class="text-[9px] font-bold text-slate-400 ml-1">Y (px)</span>
            <input type="number" :value="objectProps.top"
              @input="e => updateProperty('top', Number((e.target as HTMLInputElement).value))"
              class="w-full h-9 px-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono font-bold text-slate-600 focus:border-slate-900 focus:bg-white transition-all outline-none" />
          </div>
          <div class="space-y-1.5" v-if="!objectProps.isPipe">
            <span class="text-[9px] font-bold text-slate-400 ml-1">宽 (W)</span>
            <input type="number" :value="objectProps.width"
              @input="e => updateProperty('width', Number((e.target as HTMLInputElement).value))"
              class="w-full h-9 px-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono font-bold text-slate-600 focus:border-slate-900 focus:bg-white transition-all outline-none" />
          </div>
          <div class="space-y-1.5" v-if="!objectProps.isPipe">
            <span class="text-[9px] font-bold text-slate-400 ml-1">高 (H)</span>
            <input type="number" :value="objectProps.height"
              @input="e => updateProperty('height', Number((e.target as HTMLInputElement).value))"
              class="w-full h-9 px-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono font-bold text-slate-600 focus:border-slate-900 focus:bg-white transition-all outline-none" />
          </div>
          <div class="space-y-1.5">
            <span class="text-[9px] font-bold text-slate-400 ml-1">旋转角度</span>
            <input type="number" :value="objectProps.angle"
              @input="e => updateProperty('angle', Number((e.target as HTMLInputElement).value))"
              class="w-full h-9 px-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono font-bold text-slate-600 focus:border-slate-900 focus:bg-white transition-all outline-none" />
          </div>
        </div>
      </section>

      <div class="h-[1px] bg-slate-100"></div>

      <!-- 样式区 -->
      <section class="space-y-4">
        <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">显示与颜色</label>

        <!-- 文本特有 -->
        <div v-if="objectProps.type === 'i-text' || objectProps.type === 'text'" class="space-y-4">
          <div class="space-y-1.5">
            <span class="text-[9px] font-bold text-slate-400 ml-1">文字内容</span>
            <textarea :value="objectProps.text"
              @input="e => updateProperty('text', (e.target as HTMLTextAreaElement).value)"
              class="w-full min-h-[60px] p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 focus:border-slate-900 focus:bg-white transition-all outline-none resize-none"></textarea>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <span class="text-[9px] font-bold text-slate-400 ml-1">{{ objectProps.isPipe ? '管壁颜色' : '填充底色' }}</span>
            <div class="flex items-center gap-2">
              <input type="color" :value="objectProps.isPipe ? objectProps.stroke : objectProps.fill"
                @input="e => updateProperty(objectProps.isPipe ? 'stroke' : 'fill', (e.target as HTMLInputElement).value)"
                class="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer rounded-full overflow-hidden shadow-sm hover:scale-110 transition-transform" />
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{{ objectProps.isPipe ?
                objectProps.stroke : objectProps.fill }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-40">
      <div class="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
        <Settings class="w-8 h-8 text-slate-300 stroke-[1.5]" />
      </div>
      <p class="text-sm font-bold text-slate-400 uppercase tracking-wide">空物</p>
      <p class="text-[10px] text-slate-300 mt-1">未选中画布对象</p>
    </div>
  </div>
</template>