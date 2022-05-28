---
title: Node.js与开发实战（1）
date: 2022-01-23 10:40:08
tags:
  - JavaScript
  - NodeJS
  - 学习笔记
categories: NodeJS
---

字节前端青训营课程内容笔记

<!-- more -->

# 编写 HTTP Server

## 基本的 http server：

```js
// 导入http包
const http = require('http')
// 自定义的端口号，可用数值为0-62235，0-1023是系统端口，最好不要使用
const port = 3000
// 创建http服务
const server = http.createServer((req, res) => {
  //告诉服务器响应已完成，并向请求的一方发送数据，内容为字符串'hello world'
  res.end('hello world')
})
// 服务器监听端口
server.listen(port, () => {
  console.log('listen on :', port)
})
```

## 发送 json 数据的 http server

```js
const http = require('http')
const port = 3000

const server = http.createServer((req, res) => {
  // 创建数据缓冲区
  const bufs = []
  // 监听数据，有数据变换，将其添加到缓冲区中
  req.on('data', (buf) => {
    bufs.push(buf)
  })
  req.on('end', () => {
    // 将所有接受到的数据进行拼接和整合，转为utf8格式的字符串
    let buf = Buffer.concat(bufs).toString('utf8')
    // 默认数据
    let msg = 'Hello'
    try {
      // 解析数据
      const ret = JSON.parse(buf)
      msg = ret.msg
    } catch (err) {
      // res.end('invalid json')
    }
    // 定义响应数据
    const responseJson = {
      msg: `receive: ${msg}`,
    }
    // 设置响应头
    res.setHeader('Content-Type', 'application/json')
    // 发送数据
    res.end(JSON.stringify(responseJson))
    console.log('已经向客户端发送数据')
  })
})
server.listen(port, () => {
  console.log('listen on:', port)
})
```

在此，需要一个客户端发送响应，才能看到结果，所以，我们接下来创建一个发送数据的客户端。

```js
const http = require('http')
const port = 3000
// 定义发送的json数据
const body = JSON.stringify({
  msg: '我是来自客户端的数据',
})
// 创建请求
const request = http.request(
  'http://127.0.0.1:3000',
  {
    method: 'POST',
    headers: {
      'Content-Tpye': 'application/json',
    },
    // 设置得到响应后的回调函数
  },
  (response) => {
    const bufs = []
    response.on('data', (buf) => {
      bufs.push(buf)
    })
    response.on('end', () => {
      const buf = Buffer.concat(bufs).toString('utf8')
      const json = JSON.parse(buf)
      console.log('json.msg', json)
    })
  }
)
// 发送请求
request.end(body)
```

## 结合 promise 创建一个返回 json 的 http server

```js
const http = require('http');
const port = 3000

const server = http.createServer(async (req, res) => {

  const msg = await new Promise((resolve, reject) => {
    const bufs = []
    req.on('data', (buf) => { bufs.push(buf) })
    req.on('error', (err) => { reject(err) // 失败的回调})
    req.on('end', () => {
      let msg = 'hello'
      const buf = Buffer.concat(bufs).toString('utf8')
      try {
        const ret = JSON.parse(buf)
        msg = ret.msg
      } catch (err) {
        reject(err) // 失败的回调
      }
      // 成功的回调
      resolve(msg)
    })
  })
  const responseJson = {
    msg: `receive msg: ${msg}`
  }
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(responseJson))
})

server.listen(port, () => {
  console.log('listen on: ', port)
})
```

## 发送静态文件的 htpp server

```js
const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')

const port = 3000
// 找到文件所在目录
const folderPath = path.resolve(__dirname, './static')
const server = http.createServer((req, res) => {
  const info = url.parse(req.url)
  // 设置文件所在的绝对路径
  const filePath = path.resolve(folderPath, './' + info.path)
  const fileStream = fs.createReadStream(filePath)
  fileStream.pipe(res)
})

server.listen(port, () => {
  console.log('listen on: ', port)
})
```

**注意**

- path.resolve([…paths])里的每个参数都类似在当前目录执行一个 cd 操作，从左到右执行，返回的是最后的当前目录。所以 const filePath = path.resolve(folderPath, info.path)并不会正确地找到文件所在的路径。
- 使用 pipe 会节省内存

# 编写 http server-React SSR

SSR (server side rendering)有什么特点?

- 相比传统 HTML 模版引擎：避免重复编写代码
- 相比 SPA (single page application)：首屏渲染更快，SEO 友好
- 缺点：通常 qps 较低，前端代码编写时需要考虑服务端渲染情况

SSR 难点：

- 需要处理打包代码
- 需要思考前端代码在服务端运行时的逻辑
- 移除对服务端无意义的副作用，或重置环境

SSR(Server Side Rendering)相比于传统的 HTML 模板引擎，能够比避免重复编写代码，相比于 SPA，首屏渲染更快、SEO 友好；其缺点是 QPS 较低，需要考虑服务器的渲染性能。

```js
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const http = require('http')

const port = 3000

function App(props) {
  return React.createElement('div', {}, props.children || 'hello')
}

const server = http.createServer((req, res) => {
  res.end(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Document</title>
    </head>
    <body>
        ${ReactDOMServer.renderToString(App({}))}
    </body>
    </html>
    `
  )
})

server.listen(port, () => {
  console.log('listen on:', port)
})
```

注意

- SSR 需要处理打包代码，如使用 webpack
- 需要思考在服务器端运行时的逻辑，如在 componentDidMount 的时候发送网络请求
- 移除对服务器无意义的副作用配置和环境
