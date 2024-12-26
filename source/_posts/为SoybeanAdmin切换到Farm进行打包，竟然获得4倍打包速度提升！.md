---
title: 为SoybeanAdmin切换到Farm进行打包，竟然获得4倍打包速度提升！
date: 2024-09-02 10:29:43
tags:
 - SoybeanAdmin
 - Farm
 - Vue
categories: 前端
---

> Farm项目这个项目关注很久了，最近几个月Farm 1.0也推出了，对vite的适配也完善了很多，那么直接来尝试一下，我比较喜欢的Vue后台项目是SoybeanAdmin，所以我们就拿他来做个对比吧。

## 效果对比

项目使用：<https://github.com/soybeanjs/soybean-admin> 项目的main分支。

<!-- more -->

先不说别的，先直接看看效果：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/676d9db9889f433aa77303c21fdebf1f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785028&x-orig-sign=eSby4nZjzhhvGFVlFcJWL4r6lvI%3D)

vite打包用时15.2s

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ac25455912574697bd4b3b7fd8d7f372~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785028&x-orig-sign=9Ddv0w0dnGPAFI1jM3p9CrUY9nI%3D)

farm评价用时3.7s左右

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/9b855952462b42d48528c18f3231f307~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785028&x-orig-sign=T9wXjT2vP7x5jCaVObOSVfJl6uY%3D)

vite启动本地服务时间大概2s，但是因为是bundleless，打开页面还要进行一些编译，可能打开页面时间会慢一点

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/bb05a44c93a641a39c3e470e31f2a3a7~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785028&x-orig-sign=EXZdHhn2%2BhBzzFOcAvr4jxmVdpk%3D)

farm的话就得久一点了，但是farm使用的是`Partial Bundling`的策略，从控制台打印的来看好像就是把很多依赖包都先打包构建好，自然启动时间就长一点了，但是带来的好处就是打开页面之后请求的js数量就少很多了，而且因为已经打包好了，所以请求之后基本可以立刻返回打包好的js，不会出现vite这种可能启动几百ms，但是打开页面等几十个js请求，等好几秒页面才出来的情况。

官方benchmark：

|         | **Startup** | **HMR (Root)** | **HMR (Leaf)** | **Production Build** |
| ------- | ----------- | -------------- | -------------- | -------------------- |
| Webpack | 8035ms      | 345ms          | 265ms          | 11321ms              |
| Vite    | 3078ms      | 35ms           | 18ms           | 2266ms               |
| Rspack  | 831ms       | 104ms          | 96ms           | 724ms                |
| Farm    | 403ms       | 11ms           | 10ms           | 288ms                |

不过感觉和Farm官方的benchmark有一点点出入，特别是启动时间，可能如果产物越大差别就没那么明显了。

## 迁移过程

简单讲一下main分支的代码需要怎么迁移吧：

首先是打包配置定义部分：

```ts
// farm.config.ts
import { URL, fileURLToPath } from 'node:url';
import process from 'node:process';
import { defineConfig, loadEnv } from '@farmfe/core';
import { setupVitePlugins } from './build/plugins';
import { createViteProxy, getBuildTime } from './build/config';
import postcss from '@farmfe/js-plugin-postcss'

export default defineConfig(configEnv => {
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as Env.ImportMeta;

  const buildTime = getBuildTime();

  // @todo: farm/cli包还在重构，下个版本支持获取command和isPreview
  // const enableProxy = configEnv.command === 'serve' && !configEnv.isPreview;
  const enableProxy = true;

  const proxy = createViteProxy(viteEnv, enableProxy);

  // uno.config.ts需要用到环境变量，这里先存到 process.env，因为不知道还有没有别的方法
  process.env.viteEnv = JSON.stringify(viteEnv);

  return {
    compilation: {
      define: {
        BUILD_TIME: JSON.stringify(buildTime)
      },
      output: {
        publicPath: viteEnv.VITE_BASE_URL
      },
      resolve: {
        alias: {
          '~': fileURLToPath(new URL('./', import.meta.url)),
          '@': fileURLToPath(new URL('./src', import.meta.url))
        }
      }
    },
    server: {
      port: 9527,
      open: true,
      proxy
    },
    plugins: [
      postcss(),
      [
        '@farmfe/plugin-sass',
        {
          additionalData: `@use "@/styles/scss/global.scss" as *;`
        }
      ]
    ],
    vitePlugins: setupVitePlugins(viteEnv, buildTime) as object[]
  };
});
```

