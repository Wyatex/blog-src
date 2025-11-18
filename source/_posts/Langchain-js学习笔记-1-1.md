---
title: LangChain.js学习笔记（1.1）
date: 2025-05-06 11:34:11
tags:
- LangChain.js
- LLM
- AI
categories: AI
---

发布在掘金上的版本

<!-- more -->

因为最近ai挺火的，所以学习了一下LangChain.js，这是我学习过程的笔记，内容和例子主要来自官方文档。

## 环境配置

小册用到了jupyter notbook和deno，所以要先安装一下python和deno。

我装的是anaconda3，国内可以直接去清华源或者中科大源下载，比较快一点，这是中科大源的下载地址：<https://mirrors.ustc.edu.cn/anaconda/archive/>

直接下载最新的Anaconda3-2024.10-1即可，安装完成之后应该就能使用自带的python环境了：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/914cee6a81e24cc8be8d0e42409845f9~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199965&x-orig-sign=UKkN8uscgWjZuDsMafhCGxpey70%3D)

安装notebook之前国内网络最好还是设置一下国内的镜像源，配置方法<https://mirrors.ustc.edu.cn/help/anaconda.html>

然后安装notebook

    pip install notebook

然后是安装deno：

    curl -fsSL https://deno.land/install.sh | sh

将deno作为jupyter内核：

    deno jupyter --install

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/855d3a0a72e64694932fcbfb9317e524~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199965&x-orig-sign=pkQHuqq%2BgBMXOYb4LKM9GajGpHM%3D)

后面使用vsc作为代码和notebook编辑工具，安装notebook插件：

<https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter>

创建一个目录，随便创建一个nb文件，比如 `test.ipynb`，随便搞点代码

```js
const foo = 'bar'
foo
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f23d5a6da5b6477f890409f965f892e0~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199965&x-orig-sign=oUDWZwhxuYd%2BBXH%2BQ4aSehPaoYE%3D)

完美

## LangChain.js入门

### 调用对话服务

为了方便国内调用，这里使用火山引擎的方舟，可以免费获取100w token的额度进行试用，注册完成后获取到api key，放到目录下的`.env`文件：

```text
OPENAI_API_KEY=你的api key
```

#### Deno

这里传入第三方接口地址，传入使用的模型

```ts
import { load } from "jsr:@std/dotenv";
import { ChatOpenAI } from "npm:/@langchain/openai";

await load({
  envPath: "./.env",
  export: true,
});
const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  },
  model: "deepseek-v3-250324",
});

await chatModel.invoke([
  {
    role: "user",
    content: "请说一个笑话",
  },
]);
```

```json
AIMessage {
  "id": "0217477990784623b83b4190efaa19090fea2b92084a3e235c925",
  "content": "好的，这里有一个关于程序员的冷笑话：\n\n---\n\n**为什么程序员总是分不清万圣节和圣诞节？**\n\n因为 Oct 31 == Dec 25！  \n（注：八进制的31等于十进制的25，程序员梗😂）\n\n---\n\n希望这个“冷”笑话能让你会心一笑～",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "promptTokens": 7,
      "completionTokens": 65,
      "totalTokens": 72
    },
    "finish_reason": "stop",
    "model_name": "deepseek-v3-250324"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "output_tokens": 65,
    "input_tokens": 7,
    "total_tokens": 72,
    "input_token_details": {
      "cache_read": 0
    },
    "output_token_details": {
      "reasoning": 0
    }
  }
}
```

#### Node.js

node可以使用`import "dotenv/config";`，将`.env`文件加载到process.env

### 提示词模板

提示模板能够将用户输入和参数转换为语言模型的指令。通过这种方式可以引导模型的响应，帮助其理解上下文并生成相关且连贯的文本输出。

提示模板接收一个对象作为输入，其中每个键代表需要填充到提示模板中的变量。

提示模板输出的是一个PromptValue对象。该PromptValue既可以传递给LLM或ChatModel使用，也可以转换为字符串或消息列表。设计PromptValue的目的是为了便于在字符串和消息格式之间切换。

提示模板主要分为以下几种类型：

#### 字符串提示模板

这类模板用于格式化单个字符串，通常适用于较简单的输入场景。例如，构建和使用PromptTemplate的常见方式如下：

```typescript
import { PromptTemplate } from "@langchain/core/prompts";

