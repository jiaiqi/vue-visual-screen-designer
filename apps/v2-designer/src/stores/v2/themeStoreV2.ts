import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getItem, setItem } from '@/utils/storage'

export type ThemeModeV2 = 'dark' | 'light'

const MODE_KEY = 'v2_theme_mode'
const COLOR_KEY = 'v2_theme_color'

function normalizeColor(input: string): string {
  const value = String(input || '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(value))
    return value
  return '#0ea5e9'
}

export const useThemeStoreV2 = defineStore('themeV2', () => {
  const initialized = ref(false)
  const mode = ref<ThemeModeV2>('dark')
  const primaryColor = ref('#0ea5e9')

  function applyToDom() {
    const root = document.documentElement
    root.setAttribute('data-theme', mode.value)
    root.style.setProperty('--theme-primary', primaryColor.value)
  }

  async function init() {
    if (initialized.value) {
      applyToDom()
      return
    }
    const savedMode = await getItem<ThemeModeV2>(MODE_KEY, 'theme')
    const savedColor = await getItem<string>(COLOR_KEY, 'theme')
    if (savedMode === 'dark' || savedMode === 'light')
      mode.value = savedMode
    if (savedColor)
      primaryColor.value = normalizeColor(savedColor)
    applyToDom()
    initialized.value = true
  }

  async function setMode(next: ThemeModeV2) {
    mode.value = next
    applyToDom()
    await setItem(MODE_KEY, next, 'theme')
  }

  async function toggleMode() {
    await setMode(mode.value === 'dark' ? 'light' : 'dark')
  }

  async function setPrimaryColor(next: string) {
    primaryColor.value = normalizeColor(next)
    applyToDom()
    await setItem(COLOR_KEY, primaryColor.value, 'theme')
  }

  return {
    initialized,
    mode,
    primaryColor,
    init,
    setMode,
    toggleMode,
    setPrimaryColor,
    applyToDom,
  }
})
