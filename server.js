const fs = require('fs')
const express = require('express')
const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')

const isProd = process.env.NODE_ENV === 'production'
let renderer
let onReady // Promise

// 调用createRenderer生成一个渲染器
// const renderer = require('vue-server-renderer').createRenderer({
//   template: fs.readFileSync('./index.template.html', 'utf-8'),
// })

// 得到express实例
const server = express()
// 挂载处理静态资源中间件 /dist应该和客户端打包的出口的publicPath保持一致 使用express.static处理静态资源
// 当请求到/dist开头的资源时，使用express.static尝试在./dist目录下查找并返回
server.use('/dist', express.static('./dist'))

if (isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')

  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest,
  })
} else {
  // 开发模式 --> 监视打包构建 --> 重新生成 Renderer 渲染器
  /**
   * 设置开发模式下的服务
   * server开发模式下需要给web服务挂载一些中间件
   * 回调函数：每当监视打包构建完成后执行
   */
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    // 重新生成 Renderer 渲染器
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest,
    })
  })
}

const render = (req, res) => {
  renderer.renderToString(
    {
      title: '拉钩教育',
      meta: `
    <meta name="description" content="拉钩">
  `,
    },
    (err, html) => {
      if (err) {
        return res.status(500).end('Internal Srever ERROR')
      }
      res.end(html)
    }
  )
}

// 此时不用在手动创建vue实例，因为在entry-server中已经创建 renderer会自动找到entry-server得到里面的vue实例
// 去掉renderToString的第一个参数vue实例
server.get(
  '/',
  isProd
    ? render // 生产模式：使用构建好的包直接渲染
    : async (req, res) => {
        // 需等待renderer渲染器加载完成后，调用render进行渲染
        await onReady
        render(req, res)
      }
)

// 启动web服务
server.listen(3000, () => {
  console.log('server running at port 3000')
})
