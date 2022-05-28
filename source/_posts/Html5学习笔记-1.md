---
title: Html5学习笔记（1）
date: 2020-02-05 19:43:57
categories: 前端
tags: 
- 学习笔记
- HTML
- 前端
---

一些html5的学习笔记

<!-- more -->

# 主要的标签和属性

## 新的多媒体元素

标签 | 描述
- | -
`<audio>` | 定义音频内容
`<video>` | 定义视频内容
`<source>` | 定义多媒体资源，配合video或audio使用
`<embed>` | 定义嵌入内容，个人感觉不常用

```HTML
<video width="321" height= "123" controls>
  <source src="movie.mp4" type="video/mp4">
  <source src="movie.ogg" type="video/ogg">
您的浏览器不支持Video标签。
</video>
```
如果浏览器不支持就会显示：您的浏览器不支持Video标签。

video支持是属性：<a href="#" title="如果出现该属性，则视频在就绪后马上播放。">autoplay</a> 、 <a href=# title="如果出现该属性，则向用户显示控件，比如播放按钮。">controls</a> 、<a href=# title="播放器大小">height和width</a> 、<a href=# title="如果出现该属性，则当媒介文件完成播放后再次开始播放。">loop</a> 、<a href=# title="规定视频的音频输出应该被静音。">muted</a>、<a href=# title="规定视频下载时显示的图像，或者在用户点击播放按钮前显示的图像。">poster</a>、<a href=# title="如果出现该属性，则视频在页面加载时进行加载，并预备播放。如果使用autoplay，则忽略该属性。">preload</a>、<a href=# title="要播放的视频的 URL。">src</a> 。

audio有：autoplay、controls、loop、muted、preload、src属性。

## 新的表单元素

标签 | 描述
- | -
`<datalist>` | 定义选项列表，与 input 元素配合使用，用来定义 input 可能的值。
`<keygen>` | 规定用于表单的密钥对生成器字段。
`<output>` | 定义不同类型的输出，比如脚本的输出。


## 新的语意标签
标签 | 描述
- | -
`<article>` | 定义内容区域
`<aside>` | 定义侧边栏
`<command>` | 定义命令按钮
`<details>` | 定义细节
`<dialog>` | 定义对话框
`<summary>` | 标签包含 details 元素的标题
`<figure>` | 规定独立的流内容（图像、图表、照片、代码等等）。
`<figcaption>` | 定义` <figure>` 元素的标题
`<footer>` | 定义 section 或 document 的页脚。
`<header>` | 定义了头部区域
`<mark>` | 	定义带有记号的文本。
`<meter>` | 定义度量衡。仅用于已知最大和最小值的度量。 
`<nav>` | 	定义导航链接的部分。
`<progress>` | 	定义任何类型的任务的进度。
`<rt>` | 定义字符（中文注音或字符）的解释或发音。
`<section>` | 定义文档中的节（section、区段）。
`<time>` | 定义日期或时间。
`<wbr>` | 规定在文本中的何处适合添加换行符。

## 在HTML5中删除的HTML4.01标签
* `<acronym>`
* `<applet>`
* `<basefont>`
* `<big>`
* `<center>`
* `<dir>`
* `<font>`
* `<frame>`
* `<frameset>`
* `<noframes>`
* `<strike>`
* `<tt>`

## 表单的属性

### form标签的属性
属性 | 值 | 描述
- | - | -
accept-charset | charset_list | 规定服务器可处理的表单数据字符集。
action | URL | 规定当提交表单时向何处发送表单数据。
autocomplete | on / off | 规定是否启用表单的自动完成功能。
enctype |  | 规定在发送表单数据之前如何对其进行编码。
method | get/post | 规定用于发送 form-data 的 HTTP 方法。
name | form_name | 规定表单的名称。
novalidate | novalidate | 如果使用该属性，则提交表单时不进行验证。
target |  | 规定在何处打开 action URL。

