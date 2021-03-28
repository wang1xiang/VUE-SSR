const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const webpack = require('webpack')
const hotMiddleware = require('webpack-hot-middleware')
const devMiddleware = require('webpack-dev-middleware')

const resolve = (file) => path.resolve(__dirname, file)

module.exports = (server, callback) => {
  // 拿到promise中的resolve
  let ready
  const onReady = new Promise((r) => (ready = r))

  // 构建资源
  let template
  let serverBundle
  let clientManifest

  // 调用callback更新renderer
  const update = () => {
    if (template && serverBundle && clientManifest) {
      // callback被调用的话 说明开发模式打包构建已经成功
      ready()
      // await onReady render()
      callback(serverBundle, template, clientManifest)
    }
  }
  // 监视构建 --> 更新Renderer
  // 监视构建template --> 调用update --> 更新renderer渲染器
  const templatePath = resolve('../index.template.html')
  template = fs.readFileSync(templatePath, 'utf-8')
  update()

  // console.log(template)
  // fs.watch() fs.watchFile()
  // chokidar
  chokidar.watch(templatePath).on('change', () => {
    update()
  })
  // 监视构建serverBundle --> 调用update --> 更新renderer渲染器
  const serverConfig = require('./webpack.server.config')
  // 通过webpack创建编译器
  const serverCompiler = webpack(serverConfig)
  const serverDevMiddleware = devMiddleware(serverCompiler, {
    logLevel: 'silent', // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
  })
  // 每当构建结束的时触发钩子
  serverCompiler.hooks.done.tap('server', () => {
    serverBundle = JSON.parse(
      serverDevMiddleware.fileSystem.readFileSync(
        resolve('../dist/vue-ssr-server-bundle.json'),
        'utf-8'
      )
    )
    // console.log(serverBundle)
    update()
  })

  // 监视资源变化
  // serverCompiler.watch({}, (err, stats) => {
  //   // webpack本身错误，例如配置文件错误
  //   if (err) throw err
  //   // 源代码是否有错
  //   if (stats.hasErrors()) return
  //   serverBundle = JSON.parse(
  //     fs.readFileSync(resolve('../dist/vue-ssr-client-manifest.json'), 'utf-8')
  //   )
  //   // console.log(serverBundle)
  //   update()
  // })
  // 监视构建clientManifest --> 调用update --> 更新renderer渲染器

  const clientConfig = require('./webpack.client.config')
  // 热更新配置
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  clientConfig.entry = [
    // 'webpack-hot-middleware/client',
    'webpack-hot-middleware/client?reload=true&noInfo=true',
    clientConfig.entry.app,
  ]
  clientConfig.output.filename = '[name].js' // 热更新模式下确保一致的hash

  // 通过webpack创建编译器
  const clientCompiler = webpack(clientConfig)
  const clientDevMiddleware = devMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    logLevel: 'silent', // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
  })
  // 每当构建结束的时触发钩子
  clientCompiler.hooks.done.tap('client', () => {
    clientManifest = JSON.parse(
      clientDevMiddleware.fileSystem.readFileSync(
        resolve('../dist/vue-ssr-client-manifest.json'),
        'utf-8'
      )
    )
    // console.log(clientManifest)
    update()
  })
  // 挂载热更新的中间件
  server.use(
    hotMiddleware(clientCompiler, {
      log: false, // 关闭本身的日志输出
    })
  )
  // 重要!!!将clientDevMiddle挂载到Express服务器中,读取对其内部数据的访问
  server.use(clientDevMiddleware)
  return onReady
}
