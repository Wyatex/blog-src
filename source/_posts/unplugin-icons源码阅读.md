---
title: unplugin-icons源码阅读
date: 2024-07-31 09:53:14
tags:
- JavaScript
- 源码阅读
- 学习笔记
categories: 前端
---

用过unplugin-icons的小伙伴应该都对这个插件不陌生，这是一个用来导入svg图标成为各个框架组件的一个插件。

<!-- more -->

下面带大家看看这个插件是怎么实现的。

## 简单通过vitest调用一下插件

拉完代码之后，我们想运行一下这个插件的方法其实很简单，因为这是基于unplugin实现的插件，所以可以任选一个打包工具，vite、webpack、rollup啥的，因为vite配置简单所以我比较喜欢vite，这里我们选个vite来调用插件吧。

我的想法是基于vitest调用一下vite的build方法，当然你直接写个js，然后调用也是一样的，不过既然项目已经配好了vitest那我们直接用vitest，更方便ide启动（vscode需要安装vitest插件），下面我们创建下文件


```ts
// /test/main.ts
import logo from '~icons/logos/react'

console.log(logo) // 防止被tree-shake，这里随便调用一下import的内容
```


```ts
// /test/plugin.test.ts
import * as path from 'node:path'
import { it } from 'vitest'
import { build } from 'vite'
import icons from '../src/vite'

it('should build', async () => {
  const res = await build({
    plugins: [icons({
      compiler: 'jsx',
    })],
    root: path.resolve(__dirname),
    build: {
      outDir: 'dist',
      rollupOptions: {
        external: ['vue', 'react'],
        input: path.resolve(__dirname, 'main.ts'),
      },
    },
  })
})
```

然后如果是webstorm调试就很简单了：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/4bf5751955ff434f979ab2e0d949a804~tplv-73owjymdk6-jj-mark:0:0:0:0:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1722995582&x-orig-sign=QVPHKD%2F65rQeM%2B5m3CG0WZ6M3Ss%3D)

点击下三角箭头，选择调试就可以了。

如果是vscode的话，需要先装一下vitest插件，然后重启一下。但是应该会报错，说项目的vitest版本太老了不支持，这时候只需要去package.json将vitest的版本改成latest，然后重装下依赖，然后点下刷新

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/8c85b5eacbda4312a058b54a55e42408~tplv-73owjymdk6-jj-mark:0:0:0:0:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1722995582&x-orig-sign=NnRHZkLCLPn%2F7qX6Zr8l6hW5Tzw%3D)

但是我猜你的vitest插件应该还是报错，是example里面项目的配置问题，为了方便不折腾别的，我们直接删掉examples目录就好了。

ws调试的话如果断点停留超过5000ms，vitest可能会报错，我们可以加个时间，随便给的大一点就行了。

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/13a3ec987da94946bcfece00dd5ce426~tplv-73owjymdk6-jj-mark:0:0:0:0:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1722995582&x-orig-sign=2Deo94LTtQYxX1IJgLpWTwpTLFg%3D)

## resolveId

```ts
// src/index.ts 省略前面的代码
    resolveId(id) {
      if (isIconPath(id)) { // 是否是icon目录
        const normalizedId = normalizeIconPath(id) // 统一目录
        // fix issue 322
        const queryIndex = normalizedId.indexOf('?') // 处理queryString
        const res = `${(queryIndex > -1 ? normalizedId.slice(0, queryIndex) : normalizedId)
          .replace(/\.\w+$/i, '')
          .replace(/^\//, '')}${queryIndex > -1 ? `?${normalizedId.slice(queryIndex + 1)}` : ''}`
        const resolved = resolveIconsPath(res)
        const compiler = resolved?.query?.raw === 'true' ? 'raw' : options.compiler
        if (compiler && typeof compiler !== 'string') {
          const ext = compiler.extension
          if (ext)
            return `${res}.${ext.startsWith('.') ? ext.slice(1) : ext}`
        }
        else {
          switch (compiler) {
            case 'astro':
              return `${res}.astro`
            case 'jsx':
              return `${res}.jsx`
            case 'qwik':
              return `${res}.jsx`
            case 'marko':
              return `${res}.marko`
            case 'svelte':
              return `${res}.svelte`
            case 'solid':
              return `${res}.tsx`
          }
        }
        return res
      }
      return null
    },
