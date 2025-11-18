---
title: LangChain.js学习笔记（2）
date: 2025-05-26 11:34:11
tags:
- LangChain.js
- LLM
- AI
categories: AI
---

上一篇讲了基本的调用LLM，还有简单或者灵活的去使用模板生成提示词，以及使用提示词+解析器实现结构化的输出，这一节介绍一下Loader、Embedding和搭建向量数据库，最后实现一个简单的RAG

<!-- more -->

## 简单介绍RAG

This is often done using a VectorStore and Embeddings model.

典型的RAG应用包含两大核心组件：

​**​索引构建​**​：从数据源提取信息并建立索引的流水线（通常离线运行）\
​**​检索生成​**​：实时运行的RAG链，接收用户查询后从索引中检索相关数据，并传递给模型生成答案

注：本教程的索引构建部分将延续语义搜索教程的核心逻辑

从原始数据到生成答案的标准流程如下：

​**​索引阶段​**​

1.  ​**​加载​**​：通过文档加载器（Document Loaders）导入原始数据
2.  ​**​切分​**​：使用文本分割器（Text splitters）将大文档拆解为小块。这既能提升索引效率，也适配模型的有限上下文窗口——大段文本既难以有效检索，又超出模型处理上限
3.  ​**​存储​**​：需要向量数据库（VectorStore）和嵌入模型（Embeddings）来存储索引切片，以支持后续检索

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/a6d9684c37644a3598a74747fd753a1a~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199766&x-orig-sign=qdCced4bH%2BfT7W5cTk8Pr%2FDNZ5A%3D)

​**​检索与生成阶段​**​

1.  ​**​检索​**​：通过检索器（Retriever）根据用户输入从存储中提取相关数据分片
2.  ​**​生成​**​：聊天模型/ChatModel（或LLM）将用户问题与检索结果共同嵌入提示词模板，最终生成答案\
    （示意图：retrieval\_diagram）

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/0ac06f0474634a84a6b0588806b51c3b~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199766&x-orig-sign=%2FDdDQ4Nw3cXP8qcbrEJV5M7nrVo%3D)

## Document 对象

在 ​**​LangChain.js​**​ 中，`Document` 对象是一个核心数据结构，用于表示一段文本及其关联的元数据（metadata）。它是处理非结构化数据（如文本、PDF、网页等）时的基本单元，通常作为数据加载、转换和存储的中间格式。

Document对象的定义：

```ts
export interface DocumentInterface<
  Metadata extends Record<string, any> = Record<string, any>
> {
  pageContent: string;  // 页面内容

  metadata: Metadata;  // 元数据

  /**
   * 文档的可选标识符。
   *
   * 理想情况下，该标识符应在文档集合中保持唯一，
   * 并格式化为UUID，但不会强制要求。
   */
  id?: string;
}

/**
 * 用于与文档交互的接口。
 */
export class Document<
  Metadata extends Record<string, any> = Record<string, any>
> implements DocumentInput, DocumentInterface
{
  pageContent: string;  // 页面内容

  metadata: Metadata;  // 元数据

  // 当前ID字段是可选的。
  // 在足够多的向量存储实现采用后，
  // 可能会在未来的主要版本中变为必填字段。
  /**
   * 文档的可选标识符。
   *
   * 理想情况下，该标识符应在文档集合中保持唯一，
   * 并格式化为UUID，但不会强制要求。
   */
  id?: string;

  constructor(fields: DocumentInput<Metadata>) {
    this.pageContent =
      fields.pageContent !== undefined ? fields.pageContent.toString() : "";
    this.metadata = fields.metadata ?? ({} as Metadata);
    this.id = fields.id;
  }
}
```

我们直接手动创建一个试试：