const promptTemplate = PromptTemplate.fromTemplate(
  "给我讲一个关于{topic}的地点"
);

await promptTemplate.invoke({ topic: "匹诺康尼" });
```

```text
StringPromptValue {
  value: '给我讲一个关于匹诺康尼的地点'
}
```

或者直接拿到字符串而不是对象：`await promptTemplate.format({ topic: "翁法罗斯" });`

> 在Deno的中，要导入npm包的话需要加上`npm:/`，比如：`import { PromptTemplate } from "npm:/@langchain/core/prompts";`

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/b307818f84684ec3864639d7596e2a13~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758199965&x-orig-sign=qDb4LiBk8P9mGJQJlhLbgtVR35g%3D)

#### 聊天提示模板

这类模板用于格式化消息列表。这些"模板"本身由多个子模板组成。例如，构建和使用ChatPromptTemplate的常见方式如下：

```typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "你是一个列车上的一个调饮机器人"],
  ["user", "给我讲一个关于{topic}的笑话"],
]);

await promptTemplate.invoke({ topic: "纯美骑士" });
```

```text
ChatPromptValue {
  messages: [
    SystemMessage {
      "content": "你是一个列车上的一个调饮机器人",
      "additional_kwargs": {},
      "response_metadata": {}
    },
    HumanMessage {
      "content": "给我讲一个关于纯美骑士的笑话",
      "additional_kwargs": {},
      "response_metadata": {}
    }
  ]
}
```

~~纯美骑士被纯美歧视了，骑士与歧视同音，令人忍俊不禁~~

在上例中，这个ChatPromptTemplate被调用时会构造两条消息。第一条是系统消息，不需要格式化变量；第二条是用户消息，将通过用户传入的`topic`变量进行格式化。

#### 消息占位符

这类提示模板负责在特定位置添加消息列表。在前面的ChatPromptTemplate示例中，我们看到了如何格式化两条字符串消息。但如果需要让用户传入一个消息列表并插入到特定位置呢？这时就需要使用MessagesPlaceholder：

```typescript
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "你是一个乐于助人的助手"],
  new MessagesPlaceholder("msgs"),
]);

await promptTemplate.invoke({ msgs: [new HumanMessage("你好！")] });
```

```text
ChatPromptValue {
  messages: [
    SystemMessage {
      "content": "你是一个乐于助人的助手",
      "additional_kwargs": {},
      "response_metadata": {}
    },
    HumanMessage {
      "content": "你好！",
      "additional_kwargs": {},
      "response_metadata": {}
    }
  ]
}
```

这将生成两条消息，第一条是系统消息，第二条是我们传入的HumanMessage。如果我们传入了5条消息，那么总共会生成6条消息（系统消息加上5条传入消息）。这个功能对于将消息列表插入特定位置非常有用。

如果不显式使用`MessagesPlaceholder`类，也可以通过以下方式实现相同效果：

```typescript
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "你是一个乐于助人的助手"],
  // highlight-next-line
  ["placeholder", "{msgs}"], // <-- 这是修改的部分
]);
```

#### 使用部分参数创建 template

如果有多个变量，我们可以先传入部分变量，最后传入让模板完整的变量

```js
import { PromptTemplate } from "@langchain/core/prompts";

const promptTemplate = PromptTemplate.fromTemplate(
  "这是一只{animal}，它的名字是{name}"
);

