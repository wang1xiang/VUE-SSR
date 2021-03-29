##### Vue SSR 介绍

- 官方文档：https://ssr.vuejs.org/
- Vue SSR（Vue.js Server-Side Rendering） 是 Vue.js 官方提供的一个服务端渲染（同构应用）解 决方案
- 使用它可以构建同构应用
- 还是基于原有的 Vue.js 技术栈

##### 使用场景

在对你的应用程序使用服务器端渲染 (SSR) 之前，你应该问的第一个问题是，是否真的需要它。

- 技术层面： 更快的首屏渲染速度，更好的 SEO
- 业务层面： 不适合管理系统，适合门户资讯类网站，例如企业官网、知乎、简书等 适合移动网站

##### 如何使用 Vue SSR

1. 基于[ Vue SSR 官方文档](https://ssr.vuejs.org/zh/guide/structure.html#%E4%BD%BF%E7%94%A8-webpack-%E7%9A%84%E6%BA%90%E7%A0%81%E7%BB%93%E6%9E%84)提供的解决方案

   官方方案具有更直接的控制应用程序的结构，更深入底层，更加灵活，同时在使用官方方案的过程中， 也会对 Vue SSR 有更加深入的了解。

   该方式需要你熟悉 Vue.js 本身，并且具有 Node.js 和 webpack 的相当不错的应用经验。

2. [Nuxt.js](https://www.nuxtjs.cn/guide) 开发框架

   NUXT 提供了平滑的开箱即用的体验，它建立在同等的 Vue 技术栈之上，但抽象出很多模板，并提供了 一些额外的功能，例如静态站点生成。通过 Nuxt.js 可以快速的使用 Vue SSR 构建同构应用。

##### Vue SSR 基本使用（使用 Vue SSR 渲染一个 Vue 实例）

1. 在 nodeJs 中使用 VueSSR，将一个 Vue 实例渲染为 HTML 字符串

   - 初始化项目，安装 vue 和 vue-server-renderer
   - 创建 server.js，引入 Vue 并创建 Vue 实例
   - 引入 vue-server-renderer 并调用 createRenderer 生成一个渲染器来渲染 Vue 实例

   ```js
   const Vue = require('vue')
   // 调用createRenderer生成一个渲染器
   const renderer = require('vue-server-renderer').createRenderer()

   const app = new Vue({
     template: `
       <div id="app">
         <h1>{{ message }}</h1>
       </div>
     `,
     data: {
       message: '拉钩',
     },
   })
   /**
    * app Vue实例
    * err 错误
    * html 返回的html字符串
    */
   renderer.renderToString(app, (err, html) => {
     if (err) throw err
     console.log(html)
   })
   // 在 2.5.0+，如果没有传入回调函数，则会返回 Promise：
   renderer
     .renderToString(app)
     .then((html) => {
       console.log(html)
     })
     .catch((err) => {
       console.error(err)
     })
   ```

   在控制台会输出下列信息：`data-server-rendered="true"`是将来用于客户端渲染激活接管的入口

   ![image-20210325080026326](C:\Users\xiang wang\Desktop\image-20210325080026326.png)

2. 与服务端集成，如何把渲染得到的结果发送给用户端浏览器

   安装`express npm i express --save

   ```js
   const Vue = require('vue')
   const renderer = require('vue-server-renderer').createRenderer()
   const express = require('express')
   // 得到express实例
   const server = express()

   server.get('/', (req, res) => {
     const app = new Vue({
       template: `
         <div id="app">
           <h1>{{ message }}</h1>
         </div>
       `,
       data: {
         message: '拉钩',
       },
     })
     renderer.renderToString(app, (err, html) => {
       if (err) {
         return res.status(500).end('Internal Srever ERROR')
       }
       // 解决乱码问题1
       // res.setHeader('Content-Type', 'text/html;charset=utf-8')
       // 解决乱码问题2
       res.end(`
         <!DOCTYPE html>
         <html lang="en">
         <head>
           <meta charset="UTF-8">
           <meta http-equiv="X-UA-Compatible" content="IE=edge">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Document</title>
         </head>
         <body>
           ${html}
         </body>
         </html>
       `)
     })
   })

   // 启动web服务
   server.listen(3000, () => {
     console.log('server running at port 3000')
   })
   ```

   此时，打开浏览器控制台，可以看到返回 html 片段信息：

   ![image-20210325080651945](C:\Users\xiang wang\Desktop\image-20210325080651945.png)

3. HTML 模板内容单独维护

   在根目录下生成生成`index.template.html`文件

   复制模板到这里，删除`${html}`标签，添加 `<!--vue-ssr-outlet-->`，使用 renderer 渲染页面时会把它当作模板来使用，会由具体渲染内容替换

   ```html
   <!--index.tenplate.html-->
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta http-equiv="X-UA-Compatible" content="IE=edge" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Document</title>
     </head>
     <body>
       <!--vue-ssr-outlet-->
     </body>
   </html>
   ```

   createRenderer 中可以添加参数 template 模板

   ```js
   // server.js
   ...
   const renderer = require('vue-server-renderer').createRenderer({
     template: fs.readFileSync('./index.template.html', 'utf-8')
   })
   ...
   res.end(html)
   ...
   ```

   当设置模板后 renderer.renderToString 会把渲染后的结果解析替换到模板中。作为完整结果返回，此时页面内容正常

4. 页面模板使用外部数据

   修改模板内容后，需重启服务端，对标签进行渲染，使用`{{{ meta }}}`进行绑定，vue 就不会进行处理，原文输出

   ```html
   ... {{{ meta }}}
   <title>{{ title }}</title>
   ...
   ```

   ```js
   renderer.renderToString(app, {
       title: '拉钩教育',
       meta: `
             <meta name="description" content="拉钩">
           `
         }, (err, html) => {
       ...
   	}
   })
   ```

   此时可以看到浏览器中返回的 html 片段如下：

   ![image-20210325082514556](C:\Users\xiang wang\Desktop\image-20210325082514556.png)

##### 构建同构渲染

###### 构建流程

- 客户端动态交互功能

  服务端渲染只是把 vue 实例处理为纯静态的 html 片段返回给客户端，对于 vue 实例当中需要客户端动态交互的功能本身没有提供

  ```js
  ...
  const app = new Vue({
      template: `
        <div id="app">
          <h1>{{ message }}</h1>
          <h2>客户端动态交互</h2>
          <div>
            <input v-model="message">
          </div>
          <div>
            <button @click="onClick">点击测试</button>
          </div>
        </div>
      `,
      data: {
        message: '拉钩'
      },
      methods: {
        onClick () {
          console.log('hello world')
        }
      }
  })
  ...
  ```

  返回到客户端的页面是没有交互功能的

  ![image-20210325083058071](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210325083058071.png)

- 基本思路

  ![image-20210325083156083](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210325083156083.png)

  源代码 --> webpack 打包 --> Node Server 服务

  此时，我们应用中只有 Server entry 服务端入口，只能处理服务端渲染，想要实现服务端渲染内容拥有动态交互能力，还需要 Client entry 客户端入口，用于处理客户端渲染，接管服务端渲染内容，激活成一个动态页面

  Server entry 通过 webpack 最终打包成 Server Buner，主要用于做服务端渲染(SSR)

  Client entry 通过 webpack 最终打包成 Client Buner，发送给浏览器，用于接管服务端渲染好的静态页面，对他进行激活成一个动态的客户端应用

###### 源码结构

根据这幅图实现同构应用，既要实现服务端渲染，也要实现客户端渲染能够处理客户端动态交互

一个基本项目可能像是这样：

```bash
src
├── components
│   ├── Foo.vue
│   ├── Bar.vue
│   └── Baz.vue
├── App.vue
├── app.js # 通用 entry(universal entry)
├── entry-client.js # 仅运行于浏览器
└── entry-server.js # 仅运行于服务器
```

1. 使用[ webpack 的源码结构](https://ssr.vuejs.org/zh/guide/structure.html#%E4%BD%BF%E7%94%A8-webpack-%E7%9A%84%E6%BA%90%E7%A0%81%E7%BB%93%E6%9E%84)重新设置代码结构

   创建 src 目录，添加 App.vue 和 app.js、entry-client.js、entry-server.js，具体请查看 webpack 的源码结构

2. 通过 webpack 打包构建，真正完成同构应用

   安装依赖

   ```bash
   npm i vue vue-server-renderer express cross-env
   ```

   安装开发依赖

   ```bash
   npm i -D webpack webpack-cli webpack-merge webpack-node-externals @babel/core @babel/plugin-transform-runtime @babel/preset-env babel-loader css-loader url-loader file-loader rimraf vue-loader vue-template-compiler friendly-errors-webpack-plugin
   ```

   配置文件及打包命令

   - 初始化 webpack 打包配置文件，具体见[github](https://github.com/wang1xiang/VUE-SSR/tree/master/build)

     ```bash
     build
     ├── webpack.base.config.js # 公共配置
     ├── webpack.client.config.js # 客户端打包配置文件
     └── webpack.server.config.js # 服务端打包配置文件
     ```

   - 在 npm scripts 中配置打包命令

     ```bash
     "scripts": {
     "build:client": "cross-env NODE_ENV=production webpack --config build/webpack.client.config.js",
     "build:server": "cross-env NODE_ENV=production webpack --config build/webpack.server.config.js",
     "build": "rimraf dist && npm run build:client && npm run build:server"
     },
     ```

###### 启动服务

1. 通过`yarn build`打包生成客户端和服务端文件

2. 具体实现参考[Bundle Renderer 指引](https://ssr.vuejs.org/zh/guide/bundle-renderer.html#%E4%BD%BF%E7%94%A8%E5%9F%BA%E6%9C%AC-ssr-%E7%9A%84%E9%97%AE%E9%A2%98)

3. 替换 server.js 中 createRender 为 createBundleRenderer，接收 serverBundle、template 和 clientManifest 为参数，启动服务

   ```js
   ...
   const serverBundle = require('./dist/vue-ssr-server-bundle.json')
   const template = fs.readFileSync('./index.template.html', 'utf-8')
   const clientManifest = require('./dist/vue-ssr-client-manifest.json')

   renderer = require('vue-server-renderer').createBundleRenderer(serverBundle, {
       template,
       clientManifest,
   })
   ...
   ```

   此时在浏览器端获取不到 dist 下的 js 文件，是因为没有在服务器当中有 dist 中的资源传递给客户端，挂载中间件 server.use('/dist')

   ![image-20210326082507311](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210326082507311.png)

4. 挂载处理静态资源中间件

   ```js
   const express = require('express')
   // 得到express实例
   const server = express()
   // 挂载处理静态资源中间件
   //dist应该和客户端打包的出口的publicPath保持一致 使用express.static处理静态资源
   // 当请求到/dist开头的资源时，使用express.static尝试在./dist目录下查找并返回
   server.use('/dist', express.static('./dist'))
   ```

   此时重新刷新浏览器，js 文件正常加载，客户端交互功能正常

###### 解析渲染流程

服务端渲染如何输出

- 从路由着手，当客户端请求后匹配路由，调用 renderer 渲染器的 renderer.renderToString 方法

- renderToString 将 vue 实例渲染为字符串发送给客户端，但是 renderToString 中并没有 vue 实例，vue 实例是从哪来的呢？

- renderer 是通过 createBundleRenderer 创建，传入的 serverBundle 对应`vue-ssr-server-bundle.json`文件，是通过 server.entry.js 构建出来的结果文件

  ```json
  {
    "entry": "server-bundle.js", // 入口
    "files": {...}, // 所有构建结果资源列表
    "maps": {...} //源代码 source map 信息
  }
  ```

- renderer 在渲染时会加载 serverBundle 的入口，得到 entrry-server.js 中创建的 vue 实例

- 对此 vue 实例进行渲染，并将渲染的结果注入到 template 模板当中，最终将 template 模板发送到客户端

客户端渲染如何接管并激活

- 客户端需要将打包的 js 脚本注入到页面当中，是怎么做的呢？

- 在 createBundleRenderer 中，配置的 clientManifest，对应 `vue-ssr-client-mainfest.json` 文件，是客户端打包资源的构建清单

  ```json
  {
    "publicPath": "/dist/",
    "all": ["app.5c8c7bcfd286b41168f3.js", "app.5c8c7bcfd286b41168f3.js.map"],
    "initial": ["app.5c8c7bcfd286b41168f3.js"],
    "async": [],
    "modules": {}
  }
  /*
  publicPath：访问静态资源的根相对路径，与 webpack 配置中的 publicPath 一致
  all：打包后的所有静态资源文件路径
  initial：页面初始化时需要加载的文件，会在页面加载时配置到 preload 中
  async：页面跳转时需要加载的文件，会在页面加载时配置到 prefetch 中
  modules：项目的各个模块包含的文件的序号，对应 all 中文件的顺序；moduleIdentifier和
  和all数组中文件的映射关系（modules对象是我们查找文件引用的重要数据），实际作用是当客户端在实际运行的时候，加载的模块用到哪些资源，vue 会根据此信息去加载那些资源
  */
  ```

- 当客户端加载完成后，客户端的 js 是如何工作的呢？

  详细请查看[客户端激活](https://ssr.vuejs.org/zh/guide/hydration.html)

##### 构建配置开发模式

###### 基本思路

此时，以实现同构应用基本功能，但对一个完整的应用来说远远不够，例如如何处理同构渲染中的路由、如何在服务端渲染中进行数据预取等操作，在实现这些功能之前先实现打包的功能。

当前方式，每当修改代码之后，都需要重新 build 构建，构建完之后需要通过 server 重新启动服务，在开发过程中是很麻烦的；需要以下功能

- 自动构建
- 自动重启 web 服务功能
- 自动刷新浏览器页面内容等功能
- ...

在开发模式和生成模式下不同的思路：

- 生产模式

  - npm run build 构建
  - node server.js 启动应用

- 开发模式

  开发模式根据源代码的改变，不断重新生成 serverBundle、template、clientManifest 等打包的资源文件，资源文件一旦改变，自动调用 createBundleRenderer 生成新的 renderer 重新渲染

  - 监视代码变化自动构建、热更新等功能
  - node server.js 启动应用

在 scripts 中新加 start 和 dev

```json
"scripts": {
    ...
    // 启动开发服务
    "start": "cross-env NODE_ENV=production node server.js",
    // 启动生产服务
    "dev": "node server.js"
},
```

修改 server.js，根据`NODE_ENV`判断环境

```js
const fs = require('fs')
const express = require('express')
const { createBundleRenderer } = require('vue-server-renderer')

const isProd = process.env.NODE_ENV === 'production'
let renderer

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
```

###### 提取处理模块

编写`开发模式 --> 监视打包构建 --> -> 重新生成 Renderer 渲染器`代码

在开发模式下通过 serupDevServer 重新生成 renderer 渲染器

```js
...
const setupDevServer = require('./build/setup-dev-server')
...
let onReady // Promise
...
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
server.get(
  '/',
  isProd
    ? render // 生产模式：使用构建好的包直接渲染
    : async (req, res) => {
        // 需等待renderer渲染器加载完成后，调用render进行渲染
        await onReady
        render()
      }
)

...
```

```js
// /build/setup-dev-server.js
module.exports = (server, callback) => {
  const onReady = new Promise().

  // 监视构建 --> 更新Renderer
  return onReady
}
```

###### update 更新函数

setupDevServer 中定义 update 函数用于更新 renderer 渲染器

```js
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
  return onReady
}
/**
 * update调用时机
 * 监视构建template --> 调用update --> 更新renderer渲染器
 * 监视构建serverBundle --> 调用update --> 更新renderer渲染器
 * 监视构建clientManifest --> 调用update --> 更新renderer渲染器
 */
