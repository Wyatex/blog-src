---
title: js笔记：Promise
date: 2020-11-06 17:30:25
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---
ES6中Promise的学习笔记

<!-- more -->

# Promise 的含义
所谓Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。

`Promise` 对象有以下两个特点：
1. 对象状态不受外界影响。Promise对象代表一个异步操作，有三种状态：`pending`（进行中）、`fulfilled`（已成功）和 `rejected`（已失败）。
2. 一旦状态改变就不能再变。状态变化只有两种可能：从`pending`变为`fulfilled`和从`pending`变为`rejected`。一旦其中一种状态发生了，状态就凝固了，会一直保持这个结果，称为：resolved（已定型）

优点：有了`Promise`对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，`Promise`对象提供统一的接口，使得控制异步操作更加容易。

缺点：首先，无法取消`Promise`，一旦新建它就会立即执行，无法中途取消。其次，如果不设置回调函数，`Promise`内部抛出的错误，不会反应到外部。第三，当处于`pending`状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

# 基本用法
ES6 规定，`Promise`对象是一个构造函数，用来生成`Promise`实例。
```js
const promise = new Promise(function(resolve, reject) {
    //...
    if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
})
```
`Promise`构造函数接受一个函数作为参数，该函数的两个参数分别是`resolve`和`reject`。它们是两个函数，由 JavaScript 引擎提供，不用自己部署。

`resolve` 函数将状态从未完成变为成功（即`pending`变为`fulfilled`），并将异步操作的结果，作为参数传递出去，`reject`就是转变成失败，同时将异步操作报出的错误，作为参数传递出去。

`Promise`实例生成以后，可以用`then`方法分别指定`resolved`状态和`rejected`状态的回调函数。
```js
promise.then(function(value) {
  // success
}, function(error) {
  // failure
});
```
`then`方法可以接受两个回调函数作为参数。第一个回调函数是Promise对象的状态变为`resolved`时调用，第二个回调函数是Promise对象的状态变为`rejected`时调用。

其中，第二个函数是可选的，不一定要提供。这两个函数都接受Promise对象传出的值作为参数。

一个简单的例子
```js
function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms, 'done')         //'done'是传给resolve的参数
  })
}

timeout(100).then((value) => {
  console.log(value);
})
```
过了100毫秒后状态转变成resolve，然后就会触发then方法绑定的的回调函数


**Promise执行顺序**：
```js
let p = new Promise(function(resolve, reject) {
  console.log('new promise')
  resolve()
})

p.then(function() {
  console.log('resolved.')
})

console.log('Hi.')
```
上面代码中，Promise 新建后立即执行，所以首先输出的是Promise。然后，then方法指定的回调函数，将在当前脚本所有同步任务执行完才会执行，所以`resolved`最后输出。

异步加载图片的例子
```js
function loadImageAsync(url) {
  return new Promise(function(resolve, reject) {
    const image = new Image()

    image.onload = function() {
      resolve(image)
    }

    image.onerror = function() {
      reject(new Error('Could not load image at ' + url))
    }

    image.src = url;
  })
}
```

下面是实现Ajax操作的一个例子
```js
let getJSON = function(url) {
  const promise = new Promise(function(resolve, reject) {
    const handler = function() {
      if (this.readyState !== 4) {
        return
      }
      if (this.status === 200) {
        resolve(this.response)
      } else {
        reject(new Error(this.statusText))
      }
    }
    const client = new XMLHttpRequest();
    client.open("GET", url)
    client.onreadystatechange = handler
    client.responseType = "json"
    client.setRequestHeader("Accept", "application/json")
    client.send()
  })
}

```