const animalTem = await promptTemplate.partial({ animal: "猫咪" });
await animalTem.format({ name: "小黑" });
// "这是一只猫咪，它的名字是小黑"
```

#### 使用函数进行部分填充

你也可以使用函数进行部分填充。这种方式的典型应用场景是当你有一个变量需要以固定方式动态获取时。一个常见的例子就是日期或时间。假设你有一个提示模板，总是需要包含当前日期。你不能在提示中硬编码日期，而每次都与其他输入变量一起传递又很繁琐。这种情况下，能够用一个总是返回当前日期的函数来部分填充提示就非常方便。

```typescript
const getCurrentDate = () => {
  return new Date().toISOString();
};

const prompt = new PromptTemplate({
  template: "给我讲一个关于{date}的{adjective}笑话",
  inputVariables: ["adjective", "date"],
});

const partialPrompt = await prompt.partial({
  date: getCurrentDate,
});

const formattedPrompt = await partialPrompt.format({
  adjective: "有趣的",
});

console.log(formattedPrompt);

// 给我讲一个关于2023-07-13T00:54:59.287Z的有趣笑话
```

你也可以在初始化提示模板时直接指定部分填充的变量：

```typescript
const prompt = new PromptTemplate({
  template: "给我讲一个关于{date}的{adjective}笑话",
  inputVariables: ["adjective"],
  partialVariables: {
    date: getCurrentDate,
  },
});

const formattedPrompt = await prompt.format({
  adjective: "有趣的",
});

console.log(formattedPrompt);

// 给我讲一个关于2023-07-13T00:54:59.287Z的有趣笑话
```

### 组合提示

LangChain 提供了用户友好的接口，用于将提示的不同部分组合在一起。您可以使用字符串提示或聊天提示来实现这一点。通过这种方式构建提示，可以轻松复用组件。

#### 聊天提示组合

聊天提示由一系列消息组成。与上述示例类似，我们可以连接聊天提示模板。每个新元素都是最终提示中的新消息。

首先，我们用 `SystemMessage` 初始化一个 `ChatPromptTemplate`。

```ts
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

const prompt = new SystemMessage("你是个友善的海盗");
```

然后可以轻松地将其与其他消息或消息模板组合成管道。当没有需要格式化的变量时使用 `BaseMessage`，有需要格式化的变量时使用 `MessageTemplate`。也可以直接使用字符串（注意：这会自动被推断为 `HumanMessagePromptTemplate`）。

```ts
import { HumanMessagePromptTemplate } from "@langchain/core/prompts";

const newPrompt = HumanMessagePromptTemplate.fromTemplate([
  prompt,
  new HumanMessage("你好"),
  new AIMessage("什么？"),
  "{input}",
]);
```

在底层，这会创建一个 ChatPromptTemplate 类的实例，因此您可以像之前一样使用它！

```ts
await newPrompt.formatMessages({ input: "我说你好" });
```

```text
[
  HumanMessage {
    "content": [
      {
        "lc_serializable": true,
        "lc_kwargs": {
          "content": "你是个友善的海盗",
          "additional_kwargs": "[Object]",
          "response_metadata": "[Object]"
        },
        "lc_namespace": [
          "langchain_core",
          "messages"
        ],
        "content": "你是个友善的海盗",
        "additional_kwargs": {},
        "response_metadata": {}
      },
      {
        "lc_serializable": true,
        "lc_kwargs": {
          "content": "你好",
          "additional_kwargs": "[Object]",
          "response_metadata": "[Object]"
        },
        "lc_namespace": [
          "langchain_core",
          "messages"
        ],
        "content": "你好",
        "additional_kwargs": {},
        "response_metadata": {}
      },
      {
        "lc_serializable": true,
        "lc_kwargs": {
          "content": "什么？",
          "tool_calls": "[Array]",
          "invalid_tool_calls": "[Array]",
          "additional_kwargs": "[Object]",
          "response_metadata": "[Object]"
        },
        "lc_namespace": [
          "langchain_core",
          "messages"
        ],
        "content": "什么？",
        "additional_kwargs": {},
        "response_metadata": {},
        "tool_calls": [],
        "invalid_tool_calls": []
      },
      {
        "type": "text",
        "text": "我说你好"
      }
    ],
    "additional_kwargs": {},
    "response_metadata": {}
  }
]
```

#### 使用 PipelinePrompt

LangChain 包含一个名为 `PipelinePromptTemplate` 的类，当您想要复用提示的部分内容时非常有用。`PipelinePrompt` 由两个主要部分组成：

* 最终提示：返回的最终提示
* 管道提示：由字符串名称和提示模板组成的元组列表。每个提示模板将被格式化，然后作为同名变量传递给后续提示模板。

```ts
import {
  PromptTemplate,
  PipelinePromptTemplate,
} from "@langchain/core/prompts";

