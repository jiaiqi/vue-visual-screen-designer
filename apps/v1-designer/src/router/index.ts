import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/v1'),
  routes: [
    // v1 原版路由
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
  ],
})

export default router
