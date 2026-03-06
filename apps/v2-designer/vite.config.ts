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
    proxy: {
      '/preview': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'antv': ['@antv/x6', '@antv/x6-vue-shape'],
          'naive-ui': ['naive-ui', 'vueuc'],
          'charts': ['echarts'],
          'fabric': ['fabric'],
        },
      },
    },
  },
})
