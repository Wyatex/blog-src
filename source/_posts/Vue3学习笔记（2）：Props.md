---
title: Vue3学习笔记（2）：Props
date: 2021-10-14 21:28:37
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Vue3
categories: Vue3
---

这节课讲解一下 Props 相关的内容，如果没看过第一篇建议先去看完第一篇： [Vue3 学习笔记（1）：组件](/Vue3/Vue3学习笔记（1）：组件/)

<!-- more -->

# Props 的一些坑

当我们不想每个组件都写一些 Props，想把相同的 Props 定义提取出来，我们可能会这么做，这里用上一篇的例子继续演示：

```ts
import { defineComponent, PropType } from 'vue'

const PropsType = {
  age: {
    type: Number,
    required: true,
  },
}

export default defineComponent({
  name: 'HelloWorld',
  props: PropsType,
  mounted() {
    this.age
  },
})
```

这时候看一下 age 的类型，是不是发现不对劲，age 的类型是：`number | undefined`。
不对啊我们都定义了 required 为 true 了，为什么还会是`undefined`呢？首先说一下解决办法，其实很简单，只需要加上`as const`即可：

```ts
const PropsType = {
  msg: String,
  age: {
    type: Number,
    required: true,
  },
} as const
```

你会发现神奇的事情发生了，age 不再有可能是`undefined`了。

## 原因

其实原因写在了`defineComponent`函数声明的地方（不是定义），
看到 vue-next 源码的 `package/runtime-core/src/apiDefineComponent.ts` ，看到 overload4 的部分:

```ts
// overload 4: object format with object props declaration
// see `ExtractPropTypes` in ./componentProps.ts
export function defineComponent<
  // the Readonly constraint allows TS to treat the type of { required: true }
  // as constant instead of boolean.
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string
>(
  options: ComponentOptionsWithObjectProps<
    PropsOptions,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): DefineComponent<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE>
```

最重要的一句是：

> // the Readonly constraint allows TS to treat the type of { required: true }
> // as constant instead of boolean.

翻译出来就是：`Readonly`约束可以让 TS 将`{ required: true }`视为该对象是必须的。

但是如果我们使用这样子的方式去定义的话：

```ts
const PropsType = {
  msg: String,
  age: {
    type: Number,
    required: true,
  },
}
```

因为没上下文可以告诉 TS 这个 PropsType 是`Readonly`类型，就会导致 required 的约束失效。怎么将这个对象设为`Readonly`类型呢？很简单，ts 提供了一个`as const`的语法，可以将对象的所有属性设为 readonly，也就是这个对象是一个`Readonly`类型的对象，那么约束就可以生效了。

这个坑如果不是用 ts 去开发的话根本不会遇到，但是这个坑可能网上都找不到太多的相关知识。
