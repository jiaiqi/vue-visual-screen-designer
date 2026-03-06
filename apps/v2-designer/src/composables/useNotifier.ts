import { computed, ref } from 'vue'

export type NotifyType = 'info' | 'success' | 'warning' | 'error'

export interface NotifyItem {
  id: number
  type: NotifyType
  title: string
  message: string
}

const notices = ref<NotifyItem[]>([])
let noticeSeed = 0

function pushNotice(type: NotifyType, title: string, message: string, timeout: number = 4200) {
  const id = ++noticeSeed
  notices.value.push({ id, type, title, message })

  if (notices.value.length > 4) {
    notices.value.splice(0, notices.value.length - 4)
  }

  window.setTimeout(() => {
    notices.value = notices.value.filter((item) => item.id !== id)
  }, timeout)
}

export function useNotifier() {
  const hasNotices = computed(() => notices.value.length > 0)

  function info(title: string, message: string) {
    pushNotice('info', title, message)
  }

  function success(title: string, message: string) {
    pushNotice('success', title, message)
  }

  function warning(title: string, message: string) {
    pushNotice('warning', title, message)
  }

  function error(title: string, message: string) {
    pushNotice('error', title, message, 5200)
  }

  function remove(id: number) {
    notices.value = notices.value.filter((item) => item.id !== id)
  }

  return {
    notices,
    hasNotices,
    info,
    success,
    warning,
    error,
    remove,
  }
}