`./build/plugins` 部分代码也需要修改一下:

```ts
import type { PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
// import VueDevtools from 'vite-plugin-vue-devtools';
import progress from 'vite-plugin-progress';
import { setupElegantRouter } from './router';
// import { setupUnocss } from './unocss';
import { setupUnplugin } from './unplugin';
import { setupHtmlPlugin } from './html';

export function setupVitePlugins(viteEnv: Env.ImportMeta, buildTime: string) {
  const plugins: PluginOption = [
    vue({
      script: {
        defineModel: true
      }
    }),
    vueJsx(),
    // VueDevtools(),
    setupElegantRouter(),
    // setupUnocss(viteEnv),
    ...setupUnplugin(viteEnv),
    progress(),
    setupHtmlPlugin(buildTime)
  ];

  return plugins;
}
```

unocss的vite插件使用到了一些比较特别的vite hook，farm还不支持，所以这里咱们换成postcss插件，安装：`@farmfe/js-plugin-postcss` 和 `@unocss/postcss`

创建postcss的配置文件：

```js
// postcss.config.mjs
import UnoCSS from '@unocss/postcss'

export default {
  plugins: [
    UnoCSS(),
  ],
}
```

uno.config.ts文件修改一下：

```ts
import path from 'node:path';
import process from 'node:process';
import { defineConfig } from '@unocss/vite';
import transformerDirectives from '@unocss/transformer-directives';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import presetUno from '@unocss/preset-uno';
import type { Theme } from '@unocss/preset-uno';
import { presetSoybeanAdmin } from '@sa/uno-preset';
import presetIcons from '@unocss/preset-icons';
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders';
import { themeVars } from './src/theme/vars';

// 上面存的环境变量就在这里使用
const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = JSON.parse(process.env.viteEnv as string);

const localIconPath = path.join(process.cwd(), 'src/assets/svg-icon');
const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, '');

export default defineConfig<Theme>({
  theme: {
    ...themeVars,
    fontSize: {
      'icon-xs': '0.875rem',
      'icon-small': '1rem',
      icon: '1.125rem',
      'icon-large': '1.5rem',
      'icon-xl': '2rem'
    }
  },
  shortcuts: {
    'card-wrapper': 'rd-8px shadow-sm'
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [
    presetUno({ dark: 'class' }),
    presetSoybeanAdmin(),
    presetIcons({
      prefix: `${VITE_ICON_PREFIX}-`,
      scale: 1,
      extraProperties: {
        display: 'inline-block'
      },
      collections: {
        [collectionName]: FileSystemIconLoader(localIconPath, svg =>
          svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
        )
      },
      warn: true
    })
  ]
});
```

最后注释掉`src/plugins/assets.ts`里的`import 'uno.css';`

换成在`src/styles/css/global.css`里使用unocss：

```css
@import './reset.css';
@import './nprogress.css';
@import './transition.css';
@unocss;

html,
body,
#app {
  height: 100%;
}

html {
  overflow-x: hidden;
}
```

到此为止，咱们就成功将vite切换到farm了，最后结果可以看这个仓库：<https://github.com/Wyatex/farm-soybean-admin>

## 再额外补个example分支打包时间对比

因为主分支被精简过了，咱们把main分支合并到example分支然后打包试试：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/c33d51b96706450195167f492df0be52~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785028&x-orig-sign=j35NBhCb9Co%2FAB7jGFsDA%2FZeGBg%3D)

vite打包时间是21s左右

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/d3ea63399ad94d2aaa7b7d83692ccd4e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785028&x-orig-sign=esVHITxEdzKZNPqSUb9ocmy95LA%3D)

farm的时间就去到6.1s，已经缩短到不到4倍了，看来打包的内容越多打包时间倍数差就没那么大了（手动滑稽），这也可能是这个项目打包时间和benchmark差别大的原因吧。
