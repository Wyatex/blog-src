---
title: CSS学习笔记-2
date: 2022-01-19 20:33:33
categories: 前端
tags:
  - 学习笔记
  - CSS
  - 前端
---

字节前端青训营课程内容笔记

<!-- more -->

# CSS 继承

某些属性会自动继承其父元素的计算值，除非显式指定一个值。一般和文字相关的属性都可以继承，但是和宽度、高度等模型尺寸相关的属性不可以继承。

```html
<p>
  This is a
  <em>em-test</em>
  of
  <strong>inherit</strong>
</p>
<style>
  body {
    font-size: 20px;
  }
  p {
    color: blue;
  }
  em {
    color: red;
  }
</style>
```

可以看到 p 继承了 body 的 font-size，strong 继承了 p 的 color。

如果一个属性不可继承，但是又想让其继承父级属性，可以用通配选择器 \* 指定该属性为 inherit，inherit 关键字表示指定一个属性应从父元素继承它的值。如下所示：

```css
* {
  box-sizing: inherit;
}
html {
  box-sizing: border-box;
}
.some-content-box {
  box-sizing: content-box;
}
```

# CSS 初始值

CSS 中，每个属性都有一个初始值，比如：background-color 的初始值为 transparent、margin-left 的初始值为 0

可以使用 initial 关键字显式重置为初始值 background-color: initial

# unset

除了继承和初始值，还有个 unset 的值，如果使用 unset 会先判断改值是否为可继承属性，如果是可继承将继承父级，否则相当于 initial（初始值）。

# CSS 从解析到展示过程

大概的流程是：

1. 首先通过 DOM 树和样式表通过 filtering（过滤）得到 DeclaredValue（声明值）
2. 然后通过 cascading（层叠）的得到 CascadedValue（层叠值）
3. 然后对层叠值进行 defaulting（缺省化）得到 SpecifiedValue（指定值）
4. 指定值进行一些 resolving（处理）转换得到 ComputedValue（计算值）
5. 计算值再进一步 formatting（格式化）得到 UsedValue（使用值）
6. 使用值通过 constraining（常数化）得到实际值，这时候就能实际使用了

关于上面一些操作的解释：

- filtering：对应用到该页面的规则用以下条件进行筛选:选择器匹配、属性有效、符合当前 media 等。
- Declared Value：一个元素的属性可以有 0 到多个声明值属性可以有 0 到多个声明值。
- cascading：按照来源、!important、选择器特异性、书写顺序等选出优先级最高的一个属性值。
- Cascaded Value：Cascaded Value,在层叠过程中，赢得优先级比赛的那个值。比如 1.2em
- defaulting：当层叠值为空的时候，使用继承/初始值。
- Specified Value：经过 cascading 和 defaulting 之后，保证指定值一定不为空
- resolving：将一些相对值或者关键字转化为绝对值，比如 em 转为 px，相对路径转为绝对路径。
- Computed Value：一般来说是，浏览器会在不进行实际布局的情况下，所能得到的最具体的值。比如 60%
- formatting：将计算值进一步转换， 比如关键字、百分比都转为绝对值。
- Used Value：进行实际布局时使用的值，不会再有相对值或关键字。比如 400.2px
- constraining：将小数像素转为整数
- 实际值：渲染时实际生效的值，比如 400px

# 常规流

## 行级摆放上下文（IFC）

全称：**Inline Formatting Content**

- 盒子在一行内水平摆放；
- 一行放不下就换行；
- vertical-align 控制垂直对齐（有基线）；
- text-align 控制水平对齐；
- 需要避开 float 浮动元素。

实现文字居中对齐：`vertical-align:middle;`

## 块级排版上下文(BFC)

全称：Block Formatting Content

某些容器会创建一个 BFC:

- 根元素
- 浮动、绝对定位、inline-block
- Flex 子项和 Grid 子项
- overflow 值不是 visible 的块盒
- display:flow-root;

BFC 内的排版规则:

- 盒子从下到上摆放
- 垂直 margin 合并
- BFC 内盒子的 margin 不会与外面的合并
- BFC 不会和浮动元素重叠

> 下一节讲解 flex grid 布局
