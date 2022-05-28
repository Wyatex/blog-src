---
title: Vue3学习笔记（6）：单元测试
date: 2021-10-24 19:36:24
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Vue3
categories: Vue3
---

这节讲一下如何用 jest 进行单元测试

<!-- more -->

# 使用 vue-cli 的预设

在执行：`vue create xxx`时，选上：`Unit Test`，框架选择`Jest`框架。
初始化完成后可以看到`/tests/unit`目录下有一个：`example.spec.ts`文件：

```ts example.spec.ts
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
```

# jest 的配置

跑 jest 的单元测试主要通过根目录下的：`jest.config.js`:

```js
module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transform: {
    '^.+\\.vue$': 'vue-jest',
  },
}
```

我们去到 preset 的目录`/node_modules/@vue/cli-plugin-unit-jest/presets/typescript-and-babel`看到，有一个 jest-preset.js:

```js jest-preset.js
const deepmerge = require('deepmerge')
const defaultTsPreset = require('../typescript/jest-preset')

module.exports = deepmerge(defaultTsPreset, {
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
})
```

可以看到这个预设主要是在基础预设上加上了`ts-jest`的配置。继续看：`/typescript/jest-preset`:

```js
const deepmerge = require('deepmerge')
const defaultPreset = require('../default/jest-preset')

module.exports = deepmerge(defaultPreset, {
  moduleFileExtensions: ['ts', 'tsx'],
  transform: {
    '^.+\\.tsx?$': require.resolve('ts-jest'),
  },
})
```

可以看到这个`moduleFileExtensions`指定了去寻找 ts 文件和 tsx 文件。
`transform` 用来指定编译代码，这里指定了 `tsx` 交给`ts-jest`这个依赖来编译。

继续往`/default/jest-preset`看，可以看到：

```js jest-preset
module.exports = {
  // 在我们写代码的时候，其实可以不写后缀名，这里的 moduleFileExtensions 会自动帮我们补后缀名。
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    // tell Jest to handle *.vue files
    'vue',
  ],
  // 然后 transform 还是指定需要编译的文件，比如这个 .vue 文件使用 vue-jest 编译。
  transform: {
    // process *.vue files with vue-jest
    '^.+\\.vue$': require.resolve('vue-jest'),
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      require.resolve('jest-transform-stub'),
    '^.+\\.jsx?$': require.resolve('babel-jest'),
  },
  // 指定哪些不需要编译的
  transformIgnorePatterns: ['/node_modules/'],
  // 把@映射到/src目录
  // support the same @ -> src alias mapping in source code
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // 在什么环境下进行测试，比如jsdom这个
  testEnvironment: 'jest-environment-jsdom-fifteen',
  // 快照测试:把测试结果序列化到一个文件，以后跑单测时比较输出的字符串时候和之前的一样，保证稳定性。
  // serializer for snapshots
  snapshotSerializers: ['jest-serializer-vue'],
  // jest找哪里哪些文件去跑测试
  testMatch: ['**/tests/unit/**/*.spec.[jt]s?(x)', '**/__tests__/*.[jt]s?(x)'],
  // 类似模拟浏览器的环境，通过浏览器加载一些js文件
  // https://github.com/facebook/jest/issues/6766
  testURL: 'http://localhost/',
  // 启动了watch后，每次保存都会自动跑一次测试
  watchPlugins: [
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
}
```

可以看到这些配置非常像 webpack。

# 单元测试

## 测试声明

jest 有三种 api，分别是：`describe、it、test`。

describe 指一整个套件，it 包含在 describe 里面，特指单个测试。test 是单独的一个测试。

大部分情况都是使用 describe 和 it 去测试，test 可能只会用在一些小项目里，测一下简单的东西。

## 断言

断言指判断结果是否和我们预期的一样，比如：

```ts example.spec.ts
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
```

比如这个：`expect(wrapper.text()).toMatch(msg)`，指的是期待：`wrapper.text()`的结果要 msg 匹配。

除了 toMatch 还有 toBe、toEqual 等 api。可以看[官方文档](https://jestjs.io/zh-Hans/docs/expect)的介绍。

如果需要反转一下匹配结果，比如需要结果不等于什么，只需要在 toxxx 前面加上 not，比如：`expect(wrapper.text()).not.toMatch(msg)`

## 预设和清理

包括几个 api：`beforeEach/afterEach、beforeAll/afterAll`
beforeEach 指每个单元测试执行前都会执行，同理 afterEach 是测试后执行。beforeAll 所有测试开始前只执行一次，afterAll 是所有测试执行完后执行一次。
要注意这些都有作用域，通常写到 describe 里面，比如：

```ts example.spec.ts
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  beforeAll(() => {
    console.log('测试还没开始')
  })
  beforeEach(() => {
    console.log('某个it测试还没开始')
  })
  AfterEach(() => {
    console.log('某个it测试已经结束')
  })
  afterAll(() => {
    console.log('所有测试已完成')
  })
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
```

# 异步测试

默认情况下测试都是同步测试，如果写上异步的代码可能会出现一些问题，比如：

```js
describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    setTimeout(() => {
      expect(wrapper.text()).toMatch('123')
    }, 123)
  })
})
```

理论上这个测试是不应该通过的，但是跑起来发现还是可以通过，原因是 jest 认为我们再跑同步测试，所以 setTimeout 里面的代码并没有去执行，解决方法如下。

## done

可以传入一个参数 done，然后测试结束后执行：

```js
describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', (done) => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    setTimeout(() => {
      expect(wrapper.text()).toMatch('123')
      done()
    }, 123)
  })
})
```

## promise

可以在函数的返回值使用 Promise 去解决：

```js
describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    return new Promise((resolve) => {
      expect(wrapper.text()).toMatch('msg')
      resolve('')
    })
  })
})
```

测试可以看到也是不通过，说明 Promise 的方法还是有用的。

## async、await 语法糖

可以使用上这些新的语法糖：

```js
describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', async () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    })
    await wrapper.setProps({
      msg: '123',
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
```

因为 vue 修改 dom 不是同步的，如果改了值再想拿到 dom 的值需要 nextTick 这个 api，这也是一个异步操作，所以我们用 await 来等待 dom 修改完成。
测试是不通过的，然后将 toMatch 的值设为`'123'`再跑就能通过了。

# vue-test-utils 测试 vue3 组件