```ts
import { Document } from "npm:/@langchain/core/documents";

new Document({ pageContent: "这是一段文本", metadata: { source: "MyDcoument" } });
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/c05c662553a94e9cbca9864187809304~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199766&x-orig-sign=K37cOpTrc4uPj4y8IuawxNv%2FBOs%3D)

接下来我们需要的就是加载器，将我们需要的Document从文档里面提取出来：

### Loader

官方目前提供的文件加载器有这些：

<https://js.langchain.com/docs/integrations/document_loaders/file_loaders/>

| 名称                | 说明                                            |
| ----------------- | --------------------------------------------- |
| 多文件加载             | 本示例演示如何从多个文件路径加载数据...                         |
| ChatGPT文件         | 本示例演示如何从ChatGPT的conversations.json文件加载对话记录... |
| CSV文件             | 本笔记本快速概述了如何开始使用CSV文件                          |
| 目录加载器             | 本笔记本快速概述了如何开始使用目录加载                           |
| Word文档            | DocxLoader允许您从Microsoft Word文档中提取文本数据...      |
| EPUB电子书           | 本示例演示如何从EPUB文件加载数据。默认情况下...                   |
| JSON文件            | JSON加载器使用JSON指针定位您JSON文件中的目标键...              |
| JSONLines文件       | 本示例演示如何从JSONLines或JSONL文件加载数据...              |
| Notion Markdown导出 | 本示例演示如何从Notion页面导出的Markdown文件加载数据...          |
| OpenAI Whisper音频  | 仅支持Node.js环境                                  |
| PDF加载器            | 本笔记本快速概述了如何开始使用PDF文件                          |
| PPTX演示文稿          | 本示例演示如何从PPTX文件加载数据。默认情况下...                   |
| 字幕文件              | 本示例演示如何从字幕文件加载数据。每个文档...                      |
| 文本加载器             | 本笔记本快速概述了如何开始使用文本文件                           |
| 非结构化数据            | 本笔记本快速概述了如何开始处理非结构化数据                         |

这里简单演示一下文本加载器，会用文本加载器之后其他加载器可以直接去官方文档复制demo代码尝试就好

```ts
import { TextLoader } from "npm:/langchain/document_loaders/fs/text"

const loader = new TextLoader(
  "./地底百科.txt"
);