```

用到的工具函数：

```ts
const URL_PREFIXES = ['/~icons/', '~icons/', 'virtual:icons/', 'virtual/icons/']
const iconPathRE = new RegExp(`${URL_PREFIXES.map(v => `^${v}`).join('|')}`)

export interface ResolvedIconPath {
  collection: string
  icon: string
  query: Record<string, string | undefined>
}

// 根据上面生成的正则表达式判断我们import的id是不是icon
export function isIconPath(path: string) {
  return iconPathRE.test(path)
}

// 将所有的前缀统一成'/~icons/'，方便后面统一去掉前缀
export function normalizeIconPath(path: string) {
  return path.replace(iconPathRE, URL_PREFIXES[0])
}

// 解析我们的id，是哪个图标集、图标名、query
export function resolveIconsPath(path: string): ResolvedIconPath | null {
  if (!isIconPath(path))
    return null

  path = path.replace(iconPathRE, '')

  const query: ResolvedIconPath['query'] = {}
  const queryIndex = path.indexOf('?')
  if (queryIndex !== -1) {
    const queryRaw = path.slice(queryIndex + 1)
    path = path.slice(0, queryIndex)
    new URLSearchParams(queryRaw).forEach((value, key) => {
      // configure raw compiler for empty and true values only
      if (key === 'raw')
        query.raw = (value === '' || value === 'true') ? 'true' : 'false'
      else
        query[key] = value
    })
  }

  // 去除拓展名
  path = path.replace(/\.\w+$/, '')

  const [collection, icon] = path.split('/')

  return {
    collection,
    icon,
    query,
  }
}
```

很简单的几个函数，就不多做解析了。就是判断我们import的值是否是icon。

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/c15a94cb59c949b7b1c1994deff98688~tplv-73owjymdk6-jj-mark:0:0:0:0:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1722995582&x-orig-sign=LM3t0LHP8d%2Bh5HY8%2BMEmVO0olE8%3D)

resolveId这个hook基本就是用来处理我们模块的id名，比如最后我们按需要加上后缀，对于vue、react这里我们不需要加后缀。

## load

处理完import的id，然后下面就开始实现代码生成的逻辑，这里用了两个hook，`loadInclude`和`load`，`loadInclude`是用来过滤哪个需要调用`load`的id：


```ts
// src/index.ts
    loadInclude(id) {
      return isIconPath(id)
    },
    async load(id) {
      const config = await resolved
      const code = await generateComponentFromPath(id, config) || null
      if (code) {
        return {
          code,
          map: { version: 3, mappings: '', sources: [] } as any,
        }
      }
    },
```


```ts
import { loadNodeIcon } from '@iconify/utils/lib/loader/node-loader'

export async function generateComponentFromPath(path: string, options: ResolvedOptions) {
  const resolved = resolveIconsPath(path)
  if (!resolved)
    return null
  return generateComponent(resolved, options)
}

// 主要方法
export async function generateComponent({ collection, icon, query }: ResolvedIconPath, options: ResolvedOptions) {
  const warn = `${collection}/${icon}`
  const {
    scale,
    defaultStyle,
    defaultClass,
    customCollections,
    iconCustomizer: providedIconCustomizer,
    transform,
    autoInstall = false,
    collectionsNodeResolvePath,
  } = options

  const iconifyLoaderOptions: IconifyLoaderOptions = {
    addXmlNs: false,
    scale,
    customCollections,
    autoInstall,
    defaultClass,
    defaultStyle,
    cwd: collectionsNodeResolvePath,
    // 没有必要警告，因为我们在下面抛出错误
    warn: undefined,
    customizations: {
      transform,
      async iconCustomizer(collection, icon, props) {
        await providedIconCustomizer?.(collection, icon, props)
        Object.keys(query).forEach((p) => {
          const v = query[p]
          // exclude raw compiler entry to be serialized as svg attr
          if (p !== 'raw' && v !== undefined && v !== null)
            props[p] = v
        })
      },
    },
  }
  // 调用@iconify的工具加载svg成字符串
  const svg = await loadNodeIcon(collection, icon, iconifyLoaderOptions)
  if (!svg)
    throw new Error(`Icon \`${warn}\` not found`)

  // 从查询参数接受raw编译器
  const _compiler = query.raw === 'true' ? 'raw' : options.compiler

  if (_compiler) {
    const compiler = typeof _compiler === 'string'
      ? compilers[_compiler]
      : (await _compiler.compiler) as Compiler

    if (compiler)
      return compiler(svg, collection, icon, options)
  }

  throw new Error(`Unknown compiler: ${_compiler}`)
}
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/54d20a6d396a4e9da1fc9e91ed6073be~tplv-73owjymdk6-jj-mark:0:0:0:0:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1722995582&x-orig-sign=UhqFbsp0LaSWcJG%2BhRI5Ev4rss8%3D)