```

- 处理模板文件

  1. 初始时，通过 fs 读取模板文件

     ```js
     ...
     const templatePath = path.resolve(__dirname, '../index.template.html')
     template = fs.readFileSync(templatePath, 'utf-8')
     console.log(template)
     ```

     ![image-20210327181355222](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210327181355222.png)

  2. 监视文件变化

     使用[chokidar](https://github.com/paulmillr/chokidar)监视 templatePath 变化，并重新构建

     ```js
     const chokidar = require('chokidar')
     ...
     chokidar.watch(templatePath).on('change', () => {
         update()
     })
     ...
     ```

- 服务端监视打包

  ```js
  const serverConfig = require('./webpack.server.config')
  // 通过webpack创建编译器
  const serverCompiler = webpack(serverConfig)
  // 监视资源变化
  serverCompiler.watch({}, (err, stats) => {
    // webpack本身错误，例如配置文件错误
    if (err) throw err
    // 源代码是否有错
    if (stats.hasErrors()) return
    serverBundle = JSON.parse(
      fs.readFileSync(resolve('../dist/vue-ssr-client-manifest.json'), 'utf-8')
    )
    // console.log(serverBundle)
    update()
  })
  ```

- 将数据写入内存中

  webpack 默认会把构建结果存储到磁盘中，对于生产模式构建来说是没有问题的；但是我们在开发模式中会频繁的修改代码触发构建，也就意味着要频繁的操作磁盘数据，而磁盘数据操作相对于来说是比较慢的，所以我们有一种更好的方式，在开发模式下把数据存储到内存中，这样可以极大的提高构建的速度。

  [memfs ](https://github.com/streamich/memfs)是一个兼容 Node 中 fs 模块 API 的内存文件系统，通过它我们可以轻松的实现把 webpack 构 建结果输出到内存中进行管理。

  - 自己配置 memfs，比较麻烦

  - 使用 [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware)

    webpack-dev-middleware 作用是，以监听模式启动 webpack，将编译结果输出到内存中，然后将内存文件输出到 Express 服务中。

    ```js
    ...
    const devMiddleware = require('webpack-dev-middleware')
    ...
    const serverDevMiddleware = devMiddleware(serverCompiler, {
        logLevel: 'silent', // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
    })
    // 每当构建结束的时触发钩子
    serverCompiler.hooks.done.tap('server', () => {
        serverBundle = JSON.parse(
            // 从内存中读取文件
            serverDevMiddleware.fileSystem.readFileSync(
                resolve('../dist/vue-ssr-server-bundle.json'),
                'utf-8'
            )
        )
        console.log(serverBundle)
        update()
    })
    ...
    ```

    通过打印可以看到控制台已输出从内存中读取到的文件

    ![image-20210328110202127](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210328110202127.png)

- 客户端构建

  客户端打包构建和服务端相同，特别之处在于

  - devMiddleware中需要添加publicPath输出资源的访问路径前缀，应该和客户端打包输出的 publicPath 一致
- 需要将clientDevMiddle挂载到Express服务器中,读取对其内部数据的访问
  
```js
  const clientConfig = require('./webpack.client.config')
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
      console.log(clientManifest)
      update()
    })
  
    // 重要!!!将clientDevMiddle挂载到Express服务器中,读取对其内部数据的访问
    server.use(clientDevMiddleware)
