---
title: ts笔记（7）：使用TS编进行Vue开发的常见知识点
date: 2022-07-26 19:37:40
updated: 2023-07-25 08:59:59
tags:
  - TypeScript
  - 前端
  - 学习笔记
  - Vue3
categories: TypeScript
---

可能很多人学完了 TS 之后想使用 vue 进行开发，但开发过程中可能会遇到非常多的问题，甚至有些在网上都找不到解决方法，这里总结一些比较常见的知识点，看完之后相信你也能快速上手 vue-ts 开发。

如果还没学过 TS 基础的小伙伴简易先根据[TypeScript](/categories/TypeScript/)目录里的内容学习一下 TS 基础语法，当然除了 TS 之外还需要学习一下 Vue3 的基础语法。下面的所有用例都是基于 setup 语法糖进行讲解和演示。

<!-- more -->

# 梦的开始

既然需要学习 vue 和 ts，那么使用 vite 的推荐项目模板是最方便的，而且没有其他杂七杂八的东西干扰你：

```
pnpm create vite
# 创建个vue-ts-test项目 选择vue-ts
cd vue-ts-test
pnpm install
pnpm run dev
```

这时候整个项目就跑起来了，接下来就开始正式学习 ts

# 给响应式提供类型

可以先打开 `src/components/HelloWorld.vue`，看到第 6 行（未来可能会变）：`const count = ref(0)`。在 vscode 编辑器或者 webstorm 打开后，把鼠标移到 count 可以看到：`const count: Ref<number>`，说明这是一个响应式 ref 变量而且 value 的类型是 number。这是 ref 函数的类型推导功能，一般来说传入任何基础类型字面量都能推导出正确的类型。

现在有个需求，可能你的 count 不仅需要存一个 number，还有可能是 string，那么只需要改成：`const count = ref<string | number>(0)`，可以看出这是一个泛型，传入的类型都会作为 value 的类型。还有个注意点是如果 ref 不传参的话 value 还有可能是 undefined，比如这样写：`const count = ref<number>()`，类型推导得出：`const count: Ref<number | undefined>`

vue3 除了 ref 之外还能使用 reactive 方法实现响应式，不过 reactice 一般是传入一个对象，所以一般会这样用：

```ts
interface Obj {
  name?: string;
  age: number;
}
const obj: Obj = reactive({
  age: 123,
});
```

除了这两个方法之外，vue3 还有一个非常好用的工具：computed 方法，它也有类型推导，使用方法如下：

```ts
// 推导得到的类型：ComputedRef<number>
const doubleCount = computed(() => count.value * 2);
// => TS Error: Property 'split' does not exist on type 'number'
const result = double.value.split("");
// 还可以通过泛型参数指定返回类型
const double = computed<number>(() => {
  // 若返回值不是 number 类型则会报错
});
```

# setup 编译宏

## defineProps

同样看到`src/components/HelloWorld.vue`的第 4 行，`defineProps<{ msg: string }>()`，在 setup 语法糖中，使用一个 defineProps 宏函数定义组件的类型，相当于 vue2 中的：

```js
export default {
  props: {
    msg: {
      type: String,
      require: true,
    },
  },
};
```

当然如果想让 msg 可以不传入的话，可以这样：`defineProps<{ msg?: string }>()`

如果还需要默认值的话可以这样：

```ts
withDefaults(defineProps<{ msg?: string }>(), {
  msg: "hello",
});
```

如果你需要在 setup 中拿到 props 的值可以这样：

```ts
const props = defineProps<{ age: string }>(); // withDefaults也是一样
const myComputed = computed(() => props.age * 2);
// 这样myComputed可以响应式的根据传入的props进行计算
```

vue3.3 版本之后，defineProps 可以接受泛型：

```
 //-------------父组件-----------------
 <Child :name="['xiaoman']"></Child>

 //-------------子组件-----------------
 <template>
 <div>
     {{ name }}
 </div>
</template>
 <script generic="T"  lang='ts' setup>
 defineProps<{
    name:T[]
 }>()
</script>
```

这样，这里的 T 就是 `string[]` 类型了

## defineEmits

子组件定义 emit 类型：

```ts
const emit = defineEmits(["send"]);
const send = () => {
  // 通过派发事件，将数据传递给父组件
  emit("send", "我是子组件的数据");
};
```

父组件监听事件

```
<template>
 <div>
    <Child @send="getName"></Child>
 </div>
</template>
 <script lang='ts' setup>
 import Child from './views/child.vue'
 const getName = (name: string) => {
     console.log(name)
 }
</script>
```

子组件 TS 字面量模式派发

```ts
const emit = defineEmits<{
  (event: "send", name: string): void;
}>();
const send = () => {
  // 通过派发事件，将数据传递给父组件
  emit("send", "我是子组件的数据");
};
```

Vue3.3 新写法更简短

```ts
const emit = defineEmits<{
  send: [name: string];
}>();
const send = () => {
  // 通过派发事件，将数据传递给父组件
  emit("send", "我是子组件的数据");
};
```

## defineExpose

导出一些组件内的内容

```ts Child.vue
defineExpose({
  name: "张三",
});
```

父组件：

```Parent.vue
<template>
 <div>
    <child ref="child">派发事件</child>
 </div>
</template>
<script lang='ts' setup>
import Child from './views/child.vue'
const child = ref<InstanceType<typeof Child>>();
const getName = () => {
    console.log(child.value?.name)
}
</script>
```

## defineSlots

子组件 defineSlots 只做声明不做实现 同时约束 slot 类型

```Child.vue
<template>
 <div>
     <ul>
        <li v-for="(item,index) in data">
            <slot :index="index" :item="item"></slot>
        </li>
     </ul>
 </div>
</template>
 <script generic="T"  lang='ts' setup>
defineProps<{
    data: T[]
}>()
defineSlots<{
   default(props:{item:T,index:number}):void
}>()
</script>
```

```Parent.vue
<template>
    <div>
        <Child :data="list">
            <template #default="{item}">
                   <div>{{ item.name }}</div>
            </template>
        </Child>
    </div>
</template>
<script lang='ts' setup>
import Child from './views/child.vue'
const list = [
    {
        name: "张三"
    },
    {
        name: "李四"
    },
    {
        name: "王五"
    }
]
</script>
```

## defineOptions

Vue3.3 新指令，常用的就是定义 name 在 seutp 语法糖模式发现 name 不好定义了需要在开启一个 script 自定义 name 现在有了 defineOptions 就可以随意定义 name 了

```ts
defineOptions({
  name: "Child",
  inheritAttrs: false,
});
```

## defineModel

由于该API处于实验性特性 可能会被删除暂时不讲