const docs = await loader.load();
docs[0];
```

```text
Document {
  pageContent: "【结晶宝石蜥蜴】\r\n" +
    "「在久远的神话故事里，结晶宝石蜥蜴被认为是矿山娘娘的小兵。」\r\n" +
    "结晶宝石蜥蜴是一种穴居在矿道中的冷血爬虫类生物。其在成年的过程中，革质麟上会渐渐析出结晶体，并且根据地域、温度、健康程度的不同，结晶体的颜色还会产生变化。有生物学家指出，结晶宝石蜥蜴经由体内的渗透压将地髓等矿物质透过盐腺排出体外，这些结晶体是调节体液渗透平衡的副产物。\r\n" +
    "因其革质麟上结晶体的颜色在形成阶段具有一定随机性，民间一度出现了许多结晶宝石蜥蜴的收藏家，哄抬价格回收稀有野生种，造成了矿穴生态失衡。历史上多次下层虫灾被认为与结晶宝石蜥蜴滥捕有关。贝洛伯格明令禁止私人捕猎野生结晶宝石蜥蜴的行为。\r\n" +
    "结晶宝石蜥蜴体液中的生物碱常被用作药物成分。将其适量体液溶于水后制成喷剂，雾滴经上呼吸道进入人体肺泡腔内，可见其明显促进吸入肺部的矿尘从支气管排出体外，阻止粉尘倾入肺间质，阻滞粉尘在淋巴结的运行，原理不明。因此，常有下层区医生会饲养结晶宝石蜥蜴。不过，圈养的结晶宝石蜥蜴本身也不具有特殊的收藏价值。\r\n"
  metadata: { source: "./地底百科.txt" },
  id: undefined
}
```

除了文件加载器，还有一些网页内容加载器，用于将网页内容转成Document对象：

<https://js.langchain.com/docs/integrations/document_loaders/web_loaders/>

## 文本分割器

文档分割通常是许多应用中的关键预处理步骤，其核心是将大篇幅文本拆分为更小、更易处理的片段。这一过程能带来多重优势，例如确保对不同长度的文档进行统一处理、突破模型输入尺寸的限制，以及提升检索系统中文本表征的质量。文档分割存在多种策略，每种策略各有其优势。

### 为何需要文档分割？

文档分割的必要性主要体现在以下几个方面：

*   ​**​处理非统一文档长度​**​：现实中的文档集合通常包含不同篇幅的文本，分割能确保所有文档获得一致的处理流程。
*   ​**​突破模型限制​**​：许多嵌入模型和语言模型存在最大输入尺寸约束，分割使得超出限制的文档仍能被处理。
*   ​**​提升表征质量​**​：对于长文档，嵌入或其他表征方式可能因试图捕获过多信息而质量下降。分割可使每个片段的表征更聚焦、更准确。
*   ​**​增强检索精度​**​：在信息检索系统中，分割能提高搜索结果的粒度，使查询更精准地匹配到相关文档片段。
*   ​**​优化计算资源​**​：处理较小的文本片段能提升内存效率，并更好地实现处理任务的并行化。

### 基于文本长度切分

#### 按长度分割

最直观的策略是根据文本长度进行分割。这种简单有效的方法能确保每个片段不超过指定大小限制。其核心优势包括：

*   ​**​实现简单​**​
*   ​**​片段尺寸统一​**​
*   ​**​轻松适配不同模型需求​**​

​**​长度分割类型​**​：

*   ​**​按词元分割​**​：根据词元数量切分，适用于语言模型处理
*   ​**​按字符分割​**​：基于字符数切分，对不同类型文本更具一致性

​**​代码示例​**​（使用LangChain的字符分割器）：

```javascript
import { RecursiveCharacterTextSplitter } from "npm:/langchain/text_splitter";
import { TextLoader } from "npm:/langchain/document_loaders/fs/text"

const loader = new TextLoader(
  "./地底百科.txt"
);

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 64,
    chunkOverlap: 0,
  });

await splitter.splitDocuments(docs);
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ce431558cb4141449a93ea635c5851fa~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199766&x-orig-sign=Q2l1lyUHWBoSwa%2BgWcgf9LKzcks%3D)

通过查看源码发现，默认的分隔符是：`["\n\n", "\n", " ", ""];`，而我的文档里面很多换行符，所以可以通过自定义分隔符让文本不要一些长一些短的，

```ts
import { RecursiveCharacterTextSplitter } from "npm:/langchain/text_splitter";
import { TextLoader } from "npm:/langchain/document_loaders/fs/text"

const loader = new TextLoader(
  "./地底百科.txt"
);

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
    separators: ["\n\n\n"],
    chunkSize: 64,
    chunkOverlap: 0,
  });

await splitter.splitDocuments(docs);
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/e5f09a6fe9ad432fb25fd191480048ec~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199766&x-orig-sign=FHqLybW9IuSmF7icMJ%2BOzZPUGrc%3D)

这样一些换行也不会随便被分开了。当然还有很多一些情况，比如个用一些特别的符号当作分隔符的，就需要按需调整。

`chunkOverlap` 参数则是用来让文本分割边缘进行重叠

```ts
import { RecursiveCharacterTextSplitter } from "npm:/langchain/text_splitter";
import { Document } from "npm:/@langchain/core/documents";

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 4,
    chunkOverlap: 2,
  });

const doc = [new Document({ pageContent: "1234567890",  metadata: { source: "MyDcoument" } })]


