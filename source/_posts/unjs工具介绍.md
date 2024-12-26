---
title: unjs工具介绍
date: 2024-12-15 10:42:52
tags:
- npm
categories: npm
---

unjs是github上面一个挺多人关注的组织，组织下有很多很好用的工具包，搜了一下掘金好像并没有相关的详细介绍，然后就想着为他们介绍一下（水一篇文章）。

这里按照github上面的高星进行排名，下面开始咯。

<!-- more -->

## **[consola](https://github.com/unjs/consola)** 优雅且功能强大的日志库

`consola` 是一个优雅且功能强大的 JavaScript/Node.js 日志库，它提供了丰富的日志级别、自定义格式化选项、漂亮的终端输出以及对多种环境的支持。`consola` 的设计目标是提供一个简单易用、功能全面的日志工具，适合在 Node.js 项目、CLI 工具、测试框架以及浏览器环境中使用。

```js
// ESM
import { consola, createConsola } from "consola";

// CommonJS
const { consola, createConsola } = require("consola");

consola.info("Using consola 3.0.0");
consola.start("Building project...");
consola.warn("A new version of consola is available: 3.0.1");
consola.success("Project built!");
consola.error(new Error("This is an example error. Everything is fine!"));
consola.box("I am a simple box");
await consola.prompt("Deploy to the production?", {
  type: "confirm",
});
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/36692ee70f4343999df68d08412f5495~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785804&x-orig-sign=HNrEWU%2B7%2BDLo3CCDs9g2DdNeJmI%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/b3f883127cfe49388369a52bd66ae2dc~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785804&x-orig-sign=KB%2FUFW9GhHGZafK%2Bg7FPrT88ixQ%3D)

您可以使用不带花里胡哨功能的构建产物，包大小减少 80%：

```js
import { consola, createConsola } from "consola/basic";
import { consola, createConsola } from "consola/browser";
import { createConsola } from "consola/core";
```

## **[ofetch](https://github.com/unjs/ofetch)** 轻量级现代化的 HTTP 请求库

`ofetch` 是一个轻量级、现代化的 HTTP 请求库，专为 JavaScript 和 TypeScript 开发环境设计。它基于 `fetch` API 构建，提供了更简洁的 API 和一些额外的功能，使得在浏览器和 Node.js 环境中进行 HTTP 请求变得更加方便。`ofetch` 的设计目标是简化常见的 HTTP 请求场景，同时保持轻量和高效。

基础用法:

```js
import { ofetch } from 'ofetch';

// 发起 GET 请求
const data = await ofetch('https://api.example.com/data');
console.log(data); // 自动解析为 JSON

// 发起 POST 请求
const response = await ofetch('https://api.example.com/submit', {
  method: 'POST',
  body: { name: 'John', age: 30 },
});
console.log(response);

// 处理错误
try {
  const result = await ofetch('https://api.example.com/protected');
} catch (error) {
  console.error('请求失败:', error.message);
}
```

### 设置默认值，设置拦截器

```js
const api = ofetch.create({
  baseURL: '/api',
  headers: {
    'Authorization': 'Bearer my-token',
  },
  async onRequest({ request, options }) {
    // Log request
    console.log("[fetch request]", request, options);

    // Add `?t=1640125211170` to query search params
    options.query = options.query || {};
    options.query.t = new Date();
  },
  async onRequestError({ request, options, error }) {
    // Log error
    console.log("[fetch request error]", request, error);
  },
  async onResponse({ request, response, options }) {
    // Log response
    console.log("[fetch response]", request, response.status, response.body);
  },
  async onResponseError({ request, response, options }) {
    // Log error
    console.log(
      "[fetch response error]",
      request,
      response.status,
      response.body
    );
  },
});

const data = await api('/data');
```

### 自定义请求处理

```js
// Use JSON.parse
await ofetch("/movie?lang=en", { parseResponse: JSON.parse });

// Return text as is
await ofetch("/movie?lang=en", { parseResponse: (txt) => txt });

// Get the blob version of the response
await ofetch("/api/generate-image", { responseType: "blob" });
```

还有很多定制功能，比如自动重试、超时、ts类型、node使用等等，详情请看readme

## [magic-regexp](https://regexp.dev/) 链式构建正则表达式

`magic-regexp` 是一个用于创建和操作正则表达式的 JavaScript 库，旨在简化正则表达式的编写和使用。它提供了更直观、更易读的 API，帮助开发者避免直接编写复杂的正则表达式字符串。`magic-regexp` 的设计目标是让正则表达式的使用变得更加友好和高效，特别适合那些对正则表达式不太熟悉或希望提高代码可读性的开发者。

### 简单使用

```js
import { createRegExp, exactly } from 'magic-regexp'

const regExp = createRegExp(exactly('foo/test.js').after('bar/'))
console.log(regExp)

