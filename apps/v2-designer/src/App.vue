<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useThemeStoreV2 } from '@/stores/v2/themeStoreV2'

const themeStore = useThemeStoreV2()

onMounted(() => {
  void themeStore.init()
})
</script>

<template>
  <RouterView />
</template>

<style>
#app {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