```

- 热更新

  通过以上配置，已经实现了客户端和服务端的自动打包构建，但是需要手动刷新浏览器才行，通过使用 [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) 工具开启热更新功能。

  ```js
...
  const hotMiddleware = require('webpack-hot-middleware')
...
  const clientConfig = require('./webpack.client.config')
  // 热更新配置
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
clientConfig.entry = [
      // 'webpack-hot-middleware/client',
      'webpack-hot-middleware/client?reload=true&noInfo=true',
      clientConfig.entry.app,
  ]
  clientConfig.output.filename = '[name].js' // 热更新模式下确保一致的hash
  ...
  // 挂载热更新的中间件
  server.use(
      hotMiddleware(clientCompiler, {
          log: false, // 关闭本身的日志输出
      })
  )
  ```
  
  如果不设置clientConfig.output.filename = '[name].js'，会报错
  
  ![image-20210328112431941](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210328112431941.png)
  
  配置完成后，打开浏览器刷新页面，可以看到_webpack_hmr文件，和服务端交互的用于热更新的客户端的一个库
  
  ![image-20210328112540704](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210328112540704.png)
  
  通过修改代码文件，可以看到浏览器自动刷新，并输出一下日志，使用`webpack-hot-middleware/client?reload=true&noInfo=true`可去除日志输出
  
  ![image-20210328112806448](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210328112806448.png)
  
  热更新工作原理：
  
  - 中间件将自身安装为 webpack 插件，并侦听编译器事件。
  
  - 每个连接的客户端都有一个 Server Sent Events 连接，服务器将在编译器事件上向连接的客户端发布通知。
  
    [MDN - 使用服务器发送事件](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events/Using_server-sent_events)
  
    [Server-Sent Events 教程](http://www.ruanyifeng.com/blog/2017/05/server-sent_events.html)
  
  - 当客户端收到消息时，它将检查本地代码是否为最新。如果不是最新版本，它将触发 webpack 热 模块重新加载。

##### 编写通用代码

参考[编写通用代码](https://ssr.vuejs.org/zh/guide/universal.html#%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%B8%8A%E7%9A%84%E6%95%B0%E6%8D%AE%E5%93%8D%E5%BA%94)

避免交叉请求造成的状态污染

如果，创建vue实例的代码不放在函数中，那么相当于所有用户所有请求都共享同一个vue实例，这样就可能造成状态的交叉污染，所以创建vue实例代码放到函数中，调用函数创建独立的vue实例
如：创建路由实例 创建容器实例都会使用这种方式避免状态污染问题

```js
const app = new Vue({
    // 根实例简单的渲染应用程序组件。
    render: h => h(App)
})
// 将来还要返回router、store等数据
return { app }
```

##### 配置VueRouter

参考[路由和代码分割](https://ssr.vuejs.org/zh/guide/routing.html)

添加pages文件夹，创建Home.vue、About.vue、404.vue

创建router/index.js文件

```js
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
        component: () => import('@/pages/about'),
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
```

app.js中修改

```js
...
import { createRouter } from './router'

