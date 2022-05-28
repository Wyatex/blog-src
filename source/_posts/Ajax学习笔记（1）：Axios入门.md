---
title: Ajax学习笔记（1）：Axios入门
date: 2021-09-20 22:57:50
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Axios
categories: 前端
---

# Ajax 介绍

## 什么是 axios

官方介绍：

> Axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中。
> 特性：
>
> - 从浏览器中创建 XMLHttpRequests
> - 从 node.js 创建 http 请求
> - 支持 Promise API
> - 拦截请求和响应
> - 转换请求数据和响应数据
> - 取消请求
> - 自动转换 JSON 数据
> - 客户端支持防御 XSRF

<!-- more -->

# 基础使用

## 安装

这篇文章先介绍如何在 html 文件里引入和基本的使用，下一篇文章介绍如何在 npm 里使用并封装到项目里使用。
使用 cdn 引入：

```
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```

## 案例

发送一个 GET 方法的 ajax 请求(几种方法)

```js
axios.get('/user?id=123').then((res) => console.log(res))

axios
  .get('/user', {
    params: { id: 123 },
  })
  .then((res) => console.log(res))

axios({
  method: 'get',
  url: '/user',
  params: {
    id: 123,
  },
}).then((res) => console.log(res))
```

三种方法都可以发送请求，而且上面三个的效果都是一样的。axios()和 axios.get()都会返回一个 promise，只需要使用 then 去处理返回的响应（比如上面的 res）即可。也可以使用 async/await 语法，不过大佬建议不要用 async/await 语法，因为如果使用 babel 等工具转译成 es3、es5 语法之后会生成很大量的代码，如果对这些没要求的话也是可以使用的。

同理，发送 post、put、options 请求也是差不多方法，为了方便，axios 提供了所有支持的请求方法的别名：

- axios.request(config)
- axios.get(url[, config])
- axios.delete(url[, config])
- axios.head(url[, config])
- axios.options(url[, config])
- axios.post(url[, data[, config]])
- axios.put(url[, data[, config]])
- axios.patch(url[, data[, config]])

在使用别名方法时， url、method、data 这些属性都不必在配置中指定(get 请求的 params 除外)。

# 创建示例

使用 create 方法创建一个 axios 示例：

```js
const instance = axios.create({
  baseURL: 'http://your-api-server.com/',
  timeout: 1000,
  headers: { Authorization: 'Bearer abcdefg' },
  params: { ... }
  ...
})
```

然后也是一样可以调用 request、get、post......等方法发送请求：

```js
instance.request('/user').then((res) => console.log(res))
```

# 请求配置

这部分是创建请求时可用的配置选项，其中只有 url 是必需的，其他可用按需求进行配置。