enctype 属性可能的值：
* application/x-www-form-urlencoded
* multipart/form-data
* text/plain

target 属性可能的值：
* _blank
* _self
* _parent
* _top
* framename

# Web 储存

## localStorage 和 sessionStorage 

客户端存储数据的两个对象：
* localStorage - 没有时间限制
* sessionStorage - 针对session的数据储存

使用前应检查是否支持

```javascript
if(typeof(Storage)!=="undefined") {        
    // 是的! 支持 localStorage  sessionStorage 对象!         
    // 一些代码.....         
} else {        
    // 抱歉! 不支持 web 存储。         
}
```

## localStorage对象

实例：
```javascript
// 存储
localStorage.sitename = "Wyatex博客";
// 查找
document.getElementById("result").innerHTML = localStorage.sitename;
```

localStorage其他可用API：
* 保存数据：`localStorage.setItem(key,value);`
* 读取数据：`localStorage.getItem(key);`
* 删除单个数据：`localStorage.removeItem(key);`
* 删除所有数据：`localStorage.clear();`
* 得到某个索引的key：`localStorage.key(index);`

## sessionStorage对象

用户关闭浏览器窗口后数据会删除，实例：
```javascript
if (sessionStorage.clickcount) {
  sessionStorage.clickcount = (sessionStorage.clickcount)+1;
} else {
  sessionStorage.clickcount=1;
}
document.getElementById("counter").innerHTML="在这个会话中你已经点击了该按钮 " + sessionStorage.clickcount + " 次 ";
```

# HTML5 应用程序缓存
使用 HTML5，通过创建 cache manifest 文件，可以轻松地创建 web 应用的离线版本。
实例：
```HTMl
<!DOCTYPE HTML>
<html manifest="demo.appcache">

<body>
The content of the document......
</body>

</html>
```

## manifest文件
manifest 文件是简单的文本文件，它告知浏览器被缓存的内容（以及不缓存的内容）。

manifest 文件可分为三个部分：

* CACHE MANIFEST - 在此标题下列出的文件将在首次下载后进行缓存
* NETWORK - 在此标题下列出的文件需要与服务器的连接，且不会被缓存
* FALLBACK - 在此标题下列出的文件规定当页面无法访问时的回退页面（比如 404 页面）

### CACHE MANIFEST
第一行，CACHE MANIFEST，是必需的：
```
CACHE MANIFEST        
/theme.css        
/logo.gif        
/main.js
```

### NETWORK
下面的 NETWORK 小节规定文件 "login.php" 永远不会被缓存，且离线时是不可用的： 
```
NETWORK:        
login.php
```
可以使用星号来指示所有其他其他资源/文件都需要因特网连接：
```
NETWORK:        
*
```

### FALLBACK
下面的 FALLBACK 小节规定如果无法建立因特网连接，则用 "offline.html" 替代 /html/ 目录中的所有文件：
```
FALLBACK:       
/html/ /offline.html
```
第一个 URI 是资源，第二个是替补。

实例：完整的 Manifest 文件
```
CACHE MANIFEST        
# 2012-02-21 v1.0.0       
/theme.css        
/logo.gif        
/main.js        
        
NETWORK:        
login.php        
        
FALLBACK:       
/html/ /offline.html
```
**提示** : 以 "#" 开头的是注释行，但也可满足其他用途。应用的缓存会在其 manifest 文件更改时被更新。如果您编辑了一幅图片，或者修改了一个 JavaScript 函数，这些改变都不会被重新缓存。更新注释行中的日期和版本号是一种使浏览器重新缓存文件的办法。

# WebSocket
WebSocket是HTML5开始提供的一种在单个 TCP 连接上进行全双工通讯的协议。

在WebSocket API中，浏览器和服务器只需要做一个握手的动作，然后，浏览器和服务器之间就形成了一条快速通道。两者之间就直接可以数据互相传送。

