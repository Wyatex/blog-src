---
title: Vue学习笔记（1）：基本指令
date: 2020-10-18 21:04:04
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Vue
categories: Vue
---

vue 指令的说明和用法

<!-- more -->

# 数据&方法

实例化 Vue 对象

```js
new Vue({
  el: '#app',
  data: {
    name: 'Wyatex',
    job: '程序员',
  },
  methods: {
    world: () => console.log('The World!'),
    add: (x, y) => x + y,
    myJob: function () {
      return this.job
    },
  },
})
```

el: element 需要获取的元素，一定是 html 中的根容器元素
data: 用于数据的存储
methods: 用于存放方法

在 html 中：

```html
<body>
  <div id="app">
    <h1>My name is {{name}}</h1>
    {{world()}}
    <p>{{add(1,2)}}</p>
    <p>my job is {{myJob()}}</p>
  </div>
  <script src="xx.js"></script>
</body>
```

# v-text

和上面的`{{xxx}}`用法差不多

```html
<span v-text="msg"></span>
<!-- 和下面的一样 -->
<span>{{msg}}</span>
```

# 属性绑定 v-bind

在 vue 实例化里的 data 里添加：`url: "http://baidu.com"`
在 html 的 app 容器里添加`<a v-bind:href="url">百度</a>`
这样就可以把 data 里的数据绑定到 html 里

# html 标签绑定

在 data 里存放标签：`tag: "<a href="http://baidu.com">百度</a>"`
然后在 html 里用另一个标签然后使用 v-html 绑定：`<div v-html="tag"></div>`

> 官方提示：在网站上动态渲染任意 HTML 是非常危险的，因为容易导致 XSS 攻击。只在可信内容上使用 v-html，永不用在用户提交的内容上。

# 事件

重新开始初始化 vue 实例

```js
new Vue({
  el: '#app',
  data: {
    age: '21',
  },
  methods: {
    sub: function (a) {
      this.age -= a
    },
    addTen: function () {
      this.age -= 10
    },
  },
})
```

```html
<div id="app">
  <h1>My age is {{age}}</h1>
  <button v-on:click="age++">涨一岁</button>
  <button v-on:click="ageTen">涨十岁</button>
  <button v-on:click="sub(1)">减一岁</button>
  <button v-on:dblclick="sub(10)">双击减十岁</button>
</div>
```

在 v-on 中调用的方法可以不用加括号，但是在数据绑定就必须要使用括号才能正确调用方法

还有一些其他的事件

```html
<div id="app">
  <div id="block" v-on:mousemove="getXY">{{x}},{{y}}</div>
</div>
```

```js
new Vue({
  el: '#app',
  data: {
    x: 0,
    y: 0,
  },
  methods: {
    getXY: function (e) {
      this.x = e.offsetX
      this.y = e.offsetY
    },
  },
})
```

> v-on 可以简写成@，比如`@click`、`@mousemove`

# 事件修饰符

停止事件的一种方法：

```html
<div id="app">
  <div id="block" v-on:mousemove="getXY">
    {{x}},{{y}} - <span @mousemove="stopUpdate">Stop Updata</span>
  </div>
</div>
```

```js
new Vue({
  el: '#app',
  data: {
    x: 0,
    y: 0,
  },
  methods: {
    getXY: function (e) {
      this.x = e.offsetX
      this.y = e.offsetY
    },
    stopUpdate: (e) => {
      e.stopPropagation()
    },
  },
})
```

但是可以用更方便的 stop 修饰符：

```html
<div id="app">
  <div id="block" v-on:mousemove="getXY">
    {{x}},{{y}} - <span @mousemove.stop="">Stop Updata</span>
  </div>
</div>
```

还有比如 once 修饰符，也就是调用的方法只能调用一次，第二次以后的方法都不会再调用方法

官方介绍：

```html
<!-- 阻止单击事件继续传播 -->
<a v-on:click.stop="doThis"></a>

<!-- 提交事件不再重载页面 -->
<form v-on:submit.prevent="onSubmit"></form>

<!-- 修饰符可以串联 -->
<a v-on:click.stop.prevent="doThat"></a>

<!-- 只有修饰符 -->
<form v-on:submit.prevent></form>

<!-- 添加事件监听器时使用事件捕获模式 -->
<!-- 即内部元素触发的事件先在此处理，然后才交由内部元素进行处理 -->
<div v-on:click.capture="doThis">...</div>

<!-- 只当在 event.target 是当前元素自身时触发处理函数 -->
<!-- 即事件不是从内部元素触发的 -->
<div v-on:click.self="doThat">...</div>
```

prevent 可以阻止默认事件，比如可以在 a 标签中使用`v-on:click.prevent=""`可以阻止跳转

> 2.3.0 新增：
> Vue 还对应 addEventListener 中的 passive 选项提供了 .passive 修饰符。

```html
<!-- 滚动事件的默认行为 (即滚动行为) 将会立即触发 -->
<!-- 而不会等待 `onScroll` 完成  -->
<!-- 这其中包含 `event.preventDefault()` 的情况 -->
<div v-on:scroll.passive="onScroll">...</div>
```

这个 .passive 修饰符尤其能够提升移动端的性能。

# 键盘事件和修饰符

## 键盘事件

keyup：在松开键盘时会调用方法

