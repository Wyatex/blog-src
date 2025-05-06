---
title: LangChain.js学习笔记（1）
date: 2025-05-06 11:34:11
tags:
- LangChain.js
- LLM
- AI
categories: AI
---

LangChain.js官方文档：<https://js.langchain.com/>

<!-- more -->

## 需要用到的一些包

`@langchain/community @langchain/core @langchain/openai dotenv langchain`

@langchain/community: 用来引入一些社区的包，比如各种向量库适配器、各种embedding的支持、各种loader

@langchain/core：主要是官方实现的一些库

@langchain/openai：调用openai或者第三方兼容openai的接口

dotenv：加载环境变量

langchain：好像有些工具即不在@langchain/community也不在@langchain/core，只有langchain包有，很奇怪

## 开始

### 获取对话服务

调用ollama：

```ts
import { Ollama } from "@langchain/community/llms/ollama";

const ollama = new Ollama({
  baseUrl: "http://localhost:11434", 
  model: "llama2", 
});


const res = await ollama.invoke("讲个笑话")
```

调用第三方接口，新建.env文件

```plaintext .env
OPENAI_API_KEY=xxx
```

调用火山

```ts
import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";


const chatModel = new ChatOpenAI({
    configuration: {
        baseURL: "https://ark.cn-beijing.volces.com/api/v3",
    },
    model: 'deepseek-v3-250324'
});

console.log(await chatModel.invoke([
    new HumanMessage("Tell me a joke")
]));
```

### LCEL

LCEL（LangChain Expression Language）

一条 Chain 组成的每个模块都是继承自 Runnable 这个接口，而一条 Chain 也是继承自这个接口，所以一条 Chain 也可以很自然的成为另一个 Chain 的一个模块。并且所有 Runnable 都有相同的调用方式。 所以在我们写 Chain 的时候就可以自由组合多个 Runnable 的模块来形成复杂的 Chain。

对于任意 Runnable 对象，其都会有这几个常用的标准的调用接口：

- invoke 基础的调用，并传入参数
- batch 批量调用，输入一组参数
- stream 调用，并以 stream 流的方式返回数据
- streamLog 除了像 stream 流一样返回数据，并会返回中间的运行结果

#### invoke

首先，我们用最基础的 ChatOpenAI，这显然是一个 Runnable 对象，我们以此为例来让大家熟悉 LCEL 中 Runnable 中常见的调用接口。 其中 HumanMessage 你可以理解成构建一个用户输入，各种 Message 的介绍我们会在后续章节中展开介绍。 注意这里 chatModel 需要的输入是一个 Message 的列表。

```js
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

const model = new ChatOpenAI();

await model.invoke([
    new HumanMessage("Tell me a joke")
])
```

输出：

```json
AIMessage {
  "id": "021746503328980713197eb3e0d8a6a0914d987ddc72be16a86c7",        
  "content": "Sure! Here's a classic for you:  \n\n**Why don’t skeletons fight each other?**  \n*Because they don’t have the guts!*  \n\nWant another? 😄",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "promptTokens": 7,
      "completionTokens": 39,
      "totalTokens": 46
    },
    "finish_reason": "stop",
    "model_name": "deepseek-v3-250324"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "output_tokens": 39,
    "input_tokens": 7,
    "total_tokens": 46,
    "input_token_details": {
      "cache_read": 0
    },
    "output_token_details": {
      "reasoning": 0
    }
  }
}
```

#### batch

```js
await simpleChain.batch([
    [ new HumanMessage("Tell me a joke") ],
    [ new HumanMessage("Hi, Who are you?") ],
])
```

```json
[
  "Why don't scientists trust atoms?\n\nBecause they make up everything!",
  "Hello! I'm OpenAI, or more specifically an artificial intelligence programmed to help answer questio"... 89 more characters
]
```

#### stream

```js
const stream = await simpleChain.stream([
     new HumanMessage("Tell me a joke")
])

for await (const chunk of stream){
    console.log(chunk)
}
```

streamLog 的使用较少，他会在每次返回 chunk 的时候，返回完整的对象，我们不深入介绍，感兴趣的可以运行下述代码观察其每个 chunk 的返回值，并根据自己需要去使用。

#### fallback

withFallbacks 是任何 runnable 都有的一个函数，可以给当前 runnable 对象添加 fallback 然后生成一个带 fallback 的 RunnableWithFallbacks 对象，这适合我们将自己的 fallback 逻辑增加到 LCEL 中。

例如，我们创建一个一定会失败的 llm ：

```hs
import { ChatOpenAI } from "@langchain/openai";

const fakeLLM = new ChatOpenAI({
    azureOpenAIApiKey: "123",
    maxRetries: 0,
});

await fakeLLM.invoke("你好")
```

