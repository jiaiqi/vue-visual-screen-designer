import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      redirect: '/apps',
    },
    {
      path: '/apps',
      name: 'apps',
      component: () => import('../views/AppManagerView.vue'),
    },
    {
      path: '/app/:appId/page/:pageId/editor',
      name: 'editor',
      component: () => import('../views/EditorView.vue'),
    },
    {
      path: '/app/:appId/page/:pageId/preview',
      name: 'preview',
      component: () => import('../views/PreviewView.vue'),
    },
    {
      path: '/preview',
      redirect: '/apps',
    },
  ],
})

export default router
