import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      deep: true,
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [
        Icons({
          compiler: 'vue3',
          autoInstall: true,
        }),
      ],
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
      customCollections: {
        custom: FileSystemIconLoader('src/assets/icons'),
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/vue/') || id.includes('/vue-router/') || id.includes('/pinia/')) return 'vue-vendor'
          if (id.includes('/@antv/x6/') || id.includes('/@antv/x6-vue-shape/')) return 'antv'
          if (id.includes('/naive-ui/') || id.includes('/vueuc/')) return 'naive-ui'
          if (id.includes('/echarts/')) return 'charts'
          if (id.includes('/fabric/')) return 'fabric'
          return undefined
        },
      },
    },
  },
})
