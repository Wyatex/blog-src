---
title: Ajax学习笔记：XMLHttpRequest
date: 2020-11-12 20:33:06
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---

> MDN：`XMLHttpRequest`（XHR）对象用于与服务器交互。通过 XMLHttpRequest 可以在不刷新页面的情况下请求特定 URL，获取数据。这允许网页在不影响用户操作的情况下，更新页面的局部内容。XMLHttpRequest 在 AJAX 编程中被大量使用。

<!-- more -->

> 本文内容大部分来至：[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest) 、[你不知道的 XMLHttpRequest](https://juejin.im/post/6844903472714743816)

尽管名称叫这个，但是 `XMLHttpRequest` 可以用于获取任何类型的数据。它甚至支持 HTTP 以外的协议（包括 file:// 和 FTP），尽管可能受到更多出于安全等原因的限制。

但是如果只是需要单纯从服务器端接收事件或消息数据，应该通过 `EventSource` 接口使用 `Server-sent events` ，如果是全双工通信应该使用 `WebSocket`, 使用方法在这章简述：[Html5学习笔记](/学习笔记/Html5学习笔记-1/#WebSocket)

# 构造函数
通过 `XMLHttpRequest()` 方法可以得到一个该对象
```js
const request = new XMLHttpRequest();
```
在调用下列任何其他方法之前，必须先调用该构造函数，或通过其他方式，得到一个实例对象。

# 属性
此接口继承了 `XMLHttpRequestEventTarget` 和 `EventTarget` 的属性。

## XMLHttpRequest.readyState 
**该属性为只读**

XMLHttpRequest.readyState 属性返回一个 XMLHttpRequest  代理当前所处的状态。一个 XHR 代理总是处于下列状态中的一个：

值 | 状态 | 描述
- | - | -
`0` | `UNSENT` | 代理被创建，但尚未调用 open() 方法。
`1` | `OPENED` | `open()` 方法已经被调用。
`2` | `HEADERS_RECEIVED` | `send()` 方法已经被调用，并且头部和状态已经可获得。
`3` | `LOADING` | 下载中； responseText 属性已经包含部分数据。
`4` | `DONE` | 下载操作已完成。

**OPENED** ： 在这个状态中，可以通过 `setRequestHeader()` 方法来设置请求的头部， 可以调用 `send()` 方法来发起请求。

**LOADING**： 响应体部分正在被接收。如果 responseType 属性是“text”或空字符串， responseText 将会在载入的过程中拥有部分响应数据。

**DONE**： 请求操作已经完成。这意味着数据传输已经彻底完成或失败。

> 在IE中，状态有着不同的名称，并不是 `UNSENT`，`OPENED` ， `HEADERS_RECEIVED` ， `LOADING` 和 `DONE`, 而是 `READYSTATE_UNINITIALIZED` (0)，`READYSTATE_LOADING` (1) ， `READYSTATE_LOADED` (2) ， `READYSTATE_INTERACTIVE` (3) 和 `READYSTATE_COMPLETE` (4) 。

实例
```js
var xhr = new XMLHttpRequest();
console.log('UNSENT', xhr.readyState); // readyState 为 0

xhr.open('GET', '/api', true);
console.log('OPENED', xhr.readyState); // readyState 为 1

xhr.onprogress = function () {
    console.log('LOADING', xhr.readyState); // readyState 为 3
};

xhr.onload = function () {
    console.log('DONE', xhr.readyState); // readyState 为 4
};

xhr.send(null);
```

## XMLHttpRequest.onreadystatechange
该属性是一个方法，当 readyState 属性改变时会调用它

## XMLHttpRequest.status
返回一个无符号短整型（unsigned short）数字，代表请求的响应状态。

## XMLHttpRequest.statusText
只读属性 `XMLHttpRequest.statusText` 返回了 `XMLHttpRequest` 请求中由服务器返回的一个 `DOMString` 类型的文本信息，这则信息中也包含了响应的数字状态码。不同于使用一个数字来指示的状态码 `XMLHTTPRequest.status` ，这个属性包含了返回状态对应的文本信息，例如"OK"或是"Not Found"。如果请求的状态 `readyState` 的值为"UNSENT"或者"OPENED"，则这个属性的值将会是一个空字符串。
如果服务器未明确指定一个状态文本信息，则`statusText`的值将会被自动赋值为"OK"。

## XMLHttpRequest.upload
**该属性为只读**

`XMLHttpRequest.upload` 属性返回一个 `XMLHttpRequestUpload` 对象，用来表示上传的进度。这个对象是不透明的，但是作为一个 `XMLHttpRequestEventTarget` ，可以通过对其绑定事件来追踪它的进度。

可以被绑定在upload对象上的事件监听器如下:
1. onloadstart: 获取开始
2. onprogress: 数据传输进行中
3. onabort: 获取操作终止
4. onerror: 获取失败
5. onload: 获取成功
6. ontimeout: 获取操作在用户规定的时间内未完成
7. onloadend: 获取完成（不论成功与否）

## XMLHttpRequest.timeout
`XMLHttpRequest.timeout` 是一个无符号长整型数，代表着一个请求在被自动终止前所消耗的毫秒数。默认值为 0，意味着没有超时。超时并不应该用在一个 [document environment](https://developer.mozilla.org/en-US/docs/Glossary/document_environment) 中的同步 XMLHttpRequests  请求中，否则将会抛出一个 `InvalidAccessError` 类型的错误。当超时发生， `timeout` 事件将会被触发。

## 一些response属性
`XMLHttpRequest.response` ：响应体的类型由 `responseType` 来指定，可以是 `ArrayBuffer、Blob、Document、JSON`，或者是字符串。如果请求未完成或失败，则该值为 null。**该属性为只读**

`XMLHttpRequest.responseText` ：返回一个 `DOMString`，该 `DOMString` 包含对请求的响应，如果请求未成功或尚未发送，则返回 `null`。**该属性为只读**

`XMLHttpRequest.responseType` ：一个用于定义响应类型的枚举值（enumerated value）。responseType支持以下几种值：
* `""` :`responseType` 为空字符串时，采用默认类型 DOMString，与设置为 text 相同。
* `arraybuffer` :`response` 是一个包含二进制数据的 JavaScript `ArrayBuffer`。
* `blob` : `response` 是一个包含二进制数据的 Blob 对象 。
* `document` :`response` 是一个 `HTML Document` 或 `XML XMLDocument`，这取决于接收到的数据的 `MIME` 类型。
* `json` : `response` 是一个 JavaScript 对象。这个对象是通过将接收到的数据类型视为 JSON 解析得到的。
* `text` : `response` 是一个以 `DOMString` 对象表示的文本。


# 方法
包括下面方法：
1. `XMLHttpRequest.open()` ：初始化一个请求。
2. `XMLHttpRequest.send()` ：发送请求。如果请求是异步的（默认），那么该方法将在请求发送后立即返回。
3. `XMLHttpRequest.abort()` ：如果请求已经被发送，则立刻中止请求。
4. `XMLHttpRequest.getAllResponseHeaders()` ：返回所有响应头信息(响应头名和值)，如果响应头还没有接收，则返回 null。**注意：使用该方法获取的 response headers 与在开发者工具 Network 面板中看到的响应头不一致**
5. `XMLHttpRequest.overrideMimeType()` ：重写由服务器返回的 MIME 类型。例如，可以用于强制把响应流当做 text/xml 来解析，即使服务器没有指明数据是这个类型。**注意：这个方法必须在 send() 之前被调用。**
6.  `XMLHttpRequest.setRequestHeader()` ：设置 HTTP 请求头信息。**注意：在这之前，你必须确认已经调用了 open() 方法打开了一个 url**

open() 方法签名：
```
void open(
   DOMString method,                //请求所使用的 HTTP 方法，如 GET、POST、PUT、DELETE
   DOMString url,                   //请求的 URL 地址
   optional boolean async,          //一个可选的布尔值参数，默认值为 true，表示执行异步操作。如果值为 false，则 send() 方法不会返回任何东西，直到接收到了服务器的返回数据
   optional DOMString user,         //用户名，可选参数，用于授权。默认参数为空字符串
   optional DOMString password      //密码，可选参数，用于授权。默认参数为空字符串
)   
```

send() 方法签名:
```
void send();
void send(ArrayBuffer data);
void send(Blob data);
void send(Document data);
void send(DOMString? data);
void send(FormData data);
```
如果发送的数据是Document对象，需要在发送之前将其序列化。

发送二进制内容的最佳方法（如上传文件）是使用一个与send()方法结合的 [ArrayBufferView](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView) 或者 [Blobs](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

# 使用案例
## 简单的GET
```js
var xhr = new XMLHttpRequest();
xhr.open('GET', '/server', true);

xhr.onload = function () {
   // 请求结束后,在此处写处理代码
};

xhr.send(null);
// xhr.send('string');
// xhr.send(new Blob());
// xhr.send(new Int8Array());
// xhr.send({ form: 'data' });
// xhr.send(document);
```

## 简单的POST
```js
var xhr = new XMLHttpRequest();
xhr.open("POST", '/server', true);

//发送合适的请求头信息
xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

xhr.onload = function () { 
    // 请求结束后,在此处写处理代码 
};
xhr.send("foo=bar&lorem=ipsum"); 
// xhr.send('string'); 
// xhr.send(new Blob()); 
// xhr.send(new Int8Array()); 
// xhr.send({ form: 'data' }); 
// xhr.send(document);
```

## 传FormData
为了方便表单数据，HTML 5新增了一个 [FormData](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/FormData) 对象，可以用于模拟表单。
```js
//首先新建一个 FormData 对象
var formData = new FormData()
//然后，为它添加表单项
formData.append('username', 'wyatex')
formData.append('password', '123456')
formData.append('id', 123)
//最后，直接传送这个FormData对象。这与提交网页表单的效果，完全一样。
xhr.send(formData)
```
FormData 对象也可以用来获取网页表单的值
```
var form = document.getElementById('myform');   // 获取页面上表单对象
var formData = new FormData(form);
formData.append('role', 'user');                // 添加一个表单项
xhr.send(formData);
```

## 上传文件
为了上传文件, 我们得先选中一个文件. 一个 `type` 为 `file` 的 `input` 输入框
```js
<input id="input" type="file">
```
然后用 FormData 对象包裹选中的文件
```js
var input = document.getElementById("input"),
formData = new FormData();
formData.append("file",input.files[0]); // file名称与后台接收的名称一致
//设置上传地址和请求方法(使用POST方法)，最后发送 `FormData` 对象
xhr.send(formData);
```

## 进度信息
新版本的 XMLHttpRequest 对象，传送数据的时候，有一个 progress 事件，用来返回进度信息。

它分成上传和下载两种情况。下载的 progress 事件属于 XMLHttpRequest 对象，上传的 progress 事件属于XMLHttpRequest.upload 对象。
```js
xhr.onprogress = function(e) {
    if (e.lengthComputable) {
        let precent = e.loaded / e.total
    }
}
xhr.upload.onprogress = xhr.onprogress
```
其中total是需要传输的总字节，loaded是已经传输的字节。如果event.lengthComputable 不为真，则 event.total 等于0。

# XHR定时轮询和长轮询

感觉这部分不怎么需要，到时候需要再写