export function createApp() {
  const router = createRouter()
  const app = new Vue({
    router, // 把路由挂载到Vue根实例中
    render: (h) => h(App),
  })
  return { app, router }
}
```

entry-server.js中将vue-router适配到服务端渲染当中

```js
export default context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，就已经准备就绪。
  return new Promise((resolve, reject) => {
    const { app, router } = createApp()

    // 设置服务器端 router 的位置
    // context.url客户端的请求路径客户端的请求路径
    router.push(context.url)

    // 等到 router 将可能的异步组件和钩子函数解析完
    // 参数(解析成功函数,解析失败函数)
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // 匹配不到的路由，执行 reject 函数，并返回 404
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }

      // Promise 应该 resolve 应用程序实例，以便它可以渲染
      resolve(app)
    }, reject)
  })
}
```

可以将以上方法使用async...await进行改造

```js
export default async (context) => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，就已经准备就绪。
  const { app, router } = createApp()

  // 设置服务器端 router 的位置
  router.push(context.url)

  // 等到 router 将可能的异步组件和钩子函数解析完
  // new Promise((resolve, reject) => {
  //   router.onReady(resolve, reject)
  // })
  await new Promise(router.onReady.bind(router))

  return app
}
```

服务端server适配

```js
...
server.get('*', isProd
    ? render // 生产模式：使用构建好的包直接渲染
    : async (req, res) => {
        // 需等待renderer渲染器加载完成后，调用render进行渲染
        await onReady
        render(req, res)
      }
)
...
```

服务端路由设置为*，意味着所有的路由都会进入，调用render方法，在render中将路由路径通过context对象传递到渲染当中，渲染函数中调用entry-server.js中的函数，调用createApp创建vue实例，拿到vue和router实例，通过路由实例设置服务端的路由位置

改造render，renderToString返回Promise

```js
const render = async (req, res) => {
  // renderToString第一个参数为context对象 被传递到entry-sever.js中
  try {
    const html = await renderer.renderToString({
      title: '拉钩教育',
      meta: `
        <meta name="description" content="拉钩">
      `,
      url: req.url,
    })
    res.setHeader('Content-type', 'text/html;charset=utf8')
    res.end(html)
  } catch (e) {
    res.status(500).end('Internal Srever ERROR')
  }
}
```

entry-client.js操作

需要在挂载 app 之前调用 `router.onReady`，因为路由器必须要提前解析路由配置中的异步组件，才能正确地调用组件中可能存在的路由钩子

```js
...
const { app, router } = createApp()

