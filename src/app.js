/**
 * 同构应用通用启动入口
 * 客户端应用程序中，在此文件中创建根 Vue 实例，并直接挂载到 DOM；对于服务器端渲染(SSR)，责任转移到纯客户端 entry 文件
 */
import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import { createStore } from './store'
import VueMeta from 'vue-meta'

Vue.use(VueMeta)
Vue.mixin({
  metaInfo: {
    titleTemplate: '%s - 拉勾教育',
  },
})
// 导出一个工厂函数，用于创建新的
// 应用程序、router 和 store 实例
export function createApp() {
  const router = createRouter()
  const store = createStore()
  const app = new Vue({
    router, // 把路由挂载到Vue根实例中
    store,
    // 根实例简单的渲染应用程序组件。
    render: (h) => h(App),
  })
  // 将来还要返回router、store等数据
  return { app, router, store }
}

/*
  如果,创建vue实例的代码不放在函数中,那么相当于所有用户所有请求都共享同一个vue实例,这样就可能造成状态的交叉污染
  创建vue实例代码放到函数中,调用函数创建独立的vue实例
  如:创建路由实例 创建容器实例都会使用这种方式避免状态污染问题
  const app = new Vue({
    // 根实例简单的渲染应用程序组件。
    render: h => h(App)
  })
  // 将来还要返回router、store等数据
  return { app }
 */