```js
{
   // `url` 是用于请求的服务器 URL
  url: '/user',

  // `method` 是创建请求时使用的方法
  method: 'get', // 默认方法：get

  // `baseURL` 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL。
  // 它可以通过设置一个 `baseURL` 便于为 axios 实例的方法传递相对 URL
  baseURL: 'https://some-domain.com/api/',

  // `transformRequest` 允许在向服务器发送前，修改请求数据
  // 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
  // 后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
  transformRequest: [function (data, headers) {
    // 对 data 进行任意转换处理
    return data;
  }],

  // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
  transformResponse: [function (data) {
    // 对 data 进行任意转换处理
    return data;
  }],

  // `headers` 是即将被发送的自定义请求头
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  // `params` 是即将与请求一起发送的 URL 参数
  // 必须是一个无格式对象(plain object)或 URLSearchParams 对象
  params: {
    ID: 12345
  },

   // `paramsSerializer` 是一个负责 `params` 序列化的函数
  // (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
  paramsSerializer: function(params) {
    return Qs.stringify(params, {arrayFormat: 'brackets'})
  },

  // `data` 是作为请求主体被发送的数据
  // 只适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
  // 在没有设置 `transformRequest` 时，必须是以下类型之一：
  // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
  // - 浏览器专属：FormData, File, Blob
  // - Node 专属： Stream
  data: {
    firstName: 'Fred'
  },

  // `timeout` 指定请求超时的毫秒数(0 表示无超时时间)
  // 如果请求话费了超过 `timeout` 的时间，请求将被中断
  timeout: 1000,

   // `withCredentials` 表示跨域请求时是否需要使用凭证
  withCredentials: false, // default

  // `adapter` 允许自定义处理请求，以使测试更轻松
  // 返回一个 promise 并提供一个有效的响应 （参见 lib/adapters/README.md）.
  adapter: function (config) {
    /* ... */
  },

 // `auth` 表示应该使用 HTTP 基础验证，并提供凭据
  // 这将设置一个 `Authorization` 头，覆写掉现有的任意使用 `headers` 设置的自定义 `Authorization`头（Basic类型）
  auth: {
    username: 'admin',
    password: '12345678'
  },

  // `responseType` 表示浏览器将要响应的数据类型
  // 选项包括: 'arraybuffer', 'document', 'json', 'text', 'stream'
  // 浏览器专属：'blob'
  responseType: 'json', // 默认json

  // `responseEncoding` 表示用于解码响应的编码 (Node.js 专属)
  // 注意：忽略 `responseType` 的值为 'stream'，或者是客户端请求
  // Note: Ignored for `responseType` of 'stream' or client-side requests
  responseEncoding: 'utf8', // default

   // `xsrfCookieName` 是用作 xsrf token 的值的cookie的名称
  xsrfCookieName: 'XSRF-TOKEN', // default

  // `xsrfHeaderName` 是带有 xsrf token 值的http 请求头名称
  xsrfHeaderName: 'X-XSRF-TOKEN', // default

   // `onUploadProgress` 允许为上传处理进度事件
  onUploadProgress: function (progressEvent) {
    // 处理原生进度事件
  },

  // `onDownloadProgress` 允许为下载处理进度事件
  onDownloadProgress: function (progressEvent) {
    // 对原生进度事件的处理
  },

   // `maxContentLength` 定义允许的响应内容的最大尺寸
  maxContentLength: 2000,

  // `validateStatus` 定义了对于给定的 HTTP状态码是 resolve 还是 reject promise。
  // 如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，
  // 则promise 将会 resolved，否则是 rejected。
  validateStatus: function (status) {
    return status >= 200 && status < 300; // 默认值
  },

  // `maxRedirects` 定义了在node.js中要遵循的最大重定向数。
  // 如果设置为0，则不会进行重定向
  maxRedirects: 5, // 默认值

  // `socketPath` 定义了在node.js中使用的UNIX套接字。
  // e.g. '/var/run/docker.sock' 发送请求到 docker 守护进程。
  // 只能指定 `socketPath` 或 `proxy` 。
  // 若都指定，这使用 `socketPath` 。
  socketPath: null, // default

  // `httpAgent` and `httpsAgent` define a custom agent to be used when performing http
  // and https requests, respectively, in node.js. This allows options to be added like
  // `keepAlive` that are not enabled by default.
  // `httpAgent` 和 `httpsAgent` 分别在 node.js 中用于定义在执行 http 和 https 时使用的自定义代理。允许像这样配置选项：
  // `keepAlive` 默认没有启用
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),

  // 'proxy' 定义代理服务器的主机名称和端口
  // `auth` 表示 HTTP 基础验证应当用于连接代理，并提供凭据
  // 这将会设置一个 `Proxy-Authorization` 头，覆写掉已有的通过使用 `header` 设置的自定义 `Proxy-Authorization` 头。
  proxy: {
    host: '127.0.0.1',
    port: 9000,
    auth: {
      username: 'mikeymike',
      password: 'rapunz3l'
    }
  },

  // `cancelToken` 指定用于取消请求的 cancel token
  // （查看后面的 Cancellation 这节了解更多）
  cancelToken: new CancelToken(function (cancel) {
  })
}
```

# 响应结构

如果你尝试过上面的 get 请求，如果你在 then 里将 res 打印出来，你将会得到如下数据：