await splitter.splitDocuments(doc);
```

```text
[
  Document {
    pageContent: "1234",
    metadata: { source: "MyDcoument", loc: { lines: { from: 1, to: 1 } } },
    id: undefined
  },
  Document {
    pageContent: "3456",
    metadata: { source: "MyDcoument", loc: { lines: { from: 1, to: 1 } } },
    id: undefined
  },
  Document {
    pageContent: "5678",
    metadata: { source: "MyDcoument", loc: { lines: { from: 1, to: 1 } } },
    id: undefined
  },
  Document {
    pageContent: "7890",
    metadata: { source: "MyDcoument", loc: { lines: { from: 1, to: 1 } } },
    id: undefined
  }
]
```

#### 按文档结构分割

HTML/Markdown/JSON等文档具有显式结构，按此分割可：

*   保留文档逻辑组织
*   维持片段上下文关联
*   提升检索/摘要等下游任务效果

​**​典型场景​**​：

*   ​**​Markdown​**​：根据标题层级（#/##/###）切分
*   ​**​HTML​**​：按标签分割
*   ​**​JSON​**​：按对象/数组元素划分
*   ​**​代码​**​：按函数/类/逻辑块切分

详情可以看：<https://js.langchain.com/docs/how_to/code_splitter/>

## Embedding/向量化

想象一下，您能将任何文本（无论是推文、文档还是书籍）的精髓浓缩为一个紧凑的数字化表达——这正是嵌入模型的核心能力，也是众多检索系统的技术基石。这类模型将人类语言转化为机器可理解、可快速精准比对的数据格式。它们接收文本输入后，会输出一组固定长度的数字序列，相当于文本语义的数字指纹。通过嵌入技术，搜索系统不仅能基于关键词匹配，更能依据语义理解来查找相关文档。

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f6c1cc17b1a6478a82f91d393de17f52~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199766&x-orig-sign=c5nH6t1pZUCOJ1gXAd29MU26P88%3D)

（1）将文本嵌入为向量：嵌入模型将文本转化为数值化的向量表示

（2）计算相似度：通过基础数学运算即可比较不同嵌入向量的相似性

### 文本嵌入

我们上面已经学会如何加载文档和拆分文档，现在需要将文档转成向量，也就是嵌入。这里简单展示一下用ollama的bge-m3和火山的豆包模型

ollama：

```shell
ollama pull bge-m3:latest
```

```ts
import { OllamaEmbeddings } from 'npm:/@langchain/ollama'
import { RecursiveCharacterTextSplitter } from "npm:/langchain/text_splitter";
import { TextLoader } from "npm:/langchain/document_loaders/fs/text"

const loader = new TextLoader(
  "./地底百科.txt"
);

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
    separators: ["\n---\n\n"],
    chunkSize: 600,
    chunkOverlap: 0,
  });

const documents = await splitter.splitDocuments(docs);

const embedding = new OllamaEmbeddings({
  model: 'bge-m3:latest',
})

const embedDocuments = await embedding.embedDocuments(documents.map((doc) => doc.pageContent))

documents.map((doc, i) => ({ content: doc.pageContent, embedding: embedDocuments[i] }))
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/c5cec505210849c3a58412db0fe22810~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199766&x-orig-sign=QnNzKWhDs8H%2FXuwwdZZDltiCRgo%3D)

这样embedding模型就将文本理解成向量了，下面再演示一下用火山的豆包模型，首先在`.env`文件加入火山引擎的API key

```text
ARK_API_KEY=xxx
```

```ts
import { ByteDanceDoubaoEmbeddings } from "npm:/@langchain/community/embeddings/bytedance_doubao";
import { RecursiveCharacterTextSplitter } from "npm:/langchain/text_splitter";
import { TextLoader } from "npm:/langchain/document_loaders/fs/text"
import { load } from 'jsr:@std/dotenv'

await load({
  envPath: './.env',
  export: true,
})
const loader = new TextLoader(
  "./地底百科.txt"
);

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
    separators: ["\n---\n\n"],
    chunkSize: 600,
    chunkOverlap: 0,
  });

const documents = await splitter.splitDocuments(docs);

const embeddings = new ByteDanceDoubaoEmbeddings({
  model: "doubao-embedding-large-text-240915",
});

const embedDocuments = await embeddings.embedDocuments(documents.map((doc) => doc.pageContent))

documents.map((doc, i) => ({ content: doc.pageContent, embedding: embedDocuments[i] }))
```

