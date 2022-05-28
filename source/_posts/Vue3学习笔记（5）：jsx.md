---
title: Vue3学习笔记（5）：jsx
date: 2021-10-17 16:47:04
updated: 2022-1-20
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Vue3
categories: Vue3
---

这集来讲解 jsx 的基本使用，为了让你更好理解建议先把该系列的前置课程学会。

<!-- more -->

# 安装配置

这里建议使用官方推荐的：`@vue/babel-plugin-jsx`。
安装：`yarn add @vue/babel-plugin-jsx -D`
然后在 babel 配置文件使用：

```js
module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: ['@vue/babel-plugin-jsx'],
}
```

# 开始使用

我们先对 App.vue 进行改造，先创建一个 App.tsx 文件：

```ts App.tsx
import { defineComponent, ref } from 'vue'

const img = require('./assets/logo.png') // eslint-disable-line

export default defineComponent({
  setup() {
    const name = ref('jack')
    return () => {
      return (
        <div id='app'>
          <img src={img} alt='Vue logo' />
          <p>{name.value}</p>
        </div>
      )
    }
  },
})
```

可以看到这个结构是不是和用 h 函数写非常的像，如果你能理解 h 函数的写法应该也很好理解这种写法。
其中 jsx 如果需要引用值的话只需要使用`{}`即可。

## 属性检查

jsx 有个好处就是能检查你使用组件时是否按照要求传入属性，如果检查不通过则会直接编译时报错：

```js HelloWorld.vue
export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
})
```

这时候如果我们的 jsx 这样写：

```ts
import { defineComponent, ref } from 'vue'

import HelloWorld from './components/HelloWorld.vue'

const img = require('./assets/logo.png') // eslint-disable-line

export default defineComponent({
  setup() {
    const name = ref('jack')
    return () => {
      return (
        <div id='app'>
          <img src={img} alt='Vue logo' />
          <p>{name.value}</p>
          <HelloWorld />
        </div>
      )
    }
  },
})
```

运行会发现直接报错不通过编译，或者直接传入一个 number 试试：

```js
export default defineComponent({
  setup() {
    const name = ref('jack')
    return () => {
      return (
        <div id='app'>
          <img src={img} alt='Vue logo' />
          <p>{name.value}</p>
          <HelloWorld msg={123} />
        </div>
      )
    }
  },
})
```

也是一样会报错：`TS2322: Type 'number' is not assignable to type 'string'.`

然后我们正常的传入一个 string：

```js
export default defineComponent({
  setup() {
    const name = ref('jack')
    return () => {
      return (
        <div id='app'>
          <img src={img} alt='Vue logo' />
          <p>{name.value}</p>
          <HelloWorld msg={'123'} />
        </div>
      )
    }
  },
})
```

可以看到正常的跑起来的，这就是 ts 和 jsx 给我们带来的好处。

而我们如果使用.vue 的话，不传入属性：

```js App.vue
<template>
  <div class='div'>
    <img alt='Vue logo' src='./assets/logo.png' />
    <HelloWorld />
  </div>
</template>
```

只有在运行时才会在控制台弹出警告：`Missing required prop: "msg"`，而且只是警告，但是这个 app.vue 还是能正常运行，这就不太符合 ts 的思想了。

## 加上函数

如果我们有一些复杂的逻辑，会导致需要渲染的片段不一样，那可能就需要这样去做了。

```js
function renderHelloWorld(msg: string) {
  return <HelloWorld msg={msg} />
}

export default defineComponent({
  setup() {
    const name = ref('jack')
    return () => {
      return (
        <div id='app'>
          <img src={img} alt='Vue logo' />
          <p>{name.value}</p>
          {renderHelloWorld('hello')}
        </div>
      )
    }
  },
})
```

这样我们就可以通过一些函数来生成不一样的代码，不像 template 一样直接写死。

## 使用指令

比如使用双向绑定`v-model`指令，就和写 sfc 一样：

```js
export default defineComponent({
  setup() {
    const name = ref('jack')
    return () => {
      return (
        <div id='app'>
          <p>{name.value}</p>
          <input type='text' v-model={name.value} />
        </div>
      )
    }
  },
})
```

当我们进行输入，上面的 p 也会跟着改变。

> 以下内容基于 vue3.2.x 补充

# 模板的语法

上面说模板的方式编写组件没办法对 props 进行类型检测，其实在 vue3.2 加上 volar 插件的情况下是可以进行类型检测的。（volar 用于代码编写时进行类型检查）

组件只需要使用 defineProps 编译器宏也是能够实现类型检测的：

```ts HelloWorld.vue
// ...
<script lang='ts' setup>
interface IMyProps {
  msg: string;
}
  const props = defineProps<IMyProps>()
</script>
```

当然如果在 setup 里面不需要调用 props 的话可以去掉前面的声明赋值，只写 defineProps 就行了。

然后其他组件调用：

```ts App.vue
<template>
  <div>
    <img alt='Vue logo' src='./assets/logo.png' />
    <HelloWorld />
  </div>
</template>
```

这时候会提示缺少了某个属性，当然传入不正确的类型也会报错。如果需要属性可选，不传的话使用默认值则需要使用 `withDefaults` 编译器宏:

```ts 官网例子
interface Props {
  msg?: string
  labels?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two'],
})
```

同样 emit 也能进行类型校验了：

```ts
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()
// 下面需要emit的话：
emit('change', 123)
emit('update', '123')
```

如果 emit 的事件和参数写错也是会报类型错误。
