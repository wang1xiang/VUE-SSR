import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/pages/Home'

Vue.use(VueRouter)

// 避免状态污染
export const createRouter = () => {
  const router = new VueRouter({
    mode: 'history', // 兼容前后端
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home,
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('@/pages/About'),
      },
      {
        path: '*',
        name: '404',
        component: () => import('@/pages/404'),
      },
    ],
  })
  return router
}