// 这里假定 App.vue 模板中根元素具有 `id="app"`
router.onReady(() => {
  app.$mount('#app')
})
```

App.vue设置路由出口

```vue
...
<ul>
    <li>
        <router-link to="/">Home</router-link>
    </li>
    <li>
        <router-link to="/about">About</router-link>
    </li>
</ul>

<router-view />
...
```

通过build之后可以看到，About和404这种异步加载的组件都被分割成独立的chunk资源，只有在需要的时候才会进行加载，这样就能够避免在初始渲染的时候客户端加载的脚本过大导致激活速度变慢的问题

![image-20210328171318575](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210328171318575.png)

刷新页面查看资源加载过程：可以看到，除了 app 主资源外，其它的资源也被下载下来了，头部的link标签的preload和prefetch作用是预加载对应资源，工作流程是：

- 使用者期望客户端js脚本尽快加载，尽早接管服务端渲染的内容，让其拥有动态交互能力
- 如果把 script 标签放到body中的话，浏览器会去下载它并执行里面的代码，这个过程会阻塞页面的渲染
- 真正的script 标签是在页面的底部，preload和prefetch告诉浏览器可以去预加载这个资源，但是不 要执行里面的代码，也不要影响网页的正常渲染，直到遇到真正的 script 标签加载该资源的时候才会去执行里面的代码，这个时候可能已经预加载好了，直接使用就可以了，这样可以提高script标签加载渲染速度
- preload加载的是当前页面一定会用到的资源，对其进行预加载
- 而prefetch 资源是加载下一个页面可能用到的资源，浏览器会在空闲的时候对其进行加载，所以它并不一定会把资源加载出来，而 preload 一定会预加载。
- 当访问 about 页面的时候，它的资源是通过 prefetch 预取过来的，提高了客户端页面导航的响应速度。

![image-20210328171641640](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210328171641640.png)

#### 管理头部Head内容

服务端和客户端渲染都是用同一个页面模板，页面body部分是动态渲染，但是title和meta都是写死的，所以下面来演示如何为不同页面定制不同的head头部内容。

[Vue Meta ](https://vue-meta.nuxtjs.org/guide/)是一个支持 SSR 的第三方 Vue.js 插件，可轻松实现不同页面的 head 内容管理。 使用它的方式非常简单，而只需在页面组件中使用 metaInfo 属性配置页面的 head 内容即可。

```vue
<template>
...
</template>
<script>
    export default {
        metaInfo: {
            title: 'My Example App',
            titleTemplate: '%s - Yay!',
            htmlAttrs: {
                lang: 'en',
                amp: true
            }
        }
    }
