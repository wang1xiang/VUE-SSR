const fs = require('fs')
const express = require('express')
const { createBundleRenderer } = require('vue-server-renderer')

const isProd = process.env.NODE_ENV === 'production'
let renderer

// 调用createRenderer生成一个渲染器
// const renderer = require('vue-server-renderer').createRenderer({
//   template: fs.readFileSync('./index.template.html', 'utf-8'),
// })

if (isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')

  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest,
  })
} else {
  // 开发模式 --> 监视打包构建 -->  -> 重新生成 Renderer 渲染器
}

// 得到express实例
const server = express()
// 挂载处理静态资源中间件 /dist应该和客户端打包的出口的publicPath保持一致 使用express.static处理静态资源
// 当请求到/dist开头的资源时，使用express.static尝试在./dist目录下查找并返回
server.use('/dist', express.static('./dist'))

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
    : (req, res, next) => {
        // 需等待renderer渲染器加载完成后，调用render进行渲染
        render()
      }
)

// 启动web服务
server.listen(3000, () => {
  console.log('server running at port 3000')
})