除此之外还有很多模型可以选择：百度千帆、阿里通义，可以在这个列表查看详情：<https://js.langchain.com/docs/integrations/text_embedding/>

## 向量存储、计算

向量数据库是一种专用于基于向量表示进行信息索引与检索的数据存储系统。

这些被称为"嵌入向量"的数值向量，能够捕捉被嵌入数据的语义信息。

向量数据库常用于对非结构化数据（如文本、图像、音频）进行语义搜索，其检索依据是内容的语义相似度而非精确的关键词匹配。

LangChain 提供了丰富的向量存储集成方案，用户可轻松切换不同的向量存储实现。

现在主流的向量数据库应该是Milvus，下面就以Milvus为例展开介绍怎么使用。

### 部署Milvus

这里我使用虚拟机运行Ubuntu并使用docker进行部署，可以选择单容器部署：

<https://milvus.io/docs/zh/install_standalone-docker.md>

```shell
curl -sfL https://raw.githubusercontent.com/milvus-io/milvus/master/scripts/standalone_embed.sh -o standalone_embed.sh

bash standalone_embed.sh start
```

不过我选择了使用docker compose部署：

<https://milvus.io/docs/zh/install_standalone-docker-compose.md>

```shell
wget https://github.com/milvus-io/milvus/releases/download/v2.5.10/milvus-standalone-docker-compose.yml -O docker-compose.yml

sudo docker compose up -d

Creating milvus-etcd  ... done
Creating milvus-minio ... done
Creating milvus-standalone ... done
```

因为我的docker compose是v1，所以命令要改一下：

```shell
sudo docker-compose up -d
```

sudo不一定需要，看情况，如果是使用docker desktop并且不使用sudo启动的话minio有可能出现一点问题，可以查看：

<https://juejin.cn/post/7489820414321049640>

### 存储和搜索

因为milvus目前只有nodejs的sdk，所以这里暂时换回node来执行，参考官方文档：<https://js.langchain.com/docs/integrations/vectorstores/milvus/>

同时进行Embedding和存储，并搜索相关的内容：

.env文件，设置milvus的地址：

```text
MILVUS_URL=192.168.86.129:19530
```

```ts
import { Milvus } from '@langchain/community/vectorstores/milvus'
import { OllamaEmbeddings } from '@langchain/ollama'
import 'dotenv/config'

const chat = [
    '拉克什米：斯科特，我们认识多久了？',
    '斯科特：7、8年了吧？怎么了？',
    '拉克什米：我们一起工作了这么多年，竟然才发现老家离得那么近，哈哈，你说离谱不离谱。',
    '斯科特：我们平时在公司也没机会聊这些嘛。',
    '尾巴：没想到斯科特还是个纯情的人渣。',
    '拉克什米：这些年，有句话我一直憋在心里，不敢对你说。',
    '斯科特：你喜欢我，对吗？',
    '拉克什米：你…你怎么这么突然！',
    '尾巴：喔～很不错嘛斯科特，很直球！老子很欣赏你。',
    '拉克什米：嗯…斯科特，我想和你成为恋人。',
    '尾巴：斯科特，终于让老子找到了，这就是你的软肋！',
    '斯科特：哈哈哈哈哈！终于让我抓住了你的软肋！',
    '尾巴&拉克什米：啊？？？',
    '斯科特：你刚才说的话，我已经全部录音了！咱们部门可是明令禁止办公室恋情的，只要我将这段录音发出去，你就再也没机会和我竞争专员的职位了，哈哈哈哈哈！',
    '尾巴：逆天。',
    '拉克什米：这…哈哈哈，斯科特，我喜欢的正是这样的你。',
    '尾巴：你也逆天。',
    '拉克什米：我明白了，我会给你让路。但等到有一天，我像这样战胜你的时候，请你接受我的心意。',
    '斯科特：这就不了吧，因为我啊，是一匹「孤狼」啊。',
    '尾巴：你小子真是油盐不进啊。',
  ]

const vectorStore = await Milvus.fromTexts(
  chat,
  chat.map((_, i) => ({ id: i + 1 })), // ids
  new OllamaEmbeddings({
    model: 'bge-m3:latest',
  }),
  {
    collectionName: 'Scott',
  }
)

const response = await vectorStore.similaritySearch('表白', 2)
console.log(response)
```

