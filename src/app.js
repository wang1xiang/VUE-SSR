/**
 * 同构应用通用启动入口
 * 客户端应用程序中，在此文件中创建根 Vue 实例，并直接挂载到 DOM；对于服务器端渲染(SSR)，责任转移到纯客户端 entry 文件
 */
 import Vue from 'vue'
 import App from './App.vue'
 
 // 导出一个工厂函数，用于创建新的
 // 应用程序、router 和 store 实例
 export function createApp () {
   const app = new Vue({
     // 根实例简单的渲染应用程序组件。
     render: h => h(App)
   })
   // 将来还要返回router、store等数据
   return { app }
 }