因为大多 runnable 都自带出错重试的机制，所以我们在这将重试的次数 maxRetries 设置为 0。

然后，我们创建一个可以成功的 llm，并设置为 fallback：

```js
const realLLM = new ChatOpenAI()
const llmWithFallback = fakeLLM.withFallbacks({
    fallbacks: [realLLM]
})

await llmWithFallback.invoke("你好")
```

就会输出正确的结果。

## Prompt

首先我们学习基础的 PromptTemplate 来理解 langchain 中是如何构建和管理 prompt template。

PromptTemplate 是帮助我们定义一个包含变量的字符串模版，我们可以通过向该类的对象输入不同的变量值来生成模版渲染的结果。 这可以方便的让我们定义一组 prompt 模板，然后在运行时根据用户的输入动态地填充变量从而生成 prompt。

### 无变量 template

```js
import { PromptTemplate } from "@langchain/core/prompts";

const greetingPrompt = new PromptTemplate({
  inputVariables: [],
  template: "hello world",
});
const formattedGreetingPrompt = await greetingPrompt.format();

console.log(formattedGreetingPrompt);
```

PromptTemplate 就是最基础的 template，我们不传入任何变量（inputVariables: []），这跟硬编码一个字符串没任何区别。 调用 prompt template 的方式就是 format，因为我们没有任何变量，也就没有任何参数。

没有变量的 prompt template 使用的很少，这里主要以此帮助大家理解 template 的概念。

### 含变量的 template

```js
const personalizedGreetingPrompt = new PromptTemplate({
  inputVariables: ["name"],
  template: "hello，{name}",
});
const formattedPersonalizedGreeting = await personalizedGreetingPrompt.format({
  name: "Kai",
});

console.log(formattedPersonalizedGreeting);
// hello，Kai
```

其 API 比较容易理解，使用 {} 来包裹住变量，然后在 inputVariables 声明用到的变量名称。因为有了变量，所以在调用 format() 就需要传入对应的变量。

同样的多变量的 template 也是类似的

```js
const multiVariableGreetingPrompt = new PromptTemplate({
  inputVariables: ["timeOfDay", "name"],
  template: "good {timeOfDay}, {name}",
});
const formattedMultiVariableGreeting = await multiVariableGreetingPrompt.format({
  timeOfDay: "morning",
  name: "Kai",
});

console.log(formattedMultiVariableGreeting);
// good morning, Kai
```

唯一需要注意的就是，如果你的 prompt 需要 `{}`，可以这么转义 `{{}}`

```js
const multiVariableGreetingPrompt = new PromptTemplate({
  inputVariables: ["timeOfDay", "name"],
  template: "good {timeOfDay}, {name} {{test}}",
});
const formattedMultiVariableGreeting = await multiVariableGreetingPrompt.format({
  timeOfDay: "morning",
  name: "Kai",
});

console.log(formattedMultiVariableGreeting);
// good morning, Kai {test}
```

这么创建 template 有点繁琐， langchain 也提供了简便的创建方式

```js
const autoInferTemplate = PromptTemplate.fromTemplate("good {timeOfDay}, {name}");
console.log(autoInferTemplate.inputVariables);
// ['timeOfDay', 'name']

const formattedAutoInferTemplate = await autoInferTemplate.format({
  timeOfDay: "morning",
  name: "Kai",
});
console.log(formattedAutoInferTemplate)
// good morning, Kai
```

这样创建 prompt 的时候，会自动从字符串中推测出需要输入的变量。

### 使用部分参数创建 template

```js
const initialPrompt = new PromptTemplate({
  template: "这是一个{type}，它是{item}。",
  inputVariables: ["type", "item"],
});


const partialedPrompt = await initialPrompt.partial({
  type: "工具",
});

const formattedPrompt = await partialedPrompt.format({
  item: "锤子",
});

console.log(formattedPrompt);
// 这是一个工具，它是锤子。

const formattedPrompt2 = await partialedPrompt.format({
  item: "改锥",
});

console.log(formattedPrompt2)
// 这是一个工具，它是改锥。
```

### 使用动态填充参数

当我们需要，一个 prompt template 被 `format` 时，实时地动态生成参数时，我们可以使用函数来对 template 部分参数进行指定。

```js
const getCurrentDateStr = () => {
  return new Date().toLocaleDateString();
};

const promptWithDate = new PromptTemplate({
  template: "今天是{date}，{activity}。",
  inputVariables: ["date", "activity"],
});

const partialedPromptWithDate = await promptWithDate.partial({
  date: getCurrentDateStr,
});

const formattedPromptWithDate = await partialedPromptWithDate.format({
  activity: "我们去爬山",
});

console.log(formattedPromptWithDate);
// 输出: 今天是2023/7/13，我们去爬山。
```

