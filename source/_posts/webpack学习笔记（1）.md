---
title: webpack学习笔记（1）：入门
date: 2020-11-16 17:23:58
tags:
---
开始学习webpack打包

<!-- more -->

# 快速上手
首先新建一个非常简单的页面，目录如下：
```
└─ learn
   ├── src
   │   ├── heading.js
   │   └── index.js
   └── index.html
```
```js
// ./src/heading.js
export default () => {
  const element = document.createElement('h2')
  element.textContent = 'Hello webpack'
  element.addEventListener('click', () => alert('Hello webpack'))
  return element
}
```
```js
// ./src/index.js
import createHeading from './heading.js'
const heading = createHeading()
document.body.append(heading)
```
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Webpack - 快速上手</title>
</head>
<body>
  <script type="module" src="./src/index.js"></script>
</body>
</html>
```
> type="module" 这种用法是 ES Modules 中提出的标准，用来区分加载的是一个普通 JS 脚本还是一个模块。

因为上面的`type="module"`是ES6语法，但是在不支持中这个语法的浏览器可能会出现错误，所以我们使用webpack把按照模块化方式拆分的 JS 代码再次打包到一起。

首先按照webpack
```
$ npm init --yes                            //新建package.json文件
$ npm i webpack webpack-cli --save-dev      //安装本体和cli模块
```
不过现在因为webpack更新后导致打包结果和视频教学的结果不一样，所以使用这个方法：
1. 把package.json里的webpack版本改为4.44.2，cli改成3.3.12
2. 删掉`node_modules`，再执行`npm install`

最后使用`npx webpack`即可执行打包

结果会出现在 `./dist/main.js` 

然后我们就可以删掉 `type="module"` :
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Webpack - 快速上手</title>
</head>
<body>
  <script src="./dist/main.js"></script>
</body>
</html>
```

# 配置 Webpack 的打包过程
Webpack 4 以后的版本支持零配置的方式直接启动打包，整个过程会按照约定将 src/index.js 作为打包入口，最终打包的结果会存放到 dist/main.js 中。

如果需要自定义打包过程，那就需要在根目录下添加 `webpack.config.js` ，因为这个是运行在node环境中所以需要按照CommonJS方式编写代码，首先试试修改Webpack 打包的入口文件路径和输出文件的文件名和目录：
```js
// ./webpack.config.js
const path = require('path')
module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'output')
  }
}
```
> webpack.config.js 是运行在 Node.js 环境中的代码，所以直接可以使用 path 之类的 Node.js 内置模块。

全部的配置项可以看[Webpack官网](https://webpack.js.org/configuration/#options)

# 让配置文件支持智能提示
在配置文件中通过import方法导入Webpack中的 `Configuration` 类型，并通过ts的注解，vs就能提供正确的提示了。
```js
// ./webpack.config.js
import { Configuration } from 'webpack'
/**
 * @type {Configuration}
 */
const config = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  }
}
module.exports = config
```
不过由于node不支持import语句，所以打包时要注释掉import语句。不过还有一种更方法的方法，利用vscode对ts的原生支持，在配置文件中使用ts的动态导入方式，实现智能提示
```js
// ./webpack.config.js
/** @type {import('webpack').Configuration} */
const config = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  }
}
module.exports = config
```
> 这种 @type 类型注释的方式是基于 [JSDoc](https://jsdoc.app/) 实现的。JSDoc 中类型注释的用法还有很多，详细可以参考[官方文档中对 @type 标签的介绍](https://jsdoc.app/tags-type.html)。

# 工作模式
webpack 4新增了工作模式功能，提供了三种预设
* production 模式下，启动内置优化插件，自动优化打包结果，打包速度偏慢；
* development 模式下，自动优化打包速度，添加一些调试过程中的辅助插件；
* none 模式下，运行最原始的打包，不做任何额外处理。

默认情况下使用production模式。

修改 Webpack 工作模式的方式有两种：
* 通过 CLI --mode 参数传入；
* 通过配置文件设置 mode 属性。