</script>
```

页面渲染出来的结果

```html
<html lang="en" amp>
    <head>
        <title>My Example App - Yay!</title>
        ...
    </head>
</html>
```

使用步骤如下:

- 安装: `npm i vue-meta`

- 在通用入口将注册vue-meta，并混入metaInfo

  ```js
  ...
  import VueMeta from 'vue-meta'
  
  Vue.use(VueMeta)
  Vue.mixin({
    metaInfo: {
      titleTemplate: '%s - 拉勾教育',
    },
  })
  ...
  ```

- 在服务端渲染入口模块中适配 vue-meta

  ```js
  ...
  const { app, router } = createApp()
  
  const meta = app.$meta()
  context.meta = meta
  ...
  ```

- 最后在模板页面注入meta信息

  ```html
  <head>
      {{{ meta.inject().title.text() }}}
      {{{ meta.inject().meta.text() }}}
  </head>
  ```

- 在组件中添加不同的title信息

  ```js
  // Home.vue
  {
      metaInfo: {
          title: '首页' // 首页 - 拉勾教育
      }
  }
  
  // About.vue
  {
      metaInfo: {
          title: 'About' // About - 拉勾教育
      }
  }
  ```

  更多属性设置请参考[metaInfo properties](https://vue-meta.nuxtjs.org/api/#metainfo-properties)

##### 数据预取和状态

[官方文档](https://ssr.vuejs.org/zh/guide/data.html)很难看懂，可以通过一个实际需求来了解服务端渲染中的数据预取和状态管理

需求：实现通过服务端渲染的方式来把异步接口数据渲染到页面中

如果是纯客户端渲染，无非就是在页面发请求拿数据，然后在模板中遍历出来，但是想要通过服务端渲染的方式来处理的话就比较麻烦。

使用服务端渲染（服务端获取异步接口数据，交给 Vue 组件去渲染）流程：

![image-20210329113524310](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210329113524310.png)

首先想到的肯定是在组件的生命周期钩子中请求获取数据渲染页面，创建pages/Posts.vue组件

```vue
<template>
  <div>
    <h1>Post List</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PostList',
  data () {
    return {
      posts: []
    }
  },
  // 服务端渲染 只支持 beforeCreate 和 created
  // 不会等待 beforeCreate 和 created 中的异步操作
  // 不支持响应式数据
  // 所有这种做法在服务端渲染中是不会工作的！！！
  async created () {
    console.log('Posts Created Start')
    const { data } = await axios({
      method: 'GET',
      url: 'https://cnodejs.org/api/v1/topics'
    })
    this.posts = data.data
    console.log('Posts Created End')
  }
}
</script>
```

此时虽然页面可以正常加载，但是可以看到不是首次渲染就渲染好的html片段，而是通过接口请求到的数据

接着我们按照官方文档给出的参考来把服务端渲染中的数据预取以及状态管理来处理一下。

核心思路就是把在服务端渲染期间获取的数据存储到 Vuex 容器中， 然后把容器中的数据同步到客户端，这样就保持了前后端渲染的数据状态同步，避免了客户端重新渲染 的问题。

1. 通过Vuex创建容器实例，并挂载到Vue实例

   ```js
   // store/index.js
   import Vue from 'vue'
   import Vuex from 'vuex'
   import axios from 'axios'
   Vue.use(Vuex)
   export const createStore = () => {
       return new Vuex.Store({
           state: {
               posts: [] // 文章列表
           },
           mutations: {
               // 修改容器状态
               setPosts (state, data) {
                   state.posts = data
               }
           },
           actions: {
               async getPosts ({ commit }) {
                   const { data } = await axios({
                       method: 'GET',
                       url: 'https://cnodejs.org/api/v1/topics'
                   })
                   commit('setPosts', data.data)
               }
           }
       })
   }
   ```

2. 在通用应用入口中将 Vuex 容器挂载到 Vue 根实例

   ```js
   // app.js
   ...import { createStore } from './store'
   ...
   export function createApp () {
       const router = createRouter()
       const store = createStore()
       const app = new Vue({
           router, // 把路由挂载到 Vue 根实例中
           store, // 把容器挂载到 Vue 根实例
           // 根实例简单的渲染应用程序组件。
           render: h => h(App)
       })
       return { app, router, store }
   }
   ```

3. 在组件中使用 serverPrefetch 触发容器中的 action

   ```vue
   <template>
     <div>
       <h1>Post List</h1>
       <ul>
         <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
       </ul>
     </div>
   </template>
   
   <script>
   import { mapState, mapActions } from 'vuex'
   
   export default {
     name: 'PostList',
     metaInfo: {
       title: 'Posts'
     },
     computed: {
       ...mapState(['posts'])
     },
   
     // Vue SSR 特殊为服务端渲染提供的一个生命周期钩子函数
     serverPrefetch () {
       // 一定按照这种形式：发起 action，返回 Promise
       // this.$store.dispatch('getPosts')
       return this.getPosts()
     },
     methods: {
       ...mapActions(['getPosts'])
     }
   }
   </script>
   ```

4. 在服务端渲染应用入口中将容器状态序列化到页面中

   接下来我们要做的就是把在服务端渲染期间所获取填充到容器中的数据同步到客户端容器中，从而避免两个端状态不一致导致客户端重新渲染的问题。

   ```js
   // entry-server.js
   router.onReady...
   context.rendered = () => {
       // 在应用渲染完成以后，服务端 Vuex 容器中已经填充了状态数据
       // 这里手动的把容器中的状态数据放到 context 上下文中
       // Renderer 在渲染页面模板的时候会把 state 序列化为字符串串内联到页面中
       // window.__INITIAL_STATE__ = store.state
       context.state = store.state
   }
   ```

   两个端数据状态没有同步，还需设置客户端数据状态

   ![image-20210329083452856](C:\Users\xiang wang\AppData\Roaming\Typora\typora-user-images\image-20210329083452856.png)

5. 最后，在客户端渲染入口中把服务端传递过来的状态数据填充到客户端 Vuex 容器中

   ```js
   // entry-client.js
   import { createApp } from './app'
   // 客户端特定引导逻辑……
   const { app, router, store } = createApp()
   // 如果当前页面中有 __INITIAL_STATE__ 数据，则直接将其填充到客户端容器中
   if (window.__INITIAL_STATE__) {
       // We initialize the store state with the data injected from the server
       store.replaceState(window.__INITIAL_STATE__)
   }
   router.onReady(() => {
       app.$mount('#app')
   })
   ```

##### 服务端渲染优化

尽管Vue的SSR速度相当快，但由于创建组件实例和虚拟DOM节点的成本，它无法与纯基于字符串的模板的性能相匹配。在SSR性能至关重要的情况下，明智的利用缓存策略可极大的缩短响应时间并减少服务器负载。

##### 页面级别缓存

如[官方文档](https://ssr.vuejs.org/zh/guide/caching.html#%E9%A1%B5%E9%9D%A2%E7%BA%A7%E5%88%AB%E7%BC%93%E5%AD%98-page-level-caching)中介绍的那样，对特定的页面合理的应用 [micro-caching](https://www.nginx.com/blog/benefits-of-microcaching-nginx/) 能够大大改善服务器处理并发的能力(吞吐率 RPS )。

但并非所有页面都适合使用 micro-caching 缓存策略，我们可以将资源分为三类：

- 静态资源：如 js 、 css 、 images 等。
- 用户特定的动态资源：不同的用户访问相同的资源会得到不同的内容。
- 用户无关的动态资源：任何用户访问该资源都会得到相同的内容，但该内容可能在任意时间发生变 化，如博客文章。

只有“用户无关的动态资源”适合应用 micro-caching 缓存策略。

使用[lru-cache](https://github.com/isaacs/node-lru-cache)

```
npm install lru-cache --save
```

修改server.js

```js
...
const LRU = require('lru-cache')