注意，函数 `getCurrentDateStr` 是在 `format` 被调用的时候实时运行的，也就是可以在被渲染成字符串时获取到最新的外部信息。 目前这里不支持传入参数，如果需要参数，可以用 js 的闭包进行参数的传递。
假设我们有一个根据时间段（morning, afternoon, evening）返回不同问候语，并且需要带上当前时间的需求

```js
const getCurrentDateStr = () => {
  return new Date().toLocaleDateString();
};

function generateGreeting(timeOfDay) {
  return () => {
    const date = getCurrentDateStr()
    switch (timeOfDay) {
      case 'morning':
        return date + ' 早上好';
      case 'afternoon':
        return date + ' 下午好';
      case 'evening':
        return date + ' 晚上好';
      default:
        return date + ' 你好';
    }
  };
}

const prompt = new PromptTemplate({
  template: "{greeting}!",
  inputVariables: ["greeting"],
});

const currentTimeOfDay = 'afternoon';
const partialPrompt = await prompt.partial({
  greeting: generateGreeting(currentTimeOfDay),
});

const formattedPrompt = await partialPrompt.format();

console.log(formattedPrompt);
// 输出: 3/21/2024 下午好!
```

### chat prompt

为了方便地构建和处理这种结构化的聊天消息，LangChain 提供了几种与聊天相关的提示模板类，如 `ChatPromptTemplate`、`SystemMessagePromptTemplate`、`AIMessagePromptTemplate` 和 `HumanMessagePromptTemplate`。

其中后面三个分别对应了一段 ChatMessage 不同的角色。在 OpenAI 的定义中，每一条消息都需要跟一个 role 关联，标识消息的发送者。角色的概念对 LLM 理解和构建整个对话流程非常重要，相同的内容由不同的 role 发送出来的意义是不同的。

- `system` 角色的消息通常用于设置对话的上下文或指定模型采取特定的行为模式。这些消息不会直接显示在对话中，但它们对模型的行为有指导作用。 可以理解成模型的元信息，权重非常高，在这里有效的构建 prompt 能取得非常好的效果。
- `user` 角色代表真实用户在对话中的发言。这些消息通常是问题、指令或者评论，反映了用户的意图和需求。
- `assistant` 角色的消息代表AI模型的回复。这些消息是模型根据system的指示和user的输入生成的。

我们以一个基础的翻译 chatbot 来讲解这几个常见 chat template，我们先构建一个 system message 来给 llm 指定核心的准则

```js
import { SystemMessagePromptTemplate } from "@langchain/core/prompts";

const translateInstructionTemplate = SystemMessagePromptTemplate.fromTemplate(`你是一个专
业的翻译员，你的任务是将文本从{source_lang}翻译成{target_lang}。`);
```

然后构建一个用户输入的信息

```js
import { HumanMessagePromptTemplate } from "@langchain/core/prompts";

const userQuestionTemplate = HumanMessagePromptTemplate.fromTemplate("请翻译这句话：{text}")
```

然后将这两个信息组合起来，形成一个对话信息

```js
import { ChatPromptTemplate } from "@langchain/core/prompts";

const chatPrompt = ChatPromptTemplate.fromMessages([
  translateInstructionTemplate,
  userQuestionTemplate,
]);
```

然后我们就可以用一个 `fromMessages` 来格式化整个对话信息

```js
const formattedChatPrompt = await chatPrompt.formatMessages({
  source_lang: "中文",
  target_lang: "法语",
  text: "你好，世界",
});

console.log(formattedChatPrompt)
```

```json
[
  SystemMessage {
    lc_serializable: true,
    lc_kwargs: {
      content: "你是一个专业的翻译员，你的任务是将文本从中文翻译成法语。",
      additional_kwargs: {},
      response_metadata: {}
    },
    lc_namespace: [ "langchain_core", "messages" ],
    content: "你是一个专业的翻译员，你的任务是将文本从中文翻译成法语。",
    name: undefined,
    additional_kwargs: {},
    response_metadata: {}
  },
  HumanMessage {
    lc_serializable: true,
    lc_kwargs: {
      content: "请翻译这句话：你好，世界",
      additional_kwargs: {},
      response_metadata: {}
    },
    lc_namespace: [ "langchain_core", "messages" ],
    content: "请翻译这句话：你好，世界",
    name: undefined,
    additional_kwargs: {},
    response_metadata: {}
  }
]
```