// /(?<=bar/)foo/test.js/
```

    import { createRegExp, exactly, global, maybe, multiline } from 'magic-regexp'

    createRegExp(exactly('foo').or('bar'))

    createRegExp('string-to-match', [global, multiline])
    // you can also pass flags directly as strings or Sets
    createRegExp('string-to-match', ['g', 'm'])

    // or pass in multiple `string` and `input patterns`,
    // all inputs will be concatenated to one RegExp pattern
    createRegExp(
      'foo',
      maybe('bar').groupedAs('g1'),
      'baz',
      [global, multiline]
    )
    // equivalent to /foo(?<g1>(?:bar)?)baz/gm

更多功能请看详情

## [h3](https://h3.unjs.io/) HTTP 框架

`h3` 是一个轻量级、高性能的 Node.js HTTP 框架，专为构建现代的 Web 应用和 API 设计。它的设计理念是简洁、高效和灵活，旨在提供一个易于使用且功能强大的工具，帮助开发者快速构建高性能的 HTTP 服务器。`h3` 是 [Nuxt.js](https://nuxt.com/) 生态系统的一部分，但它也可以作为一个独立的框架使用。

## [unplugin](https://github.com/unjs/unplugin) 通用打包插件适配层

`unplugin` 是一个通用的插件系统，旨在为各种构建工具（如 Vite、Webpack、Rollup 等）提供统一的插件开发体验。它的设计目标是让开发者能够编写一次插件，并在多个构建工具中复用，从而减少重复工作并提高开发效率。`unplugin` 的核心理念是模块化和可组合性，它允许开发者将插件逻辑抽象为独立的模块，并在不同的构建工具中无缝集成。

对于vue开发的小伙伴来说肯定对unplugin-vue-components、unplugin-auto-import、unplugin-icons这些插件如数家珍了，他们就是基于这个项目来开发，可以简单的在webpack、vite、rspack、farm等等打包工具去使用。当然如果你需要开发一些插件也推荐使用这个项目进行开发。

## [unbuild](https://github.com/unjs/unbuild) 简单的打包库、模块工具

`unbuild` 是一个现代化的 JavaScript/TypeScript 构建工具，专为构建和打包库、模块以及应用程序而设计。它的设计目标是简化构建流程，提供灵活的配置选项，并支持多种模块格式（如 CommonJS、ESM 等）。`unbuild` 的核心理念是让开发者能够专注于代码的编写，而无需过多关注构建工具的复杂性。

内置了automd（自动生成README.md）、vitest（快速、简单、强大的测试框架）、github actions构建发布脚本等等，满足绝大部分的库开发需求。

## [magicast](https://github.com/unjs/magicast) 动态生成/操作JS/TS代码

`Magicast` 是一个用于动态生成和操作 JavaScript 或 TypeScript 代码的工具库。它的设计目标是让开发者能够在运行时动态创建、修改和分析代码，而无需手动编写大量的代码字符串。`Magicast` 的核心理念是通过一个抽象的代码模型来表示 JavaScript/TypeScript 代码，开发者可以通过操作这个模型来生成最终的代码。

基础使用

```js
// config.js
export default {
  foo: ["a"],
};
```

将 `'b'` 加到 foo

```js
import { loadFile, writeFile } from "magicast";

const mod = await loadFile("config.js");

mod.exports.default.foo.push("b");

await writeFile(mod, "config.js");
```

更新后的 `config.js` ：

```js
export default {
  foo: ["a", "b"],
};
```

更多的一些AST操作请看文档

## [ipx](https://github.com/unjs/ipx) 图像处理、压缩库

`ipx` 是一个用于处理和优化图像的工具库，专为现代 Web 应用设计。它的设计目标是简化图像处理流程，提供高效的图像优化功能，帮助开发者提升 Web 应用的性能。`ipx` 支持多种图像格式（如 JPEG、PNG、WebP 等），并且提供了丰富的图像处理选项，如调整大小、裁剪、压缩等。

## [jiti](https://github.com/unjs/jiti) 动态加载、解析、运行JS/TS代码

`jiti` 是一个用于在 Node.js 环境中动态加载和解析 JavaScript 和 TypeScript 文件的工具库。它的设计目标是简化在运行时加载和解析模块的过程，特别适合在需要动态加载模块的场景中使用。`jiti` 的核心功能是提供一个轻量级的、高性能的模块加载器，支持 TypeScript 和 ESM（ECMAScript 模块）。

我在前几篇文章也有提到这个项目：[更简单的运行时转译esm、ts文件工具](https://juejin.cn/post/7389446404189487123)，只能说味大，无需多盐（滑稽）

## [unstorage](https://github.com/unjs/unstorage) 后端键值存储库

`unstorage` 是一个轻量级、高性能的键值存储库，专为现代 JavaScript 和 TypeScript 开发环境设计。它的设计目标是提供一个简单易用、功能全面的存储解决方案，支持多种存储后端（如内存、文件系统、HTTP、Redis 等），并且提供了统一的 API 来访问这些存储。`unstorage` 的核心理念是模块化和可组合性，它允许开发者根据项目需求选择性地使用不同的存储后端。

## [fontaine](https://github.com/unjs/fontaine) 网页字体加载的工具库

`fontaine` 是一个用于优化和自定义网页字体加载的工具库，专为现代 Web 应用设计。它的设计目标是简化字体加载流程，提供高效的性能优化功能，帮助开发者提升网页的加载速度和用户体验。`fontaine` 支持多种字体格式（如 WOFF2、WOFF、TTF 等），并且提供了丰富的字体加载选项，如字体子集化、字体加载策略等。

使用方式：

```js
import { FontaineTransform } from 'fontaine'

