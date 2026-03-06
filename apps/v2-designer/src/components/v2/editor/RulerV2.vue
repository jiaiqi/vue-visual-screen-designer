<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

interface Props {
  type: 'horizontal' | 'vertical'
  thick: number
  scale: number
  start: number // 逻辑起点坐标
  width?: number
  height?: number
  palette?: {
    bgColor?: string
    longfgColor?: string
    shortfgColor?: string
    fontColor?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  palette: () => ({
    bgColor: 'var(--ui-panel-bg-strong)',
    longfgColor: 'var(--color-text-muted)',
    shortfgColor: 'var(--color-border-secondary)',
    fontColor: 'var(--color-text-tertiary)',
  })
})

const canvasRef = ref<HTMLCanvasElement>()

function resolveCssColor(input: string): string {
  if (!input.startsWith('var('))
    return input
  if (typeof window === 'undefined')
    return 'rgb(100, 116, 139)'
  const varName = input.slice(4, -1).trim()
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || 'rgb(100, 116, 139)'
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { type, thick, scale, start, palette } = props
  const w = canvas.width
  const h = canvas.height

  // 清空画布
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = resolveCssColor(palette.bgColor!)
  ctx.fillRect(0, 0, w, h)

  ctx.beginPath()
  ctx.strokeStyle = resolveCssColor(palette.longfgColor!)
  ctx.fillStyle = resolveCssColor(palette.fontColor!)
  ctx.font = '10px sans-serif'
  ctx.textBaseline = 'middle'

  const isH = type === 'horizontal'
  const step = getStep(scale)

  // 计算第一个刻度点
  // start 是逻辑坐标，比如 -100px
  // 需要找到大于 start 的第一个 step 的倍数
  const firstTick = Math.ceil(start / step) * step

  for (let tick = firstTick; ; tick += step) {
    // 逻辑坐标转屏幕坐标
    const pos = (tick - start) * scale
    if (pos > (isH ? w : h)) break

    const isLong = tick % (step * 5) === 0
    const len = isLong ? thick : thick / 2

    if (isH) {
      ctx.moveTo(pos, thick - len)
      ctx.lineTo(pos, thick)
      if (isLong) {
        ctx.fillText(tick.toString(), pos + 4, thick / 2)
      }
    } else {
      ctx.moveTo(thick - len, pos)
      ctx.lineTo(thick, pos)
      if (isLong) {
        ctx.save()
        ctx.translate(thick / 2, pos + 4)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(tick.toString(), 0, 0)
        ctx.restore()
      }
    }
  }
  ctx.stroke()
}

const getStep = (scale: number) => {
  if (scale > 2) return 10
  if (scale > 1.5) return 20
  if (scale > 0.7) return 50
  if (scale > 0.4) return 100
  return 200
}

onMounted(() => {
  draw()
})

watch(() => [props.scale, props.start, props.width, props.height], () => {
  draw()
}, { deep: true })
</script>

<template>
  <canvas ref="canvasRef" :width="type === 'horizontal' ? width : thick" :height="type === 'vertical' ? height : thick"
    class="custom-ruler" />
</template>

<style scoped>
.custom-ruler {
  display: block;
}
</style>
