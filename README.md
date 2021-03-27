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

  - npm run build构建
  - node server.js启动应用

- 开发模式

  开发模式根据源代码的改变，不断重新生成 serverBundle、template、clientManifest 等打包的资源文件，资源文件一旦改变，自动调用 createBundleRenderer 生成新的 renderer 重新渲染

  - 监视代码变化自动构建、热更新等功能
  - node server.js启动应用

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

修改server.js，根据`NODE_ENV`判断环境

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
server.get('/',
  isProd ? render // 生产模式：使用构建好的包直接渲染
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

编写`开发模式 --> 监视打包构建 -->  -> 重新生成 Renderer 渲染器`代码