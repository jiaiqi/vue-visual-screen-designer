import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import '@/assets/main.css'
import { registerVueNodes, registerEdges } from '@/plugins/x6-nodes'

// 全局注册 X6 图元定义
registerVueNodes()
registerEdges()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