可以看到这个方法主要还是通过iconify的工具函数加载svg，然后交给compiler去处理成组件或者raw字符串

## compiler

可以点击进入compilers看到各种框架的实现，先看看是怎么处理raw的：

```ts
import type { Compiler } from './types'

export const RawCompiler = ((svg: string) => {
  // 因为字符串里面也有双引号，所有需要JSON再序列化一下
  return `export default ${JSON.stringify(svg)}`
}) as Compiler
```

很简单，就在字符串外面加一个export default用来给别的模块导入。

看看react的：


```ts
import { importModule } from 'local-pkg'
import { camelize } from '@iconify/utils/lib/misc/strings'
import type { Compiler } from './types'

export const JSXCompiler = (async (
  svg,
  collection,
  icon,
  options,
) => {
  const svgrCore = await importModule('@svgr/core')
  // check for v6/v7 transform (v7 on CJS it is in default), v5 default and previous versions
  // 检查 v6/v7 transform（在 CJS 中 v7 是default导出的），v5 和之前的版本使用default
  const svgr = svgrCore.transform // v6 or v7 ESM
    || (svgrCore.default ? (svgrCore.default.transform /* v7 CJS */ ?? svgrCore.default) : svgrCore.default)
    || svgrCore
  let res = await svgr(
    svg,
    {
      plugins: ['@svgr/plugin-jsx'],
    },
    { componentName: camelize(`${collection}-${icon}`) },
  )
  // svgr不提供支持preact的选项,
  // 我们手动删除preact的react导入
  if (options.jsx !== 'react')
    res = res.replace('import * as React from "react";', '')
  return res
}) as Compiler
```

很熟悉的svgr，直接生成了适合react的代码

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/5b84cc6951a84002b13ab1c7e98b5fbe~tplv-73owjymdk6-jj-mark:0:0:0:0:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1722995582&x-orig-sign=yU74WNgFJweBIzttahKoU5VrJEw%3D)

然后看看vue3的：

```ts
import { importModule } from 'local-pkg'
import { handleSVGId } from '../svgId'
import type { Compiler } from './types'

export const Vue3Compiler = (async (svg: string, collection: string, icon: string) => {
  // 导入vue的编译工具
  const { compileTemplate } = await importModule('@vue/compiler-sfc')
  
  // 
  const { injectScripts, svg: handled } = handleSVGId(svg)

  let { code } = compileTemplate({
    source: handled,
    id: `${collection}:${icon}`,
    filename: `${collection}-${icon}.vue`,
  })

  code = `import { markRaw } from 'vue'\n${code}`
  // 因为生成的代码最后代码是export function render() {...}
  // 我们不需要导出这个render，所有去掉export
  code = code.replace(/^export /gm, '')
  // 生成组件定义
  code += `\n\nexport default markRaw({ name: '${collection}-${icon}', render${
    injectScripts ? `, data() {${injectScripts};return { idMap }}` : ''
  } })`
  code += '\n/* vite-plugin-components disabled */'

  return code
}) as Compiler
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/538cafe6ddfd42248af1739fc65fcc60~tplv-73owjymdk6-jj-mark:0:0:0:0:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1722995582&x-orig-sign=6zdxi4YuMMDPNdwGlVjljex246w%3D)

## 总结

可以看到这个插件很简单，基本就三部分，处理resolveId，调用iconify的工具加载svg字符串，最后调用compiler生成组件代码。看完这个插件相信你也能学会写一些简单的插件。