浏览器通过 JavaScript 向服务器发出建立 WebSocket 连接的请求，连接建立以后，客户端和服务器端就可以通过 TCP 连接直接交换数据。

当你获取 Web Socket 连接后，你可以通过 send() 方法来向服务器发送数据，并通过 onmessage 事件来接收服务器返回的数据。

以下 API 用于创建 WebSocket 对象。

```javascript
var Socket = new WebSocket(url, [protocal] );
```
以上代码中的第一个参数 url, 指定连接的 URL。第二个参数 protocol 是可选的，指定了可接受的子协议。

## WebSocket 属性
以下是 WebSocket 对象的属性。假定我们使用了以上代码创建了 Socket 对象：

<table>
    <tbody>
        <tr class="firstRow">
            <td width="401" valign="top" style="word-break: break-all;">
                属性
            </td>
            <td width="401" valign="top" style="word-break: break-all;">
                描述
            </td>
        </tr>
        <tr>
            <td width="401" valign="top" style="word-break: break-all;">
                Socket.readyState
            </td>
            <td width="401" valign="top" style="word-break: break-all;">
                <p>
                    只读属性&nbsp;readyState&nbsp;表示连接状态，可以是以下值：
                </p>
                <ul class="list list-paddingleft-2">
                    <li>
                        <p>
                            0 - 表示连接尚未建立。
                        </p>
                    </li>
                    <li>
                        <p>
                            1 - 表示连接已建立，可以进行通信。
                        </p>
                    </li>
                    <li>
                        <p>
                            2 - 表示连接正在进行关闭。
                        </p>
                    </li>
                    <li>
                        <p>
                            3 - 表示连接已经关闭或者连接不能打开。
                        </p>
                    </li>
                </ul>
            </td>
        </tr>
        <tr>
            <td width="401" valign="top" style="word-break: break-all;">
                Socket.bufferedAmount
            </td>
            <td width="401" valign="top" style="word-break: break-all;">
                只读属性&nbsp;bufferedAmount&nbsp;已被 send() 放入正在队列中等待传输，但是还没有发出的 UTF-8 文本字节数。
            </td>
        </tr>
    </tbody>
</table>

## WebSocket 事件
<table class="reference" width="979" style="width: 828px;">
    <tbody style="margin: 0px; padding: 0px;">
        <tr style="margin: 0px; padding: 0px; background-color: rgb(239, 239, 239);" class="firstRow">
            <th width="10%" style="margin: 0px; padding: 3px; background-color: rgb(189, 189, 189); border-top-color: rgb(189, 189, 189); border-right-color: rgb(189, 189, 189); border-bottom: none; border-left-color: rgb(189, 189, 189); color: rgb(255, 255, 255); vertical-align: top; text-align: left;">
                事件
            </th>
            <th width="25%" style="margin: 0px; padding: 3px; background-color: rgb(189, 189, 189); border-top-color: rgb(189, 189, 189); border-right-color: rgb(189, 189, 189); border-bottom: none; border-left-color: rgb(189, 189, 189); color: rgb(255, 255, 255); vertical-align: top; text-align: left;">
                事件处理程序
            </th>
            <th style="margin: 0px; padding: 3px; background-color: rgb(189, 189, 189); border-top-color: rgb(189, 189, 189); border-right-color: rgb(189, 189, 189); border-bottom: none; border-left-color: rgb(189, 189, 189); color: rgb(255, 255, 255); vertical-align: top; text-align: left;">
                描述
            </th>
        </tr>
        <tr style="margin: 0px; padding: 0px;">
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                open
            </td>
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                Socket.onopen
            </td>
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                连接建立时触发
            </td>
        </tr>
        <tr style="margin: 0px; padding: 0px; background-color: rgb(239, 239, 239);">
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                message
            </td>
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                Socket.onmessage
            </td>
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                客户端接收服务端数据时触发
            </td>
        </tr>
        <tr style="margin: 0px; padding: 0px;">
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                error
            </td>
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                Socket.onerror
            </td>
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                通信发生错误时触发
            </td>
        </tr>
        <tr style="margin: 0px; padding: 0px; background-color: rgb(239, 239, 239);">
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                close
            </td>
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                Socket.onclose
            </td>
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                连接关闭时触发
            </td>
        </tr>
    </tbody>
