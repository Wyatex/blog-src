---
title: Vue3学习笔记（1）：组件
date: 2021-10-14 17:13:29
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Vue3
categories: Vue3
---

vue3 已经发布到 3.2 版本了，快来一起学习一下吧！
不过因为 Vue3 已经通过 ts 进行重写了，所以在学习 vue3 之前最好还是先学习一下 ts 的基本使用哦！

<!-- more -->

# 组件定义

在 vue3 中，定义组件主要是通过：`defineComponent`来定义，而不能向 vue2 一样直接`export`导出。

基本用法是先从 vue 依赖导入`defineComponent`函数，然后再`export default defineComponent`导出该组件，看起来就像这样：

```js
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
})
```

## defineComponent 讲解

<!-- 在 vscode 或者其他 ide 按住 ctrl 点击`defineComponent`函数跳转到依赖可以查看`defineComponent`的定义。
可以看到`defineComponent`一共有四种定义，它可以接收不同的参数类型，对应这四种不同的定义。 -->

下载 vue 官方的 vue-next 仓库，查看相关的源码，先看一下 DefineComponent 类型：

```ts package/runtime-core/src/apiDefineComponent.ts
export type DefineComponent<
  PropsOrPropOptions = {}, // 定义props
  RawBindings = {}, // 如果组件setup函数里返回的是对象，那么该对象的属性将会记录在这路
  D = {}, // 组件的data定义
  C extends ComputedOptions = ComputedOptions, // 组件的computed定义
  M extends MethodOptions = MethodOptions, // 组件的methods定义
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, // 组件的mixin定义
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin, // 组件的extends定义
  E extends EmitsOptions = {}, // 如果组件需要emit一些事件的话，记录在这里
  EE extends string = string,
  PP = PublicProps,
  Props = Readonly<
    PropsOrPropOptions extends ComponentPropsOptions
      ? ExtractPropTypes<PropsOrPropOptions>
      : PropsOrPropOptions
  > &
    ({} extends E ? {} : EmitsToProps<E>),
  Defaults = ExtractDefaultPropTypes<PropsOrPropOptions>
> = ComponentPublicInstanceConstructor<
  // 可以看到返回类型是一个ComponentPublicInstanceConstructor
  CreateComponentPublicInstance<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    PP & Props,
    Defaults,
    true
  > &
    Props
> &
  ComponentOptionsBase<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE,
    Defaults
  > &
  PP
// ...
```

建议动手下载一下源码，并去查看一下上面提到的一些类型，比如：`ComputedOptions`、`ComponentPublicInstanceConstructor`等等，想想为什么要这么写，想不到其实也没关系，其实这就是为了符合 TypeScript 的类型声明的理念。

通过查看`ComponentPublicInstanceConstructor`层层类型定义的嵌套，可以找到最终的一个类型定义

```ts package/runtime-core/src/componentPublicInstance.ts
// public properties exposed on the proxy, which is used as the render context
// in templates (as `this` in the render option)
export type ComponentPublicInstance<
  P = {}, // props type extracted from props option
  B = {}, // raw bindings returned from setup()
  D = {}, // return from data()
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  E extends EmitsOptions = {},
  PublicProps = P,
  Defaults = {},
  MakeDefaultsOptional extends boolean = false,
  Options = ComponentOptionsBase<any, any, any, any, any, any, any, any, any>
> = {
  $: ComponentInternalInstance
  $data: D
  $props: MakeDefaultsOptional extends true
    ? Partial<Defaults> & Omit<P & PublicProps, keyof Defaults>
    : P & PublicProps
  $attrs: Data
  $refs: Data
  $slots: Slots
  $root: ComponentPublicInstance | null
  $parent: ComponentPublicInstance | null
  $emit: EmitFn<E>
  $el: any
  $options: Options & MergedComponentOptionsOverride
  $forceUpdate: () => void
  $nextTick: typeof nextTick
  $watch(
    source: string | Function,
    cb: Function,
    options?: WatchOptions
  ): WatchStopHandle
} & P &
  ShallowUnwrapRef<B> &
  UnwrapNestedRefs<D> &
  ExtractComputedReturns<C> &
  M &
  ComponentCustomProperties
```

可以看到上面熟悉的：`$data`、`$refs`、`$parent`等等，这就是最终生成的组件的定义。

继续看主要内容：`defineComponent`，下面是四种不同的`defineComponent`函数的重载

