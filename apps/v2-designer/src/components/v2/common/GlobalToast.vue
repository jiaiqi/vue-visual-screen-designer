<script setup lang="ts">
import { useNotifier } from '@/composables/useNotifier'

const notifier = useNotifier()
const notices = notifier.notices

const typeClassMap: Record<string, string> = {
  info: 'is-info',
  success: 'is-success',
  warning: 'is-warning',
  error: 'is-error',
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="global-toast" tag="div" class="global-toast-stack">
      <div
        v-for="notice in notices"
        :key="notice.id"
        class="global-toast-item"
        :class="typeClassMap[notice.type]"
      >
        <div class="global-toast-title">{{ notice.title }}</div>
        <div class="global-toast-message">{{ notice.message }}</div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.global-toast-stack {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 2400;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.global-toast-item {
  width: 340px;
  max-width: calc(100vw - 28px);
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.93), rgba(8, 15, 30, 0.93));
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
}

.global-toast-title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
}

.global-toast-message {
  font-size: 12px;
  line-height: 1.45;
  color: #cbd5e1;
}

.is-info .global-toast-title {
  color: #7dd3fc;
}

.is-success .global-toast-title {
  color: #86efac;
}

.is-warning .global-toast-title {
  color: #fcd34d;
}

.is-error {
  border-color: rgba(251, 113, 133, 0.4);
  background: linear-gradient(135deg, rgba(60, 12, 24, 0.92), rgba(30, 10, 20, 0.92));
}

.is-error .global-toast-title {
  color: #fecdd3;
}

.global-toast-enter-active,
.global-toast-leave-active {
  transition: all 0.22s ease;
}

.global-toast-enter-from,
.global-toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
