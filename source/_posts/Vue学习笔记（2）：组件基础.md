---
title: Vue学习笔记（2）：组件基础
date: 2021-06-26 16:10:58
tags:
- JavaScript
- 前端
- 学习笔记
- Vue
categories: Vue
---

组件的简单使用，包括prop和插槽
(本文在vue2环境下)

<!-- more -->

# 基础实例
## 定义一个组件
```html
<div id="components-demo">
  <button-counter></button-counter>
</div>
```
```js
// 定义一个名为 button-counter 的新组件
Vue.component('button-counter', {
  data: function () {
    return {
      count: 0
    }
  },
  template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
})
new Vue({ el: '#components-demo' })
```
在vue2的option里，组件拥有 `data、computed、watch、methods` 以及生命周期钩子等属性。仅有的例外是像 `el` 这样根实例特有的选项。

组件的data选择必须是一个函数，通过return返回一份对象的拷贝。

使用 `Vue.component` 都是全局注册。

# Prop

## 通过Prop传递数据
在option中添加prop，然后父组件就可以通过定义的prop列表传递数据
```js
Vue.component('blog-post', {
  props: ['title'],
  template: '<h3>{{ title }}</h3>'
})
```
然后调用这个组件
```html
<blog-post title="My journey with Vue"></blog-post>
<blog-post title="Blogging with Vue"></blog-post>
<blog-post title="Why Vue is so fun"></blog-post>
```
渲染出来的结果：
```html
<div id="blog-post-demo" class="demo">
    <h3>My journey with Vue</h3> 
    <h3>Blogging with Vue</h3> 
    <h3>Why Vue is so fun</h3>
</div>
```
除了这样多次调用以外，还可以用v-for指令来生成多个组件。

如果需要传递多个属性的话建议传入对象：
```js
Vue.component('blog-post', {
  props: ['post'],
  template: `
    <div class="blog-post">
      <h3>{{ post.title }}</h3>
      <div v-html="post.content"></div>
    </div>
  `
})
```
```html
<blog-post
  v-for="post in posts"
  v-bind:key="post.id"
  v-bind:post="post"
></blog-post>
```

## prop单向数据流
父级prop的更新会流动到子组件，子组件可以响应式变化，但是反过来则不行。如果试图将prop作为一个本地的prop数据来用，不跟随父组件传入的数据改变，可以使用data：
```js
props: ['initialCounter'],
data: function () {
  return {
    counter: this.initialCounter
  }
}
```
这个 prop 以一种原始的值传入且需要进行转换。在这种情况下，最好使用这个 prop 的值来定义一个计算属性：
```js
props: ['size'],
computed: {
  normalizedSize: function () {
    return this.size.trim().toLowerCase()
  }
}
```

> 注意：对象和数组是通过引用传入的，如果子组件对一个引用对象、数组进行修改，是会影响到父组件的状态的！

## Prop验证
将原来的数组改成一个带有验证需求的对象，可以验证传入的数据是否满足需求，如果不满足将会在控制台中警告。
```js
Vue.component('my-component', {
  props: {
    // 基础的类型检查 (`null` 和 `undefined` 会通过任何类型验证)
    propA: Number,
    // 多个可能的类型
    propB: [String, Number],
    // 必填的字符串
    propC: {
      type: String,
      required: true
    },
    // 带有默认值的数字
    propD: {
      type: Number,
      default: 100
    },
    // 带有默认值的对象
    propE: {
      type: Object,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function () {
        return { message: 'hello' }
      }
    },
    // 自定义验证函数
    propF: {
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return ['success', 'warning', 'danger'].indexOf(value) !== -1
      }
    }
  }
})
```

type除了原生的属性以外，还可以是自定义的构造函数。
```js
function Person (firstName, lastName) {
  this.firstName = firstName
  this.lastName = lastName
}
```
```js
Vue.component('blog-post', {
  props: {
    author: Person
  }
})
```

# 监听子组件事件
展示一个子组件与父组件通过事件进行信息传递的实例：
```js
Vue.component('blog-post', {
  props: ['post'],
  template: `
    <div class="blog-post">
      <h3>{{ post.title }}</h3>
      <button v-on:click="$emit('enlarge-text')">
        Enlarge text
      </button>
      <div v-html="post.content"></div>
    </div>
  `
})
new Vue({
  el: '#blog-posts-events-demo',
  data: {
    posts: [/* ... */],
    postFontSize: 1
  }
})
```
```html
<div id="blog-posts-events-demo">
  <div :style="{ fontSize: postFontSize + 'em' }">
    <blog-post
      v-for="post in posts"
      v-bind:key="post.id"
      v-bind:post="post"
      v-on:enlarge-text="postFontSize += 0.1"
    ></blog-post>
  </div>
</div>
```
这样点击子组件的按钮时，会通知父组件，实现子组件到父组件的数据流。