const fullPrompt = PromptTemplate.fromTemplate(`{introduction}

{example}

{start}`);

const introductionPrompt = PromptTemplate.fromTemplate(
  `你正在模仿{person}。`
);

const examplePrompt =
  PromptTemplate.fromTemplate(`这是一个交互示例：
问：{example_q}
答：{example_a}`);

const startPrompt = PromptTemplate.fromTemplate(`现在，来真的！
问：{input}
答：`);

const composedPrompt = new PipelinePromptTemplate({
  pipelinePrompts: [
    {
      name: "introduction",
      prompt: introductionPrompt,
    },
    {
      name: "example",
      prompt: examplePrompt,
    },
    {
      name: "start",
      prompt: startPrompt,
    },
  ],
  finalPrompt: fullPrompt,
});

const formattedPrompt = await composedPrompt.format({
  person: "阿那克萨戈拉斯",
  example_q: `你最喜欢的动物是什么？`,
  example_a: "大地兽",
  input: `你最喜欢哪个地区？`,
});

console.log(formattedPrompt);
```

```text
你正在模仿阿那克萨戈拉斯。

这是一个交互示例：
问：你最喜欢的动物是什么？
答：大地兽

现在，来真的！
问：你最喜欢哪个地区？
答：
```

## 解析器

虽然部分模型提供商支持内置方式返回结构化输出，但并非所有厂商都具备此功能。我们可以利用输出解析器，通过提示词让用户指定任意JSON格式，查询模型以获取符合该格式的输出，并最终将结果解析为JSON数据。

在处理模型返回的结构化数据时，主要使用的输出解析器是 ​**​StructuredOutputParser​**​。在下面的示例中，我们将使用 ​**​zod​**​ 来定义期望从模型获取的输出格式。

首先，我们来看一下默认的格式化指令，这些指令将被插入到提示词中：

```ts
import { z } from "npm:/zod";
import { RunnableSequence } from "npm:/@langchain/core/runnables";
import { StructuredOutputParser } from "npm:/@langchain/core/output_parsers";
import { ChatPromptTemplate } from "npm:/@langchain/core/prompts";
import { load } from "jsr:@std/dotenv";
import { ChatOpenAI } from "npm:/@langchain/openai";

await load({
  envPath: "./.env",
  export: true,
});
const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  },
  model: "deepseek-v3-250324",
});
const zodSchema = z.object({
  answer: z.string().describe("answer to the user's question"),
  source: z
    .string()
    .describe(
      "source used to answer the user's question, should be a website."
    ),
});

const parser = StructuredOutputParser.fromZodSchema(zodSchema);

const chain = RunnableSequence.from([
  ChatPromptTemplate.fromTemplate(
    "Answer the users question as best as possible.\n{format_instructions}\n{question}"
  ),
  model,
  parser,
]);

