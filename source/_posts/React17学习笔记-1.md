---
title: React17学习笔记-1
date: 2022-01-20 10:08:41
tags:
  - 前端
  - 学习笔记
  - React
categories: React
---

字节前端青训营课程内容笔记

<!-- more -->

# 组件化的准则

- 组件是组件的组合/原子组件
- 组件内拥有状态，外部不可见
- 父组件可将状态传入组件内部

组件设计：

- 组件声明了状态和 UI 映射
- 组件有 Props/State 两种状态
- 组件可以组合

# JSX 语法和组件

React 组件声明共有两种形式：函数组件与 class 组件
函数组件：

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>
}
```

```js
class Welcome extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <h1>Hello, {this.props.name}</h1>
  }
}
```

jsx 的语法就是在函数的 return 返回一段类似 HTML 的代码，但依然是 js 代码，只不过会通过构建工具转译成`React.createElement('h1', ...)`的格式，和 vue3 的 jsx 一模一样，可以查看：[Vue3 学习笔记：jsx](/Vue3/Vue3学习笔记（5）：jsx/) 进行对比理解。

# React（hooks）的写法

## useState

传入一个初始值，返回一个状态，和 set 该状态的函数，用户可以通过调用该函数，来实现状态的修改。

```js
import React, { useState } from 'react'

function Example() {
  // 声明一个新的叫做 “count” 的 state 变量
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

## useEffect

传入一个函数，和一个数组(可选)，数组是状态的数组，称作依赖项，该函数在 mount 时，和依赖项被 set 的时候会执行。

```js
import React, { useState, useEffect } from 'react'

function Example() {
  const [count, setCount] = useState(0)

  // 使用一个副作用，传入的[count]数组使得此副作用只有当count变量改变时才会被调用
  useEffect(() => {
    // 副作用：Update the document title using the browser API
    document.title = `You clicked ${count} times`
  }, [count])

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

如果不写第二个参数的话，传入的参数引用了外面的状态，则这些状态其中一个发生变化都会触发这个副作用函数。

# 生态介绍

## 状态管理库

Redux、xState、mobx、recoil 等

## 应用级框架

1. NEXT.js：硅谷明星创业公司 Vercel 的 React 开发框架，稳定，开发体验好，支持 Unbundled Dev、SWC 等，其同样有 Serverless 一键部署平台帮助开发者快速完成部署。口号是"Let's Make Web Faster"
2. MODERN.js：字节跳动 Web Infra 团队研发的全栈开发框架，内置了很多开箱即用的能力与最佳实践，可以减少很多调研选择工具的时间。
3. Blitz：无 API 思想的全栈开发框架，开发过程中无需写 API 调用与 CRUD 逻辑，适合前后端紧密结合的小团队项目
