<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-vue-next'
import { getGuideSteps, type GuideStep } from '@/data/guideSteps'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'complete'): void
}>()

const steps = getGuideSteps()
const currentStepIndex = ref(0)
const targetRect = ref<DOMRect | null>(null)
const highlightStyle = ref<Record<string, string>>({})
const tooltipStyle = ref<Record<string, string>>({})

const currentStep = computed((): GuideStep => {
  const step = steps[currentStepIndex.value]
  if (!step) {
    return {
      id: 'fallback',
      target: '',
      title: '',
      description: '',
      position: 'center'
    }
  }
  return step
})
const isFirstStep = computed(() => currentStepIndex.value === 0)
const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)
const progress = computed(() => ((currentStepIndex.value + 1) / steps.length) * 100)

function close() {
  emit('update:modelValue', false)
}

function skip() {
  emit('complete')
  close()
}

function prev() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

function next() {
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++
  } else {
    emit('complete')
    close()
  }
}

function updatePosition() {
  const step = currentStep.value
  if (!step?.target) {
    targetRect.value = null
    highlightStyle.value = {}
    tooltipStyle.value = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
    return
  }

  const targetEl = document.querySelector(step.target)
  if (!targetEl) {
    targetRect.value = null
    highlightStyle.value = {}
    tooltipStyle.value = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
    return
  }

  const rect = targetEl.getBoundingClientRect()
  targetRect.value = rect

  highlightStyle.value = {
    top: `${rect.top - 4}px`,
    left: `${rect.left - 4}px`,
    width: `${rect.width + 8}px`,
    height: `${rect.height + 8}px`
  }

  const tooltipOffset = 16
  const tooltipWidth = 360
  const tooltipHeight = 180

  switch (step.position) {
    case 'top':
      tooltipStyle.value = {
        top: `${rect.top - tooltipHeight - tooltipOffset}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)'
      }
      break
    case 'bottom':
      tooltipStyle.value = {
        top: `${rect.bottom + tooltipOffset}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)'
      }
      break
    case 'left':
      tooltipStyle.value = {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.left - tooltipWidth - tooltipOffset}px`,
        transform: 'translateY(-50%)'
      }
      break
    case 'right':
      tooltipStyle.value = {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right + tooltipOffset}px`,
        transform: 'translateY(-50%)'
      }
      break
    default:
      tooltipStyle.value = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.modelValue) return

  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowRight':
    case 'Enter':
      next()
      break
    case 'ArrowLeft':
      prev()
      break
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    currentStepIndex.value = 0
    nextTick(updatePosition)
  }
})

watch(currentStepIndex, () => {
  nextTick(updatePosition)
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', updatePosition)
  if (props.modelValue) {
    nextTick(updatePosition)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', updatePosition)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="guide-fade">
      <div v-if="modelValue" class="guide-tour-overlay fixed inset-0 z-[99999]">
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

        <div
          v-if="targetRect"
          class="guide-highlight absolute rounded-lg pointer-events-none transition-all duration-300 ease-out"
          :style="{
            ...highlightStyle,
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.85)',
            border: '2px solid rgba(56, 189, 248, 0.6)'
          }"
        ></div>

        <Transition name="tooltip-slide" mode="out-in">
          <div
            :key="currentStep.id"
            class="guide-tooltip absolute w-[360px] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300"
            :style="tooltipStyle"
          >
            <div class="relative">
              <div class="absolute top-0 left-0 right-0 h-1 bg-slate-800">
                <div
                  class="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
                  :style="{ width: `${progress}%` }"
                ></div>
              </div>

              <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center">
                    <HelpCircle class="w-4 h-4 text-sky-400" />
                  </div>
                  <h3 class="text-base font-bold text-slate-100">{{ currentStep.title }}</h3>
                </div>
                <button
                  @click="close"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <div class="px-5 py-4">
                <p class="text-sm text-slate-300 leading-relaxed">{{ currentStep.description }}</p>

                <div v-if="currentStep.shortcut" class="mt-3 flex items-center gap-2">
                  <span class="text-xs text-slate-500">快捷键:</span>
                  <kbd class="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded text-slate-300 font-mono text-xs">
                    {{ currentStep.shortcut }}
                  </kbd>
                </div>
              </div>

              <div class="flex items-center justify-between px-5 py-3 bg-slate-950/50 border-t border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500">
                    {{ currentStepIndex + 1 }} / {{ steps.length }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    v-if="!isFirstStep"
                    @click="prev"
                    class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft class="w-4 h-4" />
                    上一步
                  </button>

                  <button
                    @click="skip"
                    class="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    跳过引导
                  </button>

                  <button
                    @click="next"
                    class="flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-lg bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors"
                  >
                    {{ isLastStep ? '完成' : '下一步' }}
                    <ChevronRight v-if="!isLastStep" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            v-for="(step, index) in steps"
            :key="step.id"
            @click="currentStepIndex = index"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="[
              index === currentStepIndex
                ? 'bg-sky-400 w-6'
                : index < currentStepIndex
                  ? 'bg-slate-500 hover:bg-slate-400'
                  : 'bg-slate-700 hover:bg-slate-600'
            ]"
          ></button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.guide-fade-enter-active,
.guide-fade-leave-active {
  transition: opacity 0.3s ease;
}

.guide-fade-enter-from,
.guide-fade-leave-to {
  opacity: 0;
}

.tooltip-slide-enter-active,
.tooltip-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.tooltip-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
