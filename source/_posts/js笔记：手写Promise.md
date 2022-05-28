---
title: js笔记：手写Promise
date: 2021-10-17 21:00:07
tags:
  - JavaScript
  - 前端
  - 学习笔记
categories: 前端
---

这篇文章讲解如何手写一个简单的 promise

<!-- more -->

# 基本结构

首先我们用另一个名称代表 promise，然后写一个类：

```js
class Commitment {
  static PENDING = '待定'
  static FULFILLED = '成功'
  static REJECTED = '失败'
  constructor(initFunc) {
    // 首先创建的promise是pending
    this.status = Commitment.PENDING
    // result属性用来存放结果
    this.result = null
    initFunc(this.resolve, this.reject)
  }

  resolve(result) {
    // 执行resolve之后转成fulfilled，并赋值
    if (this.status === Commitment.PENDING) {
      this.status = Commitment.FULFILLED
      this.result = result
    }
  }
  reject(result) {
    if (this.status === Commitment.PENDING) {
      this.status = Commitment.REJECTED
      this.result = result
    }
  }
}

let commitment = new Commitment((resolve, reject) => {
  resolve('123')
})
```

现在代码看起来好像没啥问题了，但是运行一下会发现：`TypeError: Cannot read properties of undefined (reading 'status')`

原因是什么呢，明显是在 resolve 里调用 this 并没有指向新实例。

## 细节：this

因为上面的：`resolve('123')`明显是在外部调用的，所以需要绑定 this：

```js
class Commitment {
  static PENDING = '待定'
  static FULFILLED = '成功'
  static REJECTED = '失败'
  constructor(initFunc) {
    this.status = Commitment.PENDING
    this.result = null
    // 1、这里的bind是给下面的resolve绑定this的
    initFunc(this.resolve.bind(this), this.reject.bind(this))
  }

  resolve(result) {
    if (this.status === Commitment.PENDING) {
      this.status = Commitment.FULFILLED
      this.result = result
    }
  }
  reject(result) {
    if (this.status === Commitment.PENDING) {
      this.status = Commitment.REJECTED
      this.result = result
    }
  }
}

let commitment = new Commitment((resolve, reject) => {
  // 2、给这个resolve绑定this
  resolve('123')
})
```

# then

为了代码的美观和强壮性，我们将 then 写在 class 里吧：

```js
class Commitment {
  // 省略上面写好的代码

  then(onFULFILLED, onREJECTED) {
    if (this.status === Commitment.FULFILLED) {
      onFULFILLED(this.result)
    }
    if (this.status === Commitment.REJECTED) {
      onREJECTED(this.result)
    }
  }
}
```

然后我们试一下正不正常：

```js
let commitment = new Commitment((resolve, reject) => {
  resolve('123')
})

commitment.then(
  (result) => console.log(result),
  (result) => console.log(result)
)
```

控制台看起来很正常，并没有报错什么的，也能正常打印，但是还有一个细节没解决。

## 执行异常

首先我演示一下原生 promise 如果在执行期间抛出异常的话：

```js
let promise = new Promise((resolve, reject) => {
  throw new Error('123')
})

promise.then(
  (result) => console.log(result),
  (result) => console.log(result.message)
)
```

控制台能成功打印出：`123`，那么我们也来实现一下，只需要在构建函数上加上 try-catch：

```js
constructor(initFunc) {
    this.status = Commitment.PENDING
    this.result = null
    try {
      initFunc(this.resolve.bind(this), this.reject.bind(this))
    } catch (error) {
      this.reject(error)
    }
  }
```

然后抛出异常就能用了：

```js
let commitment = new Commitment((resolve, reject) => {
  throw new Error('123')
})

commitment.then(
  (result) => console.log(result),
  (result) => console.log(result.message)
)
```

# 一点细节

原生的 promise 如果不传入 resolve 或者 reject 函数的话，运行是不会报错的：

```js
let promise = new Promise((resolve, reject) => {
  resolve('123')
})

promise.then(undefined, (result) => console.log(result.message))
```

而我们写的如果不传入的话会出现：`TypeError: onFULFILLED is not a function`

解决方法很简单，只需要在 then 改一下即可：

```js
then(onFULFILLED, onREJECTED) {
    onFULFILLED = typeof onFULFILLED === 'function' ? onFULFILLED : () => {}
    onREJECTED = typeof onREJECTED === 'function' ? onREJECTED : () => {}
    if (this.status === Commitment.FULFILLED) {
        onFULFILLED(this.result)
    }
    if (this.status === Commitment.REJECTED) {
        onREJECTED(this.result)
    }
}
```

# 异步
