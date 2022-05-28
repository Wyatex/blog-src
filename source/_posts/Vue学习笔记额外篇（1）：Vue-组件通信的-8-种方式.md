---
title: Vue学习笔记额外篇（1）：Vue 组件通信的 8 种方式
date: 2021-08-02 11:01:33
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Vue
categories: Vue
---

简单介绍
{% asset_img 1.png %}

<!-- more -->

# 父组件 向 子组件 传递值

步骤：

- 在父组件中引入子组件
- 注册子组件
- 在页面中使用，子组件标签上 动态绑定传入动态值 / 静态值
- 在子组件中，使用 props 来接受 父组件 传递过了的值

子组件接收的父组件的值分为引用类型和普通类型两种：

- 普通类型：字符串（String）、数字（Number）、布尔值（Boolean）、空（Null）
- 引用类型：数组（Array）、对象（Object）

```js father.vue
<template>
  <div>
    <!-- 传递值 -->
    <Test
     :obj="obj"
     info="测试"/>
  </div>
</template>

<script>
// 引入子组件
import Test from './children.vue';
export default {
  name: "about",
  // 注册子组件
  components: {
    Test,
  },
  data() {
    return {
      obj: {
        code: 200,
        title: "一起自学Vue吧！",
      },
    };
  },
};
</script>
```

```js children.vue
<template>
    <div>
        <h1>{{obj.code}}</h1><br>
        <h2>{{obj.title}}</h2>
        <h3>{{info}}</h3>
    </div>
</template>

<script>
    export default {
        name:'test',
        props:{
            obj:Object,
            info: [String,Number]  //info值为其中一种类型即可，其他类型报警告
        }
    }
</script>
```

> 由于 Vue 是 单向数据流， 子组件 是不能直接 修改 父组件 的 值。

# 子组件 向 父组件 传递值

子组件通过绑定事件，通过 this.$emit('函数名'，传递参数)

```js father.vue
<template>
    <Test
        :obj="obj"
        info="测试"
        @modify="modifyFatherValue">
</template>

<script>
// 引入子组件
import Test from "./children.vue";
export default {
  name: "about",
  // 注册子组件
  components: {
    Test,
  },
  data() {
    return {
      msg:'我是父组件'
    };
  },
  methods:{
    // 接受子组件传递来的值，赋值给data中的属性
    modifyFatherValue(e){
      console.log(e)
    }
  }
};
</script>
```
```js children.vue
<template>
    <div>
        <h1>{{obj.code}}</h1><br>
        <h2>{{obj.title}}</h2>
        <h3>{{info}}</h3>
    </div>
</template>

<script>
    export default {
        name:'test',
        props:{
            obj:Object,
            info: [String,Number]  //info值为其中一种类型即可，其他类型报警告
        }
    }
</script>
```

# 父组件 通过 $refs / $children 来获取子组件值
$refs :
* 获取DOM 元素 和 组件实例来获取组件的属性和方法。
* 通过在 子组件 上绑定 ref ，使用 this.$refs.refName.子组件属性 / 子组件方法

$children :
* 当前实例的子组件，它返回的是一个子组件的集合。如果想获取哪个组件属性和方法，可以通过 this.$children[index].子组件属性/f方法

```js text1.vue
<script>
    export default {
        name:'test',
        data() {
            return {
                datas:"我是子组件值"
            }
        },
        props:{
            obj:Object,
            info: [String,Number]
        },
        methods:{
            getValue(){
                console.log('我是Test1')
            }
        }
    }
</script>
```
```js text2.vue
<template>
    <div>
        <h1>我是Test2</h1>
    </div>
</template>

<script>
    export default {
        name:'test',
        data() {
            return {
                datas:"我是Test2"
            }
        },
        created(){
         console.log( this.$parent.obj ) 
         this.$parent.getQuery()
        },
        methods:{
            getTest2(){
                console.log(this.datas)
            }
            
        }
    }
</script>
```
使用示例：
```js
<template>
  <div>
   // 给子组件上绑定 ref  
    <Test1
      ref="son"
    />
   <Test2/>
  </div>
</template>

<script>
// 省略注册等代码
// 使用$refs示例
console.log( this.$refs.son.datas)  // 输出：我是子组件值
this.$refs.son.getValue()           // 输出：我是Test1
// 使用$children示例
this.$children[0].getValue(); // 我是 Test1
this.$children[1].getTest2();  //我是 Test2
console.log(`${this.$children[1].datas}`); //我是Test2
</script>
```

# 子组件 通过 $parent 来获取父组件实例的属性和方法

```js children.vue
<script>
    export default {
        name:'test',
        created(){
         console.log( this.$parent.obj ) 
         this.$parent.getQuery()
        },
    }
</script>
```

# $attrs 和 $listeners 获取父组件实例属性和方法(组件嵌套情况下使用)
**$attrs**：包含了父作用域中不被认为 (且不预期为) props 的特性绑定 (class 和 style 除外)，并且可以通过 v-bind=” $attrs” 传入内部组件。当一个组件没有声明任何 props 时，它包含所有父作用域的绑定 (class 和 style 除外)。