// Astro config - astro.config.mjs
import { defineConfig } from 'astro/config'

const options = {
  fallbacks: ['BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'Noto Sans'],
  // You may need to resolve assets like `/fonts/Roboto.woff2` to a particular directory
  resolvePath: id => `file:///path/to/public/dir${id}`,
  // overrideName: (originalName) => `${name} override`
  // sourcemap: false
  // skipFontFaceGeneration: (fallbackName) => fallbackName === 'Roboto override'
}

// Vite
export default {
  plugins: [FontaineTransform.vite(options)]
}

// Next.js
export default {
  webpack(config) {
    config.plugins = config.plugins || []
    config.plugins.push(FontaineTransform.webpack(options))
    return config
  },
}

// Docusaurus plugin - to be provided to the plugins option of docusaurus.config.js
// n.b. you'll likely need to require fontaine rather than importing it
const fontaine = require('fontaine')

function fontainePlugin(_context, _options) {
  return {
    name: 'fontaine-plugin',
    configureWebpack(_config, _isServer) {
      return {
        plugins: [
          fontaine.FontaineTransform.webpack(options),
        ],
      }
    },
  }
}

// Gatsby config - gatsby-node.js
const { FontaineTransform } = require('fontaine')

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  const config = getConfig()
  config.plugins.push(FontaineTransform.webpack(options))
  actions.replaceWebpackConfig(config)
}

export default defineConfig({
  integrations: [],
  vite: {
    plugins: [
      FontaineTransform.vite({
        fallbacks: ['Arial'],
        resolvePath: id => new URL(`./public${id}`, import.meta.url), // id is the font src value in the CSS
      }),
    ],
  },
})
```

## [destr](https://github.com/unjs/destr) 更快更安全的JSON.parse

`destr` 是一个轻量级的 JavaScript 工具库，用于安全地将字符串转换为 JavaScript 数据结构（如对象、数组、布尔值、数字等）。它的设计目标是简化字符串解析过程，避免常见的安全问题（如 `eval` 或 `JSON.parse` 可能引发的代码注入风险），并提供一种安全且高效的方式来处理字符串解析。

类型提示：

```ts
const obj = JSON.parse("{}"); // obj type is any

const obj = destr("{}"); // obj type is unknown by default

const obj = destr<MyInterface>("{}"); // obj is well-typed
```

传入非string：

```js
// Uncaught SyntaxError: Unexpected token u in JSON at position 0
JSON.parse();

// undefined
destr();
```

如果解析失败，则回退到原始值（空或任何纯字符串）

```js
// Uncaught SyntaxError: Unexpected token s in JSON at position 0
JSON.parse("salam");

// "salam"
destr("salam");
```

> 注意：这在严格模式下使用`safeDestr`将会失败。

避免原型污染:

```js
const input = '{ "user": { "__proto__": { "isAdmin": true } } }';

// { user: { __proto__: { isAdmin: true } } }
JSON.parse(input);

