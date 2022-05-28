---
title: Vue3学习笔记（3）：h和createVNode函数
date: 2021-10-14 22:52:23
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Vue3
categories: Vue3
---

这一节来讲解 h 函数的使用

<!-- more -->

# 先补充一点组件相关的知识

首先`.vue`不是前端可以使用的一种格式，需要打包工具将这些文件编译打包成 js 文件。
而且比如像：

```html
<template>
  <div class="div">
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>
```

这段代码，最后也不会是一个 html 格式的代码，而是一种以 h 函数描述的代码。

# h 函数的使用

首先 h 函数是用来定义 DOM 节点的函数。上面的 html 标签可以表示成这样：

```js main.js
import { createApp, h, defineComponent } from 'vue'
// import App from './App.vue'
import HelloWorld from './components/HelloWorld.vue'

const App = defineComponent({
  render() {
    return h('div', { id: 'app' }, [
      h('img', { alt: 'Vue logo', src: './assets/logo.png' }),
      h(HelloWorld, { msg: 'Welcome to Your Vue.js + TypeScript App' }),
    ])
  },
})

createApp(App).mount('#app')
```

可以看到页面成功渲染出来，但是图片并没有正常显示。这是因为写`.vue`文件时，写在 template 里的 src 会通过打包工具（比如 vue-loader）去找到正确的目录。可以改成这样：

```js
const img = require('./assets/logo.png') // eslint-disable-line

const App = defineComponent({
  render() {
    return h('div', { id: 'app' }, [
      h('img', { alt: 'Vue logo', src: img }),
      h(HelloWorld, { msg: 'Welcome to Your Vue.js + TypeScript App' }),
    ])
  },
})
```

就能看到图片正常显示了，加`// eslint-disable-line`的原因是 eslint 默认禁止使用 required，这里为了演示先关掉这一行的 eslint 检查。
至于样式问题，可以写一个 css 文件并引入即可，因为上面的写法是为了让你更好的了解 vue 的 sfc 也就是 vue 文件是如何编译打包的。
如果以后写 vue 文件时，看到某个 dom 结构你能快速的想出他是如果跟 h 函数这种结构对应的，那将对对你排查问题又非常大的好处。

# 去看一下 h 函数的源码

我们直接去 vue-next 源码看 h 函数的实现（implementation）：

```ts package/runtime-core/src/h.ts
// Actual implementation
// 可以看到h函数先接收一个type，第二个参数是props或者children，第三个是children。
export function h(type: any, propsOrChildren?: any, children?: any): VNode {
  const l = arguments.length
  if (l === 2) {
    // 当长度为2的时候，说明第二个是参数或者是children
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // single vnode without props
      if (isVNode(propsOrChildren)) {
        // 传入的是VNode，说明是children
        return createVNode(type, null, [propsOrChildren])
      }
      // 不是children，那就是props
      // props without children
      return createVNode(type, propsOrChildren)
    } else {
      // 是数组，说明是children
      // omit props
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    if (l > 3) {
      // 长度大于3的话，取出props之后的children参数
      children = Array.prototype.slice.call(arguments, 2)
    } else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}
```

可以看到 h 函数实际上就是用来返回一个 VNode 的工具，就是通过各种规则的判断，将你写的不那么规范的代码变得更加规范一点。

# createVNode

上面的代码我们可以直接改成`createVNode`的形式去写 dom 结构:

```js
const App = defineComponent({
  render() {
    return createVNode('div', { id: 'app' }, [
      createVNode('img', { alt: 'Vue logo', src: img }),
      createVNode(HelloWorld, {
        msg: 'Welcome to Your Vue.js + TypeScript App',
      }),
    ])
  },
})
```

这样就更符合 template 解析后的结构了。

## 源码查看

直接去看 vnode 相关的源码：

```ts package/runtime-core/src/vnode.ts
export const createVNode = (
  __DEV__ ? createVNodeWithArgsTransform : _createVNode
) as typeof _createVNode

// 可以看到createVNode是_createVNode的一个别名

function _createVNode(
  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag: number = 0,
  dynamicProps: string[] | null = null,
  isBlockNode = false
  // patchFlag、dynamicProps、isBlockNode是优化相关的参数
  // 在使用.vue文件时，打包工具将会为我们加上这些内容
): VNode {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    if (__DEV__ && !type) {
      warn(`Invalid vnode type when creating vnode: ${type}.`)
    }
    type = Comment
  }

  // ....

  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  )
}
```

在最后的最后，虽然可以直接用 createVNode，但是官方既然提供了 h 函数，那么这个函数肯定是对我们有很多好处的，所以尽量还是用 h 函数而不是 createVNode 函数。
