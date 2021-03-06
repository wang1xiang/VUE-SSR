/**
 * 服务端启动入口
 */
import { createApp } from './app'

export default async (context) => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，就已经准备就绪。
  const { app, router, store } = createApp()

  const meta = app.$meta()
  context.meta = meta
  // 设置服务器端 router 的位置
  router.push(context.url)

  // 等到 router 将可能的异步组件和钩子函数解析完

  // new Promise((resolve, reject) => {
  //   router.onReady(resolve, reject)
  // })
  await new Promise(router.onReady.bind(router))

  // 服务端渲染完毕之后调用 可以拿到服务端渲染好的容器状态
  context.rendered = () => {
    context.state = store.state
  }
  return app
}

// export default context => {
//   // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
//   // 以便服务器能够等待所有的内容在渲染前，就已经准备就绪。
//   return new Promise((resolve, reject) => {
//     const { app, router } = createApp()

//     // 设置服务器端 router 的位置
//     // context.url客户端的请求路径客户端的请求路径
//     router.push(context.url)

//     // 等到 router 将可能的异步组件和钩子函数解析完
//     // 参数(解析成功函数,解析失败函数)
//     router.onReady(() => {
//       const matchedComponents = router.getMatchedComponents()
//       // 匹配不到的路由，执行 reject 函数，并返回 404
//       if (!matchedComponents.length) {
//         return reject({ code: 404 })
//       }

//       // Promise 应该 resolve 应用程序实例，以便它可以渲染
//       resolve(app)
//     }, reject)
//   })
// }