// { user: {} }
destr(input);
```

[benchmark跑分对比](https://github.com/unjs/destr/blob/main/BENCH.md)

## [defu](https://github.com/unjs/defu) 深层合并

`defu` 是一个轻量级的 JavaScript 工具库，用于深度合并（deep merge）多个对象。它的设计目标是简化对象合并的过程，提供一种灵活且高效的方式来合并对象，特别适合在配置合并、默认值设置等场景中使用。`defu` 的核心功能是深度合并对象，支持嵌套对象和数组的合并，并且提供了多种合并策略。

    import { defu } from "defu";

    console.log(defu({ a: { b: 2 } }, { a: { b: 1, c: 3 } }));
    // => { a: { b: 2, c: 3 } }

## **[untun](https://github.com/unjs/untun)**  快速分享本地服务到局域网

快速通过隧道将本地服务开放给全世界！由Cloudflare Quick Tunnels提供支持。

用法：

    npx untun@latest tunnel http://localhost:3000

<!---->

    ◐ Starting cloudflared tunnel to http://localhost:3000
    ℹ Waiting for tunnel URL...
    ✔ Tunnel ready at https://unjs-is-awesome.trycloudflare.com

使用 `npx untun tunnel --help` 查看帮助

## [ufo](https://github.com/unjs/ufo) URL解析、操作

`ufo` 是一个用于处理和操作 URL 的轻量级 JavaScript 工具库。它的设计目标是简化 URL 的处理过程，提供一种高效且易用的方式来解析、构建和操作 URL。`ufo` 支持多种 URL 格式（如 HTTP、HTTPS、FTP 等），并且提供了丰富的 URL 处理功能，如 URL 解析、查询参数操作、路径拼接等。

比如：

    parseURL("http://foo.com/foo?test=123#token");
    // { protocol: 'http:', auth: '', host: 'foo.com', pathname: '/foo', search: '?test=123', hash: '#token' }

    parseURL("foo.com/foo?test=123#token");
    // { pathname: 'foo.com/foo', search: '?test=123', hash: '#token' }

    parseURL("foo.com/foo?test=123#token", "https://");
    // { protocol: 'https:', auth: '', host: 'foo.com', pathname: '/foo', search: '?test=123', hash: '#token' }

## [changelogen](https://github.com/unjs/changelogen) 变更日志生成

`changelogen` 是一个用于生成变更日志（Changelog）的工具库，专为现代软件开发流程设计。它的设计目标是简化变更日志的生成过程，提供一种自动化且高效的方式来记录项目中的变更。`changelogen` 支持多种版本控制工具（如 Git），并且可以根据提交记录自动生成格式化的变更日志。

生成Markdown格式的变更日志并显示在控制台中：

    npx changelogen@latest

生成变更日志，更新 `package.json` 中的版本号，并更新 `CHANGELOG.md` 文件（不进行提交）：

    npx changelogen@latest --bump

更新版本号，更新 `CHANGELOG.md` 文件，并创建 Git 提交和标签：

    npx changelogen@latest --release

更多参数请看readme

## [citty](https://github.com/unjs/citty) 优雅的CLI生成框架

`citty` 是一个现代化的命令行界面（CLI）框架，专为构建功能强大且用户友好的命令行工具而设计。它的设计目标是简化 CLI 工具的开发流程，提供丰富的功能和灵活的配置选项，帮助开发者快速构建高性能的命令行应用程序。`citty` 支持多种命令行功能，如命令解析、参数处理、子命令、自动补全等。

用法：

    // index.js
    import { defineCommand, runMain } from "citty";

    const main = defineCommand({
      meta: {
        name: "hello",
        version: "1.0.0",
        description: "My Awesome CLI App",
      },
      args: {
        name: {
          type: "positional",
          description: "Your name",
          required: true,
        },
        friendly: {
          type: "boolean",
          description: "Use friendly greeting",
        },
      },
      run({ args }) {
        console.log(`${args.friendly ? "Hi" : "Greetings"} ${args.name}!`);
      },
    });

    runMain(main);

<!---->

    ~/projects/stackblitz-starters-8olnwcey
    ❯ node index.js
    My Awesome CLI App (hello v1.0.0)                                                      16:04:48

    USAGE hello [OPTIONS] <NAME>

    ARGUMENTS

      NAME    Your name    

    OPTIONS

      --friendly    Use friendly greeting



     ERROR  Missing required positional argument: NAME                                     16:04:48


    ~/projects/stackblitz-starters-8olnwcey
    ❯ node index.js World!
    Greetings World!!

## [scule](https://github.com/unjs/scule) 字符串命名处理工具

类似lodash里的一些命名操作方法，简单的对PascalCase、camelCase、kebab-case、snake\_case命名方法进行转换：

```js
pascalCase("foo-bar_baz");
// FooBarBaz

camelCase("foo-bar_baz");
// fooBarBaz
```

> 注意：如果一个大写字母后面跟着其他大写字母（如FooBAR），它们将被保留。你可以使用{normalize: true}来严格遵循pascalCase约定。

```js
kebabCase("fooBar_Baz");
// foo-bar-baz

snakeCase("foo-barBaz");
// foo_bar_baz

flatCase("foo-barBaz");
// foobarbaz

trainCase("FooBARb");
// Foo-Ba-Rb

titleCase("this-IS-aTitle");
// This is a Title

upperFirst("hello world!");
// Hello world!

lowerFirst("Hello world!");
// hello world!
```

## [automd](https://github.com/unjs/automd) 自动化生成 Markdown

用法请看[AutoMD - Markdown, Automated.](https://automd.unjs.io/)

> 还有很多好用的库，有事没事可以去看看