const cache = new LRU({
  max: 100,
  maxAge: 10000, // Important: entries expires after 1 second.
})
const isCacheable = (req) => {
  console.log(req.url)
  if (req.url === '/posts') {
    return true
  }
}
...
const render = async (req, res) => 
  try {
    const cacheable = isCacheable(req)
    if (cacheable) {
      const html = cache.get(req.url)
      if (html) {
        return res.end(html)
      }
    }
    const html = await renderer.renderToString({
      title: '拉钩教育',
      meta: `
        <meta name="description" content="拉钩">
      `,
      url: req.url,
    })
    res.setHeader('Content-type', 'text/html;charset=utf8')
    res.end(html)
    
    if (cacheable) {
      cache.set(req.url, html)
    }
  } catch (e) {
    res.status(500).end('Internal Srever ERROR')
  }
}
...
```

由于内容缓存只有一秒钟，用户将无法查看过期的内容。然而，这意味着，对于每个要缓存的页面，服务器最多只能每秒执行一次完整渲染。

##### 组件级别缓存

Vue SSR内置支持组件级别缓存，在创建renderer时传入[cache](https://ssr.vuejs.org/zh/api/#cache)开启缓存

[官方案例](https://github.com/vuejs/vue-hackernews-2.0)

##### [Gzip 压缩](https://segmentfault.com/a/1190000012571492)