```json
{
  // `data` 由服务器提供的响应体，可用将数据放在这里
  "data": {},

  // `status` 来自服务器响应的 HTTP 状态码
  "status": 200,

  // `statusText` 来自服务器响应的 HTTP 状态信息
  "statusText": "OK",

  // `headers` 服务器响应的头
  "headers": {},

  // `config` 是为请求提供的配置信息
  "config": {},

  // `request` 是生成此响应的请求
  // 在node.js中它是最后一个ClientRequest实例 (in redirects)，
  // 在浏览器中则是 XMLHttpRequest 实例
  "request": {}
}
```

# 默认配置

## 全局的 axios 默认值

可用修改各个请求的配置默认值，比如查看上面的[请求配置](/前端/Ajax学习笔记（1）：Axios入门/#请求配置)部分，可用看到请求默认的方法是 get，我们可用这样修改成默认 post 方法发送请求：

```js
axios.defaults.method = 'post'
```

如果请求你的 api 服务器需要 token 的话，可用直接在 header 上加上默认值：

```js
axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
```

## 实例的默认值

设置某个实例的默认值：

```js
const instance = axios.create({
  baseURL: 'https://api.example.com',
})

instance.defaults.headers.common['Authorization'] = AUTH_TOKEN
```

## 配置的优先顺序(面试可能会考？)

配置会以一个优先顺序进行合并。这个顺序是：在 axios 源码中找到默认值，然后是实例的 defaults 属性，最后是请求的 config 参数。后者将优先于前者，这是一个例子：

```js
// 使用由库提供的配置的默认值来创建实例
// 此时超时配置的默认值是 `0`
var instance = axios.create()

// 覆写库的超时默认值
// 现在，在超时前，所有请求都会等待 2.5 秒
instance.defaults.timeout = 2500

// 为已知需要花费很长时间的请求覆写超时设置，该请求将会等待5秒
instance.get('/longRequest', {
  timeout: 5000,
})
```

# 拦截器

在请求或响应被 then 或 catch 处理前可用拦截它们。比如上面演示的加 token 操作，推荐做法不是在配置里面加而是让拦截器为我们加上。
比如设置一个请求拦截器：

```js
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么，比如加上token或者设置超时等
    config.headers.Authorization = AUTH_TOKEN
    config.timeout = 5000
    config.method = 'post'
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)
```

同样也可以为响应加上拦截器，在 then 进行处理之前响应的数据将会被拦截器处理。

```js
axios.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么，比如加上一点数据？
    response.data.username = '张三'
    return response
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)
```

如果你想在稍后移除这个拦截器，可用这样：

```js
const myInterceptor = axios.interceptors.request.use(function () {
  /*...*/
})
axios.interceptors.request.eject(myInterceptor)
```

同样上面为全局 axios 设置的拦截器，如果后面使用 axios.create()创建实例的话上面设置的拦截器是不起作用的，如果需要为实例配置的话，可用这样：

```js
const instance = axios.create()
instance.interceptors.request.use(function () {
  /*...*/
})
```

同理去除拦截器也是使用 eject 方法去除。

# 错误处理

官方示例：

```js
axios.get('/user/12345').catch(function (error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    // 渣翻：当请求发出后，服务器返回了一个响应
    // 而且响应的状态码（status code）不是2xx范围内
    console.log(error.response.data)
    console.log(error.response.status)
    console.log(error.response.headers)
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    // 渣翻：请求发出但是没接收到响应
    // `error.request`在浏览器端是发送请求的xhr实例，在node是http.ClientRequest实例
    console.log(error.request)
  } else {
    // Something happened in setting up the request that triggered an Error
    // 在设置请求时发生了错误，在这里会被捕捉到
    console.log('Error', error.message)
  }
  console.log(error.config)
})
```

可用使用 `validateStatus` 配置选项定义一个自定义 HTTP 状态码错误范围。

```js
axios.get('/user/12345', {
  validateStatus: function (status) {
    // Reject only if the status code is greater than or equal to 500
    // 渣翻：当状态码大于等于500时才触发reject
    return status < 500
  },
})
```

> 上面是我根据对官方文档的使用介绍理解后写的文章，和官方文档不完全一样，如有其他需要请查看官方文档，下一篇文章介绍如何在npm项目里使用并封装一些自己需要的功能。

[官方文档]()