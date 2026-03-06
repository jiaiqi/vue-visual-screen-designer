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
  border: 1px solid color-mix(in oklab, var(--color-border-secondary) 60%, transparent);
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--color-bg-secondary) 94%, transparent),
    color-mix(in oklab, var(--color-bg-primary) 92%, transparent)
  );
  box-shadow: var(--ui-shadow);
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
  color: var(--color-text-secondary);
}

.is-info .global-toast-title {
  color: var(--ui-info);
}

.is-success .global-toast-title {
  color: var(--ui-success);
}

.is-warning .global-toast-title {
  color: var(--ui-warning);
}

.is-error {
  border-color: var(--ui-danger-border);
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--ui-danger-bg) 78%, var(--color-bg-secondary)),
    color-mix(in oklab, var(--ui-danger-bg) 62%, var(--color-bg-secondary))
  );
}

.is-error .global-toast-title {
  color: var(--ui-danger-text);
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
