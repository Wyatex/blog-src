---
title: js源码阅读（2）：p-limit
date: 2023-04-14 10:59:18
tags:
  - JavaScript
  - 前端
  - 学习笔记
categories: 前端
---

今天继续看一个 promise 限制并发的工具

<!-- more -->

# 上源码

直接上 js 的源码

```js
// 引入作者写的一个简单的队列工具。
import Queue from 'yocto-queue'

// 工具主体
export default function pLimit(concurrency) {
  // 只能输入1-正无穷大
  if (
    !(
      (Number.isInteger(concurrency) ||
        concurrency === Number.POSITIVE_INFINITY) &&
      concurrency > 0
    )
  ) {
    throw new TypeError('Expected `concurrency` to be a number from 1 and up')
  }

  // 创建队列
  const queue = new Queue()
  // 并发计数
  let activeCount = 0

  // promise被resolve或者reject后的执行函数
  const next = () => {
    // resolve或者reject，并发数-1
    activeCount--

    // 出列
    if (queue.size > 0) {
      queue.dequeue()()
    }
  }

  // 执行promise函数
  const run = async (fn, resolve, args) => {
    // 当前并发数+1
    activeCount++

    const result = (async () => fn(...args))()

    resolve(result)

    try {
      await result
    } catch {}

    next()
  }

  const enqueue = (fn, resolve, args) => {
    queue.enqueue(run.bind(undefined, fn, resolve, args))
    ;(async () => {
      // 这个函数需要等到下一个微任务完成后才能进行比较“activeCount”到“concurrency”，
      // 因为“activeCount”是异步更新的，当 run 函数出队并被调用时，
      // 也需要异步发生，以获得“activeCount”的最新值。
      await Promise.resolve()

      if (activeCount < concurrency && queue.size > 0) {
        queue.dequeue()()
      }
    })()
  }

  // 将传入进来的()=>Promise函数封装成promise
  const generator = (fn, ...args) =>
    new Promise((resolve) => {
      enqueue(fn, resolve, args)
    })

  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount,
    },
    pendingCount: {
      get: () => queue.size,
    },
    clearQueue: {
      value: () => {
        queue.clear()
      },
    },
  })

  return generator
}
```

# 讲解

首先展示一下使用：

```js
import pLimit from 'p-limit'

const limit = pLimit(1)

const input = [
  limit(() => fetchSomething('foo')),
  limit(() => fetchSomething('bar')),
  limit(() => doSomething()),
]

// 现在只能一个一个promise运行了。类似：
// await fetchSomething('foo'); await fetchSomething('bar')
const result = await Promise.all(input)
console.log(result)
```

首先是 pLimit(1)，创建一个只能有一个 promise 并发的工具函数。

然后调用三次 limit(fn)，将 3 个 fn 存入队列，直到本次循环完成（同步任务）

同步任务执行完成，开始执行：`await Promise.resolve()`后的：

```js
if (activeCount < concurrency && queue.size > 0) {
  queue.dequeue()()
}
```

首先是第一次`limit(() => fetchSomething('foo'))`创建的 promise 微任务，这时候 activeCount 是 0 小于 concurrency 的 1，而且 queue.size 是 3，开始从 queue 取出第一个任务开始执行，activeCount++ 变成 1，并且开始 await 异步等待任务完成。

然后是 `limit(() => fetchSomething('bar'))` 创建的微任务，这时候因为 activeCount 是 1，不符合 activeCount < concurrency，不执行出列。第三个 limit 同理。

当 `fetchSomething('foo')` 异步等待完成，执行 `next()` ， activeCount-- ，并且取出第二个任务开始执行，activeCount++,异步等待，等待完成、activeCount-- ...... 直到整个队列空了，执行完成。

所以简单总结一下就是，所有任务入列，等到下一个事件循环，拿出n个任务开始执行，每一个任务执行完成，继续从队列拿出一个任务进行执行，直到队列为空。