搜索结果：

```text
[                                                                                                                                                                            
  Document {
    pageContent: '拉克什米：嗯…斯科特，我想和你成为恋人。',
    metadata: { id: 10 },
    id: undefined
  },
  Document {
    pageContent: '斯科特：你喜欢我，对吗？',
    metadata: { id: 7 },
    id: undefined
  }
]
```

感觉还算准确，除此之外还有一些接口可以分开单独进行增删改查：<https://v03.api.js.langchain.com/classes/_langchain_community.vectorstores_milvus.Milvus.html>

## 简单的RAG

基本知识都学完了，那么就应该来试试写个简单个RAG demo试试，首先我们需要一个提示词模板，然后去向量数据库搜索，并将结果输入到模板中，最后向大模型搜索。

```ts
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { Document } from '@langchain/core/documents'
import { Milvus } from '@langchain/community/vectorstores/milvus'
import { OllamaEmbeddings } from '@langchain/ollama'
import { StringOutputParser } from '@langchain/core/output_parsers'
import 'dotenv/config'

// 定义使用DeepSeekV3模型
const model = new ChatOpenAI({
  configuration: {
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  },
  model: 'deepseek-v3-250324',
})

// 定义一个提示词模板
const TEMPLATE = `
你是一个资深的崩坏星穹铁道玩家，精通根据作品原文详细解释和回答问题，你在回答时会引用作品原文。
并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

以下是原文中跟用户回答相关的内容：
{context}

现在，你需要基于原文，回答以下问题：
{question}`

const prompt = ChatPromptTemplate.fromTemplate(TEMPLATE)

const convertDocsToString = (documents: Document[]): string => {
  return documents.map((document) => document.pageContent).join('\n')
}

// 定义向量数据库，以及Embedding模型，
// 因为上面已经将数据存到数据库了，所以不需要再使用fromTexts写入
const retriever = new Milvus(
  new OllamaEmbeddings({
    model: 'bge-m3:latest',
  }),
  {
    collectionName: 'Scott',
  }
).asRetriever(3)

const contextRetriverChain = RunnableSequence.from([
  (input) => input.question,
  retriever,
  convertDocsToString,
])

const ragChain = RunnableSequence.from([
  {
    context: contextRetriverChain,
    question: (input) => input.question,
  },
  prompt,
  model,
  new StringOutputParser(),
])

// 向ai问问题
const answer = await ragChain.invoke({
  question: '拉克什米对斯科特有什么感情',
})
console.log(answer)
```

```text
根据原文内容，拉克什米对斯科特表现出明确的恋爱感情。以下是具体依据：

1. 直接告白：「嗯…斯科特，我想和你成为恋人。」（明确表达恋爱意向）
2. 情感确认：「这…哈哈哈，斯科特，我喜欢的正是这样的你。」（用"喜欢"确认情感性质）
3. 关系铺垫：「我们认识多久了？」（暗示对关系发展的考量）

这些对话表明拉克什米对斯科特怀有超越友谊的恋人级好感，且情感表达直率真诚。原文中未提及其他复杂情感成分。
```

Nice！我们的简易RAG构建成功