```html
<input v-on:keyup="inputting" />
```

这样每次输入一个字符或者按下其他键时会调用 inputting 方法

在监听键盘事件时，我们经常需要检查详细的按键。Vue 允许为 v-on 在监听键盘事件时添加按键修饰符：

```html
<!-- 只有在 `key` 是 `Enter` 时调用 `vm.submit()` -->
<input v-on:keyup.enter="submit" />
```

当然还有 keydown，就是按下键盘时触发
keypress 就是按住时不断触发

## 键盘修饰符

vue 支持的一些修饰符：

- .enter
- .tab
- .delete (捕获“删除”和“退格”键)
- .esc
- .space
- .up
- .down
- .left
- .right

还可以通过全局 config.keyCodes 对象自定义按键修饰符别名：

```html
// 可以使用 `v-on:keyup.f1` Vue.config.keyCodes.f1 = 112
```

> 2.1.0 新增

可以用如下修饰符来实现仅在按下相应按键时才触发鼠标或键盘事件的监听器。

- .ctrl
- .alt
- .shift
- .meta

```html
<!-- Alt + C -->
<input v-on:keyup.alt.67="clear" />

<!-- Ctrl + Click -->
<div v-on:click.ctrl="doSomething">Do something</div>
```

> 在 Mac 系统键盘上，meta 对应 command 键 (⌘)。在 Windows 系统键盘 meta 对应 Windows 徽标键 (⊞)。

# 双向数据绑定

## ref

通过 ref 属性可以将标签绑定到 vm.$refs 里

```html
<label>姓名：</label>
<input ref="name" type="text" v-on:keyup="print" />
<p>My name is {{name}}</p>
```

```js
// ...
print: function() {
    this.name = this.$refs.name.value
}
```

## v-model

也可以去掉 v-on 使用 v-model 来进行绑定

```html
<input v-model="name" type="text" />
<p>My name is {{name}}</p>
```

# 动态绑定 css 样式 v-bind

绑定 css 的方法是`v-bind:class="xxx:true/false"`
比如

```html
<div v-bind:class="{red:true, blue:false}"></div>
```

那么这样整个 div 就会绑定到 red 类
如果需要动态的话就可以绑定一些方法：

```html
<div v-bind:class="{red:changeColor}" v-on="changeColor = !changeColor"></div>
```

假如 div 默认蓝色，也就是 changeColor 默认是 false，点击后 div 后 div 就能加上 red 的类。

# v-if

官方介绍：根据表达式的值的 truthiness 来有条件地渲染元素。在切换时元素及它的数据绑定 / 组件被销毁并重建。如果元素是 <template>，将提出它的内容作为条件块。

```html
<div v-if="xxx">xxx为true</div>
```

这样当 data 里的 xxx 为真时，整个 div 就会显示

# v-show

和 v-if 不一样的是，v-show 是设置 display 进行隐藏和显示，而 v-if 是整个组件销毁或者重建。

# v-for

我们可以用 v-for 指令基于一个数组来渲染一个列表。v-for 指令需要使用 `item in items` 或者 `(item, index) in items` 形式的特殊语法，其中 items 是源数据数组，而 item 则是被迭代的数组元素的别名。

```html
<ul id="example-1">
  <li v-for="item in items" :key="item.message">{{ item.message }}</li>
</ul>
```

```js
var example1 = new Vue({
  el: '#example-1',
  data: {
    items: [{ message: 'Foo' }, { message: 'Bar' }],
  },
})
```

```html
<ul id="example-2">
  <li v-for="(item, index) in items">
    {{ parentMessage }} - {{ index }} - {{ item.message }}
  </li>
</ul>
```

```js
var example2 = new Vue({
  el: '#example-2',
  data: {
    parentMessage: 'Parent',
    items: [{ message: 'Foo' }, { message: 'Bar' }],
  },
})
```

也可以用 `value in object`、`(value, name) in object`、`(value, name, index) in object` 来遍历对象的 property，会按 `Object.keys()` 的结果遍历对象。

在 2.2.0 之后的版本，v-for 必须使用 key：[VUE 中演示 v-for 为什么要加 key](https://www.jianshu.com/p/4bd5e745ce95)

也可以使用值范围，比如：

```html
<div>
  <span v-for="n in 10">{{ n }} </span>
</div>
```

# 总结

- v-text：用于绑定一个字符串，在页面中显示为字符串，和`{{}}`效果一样
- v-html: 用于将一个字符串格式的 html 显示在页面并渲染出来
- v-on: 用于绑定事件，用法是 v-on:事件名称="调用的方法"，可以缩写成`@`，比如@click
- v-if: 绑定 vue 实例里的一个变量，变量为真就渲染出来，为假就之前销毁
- v-show: 和 v-if 看上去效果差不多，但是不同之处在于 show 只会设置 display 属性，不会销毁
- v-for: 遍历一个数组，并在 html 中一个一个渲染出来
- b-bind: 用于绑定属性，也可以绑定类，不过绑定类一般传入一个对象，对象里一般是`成员: 布尔值`，为真就为便签加上整个类，可缩写成 `:`
- v-once: 第一次渲染之后便不会改变
- v-model: v-model 指可以在表单 <input>、<textarea> 及 <select> 元素上创建双向数据绑定。
- v-solt：2.6 之后插槽指令，可缩写成 `#`
