---
title: Vue3学习笔记（4）：setup函数
date: 2021-10-15 09:04:28
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Vue3
categories: Vue3
---

在看这个文章之前，建议先浏览一遍下面内容：
[官方文档：组合式 API 介绍](https://v3.cn.vuejs.org/guide/composition-api-introduction.html)
[官方文档：组合式 API setup](https://v3.cn.vuejs.org/guide/composition-api-setup.html)
[全面解析 Vue3 Reactive 家族和 Ref 家族 API](https://www.jianshu.com/p/cfe25e757d0e)

这篇文章会说到一些官方文档可能没写到的内容，但是可能对你后面学习 jsx/tsx 会很有用。

<!-- more -->

# setup 函数的运用

首先演示一下大致的用法：

```js HelloWorld.vue
<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h1>{{ name }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  setup(props, { slots, attrs, emit }) {
    // setup传入两个参数，props和ctx，
    // ctx包括：slots, attrs, emit这些属性
    const name = 'jack'
    return {
      name,
    }
  },
})
</script>
```

## reactive

根据官方的文档，data 里的东西可以放到 setup，但是如果我们想改变 name 的值呢，比如这样：

```js
let name = 'jack'
setInterval(() => {
  name += 1
}, 1000)
return {
  name,
}
```

但是我们发现界面上的 jack 并没有发生改变，这是因为 setup 在组件创建到挂在的过程中只会执行一次，而 return 这个对象的时候只是相当于把上面 name 的值也就是`'jack'`这个值放到了对象里面，相当于：

```js
return {
  name: 'jack',
}
```

那你改变 name 的值自然是没有效果的。这时候就需要用到 reactive api，将上面代码改成这样：

```js
<template>
  <div class="hello">
    <h1>{{ name.value }}</h1>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  setup() {
    let name = reactive({
      value: 'jack',
    })
    setInterval(() => {
      name.value += 1
    }, 1000)
    return {
      name,
    }
  },
})
</script>
```

然后发现很神奇的是界面可以随着时间发生改变了，也就是动态绑定成功了，这就是 vue3 响应式的最基础用法。

## ref

但是如果我们不想让这个 name 包一层对象那得怎么办呢，这时候就要用到 ref api 了，可以改成这样：

```js
<template>
  <div class="hello">
    <h1>{{ name }}</h1>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    let name = ref('jack')
    setInterval(() => {
      name.value += 1
    }, 1000)
    return {
      name,
    }
  },
})
</script>
```

可以看到其实也是有效果的。ref 实际上的原理很简单，也是和 reactive 类似，由 api 去帮你包一层对象，并返回一个代理。其中传进去的值包裹在：`{ value: 'jack' }`，所以可以看到在 setInterval 里面对 name 操作的话就需要使用`.value`来访问。而为什么模板又不用呢，那是因为 vue 编译器判断这是一个 ref 对象所以自动帮我们使用了`.value`。

## computed

其实这个 computed api 和 vue2 的很类似，直接上代码：

```js
<template>
  <div class="hello">
    <h1>{{ name }}</h1>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  setup() {
    let name = ref('jack')
    const computedName = computed(() => {
      return name.value + '2'
    })
    setInterval(() => {
      name.value += 1
    }, 1000)

    return {
      name: computedName,
    }
  },
})
</script>
```

可以看到，每当 name 发生改变的时候，computed 会帮我们重新计算值，这也是 computed 函数的一个用法。

## watchEffect

首先演示一下这个 api 怎么用，有啥效果：

```js
<template>
  <div class="hello">
    <h1>{{ name }}</h1>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from 'vue'

export default defineComponent({
  setup() {
    let name = ref('jack')
    const computedName = computed(() => {
      return name.value + '2'
    })
    setInterval(() => {
      name.value += 1
    }, 1000)
    watchEffect(() => {
      console.log(name.value)
    })
    return {
      name: computedName,
    }
  },
})
</script>
```

打开页面，打开控制台，在 setInterval 执行对 name.value 进行修改的时候，控制台会将 name.value 进行输出。
所以这个函数的作用是某个 ref 或者 reactive 变量的值发生改变的时候，会调用该函数。
值得注意的一点是 watchEffect 只会监听你写进去的变量，比如上面的 name。如果你创建了一个另一个 ref 对象，比如叫 age，然后同样对 age 进行操作但是 watchEffect 并没有将 age 写到该函数里面，会发现 watchEffect 函数并没有执行。
所以这个函数非常强大而且好用，相对于 vue2 的 watch 来说不再需要注意监听的东西是否是数组或者对象，是否深度监听对象里的属性或者数组里的值发生（deep），还有其他一堆的东西。你只需要把想要执行的代码写在里面即可，不再需要关系其他东西。

## setup 的一些补充

有一点要注意的是，setup 返回的是东西有点像 data 函数返回的对象。比如这样：

```js
// 省略上面的一些代码
export default defineComponent({
  mounted() {
    console.log(this.name)
  },
  setup(props) {
    let name = ref('jack')
    return {
      name,
    }
  },
})
```

你会发现控制台打印了一个`'jack'`出来，说明 setup 外部能拿到返回的值，是不是和 data 差不多，但是值得注意的是他打印出来的并不是一个 proxy 对象，也就是直接把 ref 对象里的值拿出来了，这算一个小坑。因为我们 setup 函数返回的是一个 ref，所以当我们拿出 ref 值的时候可能值会发生改变（比如在 mounted 生命周期前对 ref 进行操作）。

# 在 setup 里使用 render

比如之前写到 render 和 h 函数演示的代码，我们进行一点修改，使用上 setup：

```js
const App = defineComponent({
  setup() {
    const name = ref('jack')
    setInterval(() => {
      name.value += 1
    }, 1000)
    return () => {
      // 上面的return ()=>{}是指直接返回一个render函数
      return h('div', { id: 'app' }, [
        h('img', { alt: 'Vue logo', src: img }),
        h('p', name.value),
      ])
    }
  },
})
```

打开页面，可以发现效果和上面写的 sfc 组件是类似的，其实写 sfc 的时候编译器也会将模板代码、script 部分代码这些编译成类似的带 render 的 js 代码。

## 一些特性

假如我们改一下需求，代码写成这个样子:

```js
const App = defineComponent({
  setup() {
    const name = ref('jack')
    const num = ref(1)
    setInterval(() => {
      name.value += '1'
      num.value += 1
    }, 1000)
    return () => {
      return h('div', { id: 'app' }, [
        h('img', { alt: 'Vue logo', src: img }),
        h('p', name.value + num.value),
      ])
    }
  },
})
```

页面很正常，num 也能随着时间增长，但是有些同学为了方便，可能写成这样：

```js
const App = defineComponent({
  setup() {
    const name = ref('jack')
    const num = ref(1)
    setInterval(() => {
      name.value += '1'
      num.value += 1
    }, 1000)
    const numVal = num.value
    return () => {
      return h('div', { id: 'app' }, [
        h('img', { alt: 'Vue logo', src: img }),
        h('p', name.value + numVal),
      ])
    }
  },
})
```

你会发现，怎么 numVal 一直为 1，这是因为组件从创建到挂载，只会执行一次 setup 函数，我们可以改成这样：

```js
const App = defineComponent({
  setup() {
    const name = ref('jack')
    const num = ref(1)
    setInterval(() => {
      name.value += '1'
      num.value += 1
    }, 1000)
    return () => {
      const numVal = num.value
      return h('div', { id: 'app' }, [
        h('img', { alt: 'Vue logo', src: img }),
        h('p', name.value + numVal),
      ])
    }
  },
})
```

现在页面展示的 numVal 能随着值发生改变了。所以说如果把 numVal 写在 setup 函数里面的话，那么他永远只会是组件初始化时拿到的 1。
而当我们对 ref 对象进行修改的话，会导致组件重新执行 render 函数，这就是导致两种写法会有不一样效果的原因。
但其实这样写的代码是不太适合阅读的，现在这么写是为了后面学习使用 jsx 做好铺垫。
