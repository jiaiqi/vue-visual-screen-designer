import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/preview'),
  routes: [
    {
      path: '/',
      name: 'preview',
      component: () => import('../views/PreviewView.vue'),
    },
  ],
})

export default router
