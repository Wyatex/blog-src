---
title: 单元测试1Jest
date: 2022-08-14 09:25:34
tags:
  - 单元测试
  - Jest
  - 前端
---

单元测试是软件质量的重要保证。单元测试之所以非常重要，有以下三方面原因：

- 保证并且展示开发质量；
- 提高重构的信心；
- 团队合作的基石。

<!-- more -->

在此之前先找个位置存放等一下需要用到的源文件。

```shell
mkdir my-test
pnpm init
pnpm add -D jest jsdom happy-dom axios
```

# 测试 JS 函数

下面尝试测试一个最基本的函数 ，一个加法函数。

```js add.js
const add = (a, b) => a + b
module.exports = add
```

测试加法程序，编写测试用例。

```js tests/add.spec.js
const add = require('../add')

describe('测试Add函数', () => {
  test('add(1,2) === 3', () => {
    expect(add(1, 2)).toBe(3)
  })
  test('add(1,1) === 2', () => {
    expect(add(1, 1)).toBe(2)
  })
})
```

接下来执行： `npx jest` 命令运行测试，然后观察测试结果。

# 用 Mock 模拟无法执行的函数

如果被测试的代码，调用了一个网络请求 API ，比如 axios，但是那个网络地址并不存在或者没有联网，这个时候应该如何测试呢？

```js fetch.js
const axios = require('axios')
exports.getData = () => axios.get('/abc/bcd')
```

对于上面的 getData 函数来讲，调用了 axios.get 函数，应该模拟一个 axios.get 函数来替换掉原有的 axios.get 函数。模拟的 axios.get 函数不会调用网络请求，只具有根据输入返回相应结果的功能。这个就是 Mock 函数。

单元测试的任务是验证 getData 函数的功能是否正确，而不是 axios.get 函数或者网络接口是否正确。

首先使用 jest.mock 创建一个 axios 的 mock 对象。实际上就是创建了一个虚拟的 axios 函数替换原函数。然后通过 mockResolvedValue 定义调用 axios.get 函数的返回值。这个时候再调用 getData() 方法的时候 ，函数内部的 axios.get 是虚拟 mock 函数。调用时不会发生真正的网络请求，只会返回预定的结果。

```js tests/fetch.spec.ts
// __tests__/fetch.spec.js
const { getData } = require("../fetch");
const axios = require("axios");
jest.mock("axios");
it("fetch", async () => {
  // 模拟第一次接收到的数据
  axios.get.mockResolvedValueOnce("123");
  // 模拟每一次接收到的数据
  axios.get.mockResolvedValue("456");
​
  const data1 = await getData();
  const data2 = await getData();
  expect(data1).toBe("123");
  expect(data2).toBe("456");
});
```

# 测试前端页面

前端程序和纯 JS 的区别在于运行时不同。前端程序运行于浏览器端，会直接调用 Dom 对象。但是 Node 中并没有 Dom 模型。解决的办法有两个 ：

- 将测试用例放到浏览器中运行；
- 用 dom 仿真模拟一个 dom 对象。

先演示一下使用 jsdom 进行测试

```js jsdom-config.js
const jsdom = require('jsdom')
const { JSDOM } = jsdom
​
const dom = new JSDOM('<!DOCTYPE html><head/><body></body>', {
  url: 'http://localhost/',
  referrer: 'https://example.com/',
  contentType: 'text/html',
  userAgent: 'Mellblomenator/9000',
  includeNodeLocations: true,
  storageQuota: 10000000,
})
global.window = dom.window
global.document = window.document
global.navigator = window.navigator
```

编写一个被测试函数，函数中创建一个 div 元素。

```js dom.js
exports.generateDiv = () => {
  const div = document.createElement('div')
  div.className = 'c1'
  document.body.appendChild(div)
}
```

在测试程序中，被测试函数创建了一个 div 元素，接着就可以在 dom 仿真中获取 div 元素了。也可以用断言来判断代码功能是否正常。

```js tests/dom.spec.ts
const { generateDiv } = require('../dom')
require('../jsdom-config')
describe('Dom测试', () => {
  test('测试dom操作', () => {
    generateDiv()
    expect(document.getElementsByClassName('c1').length).toBe(1)
  })
})
```

使用 happy-dom 也很简单

```js happy-dom-config.js
const Window = require('happy-dom').Window
const window = new Window()
const document = window.document

global.window = window
global.document = document
```
然后就可以使用happy-dom代替jsdom了。
而前端常用的Vue、React也可以使用这些方法进行测试。