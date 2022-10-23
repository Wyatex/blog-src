---
title: 动态加载JS文件并执行
date: 2022-10-12 11:31:19
tags:
  - 前端
categories: 前端
---

记录下一个简单的动态加载 js 代码并执行的方法

<!-- more -->

# iife 格式

iife 格式的立刻执行函数，通常会将对象挂载到 window

```js
fetch('https://cdn.babylonjs.com/babylon.js')
  .then((res) => {
    console.log(res)
    const reader = res.body.getReader()
    return new ReadableStream({
      start(controller) {
        // The following function handles each data chunk
        function push() {
          // "done" is a Boolean and value a "Uint8Array"
          reader.read().then(({ done, value }) => {
            // If there is no more data to read
            if (done) {
              console.log('done', done)
              controller.close()
              return
            }
            // Get the data and send it to the browser via the controller
            controller.enqueue(value)
            push()
          })
        }
        push()
      },
    })
  })
  .then((stream) =>
    new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text()
  )
  .then((result) => {
    console.log(result)
    eval(result)
    console.log(BABYLON)
  })
```

当然如果是项目集成有 Axios 的话就不需要这么麻烦了，这里可以封装一个函数：

```js
export async function fetchAndEval(url) {
  const res = await fetch(url)
  const reader = res.body.getReader()
  const stream = await new ReadableStream({
    start(controller) {
      function push() {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('done', done)
            controller.close()
            return
          }
          controller.enqueue(value)
          push()
        })
      }
      push()
    },
  })
  const result = await new Response(stream, {
    headers: { 'Content-Type': 'text/html' },
  }).text()
  console.log('js文件内容：', result)
  eval(result)
}
```

# ESM

esm 格式就方便很多了，可以通过 import 直接引入模块，演示一下 vue 的动态 import：

```html
<div id="app"></div>
<script type="module">
  async function test() {
    const vue = await import(
      'https://cdn.bootcdn.net/ajax/libs/vue/3.2.40/vue.esm-browser.js'
    )
    vue
      .createApp({
        template: '<h1>HelloWorld</h1>',
      })
      .mount('#app')
  }
  test()
</script>
```

肥肠方便(๑•̀ㅂ•́)و✧
