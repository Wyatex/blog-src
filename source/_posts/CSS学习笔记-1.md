---
title: CSS学习笔记-1
date: 2020-02-28 15:38:41
categories: 前端
tags: 
- 学习笔记
- CSS
- 前端
---

# CSS选择器

## 三种常见的选择器
### ID选择器/ID Selector
使用#xxx选择id为xxx的元素，xxx必须是以英文字母开头，可以大小写。
```html
html:
    <div id="the-id-selector">
        Hello World
    </div>
css:
    #the-id-selector {
        font-size: 24px;
        background-color: blue;
    }
```

> ID在html里面应该是唯一的，一个ID选择器只能用在一个元素上面，一个元素只能有一个ID

### 类选择器/Class Selector
使用.xxx来选择某一类元素，同样是英文字母开头，可以大小写。一个class可以套用到很多个元素，一个元素也可以有很多个class。
```html
html:
    <div class="the-class bg">
        Hello World
    </div>
css:
    .the-class {
        font-size: 24px;
        color: yellow;
    }
    .bg {
        background-color: blue;
    }
```

### 标签选择器/Tag Selector
使用xxx(比如div)就能套用到页面中所有的xxx标签。还可以在后面接上类选择器，选择某个标签下的某个类。
```html
html:
    <div class="the-class">
        Hello World
    </div>
css:
    div.the-class {
        font-size: 24px;
        color: yellow;
    }
```

## 运用一些方法的选择器
### 使用空格
比如下面的类选择器空格加上标签可以选择类里面的某些标签，可以随意搭配使用：
```html
html:
    <div class="container">
        <div></div>
        <div>
            <div></div>
            <div></div>
        </div>
        <div></div>
    </div>
css:
    div {
        min-height: 20px;
        border: 2px solid #333;
        margin: 4px;
        background-color: #fff;
    }
    .container div {
        background-color: yellow;
    }
```
> PS：这里并不包括container本身。

### 运用>进行选择
用于选择某个元素下的第一层元素，比如下面选择的是container下的第一层div:
```html
html:
    <div class="container">
        <div></div>
        <div>
            <div></div>
            <div></div>
        </div>
        <div></div>
    </div>
css:
    div {
        min-height: 20px;
        border: 2px solid #333;
        margin: 4px;
        background-color: #fff;
    }
    .container > div {
        background-color: yellow;
    }
```

### 使用+进行选择
比如`.container + div`选择的是跟container同一层而且紧接着的div，比如：
```html
html:
<div>
    这里container后面的div被选上了
    <div class="container">
        <div></div>
    </div>
    <div></div>
</div>
<div>
    这里container后面的div没有被选上
    <div class="container">
        <div></div>
    </div>
    <br>
    <div></div>
</div>
css:
    div {
        min-height: 20px;
        border: 2px solid #333;
        margin: 4px;
        background-color: #fff;
    }
    .container + div {
        background-color: yellow;
    }
```

### 使用波浪符号~进行选择
波浪符号的作用和加号很像，比如上面的例子改成`.container ~ div`，意思既是选择container后面所有的div（同一层）。

### 使用*进行选择
星号代表所有的html元素，一般搭配使用，比如还是上面的例子，改成`.container ~ *`即可选择container后面的所有标签（还是和container同一层的）。

## 属性选择器
比如
```html
html:
<a href="https://www.google.com" title="google">Google</a>
<a href="https://www.apple.com">Apple</a>
<a href="https://www.codepen.com">CodePen</a>
css:
a {
  display: block;
  padding: 8px;
}
/* 选择所有拥有title属性的标签 */
a[title] {
  color: red;
}
/* 根据href里面的值去选择 */
a[href="www.apple.com"] {
  color: green;
}
/* 根据xxx开头去选择 */
a[href^="https"] {
  color: gray;
}
/* 根据xxx结尾去选择 */
a[href$="e.com"] {
  color: orange;
}
/* 根据关键词xxx去选择 */
a[href*="code"] {
  color: blue;
}
```

## 伪类选择器
功能非常强大，用法参考[官方文档](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors/Pseudo-classes_and_pseudo-elements)

## CSS选择器权重
1. 内联样式，如：style=""，权重为1000.
2. ID选择器，如：#app，权重为0100.
3. 类选择器、伪类选择器、属性选择器，如：.sidebar，权重0010.
4. 代表