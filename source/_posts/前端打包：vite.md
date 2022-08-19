---
title: 前端打包：vite
date: 2022-06-14 10:46:14
tags:
  - 工具
  - TypeScript
  - 前端
  - 打包
  - vite
categories: 前端
---

上篇文章讲了如何使用 tsup 打包一些使用 ts 编写的工具，这次讲解如何使用 vite 打包一些 vue 组件（React、Svelte 等框架也同理）。

<!-- more -->

# 创建项目

使用下面命令快速创建一个 helloworld 项目：

```bash
pnpm create vite lib-test
cd lib-test
pnpm add -D @types/node vite-plugin-dts vite-plugin-libcss
```

其中`@types/node`用来提供正确的 node 类型提示， `vite-plugin-dts`用来打包出组件的类型定义文件， `vite-plugin-libcss`用来在打包产物第一行加入`import './style.css'`，这样比较适合 css 比较少的组件，如果 css 很多，整个 css 文件导入的话可能会导致项目的打包尺寸比较大。

# 编写 entry 文件

打包的组件库通常都由一个 entry 文件进行导出，可以这样写：

```ts src/index.ts
export { default as HelloWorld } from "./components/HelloWorld.vue";
```

然后你可以编写你自己的组件：

```vue src/components/MyBtn/MyBtn.vue
<template>
  <button class="my-btn" :style="{ '--padding': padding + 'px' }">
    <span>{{ text }}</span>
  </button>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    text: string;
    padding: number;
  }>(),
  {
    text: "hello",
    padding: 4,
  }
);
</script>

<style scoped>
@import "./style.css";
</style>
```

```css src/components/MyBtn/style.css
.my-btn {
  padding: var(--padding);
}
```

当然也可以安装 sass 或者 less，然后`<style lang="sass/less" scoped>`，就能直接使用 sass 或者 less，或者导入 sass 或者 less 文件

```ts src/components/MyBtn/index.vue
export { default as MyBtn } from "./MyBtn.vue";
```

然后在 index.ts 也导出一下：

```ts src/index.ts
export { default as HelloWorld } from "./components/HelloWorld.vue";
export { MyBtn } from "./components/MyBtn";
```

# 修改配置文件

然后在默认的 tsconfig.json 里的`"compilerOptions"`加入：`"types": ["node"]`。

接下来编写`vite.config.ts`：

```ts vite.config.ts
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import libCss from "vite-plugin-libcss";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      name: "MyLib",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
  plugins: [vue(), dts(), libCss()],
});
```

打包模式还能启用 cjs、umd、iife 模式，但是 vite-plugin-libcss 只支持 es 模式，而且 vue3 也推荐使用 es 模式这里就只写 es 吧。

其中`rollupOptions`的`external`用于表明 vue 的外部导入包，不需要打包 vue 的代码到构建产物，这样能大幅减少打包的体积。

> 到这里就能开始快乐的编译你的组件库了，输入：`pnpm build`试试吧。
