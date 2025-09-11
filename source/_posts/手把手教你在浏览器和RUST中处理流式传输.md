---
title: 手把手教你在浏览器和RUST中处理流式传输
date: 2025-02-19 22:34:46
tags:
- Rust
categories: Rust
---

最近在研究ai，通过ollama部署了deepseek之后，对ollama调用方式感到很有兴趣，所有研究了一下，发现了一些以前没见过的技术，下面来说一下吧。

## Ollama流式响应

一开始我是使用了Page Assist这个浏览器插件对ollama进行调用，这里展示一下ollama的接口是怎样响应的：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/85c20ca9183843479b923f4a9615b18a~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206107&x-orig-sign=0XfgRlTQulNomeDTYx0N6pv8NS4%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/59cc39883d6d46399715dc4543c92536~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206107&x-orig-sign=SY%2FPjj6N79YBOE4NJPJMZATMaxc%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/0d1e6a876d8c4353a3a6fdcff9e44b98~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206107&x-orig-sign=eNi%2BHE1KiiDUQwycp9C2rtoA4hw%3D)

很可惜edge并不支持直接预览这个响应，只能看十六进制值以及对应的字符，而且和标准的event-source也不一样，不过好在我在apifox里面调试发现可以正常显示json

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/5150c7faca114e8b8225f2bd16b49f98~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206107&x-orig-sign=FJaA3pDBS1Oaymm%2BL%2FXHjbkusOw%3D)

## ndjson

从响应可以看到，响应的类型是 `application/x-ndjson` ，这是ds对他的介绍：

> **application/x-ndjson** 是一种 MIME 类型，表示数据格式为 **Newline Delimited JSON**（简称 NDJSON）。它是一种基于文本的数据格式，用于存储或传输多个独立的 JSON 对象，每个对象占一行，并通过换行符（`\n`）分隔。NDJSON 在需要高效处理大规模或流式 JSON 数据的场景中非常实用。

这个内容说明了，这是一个二进制（application代表这是二进制数据）的多个json，而且每个json之间用换行符隔开，可以看apifox的响应预览，切到raw：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/7d10d77de7ed4310b3b9734fb2fd9ad9~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206107&x-orig-sign=hKA1YF%2F%2B%2FVOo8ulznrrGPNQDrYM%3D)

可以看到确实是每一行都是一个json字符串。

## Transfer-Encoding: chunked

除了内容类型，还有个传输编码方式值得注意，就是响应头的：`Transfer-Encoding: chunked`。这是ds对这个头的说明：

> **Transfer-Encoding: chunked** 是 HTTP 协议中的一种传输编码方式，允许服务器将响应数据分成多个“块”（chunk）逐步发送给客户端，**无需预先知道数据的总长度**。适用于动态生成内容或大文件传输的场景。
>
> **核心特点**
>
> **无需预知总大小**\
> 不需要提前计算并设置 `Content-Length` 头，适合实时生成内容（如流媒体、动态 API 响应）。
>
> **分块传输**\
> 数据被拆分为多个独立块，每块包含：
>
>     -   **块大小**（十六进制数值，如 `1A` 表示 26 字节）。
>     -   **块内容**（实际数据）。
>     -   换行符（`\r\n`）。
>
> **结束标志**\
> 最后发送一个 `0` 长度的块（`0\r\n\r\n`），表示传输完成。

可以看到对比于普通的请求，这样的传输方式是一块一块的，不用提前知道整个请求的最终文本长度，比较咱们也没办法预算ai的回答有多长对吧，所有这种传输方法就非常合适。

## 在浏览器请求

讲解完这两个核心知识点之后，我们就已经大致掌握了流式请求的要义了，剩下的就是怎么发起和处理这些数据了，咱们先来看看JS是怎么请求的，咱们可以参考Page Assist，通过对源码的预览，我找到发起请求的源码：

<https://github.com/n4ze3m/page-assist/blob/08b84e3918195b7cb8470fd67f60a80f94522005/src/models/utils/ollama.ts#L125-L192>

