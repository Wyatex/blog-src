---
title: Qwik官方入门教程（1）
date: 2023-10-28 23:33:07
tags:
- Qwik
- 前端
- 教程
categories: 前端
---

距离上次看qwik已经过去一年多的时间了，当时qwik才刚出没多久，那时候还是v0.1还是0.2的版本，还有很多bug就没兴趣研究了。如今过去一年多了，qwik版本已经到达了正式版，api也相对固定下来了，所有又有兴趣研究一下。

至于qwik是什么、对比别的框架有什么优势这里我就不重复提了，在掘金站内一搜一大堆。下面直接根据官方教程开始入门。这里推荐有一定的React基础（懂基本的jsx语法）、Vue3响应式基础（会用ref、watch等）、TS基础的小伙伴观看。

官方入门原文：<https://qwik.builder.io/docs/getting-started/>

## 前置条件

要在本地开始使用Qwik，你需要以下内容：

- [Node.js v16.8](https://nodejs.org/en/download/) 或者更高
- 你喜欢的 IDE (推荐[vscode](https://code.visualstudio.com/))
- 阅读 [think qwik](https://qwik.builder.io/docs/concepts/think-qwik/)（可选）

国内网络环境的需要先设置sharp国内代理，不然可能安装依赖失败：

```shell
npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"
```

## 通过cli创建一个app

在你打算新建项目的路径，打开shell或者cmd，执行下面其中一个命令（按照你平时习惯选一个）：

```shell
npm create qwik@latest
pnpm create qwik@latest
yarn create qwik
bun create qwik@latest
```

然后就会通过交互式的对话来创建项目，这里先全面选默认选项，一直下一步直到常见项目完成，会提示你cd到qwik-app文件夹，安装依赖，比如你用了pnpm创建，那么会提示你：

```shell
cd qwik-app
pnpm install
pnpm start
```

执行完start之后，会启动本地开发模式，这时候也会帮你打开网页，这样整个项目就创建好并启动了。

## 简单的HelloWorld应用

这里先简单的在页面上显示HelloWorld，然后再从一言网址拉取一些名言或者网络流行句子进行展示。

### 创建一个路由

这一步要基于Qwik的元框架Qwik-city，他能根据项目的目录提供路由。

1. 在项目的`src/routes`目录下创建一个新的文件夹：`sentence`，并且在里面创建一个新文件 `index.tsx`.
2. 每个路由下的`index.tsx`都需要包含：`export default component$(...)`，所以复制下面代码到上面新建的文件

```ts
// src/sentence/joke/index.tsx
import { component$ } from '@builder.io/qwik';
 
export default component$(() => {
  return <section class="section bright">Hello World!</section>;
});
```

3. 在浏览器打开<http://127.0.0.1:5173/sentence/>

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7c01f82424934489b948e245421a3987~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1042&h=566&s=24423&e=png&b=151934)

> 你的sentence路由组件现在被一个默认的布局包裹住，有关什么是布局以及如何使用布局的更多详细信息，请参阅[布局](https://qwik.builder.io/docs/layout/)
>
> 有关如何编写组件的更多细节，请参阅[组件API部分](https://qwik.builder.io/docs/components/overview/)。

### 加载数据

我们使用一言的api，从一言拉取一些句子。我们通过 [route loader](https://qwik.builder.io/docs/route-loader/) 在服务器拉取数据，然后在浏览器进行渲染。

将上面的`index.tsx`改成如下：

```ts
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
 
export const useHitokoto = routeLoader$(async () => {
  // 去一言拉取数据
  const response = await fetch('https://v1.hitokoto.cn/', {
    headers: { Accept: 'application/json' },
  });
  return (await response.json()) as {
    id: string;
    hitokoto: number;
    from: string;
  };
});

export default component$(() => {
  // 调用 `useHitokoto` 钩子, 会返回一个响应式信号量然后加载数据.
  const sentenceSignal = useHitokoto();
  return (
    <section class="section bright">
      <p>{sentenceSignal.value.hitokoto} --{sentenceSignal.value.from}</p>
    </section>
  );
});
```

保存代码之后再去浏览器查看：<http://127.0.0.1:5173/sentence/>

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1811c13a5c9444f4804181ac64d8ea2c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=377&h=250&s=8086&e=png&b=151934)

代码解析：

- 通过`routeLoader$`调用的函数，都会在组件渲染前调用，然后渲染成html传到浏览器进行加载渲染。
- `routeLoader$`会返回一个use钩子（use-hook），比如上面可以通过`useHitokoto()`拿到服务器返回来的数据。

> **注意**：
>  
> `routeLoader$`会在任何组件渲染前进行调用，也就是说，`export default component$(...)`里面就算不写`const sentenceSignal = useHitokoto();`，`routeLoader$`里的函数也会被调用。
>
> `routeLoader$`可以根据返回类型进行推导，所以下面的sentenceSignal能得到正确的类型，这也是为什么为什么要在return进行ts的`as`断言。

### 提交数据到服务器

在前面，我们通过`routeLoader$`从服务器拉取数据，下面我们通过[`routeAction$`](https://qwik.builder.io/docs/action/)从浏览器将数据发送到服务器。

> 注意: `routeAction$`是向服务器发送数据的首选方式，因为它使用浏览器原生表单API，即使JavaScript被禁用也能正常工作。

下面我们定义一个action，并且在组件用到这个action：

```ts
import { component$ } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$ } from '@builder.io/qwik-city';
 
export const useHitokoto = routeLoader$(async () => {
  const response = await fetch('https://v1.hitokoto.cn/', {
    headers: { Accept: 'application/json' },
  });
  return (await response.json()) as {
    id: string;
    hitokoto: number;
    from: string;
  };
});

export const useSentenceVoteAction = routeAction$((props) => {
    console.log('投票', props)
})

export default component$(() => {
  // 调用 `useHitokoto` 钩子, 会返回一个响应式信号量然后加载数据.
  const sentenceSignal = useHitokoto();
  const favoriteSentenceAction = useSentenceVoteAction();
  return (
    <section class="section bright">
      <p>{sentenceSignal.value.hitokoto} ——{sentenceSignal.value.from}</p>
      <Form action={favoriteSentenceAction}>
        <input type="hidden" name="id" value={sentenceSignal.value.id} />
        <input type="hidden" name="sentence" value={sentenceSignal.value.hitokoto} />
        <button name="vote" value="up">👍</button>
        <button name="vote" value="down">👎</button>
      </Form>
    </section>
  );
});
```

保存代码，页面多出两个按钮，随便点一个，再查看服务端有没有打印：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19ededd4e8ab49c092d9a459a05567a7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1078&h=529&s=58368&e=png&b=0f0f0f)

代码解析：

- `routeAction$` 接收数据.
  - 传递给`routeAction$`的函数在发送表单时就会在服务器上调用。
  - `routeAction$`返回一个use-hook, favoriteSentenceAction，你可以在组件中使用它来发送表单数据。
- Form是一个方便的组件，它封装了浏览器的原生`<form>`元素

### 修改状态

类似Vue3的ref，Qwik提供了一个hook：`useSignal`，用来保存状态，并且提供响应式。下面来使用一下：

1. 从 `qwik` 导入 `useSignal`：`import { component$, useSignal } from "@builder.io/qwik";`
2. 在组件定义里面定义这个signal：`const isFavoriteSignal = useSignal(false);`
3. 在Form的关闭标签后面添加一个按钮，用于修改状态

最终代码变成：

```ts
import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$ } from '@builder.io/qwik-city';
 
export const useHitokoto = routeLoader$(async () => {
  const response = await fetch('https://v1.hitokoto.cn/', {
    headers: { Accept: 'application/json' },
  });
  return (await response.json()) as {
    id: string;
    hitokoto: number;
    from: string;
  };
});

export const useSentenceVoteAction = routeAction$((props) => {
    console.log('投票', props)
})

export default component$(() => {
  // 调用 `useHitokoto` 钩子, 会返回一个响应式信号量然后加载数据.
  const sentenceSignal = useHitokoto();
  const favoriteSentenceAction = useSentenceVoteAction();
  const isFavoriteSignal = useSignal(false);
  return (
    <section class="section bright">
      <p>{sentenceSignal.value.hitokoto} ——{sentenceSignal.value.from}</p>
      <Form action={favoriteSentenceAction}>
        <input type="hidden" name="id" value={sentenceSignal.value.id} />
        <input type="hidden" name="sentence" value={sentenceSignal.value.hitokoto} />
        <button name="vote" value="up">👍</button>
        <button name="vote" value="down">👎</button>
      </Form>
      <button
        onClick$={() => (isFavoriteSignal.value = !isFavoriteSignal.value)}
      >
        {isFavoriteSignal.value ? '❤️' : '🤍'}
      </button>
    </section>
  );
});
```

### 监听状态变化并调用服务端函数

在Qwik中，任务（task）是在状态发生变化时需要执行的工作（这类似于其他框架中的“effect”）。在本例中，我们使用任务来调用服务端上的代码。

1. 从 `qwik` 导入 `useTask$`: `import { component$, useSignal, useTask$ } from "@builder.io/qwik";`
2. 创建一个task来监听isFavoriteSignal的状态变化：

```ts
useTask$(({ track }) => { 
  track(() => isFavoriteSignal.value);
});
```

3. 添加要在状态更改时执行的代码：

```ts
useTask$(({ track }) => { 
  track(() => isFavoriteSignal.value);
  console.log('FAVORITE (isomorphic)', isFavoriteSignal.value);
});
```

4. 如果你希望在服务器上也进行执行某些代码，那么将这些封装在server$()中。

```ts
useTask$(({ track }) => { 
  track(() => isFavoriteSignal.value);
  console.log('FAVORITE (isomorphic)', isFavoriteSignal.value);
  server$(() => { console.log('FAVORITE (server)', isFavoriteSignal.value); })();
});
```

最后代码变成：

```ts
import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$, server$ } from '@builder.io/qwik-city';
 
export const useHitokoto = routeLoader$(async () => {
  const response = await fetch('https://v1.hitokoto.cn/', {
    headers: { Accept: 'application/json' },
  });
  return (await response.json()) as {
    id: string;
    hitokoto: number;
    from: string;
  };
});

export const useSentenceVoteAction = routeAction$((props) => {
    console.log('投票', props)
})

export default component$(() => {
  // 调用 `useHitokoto` 钩子, 会返回一个响应式信号量然后加载数据.
  const sentenceSignal = useHitokoto();
  const favoriteSentenceAction = useSentenceVoteAction();
  const isFavoriteSignal = useSignal(false);
  useTask$(({ track }) => {
    track(() => isFavoriteSignal.value);
    console.log('FAVORITE (isomorphic)', isFavoriteSignal.value);
    server$(() => {
      console.log('FAVORITE (server)', isFavoriteSignal.value);
    })();
  });
  return (
    <section class="section bright">
      <p>{sentenceSignal.value.hitokoto} ——{sentenceSignal.value.from}</p>
      <Form action={favoriteSentenceAction}>
        <input type="hidden" name="id" value={sentenceSignal.value.id} />
        <input type="hidden" name="sentence" value={sentenceSignal.value.hitokoto} />
        <button name="vote" value="up">👍</button>
        <button name="vote" value="down">👎</button>
      </Form>
      <button
        onClick$={() => (isFavoriteSignal.value = !isFavoriteSignal.value)}
      >
        {isFavoriteSignal.value ? '❤️' : '🤍'}
      </button>
    </section>
  );
});
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65a3fb3c27584f88b2dee33eda38cf88~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1089&h=824&s=120099&e=png&b=1d1d1d)

注意：

> 组件中的`useTask$`会在服务端和客户端（浏览器）中执行一次。
>
> 当用户单击按钮时，浏览器会打印：`FAVORITE (isomorphic) true`，服务端打印：`FAVORITE (server) true`

### CSS样式

Qwik提供了一种将样式与组件关联并限定其范围的方法（类似Vue的scoped）。

1. 创建一个css文件，`src/routes/sentence/index.css`：

```css
p {
  font-weight: bold;
}

form {
  float: right;
}
```

2. 导入样式：`import styles from "./index.css?inline";`
3. 从qwik导入`useStylesScoped$`: `import { component$, useSignal, useStylesScoped$, useTask$ } from "@builder.io/qwik";`
4. 告诉组件加载样式：`useStylesScoped$(styles);`

最后的代码：

```ts
import { component$, useSignal, useTask$, useStylesScoped$ } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$, server$ } from '@builder.io/qwik-city';
import styles from './index.css?inline'

export const useHitokoto = routeLoader$(async () => {
  const response = await fetch('https://v1.hitokoto.cn/', {
    headers: { Accept: 'application/json' },
  });
  return (await response.json()) as {
    id: string;
    hitokoto: number;
    from: string;
  };
});

export const useSentenceVoteAction = routeAction$((props) => {
    console.log('投票', props)
})

export default component$(() => {
  // 调用 `useHitokoto` 钩子, 会返回一个响应式信号量然后加载数据.
  const sentenceSignal = useHitokoto();
  const favoriteSentenceAction = useSentenceVoteAction();
  const isFavoriteSignal = useSignal(false);
  useTask$(({ track }) => {
    track(() => isFavoriteSignal.value);
    console.log('FAVORITE (isomorphic)', isFavoriteSignal.value);
    server$(() => {
      console.log('FAVORITE (server)', isFavoriteSignal.value);
    })();
  });
  useStylesScoped$(styles)
  return (
    <section class="section bright">
      <p>{sentenceSignal.value.hitokoto} ——{sentenceSignal.value.from}</p>
      <Form action={favoriteSentenceAction}>
        <input type="hidden" name="id" value={sentenceSignal.value.id} />
        <input type="hidden" name="sentence" value={sentenceSignal.value.hitokoto} />
        <button name="vote" value="up">👍</button>
        <button name="vote" value="down">👎</button>
      </Form>
      <button
        onClick$={() => (isFavoriteSignal.value = !isFavoriteSignal.value)}
      >
        {isFavoriteSignal.value ? '❤️' : '🤍'}
      </button>
    </section>
  );
});
```

效果：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/edb8f925dd7645f2942838db49a669eb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=810&h=437&s=21250&e=png&b=151934)

> 上面就是Qwik官方文档的入门教程，有兴趣赶紧去试试吧