```ts package/runtime-core/src/apiDefineComponent.ts
// defineComponent is a utility that is primarily used for type inference
// when declaring components. Type inference is provided in the component
// options (provided as the argument). The returned value has artificial types
// for TSX / manual render function / IDE support.

// overload 1: direct setup function
// (uses user defined props interface)
export function defineComponent<Props, RawBindings = object>(
  setup: (
    props: Readonly<Props>,
    ctx: SetupContext
  ) => RawBindings | RenderFunction
): DefineComponent<Props, RawBindings>

// 第一种是接收一个setup函数，其中props和ctx作为参数的入参。但是如果用过vue2的props就知道了，props需要通过一个对象去声明，而不能只用ts去声明，所以这种方法去使用的话会有问题，不推荐这样使用。

// overload 2: object format with no props
// (uses user defined props interface)
// return type is for Vetur and TSX support
export function defineComponent<
  Props = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = EmitsOptions,
  EE extends string = string
>(
  options: ComponentOptionsWithoutProps<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): DefineComponent<Props, RawBindings, D, C, M, Mixin, Extends, E, EE>

// 第二种：通过传入一个对象去定义，不传入props，只在对象里进行定义props的接口。但实际上也不推荐。

// overload 3: object format with array props declaration
// props inferred as { [key in PropNames]?: any }
// return type is for Vetur and TSX support
export function defineComponent<
  PropNames extends string,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string
>(
  options: ComponentOptionsWithArrayProps<
    PropNames,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): DefineComponent<
  Readonly<{ [key in PropNames]?: any }>,
  RawBindings,
  D,
  C,
  M,
  Mixin,
  Extends,
  E,
  EE
>

// 第三种：和第二种类似，但是对象里的props是一个列表，也就是: props: ['name', 'age'...] 这种写法，但是可以看到官方解释，这种方式得到的prop都是any类型，因为不推荐在ts里使用any类型，所以这种方式也不推荐使用。

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

// 如果使用ts去编写项目，最推荐使用这种方法，在options里定义props的定义。

// implementation, close to no-op
export function defineComponent(options: unknown) {
  return isFunction(options) ? { setup: options, name: options.name } : options
}

// 最后一行才是真正去实现defineComponent函数，如果传入一个函数，那么返回一个包装过的对象，如果是传入一个对象则直接返回该对象。
```

可以看到真正定义 `defineComponent` 函数的代码只有三行，其他的都是类型定义。

## 组件的定义

既然上面了解了`defineComponent`，那么现在尝试去使用一下这个函数，这是一个非常基础的组件的定义：

```ts
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: {
      type: String as PropType<string>,
    },
    age: {
      type: Number as PropType<number>,
    },
  },
})
```

上面的`String`，`Number`这些其实只是一个类，如果要符合 ts，最正统的应该加上`as`将该值视为 xxx 类型。如果有些场景不加 as 的话：

```ts
export default defineComponent({
  name: 'HelloWorld',
  props: {
    config: {
      type: Object,
    },
  },
  mounted() {
    this.config
  },
})
```

在 vscode 编辑器下，把鼠标放到：`this.config`上，可以看到 vscode 提示：`(property) config?: Record<string, any> | undefined`

说明如果不定义类型的话那么 config 的值将会是 any 类型。对于 ts 来说这样可以用，但是 any 对于我们来说始终是不好的东西。我们应该这样去做：

```ts
interface Config {
  name: string
}
export default defineComponent({
  props: {
    config: {
      type: Object as PropType<Config>,
    },
  },
  mounted() {
    this.config
  },
})
```

这样我们去看 config 的类型：`(property) config?: Config | undefined`。
可以看到该类型还有可能是`undefined`，如果不能让他为`undefined`只需要加上`required`。

```ts
export default defineComponent({
  props: {
    config: {
      type: Object as PropType<Config>,
      required: true,
    },
  },
})
```

最终我们看到 config 类型是：`(property) config: Config`，因为声明了该 prop 是必传的，所以他肯定是有值的，那就必不可能是`undefined`。
如果上面不设置，直接调用`this.config.name`那么 TS 编译器则会报错：`Object is possibly 'undefined'`。如果没有 required 去设置的话，你可能还要使用`if (this.config)`去调用`this.config.name`，那么如果有 required 的话将不再担心这些，可以直接去调用，这就是 ts 的好处。这样就能提高我们写代码的自信，因为 ts 没给我们报错，那么我们的代码出错的几率就会降低。

上面就是组件相关的一些内容，下一节开始将深入讲解 props。
