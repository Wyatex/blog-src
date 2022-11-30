---
title: 优化你的Vue应用
date: 2022-11-30 21:00:59
tags:
  + JavaScript
  + 前端
  + 翻译
  + Vue
categories: Vue
---

文章源地址：[Optimizing A Vue App](https://www.smashingmagazine.com/2022/11/optimizing-vue-app/)

在构建我们的 Web 应用程序时优先考虑性能可以改善用户体验，有助于确保尽可能多的人可以使用它们。在本文中，Michelle Barker 将向您介绍一些前端优化技巧，以保持我们的 Vue 应用程序尽可能高效。

<!-- more -->

单页应用程序 （SPA） 可以在处理实时动态数据时提供丰富的交互式用户体验。但它们也可能很重、臃肿而且表现不佳（或者说速度很慢?）。在本文中，我们将介绍一些前端优化技巧，以保持我们的 Vue 应用程序相对精简，并且按需打包我们需要的 JS。

> 注意: 虽然假设你对Vue和 Composition API 有一定的了解，但是希望这篇文章对你来说你选择什么框架都能有所收获

作为Ada Mode的前端开发人员，我的工作涉及维护Windscope，这是一个供风电场运营商管理和维护其涡轮机组的网络应用程序。由于需要实时接收数据以及所需的高度交互性，因此为该项目选择了SPA架构。我们的 Web 应用程序依赖于一些庞大的 JS 库，但我们希望通过尽可能快速高效地获取数据和渲染来为最终用户提供最佳体验。

# 选择框架

我们选择的JS框架是Vue，部分原因是它是我最熟悉的框架。以前，与 React 相比，Vue 的整体捆绑包大小更小。然而，自从最近的 React 更新以来，React在这方面似乎做得更好。这不一定重要，因为在本文中，我们将介绍如何仅导入所需的内容。这两个框架都有优秀的文档和庞大的开发人员生态系统（社区环境），这是另一个考虑因素。Svelte是另一种可能的选择，但由于不熟悉，它需要更陡峭的学习曲线，而且由于较新，它的生态系统不太发达。
作为演示各种优化的示例，我构建了一个简单的 Vue 应用程序，该应用程序从 API 获取数据并使用D3.js 渲染一些图表。

{% asset_img 1.png %}

> 注意：完整代码请参考示例 [GitHub](https://github.com/mbarker84/vue-app-example) 仓库。

我们正在使用Parcel（一种最小配置构建工具）来打包我们的应用，但我们在此处介绍的所有优化都适用于您选择的任何打包工具。

# 使用构建工具摇树、压缩和最小化

最好只打包您需要的代码，并且开箱即用，Parcel 会在构建过程中删除未使用的 Javascript 代码（摇树）。它还可以最小化代码，并且可以配置使用 Gzip 或 Brotli 进行压缩输出。

除了缩小，Parcel 还采用范围提升作为其生产过程的一部分，这有助于提高缩小效率。范围提升的深入指南不在本文的范围之内（看看我在那里做了什么？尽管如此，如果在我们的示例应用程序上带 `--no-optimize --no-scope-hoist` 运行 Parcel 的构建过程，我们可以看到生成的捆绑包为 510kB - 大约是优化和缩小版本的5 倍。因此，无论您使用哪种打包工具，都可以公平地说，您可能希望确保它执行尽可能多的优化。

但工作并没有就此结束。即使我们总体上发布了一个较小的捆绑包，浏览器仍然需要时间来解析和编译我们的 JS，这可能会导致用户体验变慢。这篇关于 Calibre 的[打包大小优化](https://calibreapp.com/blog/bundle-size-optimization)的文章解释了大型 JS 包如何影响性能指标。

让我们看看我们还能做些什么来减少浏览器必须做的工作量。

> 这里我还是更推荐使用vite去作为打包工具，能大幅提高打包效率和拥护更大的插件生态

# Vue 组合 API

Vue 3 引入了 Composition API作为选项API 的替代方案，这是一组新的 API用于编写组件。通过专门使用 Composition API，我们可以只导入我们需要的 Vue 函数，而不是整个包。它还使我们能够使用可组合代码编写更多可复用代码。使用 Composition API 编写的代码小，并且整个应用程序更容易进行摇树优化。

注意：如果你使用的是旧版本的 Vue，你仍然可以使用 Composition API：它被向后移植到 Vue 2.7，并且有一个[旧版本的官方插件](https://github.com/vuejs/composition-api)。

# 导入依赖项

一个关键目标是减少客户端下载的初始 JS 包的大小。Windscope广泛使用D3进行数据可视化，这是一个大型库，范围广泛。但是，Windscope只需要其中的一部分（D3库中有我们根本不需要的整个模块）。如果我们在 [Bundlephobia](https://bundlephobia.com/) 上检查整个 D3 包，我们可以看到我们的应用程序使用的可用模块不到一半，甚至可能不是这些模块中的所有功能(方法/函数)。

保持我们的捆绑包大小尽可能小的最简单方法之一是仅导入我们需要的模块。

让我们以 D3 的函数为例。我们可以使用模块导入所需的函数，而不是使用默认导入

```js
// Previous:
import * as d3 from 'd3'

// Instead:
import {
    selectAll
} from 'd3-selection'
```

# 使用动态导入进行代码拆分

在整个Windscope的很多地方都使用了某些软件包，例如AWS Amplify身份验证库，特别是 `Auth` (身份校验)方法。这是一个很大的依赖关系，对我们的 JS 包大小影响非常大。动态导入不是在文件顶部静态导入模块，而是在代码中需要它的时候允许我们精准的导入模块。

而不是：

```js
import {
    Auth
} from '@aws-amplify/auth'

const user = Auth.currentAuthenticatedUser()
```

当我们想要使用它时，我们可以导入它：

```js
import('@aws-amplify/auth').then(({
    Auth
}) => {
    const user = Auth.currentAuthenticatedUser()
})
```

这意味着该模块将被拆分为一个单独的JS包（或“块”），浏览器将在需要时下载该包。此外，浏览器可以缓存这些依赖项，这些依赖项的更改频率可能低于我们应用程序其余部分的代码。

# 使用 Vue 路由器的延迟加载路由

我们的应用程序使用 `vue-router` 进行导航。与动态导入类似，我们可以延迟加载路由组件，因此只有在用户导航到该路由时才会导入它们（以及它们关联的依赖项）。

在我们 `index/router.js` 的代码中

```js
// 先前:
import Home from "../routes/Home.vue";
import About from "../routes/About.vue";

// 使用懒加载代替:
const Home = () => import("../routes/Home.vue");
const About = () => import("../routes/About.vue");

const routes = [{
        name: "home",
        path: "/",
        component: Home,
    },
    {
        name: "about",
        path: "/about",
        component: About,
    },
];
```

仅当用户单击“关于”链接并导航到该页面时，才会加载“关于”页面的代码。

# 异步组件

了延迟加载每条路由之外，我们还可以使用 Vue 的 `defineAsyncComponent` 方法延迟加载单个组件。

```js
const KPIComponent = defineAsyncComponent(() => import('../components/KPI.vue))
```

这意味着 KPI 组件的代码将被动态导入，正如我们在路由器示例中所看到的那样。我们还可以提供一些组件，以便在它处于加载或错误状态时显示（如果我们加载一个特别大的文件，这很有用）。

```js
const KPIComponent = defineAsyncComponent({
    loader: () => import('../components/KPI.vue'),
    loadingComponent: Loader,
    errorComponent: Error,
    delay: 200,
    timeout: 5000,
});
```

# 拆分 API 请求

我们的应用程序主要关注数据可视化，严重依赖从服务器获取大量数据。其中一些请求可能非常慢，因为服务器必须对数据执行大量计算。在我们的初始原型中，我们向每个路由的 REST API 发出了一个请求。不幸的是，我们发现这导致用户不得不等待很长时间 - 有时长达 10 秒，在应用程序成功接收数据并开始渲染可视化之前观看加载微调器。

我们决定将 API 拆分为多个端点，并为每个小部件发出请求。虽然这可能会增加整体响应时间，但这意味着应用程序应该更快地可用，因为用户将在等待其他页面时看到页面的一部分呈现。此外，可能发生的任何错误都将本地化，而页面的其余部分仍然可用。

您可以看到此处说明的差异：

{% dplayer "url=https://gitee.com/wyatex/wyatex/raw/master/Vue/%E4%BC%98%E5%8C%96%E4%BD%A0%E7%9A%84Vue%E5%BA%94%E7%94%A8/2.mp4" "loop=yes" "theme=#FADFA3" "autoplay=false" %}

> 在右侧的示例中，用户可以与某些组件进行交互，而其他组件仍在请求数据。左侧的页面必须等待大型数据响应，然后才能呈现并具有交互性。

# 有条件地加载组件

现在我们可以将其与异步组件结合使用，以便仅在收到来自服务器的成功响应时加载组件。在这里，我们获取数据，然后在 `fetch` 函数成功返回时导入组件：

```html template

    <div>
        <component :is="KPIComponent" :data="data"></component> 
    </div>

```

```js script
import {
    defineComponent,
    ref,
    defineAsyncComponent
} from "vue";
import Loader from "./Loader";
import Error from "./Error";

export default defineComponent({
            components: {
                Loader,
                Error
            },

            setup() {
                const data = ref(null);

                const loadComponent = () => {
                    return fetch('https://api.npoint.io/ec46e59905dc0011b7f4')
                        .then((response) => response.json())
                        .then((response) => (data.value = response))
                        .then(() => import("../components/KPI.vue") // Import the component
                            .catch((e) => console.error(e));
                        };

                    const KPIComponent = defineAsyncComponent({
                        loader: loadComponent,
                        loadingComponent: Loader,
                        errorComponent: Error,
                        delay: 200,
                        timeout: 5000,
                    });

                    return {
                        data,
                        KPIComponent
                    };
                }
            }
        )
```

为了处理每个组件的此过程，我们创建了一个称为 `WidgetLoader` 的高阶组件，您可以在仓库中看到该组件。

此模式可以扩展到应用中在用户交互时呈现组件的任何位置。例如，在Windscope中，我们仅在用户单击“地图”选项卡时才加载地图组件（及其依赖项）。这称为[交互时导入](https://www.patterns.dev/posts/import-on-interaction/)。

# CSS

如果运行示例代码，您将看到单击“位置”导航链接会加载地图组件。除了动态导入JS模块外，在组件的 `<style>` 块中导入依赖项也会延迟加载CSS：

```css
// In MapView.vue
<style>@import "../../node_modules/leaflet/dist/leaflet.css";

.map-wrapper {
    aspect-ratio: 16 / 9;
}

</style>
```

# 优化加载状态

此时，我们的 API 请求并行运行，组件在不同的时间呈现。我们可能会注意到的一件事是页面看起来很卡顿，因为布局会有很多变化。

{% dplayer "url=https://gitee.com/wyatex/wyatex/raw/master/Vue/%E4%BC%98%E5%8C%96%E4%BD%A0%E7%9A%84Vue%E5%BA%94%E7%94%A8/3.mp4" "loop=yes" "theme=#FADFA3" "autoplay=false" %}

使用户感觉更流畅的一种快速方法是在小部件上设置一个大致对应于渲染组件的纵横比，这样用户就不会看到那么大的布局偏移。我们可以为此传递一个 prop 来解释不同的组件，并回退到默认值。

```html WidgetLoader.vue template
<div class="widget" :style="{ 'aspect-ratio': loading ? aspectRatio : '' }" >

    <component :is="AsyncComponent" :data="data" />

</div> 

```

```js WidgetLoader.vue script
import {
    defineComponent,
    ref,
    onBeforeMount,
    onBeforeUnmount
} from "vue";
import Loader from "./Loader";
import Error from "./Error";

export default defineComponent({
            components: {
                Loader,
                Error
            },

            props: {
                aspectRatio: {
                    type: String,
                    default: "5 / 3", // define a default value
                },
                url: String,
                importFunction: Function,
            },

            setup(props) {
                const data = ref(null);
                const loading = ref(true);

                const loadComponent = () => {
                        return fetch(url)
                            .then((response) => response.json())
                            .then((response) => (data.value = response))
                            .then(importFunction
                                .catch((e) => console.error(e))
                                .finally(() => (loading.value = false)); // Set the loading state to false
                            };

                        /* ...Rest of the component code */

                        return {
                            data,
                            aspectRatio,
                            loading
                        };
                    },
            }); 
```

# 中止 API 请求

在包含大量 API 请求的页面上，如果用户在所有请求完成之前导航离开，会发生什么情况？我们可能不希望这些请求继续在后台运行，从而减慢用户体验。

我们可以使用AbortController接口，它使我们能够根据需要中止 API 请求。

在我们的 `setup` 函数中，我们创建一个新的控制器并将其信号传递到我们的获取请求参数中：

```js
setup(props) {
    const controller = new AbortController();

    const loadComponent = () => {
        return fetch(url, {
                signal: controller.signal
            })
            .then((response) => response.json())
            .then((response) => (data.value = response))
            .then(importFunction)
            .catch((e) => console.error(e))
            .finally(() => (loading.value = false));
    };
}
```

然后我们在卸载组件之前中止请求，使用 Vue 的 `onBeforeUnmount` 函数：

```js
onBeforeUnmount(() => controller.abort());
```

如果在请求完成之前运行项目并导航到另一个页面，则应在控制台中看到错误，指出请求已中止。