</table>

## WebSocket 方法
<p style="white-space: normal; margin-top: 0px; padding: 0px; overflow-wrap: break-word; color: rgb(51, 51, 51); line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, &quot;Helvetica Neue&quot;, &quot;PingFang SC&quot;, &quot;Microsoft YaHei&quot;, &quot;Source Han Sans SC&quot;, &quot;Noto Sans CJK SC&quot;, &quot;WenQuanYi Micro Hei&quot;, sans-serif; font-size: 14px; background-color: rgb(255, 255, 255);">
    以下是 WebSocket 对象的相关方法。假定我们使用了以上代码创建了 Socket 对象：
</p>
<table class="reference" width="979" style="width: 828px;">
    <tbody style="margin: 0px; padding: 0px;">
        <tr style="margin: 0px; padding: 0px; background-color: rgb(239, 239, 239);" class="firstRow">
            <th style="margin: 0px; padding: 3px; background-color: rgb(189, 189, 189); border-top-color: rgb(189, 189, 189); border-right-color: rgb(189, 189, 189); border-bottom: none; border-left-color: rgb(189, 189, 189); color: rgb(255, 255, 255); vertical-align: top; text-align: left;">
                方法
            </th>
            <th style="margin: 0px; padding: 3px; background-color: rgb(189, 189, 189); border-top-color: rgb(189, 189, 189); border-right-color: rgb(189, 189, 189); border-bottom: none; border-left-color: rgb(189, 189, 189); color: rgb(255, 255, 255); vertical-align: top; text-align: left;">
                描述
            </th>
        </tr>
        <tr style="margin: 0px; padding: 0px;">
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                Socket.send()
            </td>
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                <p style="margin-bottom: 5px; overflow-wrap: break-word; line-height: 1.7;">
                    使用连接发送数据
                </p>
            </td>
        </tr>
        <tr style="margin: 0px; padding: 0px; background-color: rgb(239, 239, 239);">
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                Socket.close()
            </td>
            <td style="margin: 0px; padding: 7px 5px; min-width: 40px; vertical-align: top; box-sizing: border-box;">
                <p style="margin-bottom: 5px; overflow-wrap: break-word; line-height: 1.7;">
                    关闭连接
                </p>
            </td>
        </tr>
    </tbody>
</table>

## WebScoket实例
```javascript
<!DOCTYPE HTML>
<html>
   <head>
   <meta charset="utf-8">
   <title>W3Cschool教程(w3cschool.cn)</title>
	
      <script type="text/javascript">
         function WebSocketTest()
         {
            if ("WebSocket" in window)
            {
               alert("您的浏览器支持 WebSocket!");
               
               // 打开一个 web socket
               var ws = new WebSocket("ws://localhost:9998/echo");
				
               ws.onopen = function()
               {
                  // Web Socket 已连接上，使用 send() 方法发送数据
                  ws.send("发送数据");
                  alert("数据发送中...");
               };
				
               ws.onmessage = function (evt) 
               { 
                  var received_msg = evt.data;
                  alert("数据已接收...");
               };
				
               ws.onclose = function()
               { 
                  // 关闭 websocket
                  alert("连接已关闭..."); 
               };
            }
            
            else
            {
               // 浏览器不支持 WebSocket
               alert("您的浏览器不支持 WebSocket!");
            }
         }
      </script>
		
   </head>
   <body>
   
      <div id="sse">
         <a href="javascript:WebSocketTest()">运行 WebSocket</a>
      </div>
      
   </body>
</html>

```