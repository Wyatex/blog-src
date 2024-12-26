---
title: uniapp实现类似router-view的功能
date: 2024-12-25 10:44:45
tags:
  - uniapp
  - vue
categories: uniapp
---

相信很多小伙伴在vue转uniapp或者微信小程序的时候都会想过想简单的一个函数调用一些信息提示的功能，比如：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/919c5ec8a9d8432b9b47fa8aaf294c5e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785920&x-orig-sign=Y4Hu59bztiQA9a1qnjigiQqMadY%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/3a9d12e0eaa64e8eaf5a3785be561aa6~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785920&x-orig-sign=fyjGfCweI2WjthEDC1525FSSxfg%3D)

熟悉uniapp的小伙伴肯定知道有showToast这个方法，但是这个方法的限制很大，比如限制图标、限制文本字数等等。

当然，uniapp的一些组件库也提供了类似的功能，比如uview的Toast组件，提供了更丰富的样式和功能。但是像这种组件都必须在每个用到的页面都写上这么一个组件，那有没有什么办法像上面的element一样直接一个方法搞定呢？

众所周知小程序的模板不支持动态修改dom，也就不能像web一样往body里面append一个dom，那么怎么实现呢？

我的思路是像上面的naive-ui一样在页面内容外统一使用这个组件，至于怎么实现呢，我相信聪明的你肯定能想到布局，只需要每个页面都使用这个布局不就好了，这时候我们就需要使用我们的布局插件！

<!-- more -->

## [@uni-helper/vite-plugin-uni-layouts](https://www.npmjs.com/package/@uni-helper/vite-plugin-uni-layouts)

这个插件为我们提供了页面布局的功能，详情使用方法可进去查看readme，安装好这个插件那么就能在默认模板里面加入我们想要的任何组件了。

但是我们如何在任意地方使用这个toast呢？

用过微信小程序的小伙伴都知道有个globalData的东西，能够整个app共用一个对象用于存储数据，而uniapp也为我们提供了这个功能，写h5、app的小伙伴也不用担心，uniapp为我们兼容了所有端。

那么我们只需要在进入每个页面的时候，把当前页面的Toast组件的ref存到globalData不就可以了吗？

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ffc53be6ae3641eb9276891d5581ad77~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785920&x-orig-sign=2LgQyWnz94RzyROi6PA1634JrTg%3D)

需要留意的是，因为我们有很多个页面，所有在页面切换的时候，需要把当前页面布局的Toast组件的ref存下来，所以需要onShow这个生命周期钩子。

又因为onShow应该是要比组件mount的时机要早的，所以第一次执行onShow回调的时候，这里的uToast.value是undefined的，所以我们需要补一个onMounted的生命周期钩子，保证第一次加载完组件能拿到ref。

## 在其他地方使用

首先第一个是封装成一个方法并且标明入参类型提供其他页面去使用：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/7a8d189fa7f148c19dcc2bf70c8dd621~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785920&x-orig-sign=krHgf2tlCucwcMZjUvNMnNazhk4%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f37d92513445476fb3ebac2c3ee94d04~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785920&x-orig-sign=se%2BZy1cMbLbAiwMUMiLZv534yFI%3D)

这样我们就能在任意地方使用我们在布局里的东西了，包括咱们的网络请求拦截器：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/54aa52b51eef4713bd03922ae073efad~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785920&x-orig-sign=J75Bbw1pJUNu2ggd2d6S4%2BTQsKI%3D)

只能说，这个插件真的是，**太裤辣**！

最后这是我的模板，详情代码可以看这个仓库： https://github.com/MatrixCross/Vue3-Uniapp-Starter
