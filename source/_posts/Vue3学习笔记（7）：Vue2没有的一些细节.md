---
title: Vue3学习笔记（7）：Vue2没有的或者改变的一些细节
date: 2022-08-19 11:29:10
tags:
  - 前端
  - 学习笔记
  - Vue3
categories: Vue3
---

# 基础

## v-bind 动态绑定多个值

```js
const objectOfAttrs = {
  id: 'container',
  class: 'wrapper',
}
```

```html
<div v-bind="objectOfAttrs"></div>
```

## v-for

使用解构

```html
<li v-for="{ message } in items">{{ message }}</li>

<!-- 有 index 索引时 -->
<li v-for="({ message }, index) in items">{{ message }} {{ index }}</li>
```

使用 of 代替 in

```html
<div v-for="item of items"></div>
```

# v-for 和 v-if 优先级

vue2 中 v-for 的优先级比 v-if 更高，这意味着 v-if 将分别重复运行于每个 v-for 循环中。

vue3 中 v-if 比 v-for 的优先级更高，这意味着 v-if 的条件将无法访问到 v-for 作用域内定义的变量别名：

```html
<!--
 vue3中这会抛出一个错误，因为属性 todo 此时
 没有在该实例上定义
-->
<li v-for="todo in todos" v-if="!todo.isComplete">{{ todo.name }}</li>
```

应该改成:

```html
<template v-for="todo in todos">
  <li v-if="!todo.isComplete">{{ todo.name }}</li>
</template>
```

# 事件处理

## 在内联事件处理器中访问事件参数

vue2 文档好像没写可以传入一个箭头函数，vue3 可以通过传入箭头函数。

```html
<!-- 使用特殊的 $event 变量 -->
<button @click="warn('Form cannot be submitted yet.', $event)">Submit</button>

<!-- 使用内联箭头函数 -->
<button @click="(event) => warn('Form cannot be submitted yet.', event)">
  Submit
</button>
```

```js
function warn(message, event) {
  // 这里可以访问原生事件
  if (event) {
    event.preventDefault()
  }
  alert(message)
}
```

# v-model 自定义修饰符

在在学习输入绑定时，我们知道了 v-model 有一些内置的修饰符，例如 .trim，.number 和 .lazy。在某些场景下，你可能想要一个自定义组件的 v-model 支持自定义的修饰符。

我们来创建一个自定义的修饰符 capitalize，它会自动将 v-model 绑定输入的字符串值第一个字母转为大写：

```vue
<MyComponent v-model.capitalize="myText" />
```

组件的 v-model 上所添加的修饰符，可以通过 modelModifiers prop 在组件内访问到。在下面的组件中，我们声明了 modelModifiers 这个 prop，它的默认值是一个空对象：

```html
<script setup>
  const props = defineProps({
    modelValue: String,
    modelModifiers: { default: () => ({}) },
  })

  defineEmits(['update:modelValue'])

  console.log(props.modelModifiers) // { capitalize: true }
</script>

<template>
  <input
    type="text"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
```

注意这里组件的 modelModifiers prop 包含了 capitalize 且其值为 true，因为它在模板中的 v-model 绑定上被使用了。

有了 modelModifiers 这个 prop，我们就可以在原生事件侦听函数中检查它的值，然后决定触发的自定义事件中要向父组件传递什么值。在下面的代码里，我们就是在每次 `<input>` 元素触发 input 事件时将值的首字母大写：

```html
<script setup>
  const props = defineProps({
    modelValue: String,
    modelModifiers: { default: () => ({}) },
  })

  const emit = defineEmits(['update:modelValue'])

  function emitValue(e) {
    let value = e.target.value
    if (props.modelModifiers.capitalize) {
      value = value.charAt(0).toUpperCase() + value.slice(1)
    }
    emit('update:modelValue', value)
  }
</script>

<template>
  <input type="text" :value="modelValue" @input="emitValue" />
</template>
```

对于又有参数又有修饰符的 v-model 绑定，生成的 prop 名将是 arg + "Modifiers"。举例来说：

```html
<MyComponent v-model:title.capitalize="myText"></MyComponent>
```

```js
const props = defineProps(['title', 'titleModifiers'])
defineEmits(['update:title'])

console.log(props.titleModifiers) // { capitalize: true }
```

# 生命周期

## 注册周期钩子

不能异步注册周期钩子，钩子应当在组件初始化时被同步注册，比如：

```js
setTimeout(() => {
  onMounted(() => {
    // 异步注册时当前组件实例已丢失
    // 这将不会正常工作
  })
}, 100)
```

注意这并不意味着对 onMounted 的调用必须放在 setup() 或 `<script setup>` 内的词法上下文中。onMounted() 也可以在一个外部函数中调用，只要调用栈是同步的，且最终起源自 setup() 就可以。

# 模板引用

## 函数模板引用

除了使用字符串值作名字，`ref` attribute 还可以绑定为一个函数，会在每次组件更新时都被调用。该函数会收到元素引用作为其第一个参数：

```html
<input :ref="(el) => { /* 将 el 赋值给一个数据属性或 ref 变量 */ }" />
```

注意我们这里需要使用动态的 :ref 绑定才能够传入一个函数。当绑定的元素被卸载时，函数也会被调用一次，此时的 el 参数会是 null。你当然也可以绑定一个组件方法而不是内联函数。
