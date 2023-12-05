---
title: 使用Transformers.js在Web上进行机器学习
date: 2023-12-05 19:18:19
tags:
- AI
- Machine Learning
- JavaScript
categories: AI
---

> 下面是来自transformers.js的作者的技术分享视频：[Transformers.js：Web 上的最新机器学习技术](https://www.bilibili.com/video/BV19c411B7QU/)

<!-- more -->

## 前言

本文介绍Hugging Face是如何将其AI生态系统引入到Web中的。通过transformers.js，您可以直接在浏览器中运行Hugging Face的transfrmers模型。

## 介绍

### 什么是Transformers.js

简单介绍一下什么是transformers.js，transformers.js是一个库，提供了在JavaScript中运行先进预训练模型的高级抽象。这意味着任何人都可以轻松地将机器学习功能添加到他们的Web应用程序中。

{% asset_img 1.awebp %}

而且我们还有一个了不起的开源社区，汇集了来自世界各地真正看到Web上机器学习潜力的人。在NPM上周下载量也达到了15万次。迄今为止人们已经用它创造了举世瞩目的成就。经过这个库只有几个月的历史，但是我们已经支持了对50多种最流行的模型架构。


{% asset_img 2.awebp %}

### 为什么要在Web上运行

为什么HuggingFace要探索WebML技术呢，答案可以在HuggingFace的使命中找到：让优秀的机器学习走向大众。我们知道HuggingFace上有大量的库，但是这些库都是Python实现的，这意味着大部分Web开发者不容易利用他们。因此Transformers.js的目标就是降低Web开发者的使用门槛。这个库还旨在帮助开发者构建前所未见的Web应用，这将在稍后进行展示。说到软件分发，Web真的是一骑绝尘，如今一旦有新模型或者应用推出，人们首先看到的都是Web Demo。无干扰，免安装，我相信没人会不喜欢。

### 它是怎么工作的呢

那么它是如何工作的呢，用户可以使用HuggingFace的Optimum库，将他们的pytorch、tensorflow或者JAX模型转换为ONNX模型。当然如果想直接使用预转换的模型，可以跳过这一步，直接使用HuggingFace上的模型。

{% asset_img 3.awebp %}

接下来编写JavaScript代码，最简单方法是使用popeline函数，正如前面提到的，这个函数把机器学习背后的许多复杂任务抽象化了，用户不必关系如何实现，就可以完成任务。

如果用户希望对整个过程有更精细的控制，可以使用公开的Model、Tokenizer、Processsor类以及其他相关函数。最后，打开浏览器运行项目，就这么简单。

## 应用

下面我们再来看看使用Transformers.js构建的应用程序，首先是[BlindChat](https://huggingface.co/spaces/mithril-security/blind_chat)，一个基于浏览器的ChatGPT版本，使用的模型是经过指令微调的FLAN-T5版本，能力可能不如ChatGPT强大，但仍然能胜任一些工作。

{% asset_img 4.awebp %}

来看个例子，问一下：“什么是爱情？”，这些对话都将只在本设备上产生，第一次运行时，浏览器将会下载并缓存模型，可以看到效果还算不错。

{% asset_img 5.awebp %}

> 我看了一下，大概会下载800MB左右的小模型，好像这个模型不支持中文，用中文提问就不能正常回答了。

虽然有一些提问无法回答，但是这个项目旨在演示基于浏览器的机器学习的隐私优势，因为没有任何数据被传输到其他地方。可以想象将类似的应用部署为浏览器拓展，充当您浏览Web时的个人助理，**这样您就无需担心敏感数据（比如银行卡和支付密码）泄露到某个服务器**。随着模型越来越小越来越强大，我相信很快就能见到类似的应用了。

除了对话式AI，我们还要为特定用例进行微调的模型示例，比如代码生成。即使是相对较小的3亿参数模型，也能产生高质量的代码，

> 项目演示地址：https://huggingface.co/spaces/Xenova/ai-code-playground 右键-generate，生成代码。默认的模型大概300MB

{% asset_img 6.awebp %}

另一个使用十大语言模型的例子是对语言翻译和转换器，transformers.js也支持这个功能，比如这个例子，使用的是一个600亿参数的模型，通过200多种不同语言的训练。

{% asset_img 7.awebp %}

> 项目演示地址：https://huggingface.co/spaces/Xenova/react-translator 好像翻译成中文不是那么准确，hhhh

下一个例子是语音转文本的例子：[Whisper Web](https://huggingface.co/spaces/Xenova/whisper-web)

{% asset_img 8.awebp %}

你可以从URL加载、从本地加载或者使用麦克风录制，一旦音频加载完毕，点击Transcribe Audio，即可开始转录，您可以导出为txt或者json。你也可以选择其他的模型，如果你的带宽比较小，也可以选择一个量化版本。即使是量化版的小模型，只有40MB左右，也能产出高质量的转录文本。[Whisper Web](https://huggingface.co/spaces/Xenova/whisper-web)还支持多语言转录和翻译，这意味着可以选择大于100种不同语言进行转录或者翻译成英语。

**这个例子强调了在设备上使用机器学习处理敏感数据的重要性，比如麦克风或者摄像头输入。很多情况下用户不希望将他们的语音录音发送到服务器，他们更希望只在他们自己的设备上进行处理。**

另一个有趣的应用是[语义图像搜索](https://huggingface.co/spaces/Xenova/semantic-image-search)，在这个例子中，用户会下载一个包含25000个剪辑的嵌入式数据库，大小大概在50MB左右。加载完成后，就可以用自然语言搜索图像，比如搜索一下cat

{% asset_img 9.awebp %}

或者我们搜索一下更具象化的，比如叼着棍子的狗：

{% asset_img 10.awebp %}

有意思的是，加载完模型和数据库后，文本计算只需要大概50毫秒，即可在25000张图像中进行相似性搜索，这没有使用任何酷炫的向量数据库，只是普通的JavaScript代码。

最后一个案例，[doodle-dash](https://huggingface.co/spaces/Xenova/doodle-dash) *（不知道怎么翻译了，涂鸦冲鸭？哈哈哈哈）* ， 这是一个实时的ML驱动的网页游戏，完全在浏览器中运行，感谢Transformers.js。游戏灵感来源于谷歌的 **Quick,Draw** ，你根据一个单词进行涂鸦，神经网络有20秒的时间来猜测你在画什么。事实上，我们使用了他们的训练数据来训练我们的轻量级草图检测模型。

{% asset_img 11.awebp %}

因为检测是在浏览器实时运行，所以根本不用担心网络或者服务器延迟。

上面展示的例子都是开源的，而且有demo网站进行体验


Name                                | Description                               | Links                                                                                                                                                                                                   |
| ----------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Whisper Web                         | Speech recognition w/ Whisper             | [code](https://github.com/xenova/whisper-web), [demo](https://huggingface.co/spaces/Xenova/whisper-web)                                                                                                 |
| Doodle Dash                         | Real-time sketch-recognition game         | [blog](https://huggingface.co/blog/ml-web-games), [code](https://github.com/xenova/doodle-dash), [demo](https://huggingface.co/spaces/Xenova/doodle-dash)                                               |
| Code Playground                     | In-browser code completion website        | [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/code-completion/), [demo](https://huggingface.co/spaces/Xenova/ai-code-playground)                                                  |
| Semantic Image Search (client-side) | Search for images with text               | [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/semantic-image-search-client/), [demo](https://huggingface.co/spaces/Xenova/semantic-image-search-client)                           |
| Semantic Image Search (server-side) | Search for images with text (Supabase)    | [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/semantic-image-search/), [demo](https://huggingface.co/spaces/Xenova/semantic-image-search)                                         |
| Vanilla JavaScript                  | In-browser object detection               | [video](https://scrimba.com/scrim/cKm9bDAg), [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/vanilla-js/), [demo](https://huggingface.co/spaces/Scrimba/vanilla-js-object-detector) |
| React                               | Multilingual translation website          | [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/react-translator/), [demo](https://huggingface.co/spaces/Xenova/react-translator)                                                   |
| Text to speech (client-side)        | In-browser speech synthesis               | [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/text-to-speech-client/), [demo](https://huggingface.co/spaces/Xenova/text-to-speech-client)                                         |
| Browser extension                   | Text classification extension             | [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/extension/)                                                                                                                         |
| Electron                            | Text classification application           | [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/electron/)                                                                                                                          |
| Next.js (client-side)               | Sentiment analysis (in-browser inference) | [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/next-client/), [demo](https://huggingface.co/spaces/Xenova/next-example-app)                                                        |
| Next.js (server-side)               | Sentiment analysis (Node.js inference)    | [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/next-server/), [demo](https://huggingface.co/spaces/Xenova/next-server-example-app)                                                 |
| Node.js                             | Sentiment analysis API                    | [code](https://github.com/xenova/transformers.js/blob/HEAD/examples/node/)

> 下一章就开始讲解如何使用这个框架构建我们自己的ai网站。[Transformers.js：Web 上的最新机器学习技术（2）](https://juejin.cn/spost/7308725917454598198)

## 开始尝试

### 语音转文本

{% asset_img 12.awebp %}

对于我们第一个示例，只有几行代码，模仿OpenAi whisper在浏览器中实现自动语音识别。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script type="module">
        // 1. 从cdn导入transformers库，原文使用jsdelivr，由于墙的原因，使用unpkg代替
        import { pipeline } from 'https://unpkg.com/@xenova/transformers@2.8.0/dist/transformers.min.js'

        // 2. 创建自动语音识别流水线（ASR）
        // 并将Hugging Face Hub的模型id作为第二个参数
        const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny')
        
        // 3. 最后一步是将音频文件传递给pipeline
        // 可以用手机或者电脑录一段音频，丢到当前文件夹，我这里自己录了一段
        const output = await transcriber('test.m4a')
        console.log(output)
        document.write(output.text)
    </script>
</body>
</html>
```

{% asset_img 13.awebp %}

> 我说的是生活就像海洋，只有意志坚定的人才能到达彼岸。可能是我的普通话不够标准吧哈哈哈哈，

随后将会重复使用这个模型，当然如果觉得中文准确性不够高，可以换个大一点的模型，并且可以选择是否翻译成英语。


```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script type="module">
        // 1. 从cdn导入transformers库，原文使用jsdelivr，由于墙的原因，使用unpkg
        import { pipeline } from 'https://unpkg.com/@xenova/transformers@2.8.0/dist/transformers.min.js'

        // 2. 创建自动语音识别流水线（ASR）
        // 并将Hugging Face Hub的模型id作为第二个参数
        const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small')
        
        // 3. 最后一步是将音频文件传递给pipeline
        // 可以用手机或者电脑录一段音频，丢到当前文件夹，我这里自己录了一段
        const chineseOutput = await transcriber('test.m4a', {language: 'chinese'})
        console.log(chineseOutput)
        document.write(chineseOutput.text + '<br>')

        const englishOutput = await transcriber('test.m4a', {language: 'chinese', task: 'translate'})
        console.log(englishOutput)
        document.write(englishOutput.text + '<br>')
    </script>
</body>
</html>
```

{% asset_img 14.awebp %}

### 物体检测

接下来我们尝试一下视觉任务，比如物体检测。

{% asset_img 15.awebp %}

```js
// 2. 创建对象检测流水线，这里不指定模型
// ，默认使用Facebook的轻量级目标检测转换器（DETR）
// 也就是ID为：Xenova/detr-resnet-50 这个模型
const detector = await pipeline('object-detection')

// 3. 将图像传递给流水线，并可以指定其他参数
// 比如阈值，以及边界框按百分比还是像素返回
const output = await detector('cat.jpg', { threshold: 0.9, percentage: true })
console.log(output)
// 比如我用一个猫咪的图片得到的结果：
// [
//     {
//         "score": 0.9989897608757019,
//         "label": "cat",
//         "box": {
//             "xmin": 0.36215442419052124,
//             "ymin": 0.18427562713623047,
//             "xmax": 0.8893325924873352,
//             "ymax": 0.8793745040893555
//         }
//     }
// ]
```

流水线的输出包含场景中检测到的每个物体信息的json，包括置信度、标签、边界框。


{% asset_img 16.awebp %}

完成机器学习方面的工作之后，我们可以再添加一些代码，允许用户上传图像，并呈现预测的边界框


{% asset_img 17.awebp %}

对于感兴趣的小伙伴

[这里有手把手教你编写这样一个网页的教程](https://huggingface.co/docs/transformers.js/tutorials/vanilla-js)，

[这个是源码](https://github.com/xenova/transformers.js/tree/main/examples/vanilla-js)，

[这个是demo体验网站](https://huggingface.co/spaces/Scrimba/vanilla-js-object-detector)

### 其他的一些流水线

目前为止我们支持了21种不同的流水线，并且还持续添加新的流水线。

{% asset_img 18.awebp %}

比如最近发布了文本到语音的支持，与当前浏览器内置的语音合成api相比，明显不那么机械，就在上周（视频发布的时间），我们增加了超分辨率和图像修复。

如果你要寻找transformers.js兼容的模型，打开：[hf.co/models](https://hf.co/models) ，选择libraries-Transformers.js

{% asset_img 19.awebp %}

然后可以点击回到task选择你需要的流水线类型

## 我能在哪里使用Transformers.js

你可能会问，我能在哪里用上transformers.js?

目前最主要的还是Web端和PWA应用，他们都不需要用户安装，这也是为什么web会是开发者的首选目标。除此之外，浏览器提供了非常多的API，并且运行在安全的沙箱环境中。另一个好处是您不需要担心服务器成本，像前面的所有演示应用一样，你可以将应用作为静态网站免费部署到GithubPages、HuggingFaceSpace（vercel也是挺好的选择）。

当然如果开发者不一样切换到完全静态的网站，使用一些混合的方式也可以减轻成本，对于开发者来说，浏览器插件、服务端和类似Electron这样的框架也是非常合适的选择。

{% asset_img 20.awebp %}

比如一个浏览器插件：PaperClip，当你选择一段pdf或者网页里的文本进行收藏之后，它能允许你用自然语言对之前已经收藏过的文本进行搜索。多亏了ai，你的任何数据都不会发送到外部API或者服务器。

虽然一开始Transformers.js并不是针对服务端开发的，但是随着发展，GithubIssue上提出了这方面的巨大需求。感谢这些issue，提供了Node.js和Deno相关的支持。这也是为什么在后端中JavaScript变得如此流行。

另一个有趣的用例是边缘计算里的机器学习，更具体的说，transformers.js能用于边缘计算函数，部署到边缘计算的代码足够小、轻量化，并以极低的延时完成特定的任务。Superbase在这方面有一篇很好的文章，它展示了在边缘函数中生成高质量的文本嵌入，强烈推荐你看一下！

## 自定义模型

假如你已经训练了自己自定义的模型，比如PyTorch、JAX、TensorFlow模型，你需要使用前文提到的Optimum库转换成ONNX模型。下面是官方文档教程：

https://huggingface.co/docs/transformers.js/custom_usage

总的来说就是：
1. 下载github仓库，找到scripts子文件夹
2. 安装必要的依赖
3. 运行script.convert脚本将你模型转成ONNX模型
4. 访问[hf.co/new](hf.co/new)，创建仓库，上传模型
5. 将Transformers.js标签添加到模型卡片上，以便其他人能搜索到你上传的模型。
6. 测试你的模型（可以直接在node中运行）

## Transformer.js的未来是什么

{% asset_img 21.awebp %}

首先是添加新的任务和模型，对于比较流行的用例，力图实现和Python库一样能力。

接下来，无疑是最令人期待的更新，就是WebGPU的支持。onnxruntime-web发布了带有实验性的WebGPU后端，在进行更多的测试后，您很快就能看到使用基于WebGPU的Transformers.js应用。目前由于protobuf和WASM的限制，Transformers.js的模型限制在2GB以内，也就是说一些流行的大语言模型无法运行，比如llama-7b。

幸运的是社区正在努力克服这些约束，我们还计划改进与下一个Web浏览器的整合，下一代浏览器将以科学计算和AI API为焦点。比如，可以想象一个基于浏览器的模型商店，类似Chrome的拓展商城，他们可以在HuggingFaceHub上寻找到兼容的模型，点击按钮安装它，并在各个网页中使用它。现在Transformers.js在这方面还受到限制，为此每个站点或者每个拓展都会缓存一次模型。

以上就是来自Joshua对于Transformers.js的分享。