await chain.invoke({
  question: "What is the capital of France?",
  format_instructions: parser.getFormatInstructions(),
});
```

```text
{ answer: "The capital of France is Paris.", source: "<https://www.britannica.com/place/Paris>" }
```

### 校验

虽然所有解析器都是可运行的并支持流式接口，但只有特定解析器能通过部分解析对象进行流式传输，因为这高度依赖于输出类型。结构化输出解析器（StructuredOutputParser）不支持部分流式传输，因为它在每个步骤都会验证输出。若尝试使用带有该输出解析器的链进行流式传输，该链只会生成完全解析后的输出：

```ts
const stream = await chain.stream({
  question: "What is the capital of France?",
  format_instructions: parser.getFormatInstructions(),
});

for await (const s of stream) {
  console.log(s);
}
```

```text
{
  answer: "The capital of France is Paris.",
  source: "https://en.wikipedia.org/wiki/Paris"
}
```

然而，更简单的 `JsonOutputParser` 支持通过部分输出进行流

```ts
import { ChatPromptTemplate } from "npm:/@langchain/core/prompts";
import { load } from "jsr:@std/dotenv";
import { ChatOpenAI } from "npm:/@langchain/openai";
import { JsonOutputParser } from "npm:/@langchain/core/output_parsers";

await load({
  envPath: "./.env",
  export: true,
});
const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  },
  model: "deepseek-v3-250324",
});


const template = `Return a JSON object with a single key named "answer" that answers the following question: {question}.
Do not wrap the JSON output in markdown blocks.`;

const jsonPrompt = ChatPromptTemplate.fromTemplate(template);
const jsonParser = new JsonOutputParser();
const jsonChain = jsonPrompt.pipe(model).pipe(jsonParser);

const stream = await jsonChain.stream({
  question: "Who invented the microscope?",
});

for await (const s of stream) {
  console.log(s);
}
```

```text
{}
{ answer: "" }
{ answer: "The" }
{ answer: "The microscope" }
{ answer: "The microscope was" }
{ answer: "The microscope was invented" }
{ answer: "The microscope was invented by" }
{ answer: "The microscope was invented by Hans" }
{ answer: "The microscope was invented by Hans Li" }
{ answer: "The microscope was invented by Hans Lippers" }
{ answer: "The microscope was invented by Hans Lippershey" }
{ answer: "The microscope was invented by Hans Lippershey," }
{ answer: "The microscope was invented by Hans Lippershey, Hans" }
{ answer: "The microscope was invented by Hans Lippershey, Hans Jans" }
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen,"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zach"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Jans"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen,"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with contributions"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with contributions from"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with contributions from Galileo"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with contributions from Galileo Galile"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with contributions from Galileo Galilei"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with contributions from Galileo Galilei who"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with contributions from Galileo Galilei who improved"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with contributions from Galileo Galilei who improved the"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with contributions from Galileo Galilei who improved the design"
}
{
  answer: "The microscope was invented by Hans Lippershey, Hans Janssen, and Zacharias Janssen, with contributions from Galileo Galilei who improved the design."
}
```

### 列表解释器

除了结构输出外，还可以输出列表：

```ts
import { PromptTemplate } from "npm:/@langchain/core/prompts";
import { CommaSeparatedListOutputParser } from "npm:/@langchain/core/output_parsers";

const parser = new CommaSeparatedListOutputParser();

const prompt = PromptTemplate.fromTemplate("列出崩坏星穹铁道里${number}个星神的名字.\n{instructions}")
    
const chain = prompt.pipe(model).pipe(parser)

await chain.invoke({
    number: 5,
    instructions: parser.getFormatInstructions(),
});
```

```text
[ "`纳努克", "阿哈", "克里珀", "伊德莉拉", "塔伊兹育罗斯`" ]
```

ds-v3貌似还是使用了md语法进行返回，稍微加点提示词去除一下：

```ts
const prompt = PromptTemplate.fromTemplate("列出崩坏星穹铁道里${number}个星神的名字，不要使用markdown.\n{instructions}")
```