**$listeners**：包含了父作用域中的 (不含 .native 修饰符) v-on 事件监听器。它可以通过 v-on=”$listeners” 传入内部组件。它是一个对象，里面包含了作用在这个组件上的所有事件监听器，相当于子组件继承了父组件的事件。

使用场景： 多层嵌套组件的情况下使用，可以避免使用Vuex来做数据处理， 使用 v-bind="$attrs" v-on="$listeners" 很方便达到业务数据传递。
```js father.vue
<template>
    <div>
        <Test1
        :status="status" 
        :title="title"
        @getData="getData" />
    </div>
</template>

<script>
import Children1 from "./children1.vue";
export default {
    name:'person',
    data(){
        return {
            title:'personal 组件',
            status: false
        }
    },
    methods:{
        getData(){
            console.log(this.title)
        }  
    },
    components:{
        Children1
    }
}
</script>
```
```js children1.vue
<template>
  <div>
    <h1>children1 组件</h1>
    <br /><br />
    // 通过 $attrs（属性，除了【props中定义的属性】）  和 $listeners（方法）  来给嵌套子组件传递父组件的属性和方法
    <Children2   v-bind="$attrs" v-on="$listeners"/>
  </div>
</template>

<script>
// 引入子子组件   
import Children2 from "./children2.vue";
export default {
  name: "Children1",
  props: ["title"],
  components: {
    Children2,
  },
  created() {
    console.log(this.$attrs);  //{status: false}
    console.log(this.$listeners); // {getData: ƒ}
  },
};
</script>
```
```js children2.vue
<template>
    <div>
        <h1>children2 组件</h1>
    </div>
</template>

<script>
export default {
    name:'Children2',
    created(){
        console.log('-----children2------')
        console.log(this.$attrs) //{status: false}
        console.log(this.$listeners) // {getData: ƒ}
    }
}
</script>
```

# 跨组件之间传值（eventBus）

通过新建一个 `js` 文件，导入 `vue` , 导出 `vue` 实例； 然后通过 给导出的实例 上绑定事件 `$emit` 事件 , 然后再通过 `$on` 监听触发的事件，这样就可以达到全局组件数据共享。

使用场景：它可以满足任意场景传递数据， 父子组件传值 , 子父传值 , 兄弟组件之间传值 , 跨级组件之间传值。

通信数据比较简单时，可以采用这种方案，eventBus也有不方便之处, 当项目较大，就容易造成难以维护的灾难，这时候可以采用 `Vuex` 。

```js myVue.js
import Vue from 'vue'

export default new Vue()
```
```js 组件A
<template>
    <div>  
        <button @click="changeValue">改变</button>
    </div>
</template>

<script>
import myVue from './myVue.js'
export default {
    name:'person',
    data(){
        return {
            title:'personal 组件',
            status: false
        }
    },
    methods:{
        changeValue(){
            // 通过给 vue实例绑定事件
            myVue.$emit('getTitle', this.title)   
        }  
    }
}
</script>
```
```js 组件B
<template>
  <div>
    <h1>Test4 组件</h1>
    <h1>{{ title }}</h1>
  </div>
</template>

<script>
import myVue from "./myVue.js"
export default {
  name: "test4",
  data() {
    return {
      title: "test4",
    }
  },
  mounted(){
    // 通过 vue 实例.$on  监听事件名，来接收跨级组件传递过来的值
    myVue.$on('getTitle', (item) => {
      this.title = item
    })
  }
};
</script>
```

# provide 和 inject 实现父组件向子孙孙组件传值。(层级不限)
provide 和 inject 这对选项需要一起使用，以允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在起上下游关系成立的时间里始终生效。

provide:是一个对象或返回一个对象的函数，该对象包含可注入其子孙的属性。

inject:是一个字符串数组 或者是一个对象，用来在子组件或者子孙组件中注入 provide 提供的父组件属性。

使用场景：provide/inject可以轻松实现跨级访问父组件的数据
```js father.vue
<template>
    <div>
        <h1>我是父组件</h1>
        <Son />
    </div>
</template>

<script>
import Son from './SonOne'
    export default {
        provide(){
            return {
                title: '父组件的值'
            }
        },
        components:{
            Son
        }  
    }
</script>
```
```js SonOne.vue
<template>
    <div>
        <h1>我是子组件</h1>
        <SonTwo />
    </div>
</template>

<script>
import SonTwo from './SonTwo'
export default {
    components:{
        SonTwo
    },
    inject:['title'],
    created(){
        console.log(this.title)     // 输出：父组件的值
    }
}
</script>
```
```js SonTwo.vue
<template>
    <div>
        <h1>我是子孙组件</h1>
    </div>
</template>

<script>
export default {
    components:{
        SonTwo
    },
    inject:['title'],
    created(){
        console.log(this.title)     // 输出：父组件的值
    }
}
</script>
```

# Vuex、localStorage / sessionStorage
Vuex请看：[Vue学习笔记（4）：Vuex基础](/Vue/Vue学习笔记（4）：Vuex基础/)
localStorage请看：[Html5学习笔记](/前端/Html5学习笔记-1/#Web-储存)，这种通信比较简单,缺点是数据和状态比较混乱,不太容易维护。