```ts
async function* createOllamaStream(
  url: string,
  params: OllamaRequestParams,
  options: OllamaCallOptions
) {
  const response = await fetch(formattedUrl, {
    method: "POST",
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    // ....
  }

  const stream = IterableReadableStream.fromReadableStream(response.body)

  const decoder = new TextDecoder()
  let extra = ""
  for await (const chunk of stream) {
    const decoded = extra + decoder.decode(chunk)
    const lines = decoded.split("\n")
    extra = lines.pop() || ""
    for (const line of lines) {
      try {
        yield JSON.parse(line)
      } catch (e) {
        console.warn(`Received a non-JSON parseable chunk: ${line}`)
      }
    }
  }
}
```

其他那些有的没的代码就先删掉了，之间看核心部分代码。首先是使用fetch这个api发起请求，对于fetch这个api就不多说了，[详情看MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/fetch)

为了方便迭代处理，这里将普通的可读流转成可迭代的可读的流，方便下面for await处理，这部分语法详情可以看[mdn文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for-await...of)

因为前面说了，我们拿到的是二进制（也是十六进制）码，我们需要解码成文本，才能进行json反序列化，所有这里创建了一个文本解码类：TextDecoder，剩下就是调用decode方法对二进制进行解码。

解码出每一行json之后，就是大家都懂的json反序列化了。

最后我们修改一下代码，在控制台看看数据：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/364618a7d64141d899b36ceca39c121d~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206107&x-orig-sign=zc0R2UfN%2BVUN5%2ByeYyUzns84O2o%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/c1837ee4134444d894936c6dfba94825~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206107&x-orig-sign=ndacqRgQhI1iQa1r8XUMV8ipFXI%3D)

最终我们这样就能从流式请求接口拿到咱们的数据啦！

## rust请求

因为最近还在学习rust，然后我也突发奇想使用rust调用试试，一开始问ai也写不出rust的代码，经过对各种rust群进行发问，有个群友发了个[ollama的rust版客户端](https://github.com/pepperoni21/ollama-rs)，

详情看发起请求的代码：

<https://github.com/pepperoni21/ollama-rs/blob/2409a5b584b50b83b361b229455e59fe0f156dc8/ollama-rs/src/generation/chat/mod.rs#L26-L70>

然后是调用这个方法的example：

<https://github.com/pepperoni21/ollama-rs/blob/2409a5b584b50b83b361b229455e59fe0f156dc8/ollama-rs/examples/chat_api_chatbot.rs>

然后我们~~抄袭~~借鉴一下代码：

```rust
use ollama_rs::generation::chat::ChatMessageResponse;
use reqwest::Client;
use serde::Serialize;
use std::io::{stdout, Write};

#[derive(Debug, Clone, Serialize)]
pub struct ChatMessageRequest {
    model: String,
    messages: Vec<ollama_rs::generation::chat::ChatMessage>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    use tokio_stream::StreamExt;
    let mut stdout = stdout();
    let client = Client::new();
    let builder = client.post("http://127.0.0.1:11434/api/chat");
    let serialized = serde_json::to_string(&ChatMessageRequest {
        model: "deepseek-r1:1.5b".to_string(),
        messages: vec![ollama_rs::generation::chat::ChatMessage {
            role: ollama_rs::generation::chat::MessageRole::User,
            content: "你是谁".to_string(),
            tool_calls: vec![],
            images: None,
        }],
    })
    .map_err(|e| e.to_string())?;
    let res = builder.body(serialized).send().await?;
    if !res.status().is_success() {
        println!("请求不成功：{}", res.status());
        return Ok(());
    }
    let mut stream = Box::new(res.bytes_stream().map(|res| match res {
        Ok(bytes) => {
            let res = serde_json::from_slice::<ChatMessageResponse>(&bytes);
            match res {
                Ok(res) => Ok(res),
                Err(e) => {
                    eprintln!("Failed to deserialize response: {}", e);
                    Err(())
                }
            }
        }
        Err(e) => {
            eprintln!("Failed to read response: {}", e);
            Err(())
        }
    }));
    while let Some(Ok(res)) = stream.next().await {
        stdout.write_all(res.message.content.as_bytes())?;
        stdout.flush()?;
    }
    Ok(())
}
```

代码和js类似，看代码是少了一步转字符串的，可以直接将字符串字节反序列化。

![a7ddz-njehu.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/9007f6acac184ac4bd10f071db8f4a62~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206107&x-orig-sign=D3u0FoMk%2BvbYq72ytVkdSi13xCg%3D)