## 使用事件抛出一个值
有的时候用一个事件来抛出一个特定的值是非常有用的。例如我们可能想让 <blog-post> 组件决定它的文本要放大多少。这时可以使用 $emit 的第二个参数来提供这个值：
```html
<button v-on:click="$emit('enlarge-text', 0.1)">
  Enlarge text
</button>
```
然后当在父级组件监听这个事件的时候，我们可以通过 $event 访问到被抛出的这个值：
```html
<blog-post
  ...
  v-on:enlarge-text="postFontSize += $event"
></blog-post>
```
或者，如果这个事件处理函数是一个方法：
```html
<blog-post
  ...
  v-on:enlarge-text="onEnlargeText"
></blog-post>
```
```js
methods: {
  onEnlargeText: function (enlargeAmount) {
    this.postFontSize += enlargeAmount
  }
}
```

## 在组件上使用 v-model
在 `<input>` 里用v-model相当于同时使用 `:value="xx"` `@input="xxx = $event.target.value"`
所以v-model当用在自己的组件上会变成：
```html
<custom-input
  v-bind:value="searchText"
  v-on:input="searchText = $event"
></custom-input>
```
为了让它正常工作，这个组件内的 `<input>` 必须：
* 将其 value attribute 绑定到一个名叫 value 的 prop 上
* 在其 input 事件被触发时，将新的值通过自定义的 input 事件抛出

在代码里面是这样：
```js
Vue.component('custom-input', {
  props: ['value'],
  template: `
    <input
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
    >
  `
})
```
这样子v-model应该就能正常工作了：
```html
<custom-input v-model="searchText"></custom-input>
```

# 插槽 / slot
插槽的基本内容很简单，直接上代码
```html
<!-- 当我们需要向一个组件传递内容怎么办？ -->
<alert-box>
  Something bad happened.
</alert-box>
```
实现这个 `alert-box` 的方法很简单：
```js
Vue.component('alert-box', {
  template: `
    <div class="demo-alert-box">
      <strong>Error!</strong>
      <slot></slot>
    </div>
  `
})
```
`<slot>`的作用也很简单，如果没有这个标签那么传进来的内容都会被丢弃（起始标签和结束标签之间的任何内容）。

## 默认内容
有时候我们需要在不传内容进来时，插槽需要提供默认的内容，实现这个功能也很简单，只需要将内容填入`<slot></slot>`之间。
```html
<button type="submit">
  <slot>Submit</slot>
</button>
```
比如上面的`<submit-button>`子组件，插槽提供了默认的内容，那么调用时不提供插槽内容时：
```html
<submit-button></submit-button>
```
将会渲染成
```html
<button type="submit">
  Submit
</button>
```
但是如果提供内容：
```html
<submit-button>save</submit-button>
```
则会渲染成：
```html
<button type="submit">
  Save
</button>
```

## 具名插槽 / 命名插槽
当我们需要多个插槽时，就需要使用命名插槽，直接上例子，比如我们需要一个带如下模板的`<base-layout>`组件：
```html
<div class="container">
  <header>
    <!-- 我们希望把页头放这里 -->
  </header>
  <main>
    <!-- 我们希望把主要内容放这里 -->
  </main>
  <footer>
    <!-- 我们希望把页脚放这里 -->
  </footer>
</div>
```
那么这时候就需要使用slot的一个attribute：`name`，将上面代码改成：
```html
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```
中间没有命名的slot其实有个默认的名称：default
然后在向插槽提供内容是，在一个 `<template>` 元素上使用 `v-slot` 指定名称即可，请注意语法：
```html
<base-layout>
  <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>

  <p>A paragraph for the main content.</p>
  <p>And another one.</p>

  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```
或者更明确一点：
```html
<base-layout>
  <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>

  <template v-slot:default>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
  </template>

  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

> 注意，上面的`v-slot:xxx`语法是2.6.0之后的语法，在此之前的`slot=""` 语法以及被废弃，同样 `slot-scope=""` 的语法也变成 `v-slot=""`，两个合起来用就是 `v-slot:xxx="xxx"`。

# 动态组件
有时候我们需要在不同的组件之间进行动态切换。只需要设置一个特殊的 `is` attribute即可，直接上代码：
```html
<div id="dynamic-component">
  <button @click="currentComponent = 'first-component'">第一个组件</button>
  <button @click="currentComponent = 'second-component'">第二个组件</button>
  <component :is="currentComponent"></component>
</div>
```
```js
Vue.component('first-component', {
  template: `<div id='blog-post'>
  我是第一个组件
  </div>
  `
})
Vue.component('second-component', {
  template: `<div id='blog-post'>
  我是第二个组件
  </div>
  `
})
new Vue({
  el: '#dynamic-component',
  data: {
    currentComponent: 'first-component',
  }
})
```


> 以上就是组件的基本内容，但是还有很多内容需要去了哦！下一小节补充组件注册和动态组件&异步组件

参考资料：
[VUE官方文档：组件基础](https://cn.vuejs.org/v2/guide/components.html)
[VUE官方文档：Prop](https://cn.vuejs.org/v2/guide/components-props.html)
[VUE官方文档：插槽](https://cn.vuejs.org/v2/guide/components-slots.html)
