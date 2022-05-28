---
title: Vue学习笔记（3）：组件基础拓展
date: 2021-06-28 16:49:27
tags:
- JavaScript
- 前端
- 学习笔记
- Vue
categories: Vue
---

这节补充一下组件注册和动态组件&异步组件

<!-- more -->

# 组件注册
在上一章展示了使用 `Vue.component('my-component-name', {...})` 进行全局注册。全局注册之后可以用在任何新创建的 Vue 根实例 `new Vue()` 的模板中。
```js
Vue.component('component-a', { /* ... */ })
Vue.component('component-b', { /* ... */ })
Vue.component('component-c', { /* ... */ })
new Vue({ el: '#app' })
```
```html
<div id="app">
  <component-a>
    <component-b>
      <component-c></component-c>
    </component-b>
  </component-a>
  <component-b>
    <component-a></component-a>
  </component-b>
  <component-c></component-c>
</div>
```
在所有子组件中也是如此，也就是说这三个组件在各自内部也都可以相互使用。

## 局部注册
局部注册的缺点就是使用像webpack这样的构建系统时，就算不需要使用一个组件但是它仍然在构建结果中。这造成了用户下载的 JavaScript 的无谓的增加。
而使用局部注册的方法就是使用 `components` 属性进行注册：
```js
new Vue({
  el: '#app',
  components: {
    'component-a': ComponentA,
    'component-b': ComponentB
  }
})
```
如果通过babel和webpack使用es6的话，可以这样：
```js
import ComponentA from './ComponentA.vue'

export default {
  components: {
    ComponentA
  },
  // ...
}
```

# 动态组件 & 异步组件
## 使用 keep-alive
在上一篇的实例：`<component v-bind:is="currentComponent"></component>` 中，每当切换组件时都会导致组件重新渲染，导致不必要的性能浪费。
使用 `<keep-alive>` 可以将组件在第一次被创建时缓存下来：
```html
<div id="dynamic-component">
  <button @click="currentComponent = 'first-component'">第一个组件</button>
  <button @click="currentComponent = 'second-component'">第二个组件</button>
  <keep-alive>
    <component :is="currentComponent"></component>
  </keep-alive>
</div>
```

> 注意这个 `<keep-alive>` 要求被切换到的组件都有自己的名字，不论是通过组件的 name 选项还是局部/全局注册。

## 异步组件
在大型应用中，我们可能需要将应用分割成小一些的代码块，并且只在需要的时候才从服务器加载一个模块。
一个推荐的做法就是将异步组件和 webpack 的 code-splitting 功能一起配合使用：
```js
Vue.component('async-webpack-example', function (resolve) {
  // 这个特殊的 `require` 语法将会告诉 webpack
  // 自动将你的构建代码切割成多个包，这些包
  // 会通过 Ajax 请求加载
  require(['./my-async-component'], resolve)
})
```
也可以在工厂函数中返回一个 Promise，所以把 webpack 2 和 ES2015 语法加在一起，可以这样使用动态导入：
```js
Vue.component(
  'async-webpack-example',
  // 这个动态导入会返回一个 `Promise` 对象。
  () => import('./my-async-component')
)
```
当使用局部注册的时候，也可以直接提供一个返回 Promise 的函数：
```js
new Vue({
  // ...
  components: {
    'my-component': () => import('./my-async-component')
  }
})
```

## 处理加载状态
这里的异步组件工厂函数也可以返回一个如下格式的对象：
```js
const AsyncComponent = () => ({
  // 需要加载的组件 (应该是一个 `Promise` 对象)
  component: import('./MyComponent.vue'),
  // 异步组件加载时使用的组件
  loading: LoadingComponent,
  // 加载失败时使用的组件
  error: ErrorComponent,
  // 展示加载时组件的延时时间。默认值是 200 (毫秒)
  delay: 200,
  // 如果提供了超时时间且组件加载也超时了，
  // 则使用加载失败时使用的组件。默认值是：`Infinity`
  timeout: 3000
})
```
