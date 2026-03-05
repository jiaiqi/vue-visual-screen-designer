import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // v1 原版路由（保持兼容）
    {
      path: '/',
      name: 'editor',
      component: () => import('../views/EditorView.vue'),
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => import('../views/PreviewView.vue'),
    },
    // v2 新版路由
    {
      path: '/v2',
      name: 'editor-v2',
      component: () => import('../views/v2/EditorViewV2.vue'),
    },
    {
      path: '/v2/preview',
      name: 'preview-v2',
      component: () => import('../views/v2/PreviewViewV2.vue'),
    },
  ],
})

export default router
