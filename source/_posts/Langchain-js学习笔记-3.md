---
title: LangChain.js学习笔记（3）
date: 2025-09-06 11:34:11
tags:
- LangChain.js
- LLM
- AI
categories: AI
---

> 前面学了如何构建提示词、加载文档/网页内容、检索、嵌入等等，实现简单的RAG，下面再来继续学一下函数调用，让ai调用代码能力实现对ai能力的增强

<!-- more -->

# 工具概念

## 概述

LangChain 中的**工具**抽象将 TypeScript ​**函数**与定义函数**名称**、**描述**和**输入**的**模式**关联起来。

**工具**可以传递给支持[工具调用](https://js.langchain.com/docs/concepts/tool_calling)的聊天模型，允许模型请求执行具有特定输入的特定函数。

## 核心概念

* 工具是一种封装函数及其模式的方式，可以传递给聊天模型。

* 使用 [tool](https://api.js.langchain.com/functions/_langchain_core.tools.tool-1.html?_gl=1*rz33dj*_gcl_au*NzMwNjE3NjkuMTc0Nzc5ODc1NA..*_ga*MTUxMDY5NTUyOC4xNzQxNzYyMTE1*_ga_47WX3HKKY2*czE3NDg0ODYxMzEkbzI2JGcxJHQxNzQ4NDg3NjA5JGo2MCRsMCRoMA..) 函数创建工具，该函数简化了工具创建过程，支持以下功能：

  * 定义返回**工件/artifacts**​（如图像等）的工具
  * 使用**注入的工具参数**从模式（以及模型）中隐藏输入参数

## 工具接口

工具接口在 [`StructuredTool`](https://api.js.langchain.com/classes/_langchain_core.tools.StructuredTool.html?_gl=1*1f8md9z*_gcl_au*NzMwNjE3NjkuMTc0Nzc5ODc1NA..*_ga*MTUxMDY5NTUyOC4xNzQxNzYyMTE1*_ga_47WX3HKKY2*czE3NDg0ODYxMzEkbzI2JGcxJHQxNzQ4NDg3NjA5JGo2MCRsMCRoMA..) 类中定义，该类是 [Runnable 接口](https://js.langchain.com/docs/concepts/runnables)的子类。

与工具**模式**对应的关键属性：

* ​**name**​：工具的名称。
* ​**description**​：工具功能的描述。
* ​**args**​：返回工具参数的 JSON 模式的属性。

与**工具**关联的执行函数的关键方法：

* ​**invoke**​：使用给定的参数调用工具。

## 使用 `tool` 函数创建工具

推荐使用 tool 函数创建工具。该函数旨在简化工具创建过程，在大多数情况下应使用此方法。

```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const multiply = tool(
  ({ a, b }: { a: number; b: number }): number => {
    /**
     * 两个数字相乘。
     */
    return a * b;
  },
  {
    name: "multiply",
    description: "两个数字相乘",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);
```

有关如何创建工具的更多详细信息，请参阅如何创建自定义工具指南。

> LangChain 还有其他几种创建工具的方法；例如，通过子类化 `StructuredTool` 类或使用 `StructuredTool`。这些方法在[如何创建自定义工具指南](https://js.langchain.com/docs/how_to/custom_tools/)中展示，但我们通常推荐在大多数情况下使用 `tool` 函数。

## 直接使用工具

定义工具后，可以通过调用函数直接使用它。例如，使用上面定义的 `multiply` 工具：

```typescript
await multiply.invoke({ a: 2, b: 3 });
```

### 检查

您还可以检查工具的模式和其他属性：

```typescript
console.log(multiply.name); // multiply
console.log(multiply.description); // 两个数字相乘。
```

> 如果您使用预构建的 LangChain 或 LangGraph 组件，如 [createReactAgent](https://langchain-ai.github.io/langgraphjs/reference/functions/langgraph_prebuilt.createReactAgent.html?_gl=1*1ot4i7q*_gcl_au*NzMwNjE3NjkuMTc0Nzc5ODc1NA..*_ga*MTUxMDY5NTUyOC4xNzQxNzYyMTE1*_ga_47WX3HKKY2*czE3NDg0ODYxMzEkbzI2JGcxJHQxNzQ4NDg3NjA5JGo2MCRsMCRoMA..)，可能不需要直接与工具交互。然而，了解如何使用它们对于调试和测试非常有价值。此外，在构建自定义 LangGraph 工作流时，您可能会发现有必要直接使用工具。

## 配置模式

`tool` 函数提供了额外的选项来配置工具的模式（例如，修改名称、描述或解析函数的文档字符串以推断模式）。

请参阅 tool 的 API 参考 获取更多详细信息，并查看如何创建自定义工具指南中的示例。

## 工具工件

​**工具**是模型可以调用的实用程序，其输出设计为反馈给模型。然而，有时我们希望将工具执行的工件传递给链或代理中的下游组件，但不希望将其暴露给模型本身。例如，如果工具返回自定义对象、数据框或图像，我们可能希望将有关此输出的一些元数据传递给模型，而不将实际输出传递给模型。同时，我们可能希望在其他地方访问此完整输出，例如在下游工具中。

```typescript
const someTool = tool(({ ... }) => {
    // 执行某些操作
}, {
  // ... 工具模式参数
  // 将 returnType 设置为 "content_and_artifact"
  responseFormat: "content_and_artifact"
});
```

有关更多详细信息，请参阅[如何从工具返回工件](https://js.langchain.com/docs/how_to/tool_artifacts/)。

### RunnableConfig

您可以使用 `RunnableConfig` 对象将自定义运行时值传递给工具。

如果需要从工具内部访问 [RunnableConfig](https://js.langchain.com/docs/concepts/runnables/#RunnableConfig) 对象，可以通过在工具的函数签名中使用 `RunnableConfig` 来实现。

```typescript
import { RunnableConfig } from "@langchain/core/runnables";

const someTool = tool(
    async (args: any, config: RunnableConfig): Promise<[string, any]> => {
        /**
         * 执行某些操作的工具。
         */
    },
    {
        name: "some_tool",
        description: "执行某些操作的工具",
        schema: z.object({ ... }),
        returnType: "content_and_artifact"
    }
);


await someTool.invoke(..., { configurable: { value: "some_value" } });
```

`config` 不会成为工具模式的一部分，将在运行时注入适当的值。

## 最佳实践

设计供模型使用的工具时，请记住以下几点：

* 命名良好、文档正确且类型提示恰当的工具更容易被模型使用。
* 设计简单且范围狭窄的工具，因为它们更容易被模型正确使用。
* 使用支持[工具调用](https://js.langchain.com/docs/concepts/tool_calling) API 的聊天模型以充分利用工具。

## 工具包

LangChain 有**工具包**的概念。这是一个非常薄的抽象，将设计用于特定任务一起使用的工具分组。

### 接口

所有工具包都公开了一个 `getTools` 方法，该方法返回工具列表。因此，您可以执行以下操作：

```typescript
// 初始化工具包
const toolkit = new ExampleTookit(...)

// 获取工具列表
const tools = toolkit.getTools()
```

## 相关资源

有关更多信息，请参阅以下资源：

* [`tool` 的 API 参考](https://api.js.langchain.com/functions/_langchain_core.tools.tool-1.html?_gl=1*562ck3*_gcl_au*NzMwNjE3NjkuMTc0Nzc5ODc1NA..*_ga*MTUxMDY5NTUyOC4xNzQxNzYyMTE1*_ga_47WX3HKKY2*czE3NDg0ODYxMzEkbzI2JGcxJHQxNzQ4NDg4OTE4JGo2MCRsMCRoMA..)
* [如何创建自定义工具](https://js.langchain.com/docs/how_to/custom_tools/)
* [如何将运行时值传递给工具](https://js.langchain.com/docs/how_to/tool_runtime/)
* [所有 LangChain 工具操作指南](https://docs.langchain.com/docs/how_to/?_gl=1*18n4thf*_gcl_au*NzMwNjE3NjkuMTc0Nzc5ODc1NA..*_ga*MTUxMDY5NTUyOC4xNzQxNzYyMTE1*_ga_47WX3HKKY2*czE3NDg0ODYxMzEkbzI2JGcxJHQxNzQ4NDg4OTE4JGo2MCRsMCRoMA..#tools)
* [展示与 LangGraph 使用的其他操作指南](https://langchain-ai.github.io/langgraphjs/how-tos/tool-calling/?_gl=1*18n4thf*_gcl_au*NzMwNjE3NjkuMTc0Nzc5ODc1NA..*_ga*MTUxMDY5NTUyOC4xNzQxNzYyMTE1*_ga_47WX3HKKY2*czE3NDg0ODYxMzEkbzI2JGcxJHQxNzQ4NDg4OTE4JGo2MCRsMCRoMA..)
* 工具集成，请参阅[工具集成文档](https://docs.langchain.com/docs/integrations/tools/?_gl=1*18n4thf*_gcl_au*NzMwNjE3NjkuMTc0Nzc5ODc1NA..*_ga*MTUxMDY5NTUyOC4xNzQxNzYyMTE1*_ga_47WX3HKKY2*czE3NDg0ODYxMzEkbzI2JGcxJHQxNzQ4NDg4OTE4JGo2MCRsMCRoMA..)。

# 函数调用

## 概述

许多AI应用直接与人类交互。在这些情况下，模型以自然语言响应是合适的。但如果我们希望模型也能直接与系统（如数据库或API）交互呢？这些系统通常有特定的输入模式；例如，API经常需要特定的负载结构。这种需求催生了工具调用的概念。你可以使用工具调用来请求模型响应符合特定模式。

> 有时你会听到术语`function calling / 函数调用`。我们将其与`tool calling / 工具调用`互换使用。

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/0ada82239a1645c49469482f7f3dda87~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758200431&x-orig-sign=BQx4ke%2FCtmz8G%2BdOGZcfiubtVYY%3D)

## 关键概念

​**​(1) 工具创建：​**​ 使用tool函数创建一个工具。工具是函数与其模式之间的关联。\
​**​(2) 工具绑定：​**​ 工具需要连接到支持工具调用的模型。这使模型能够了解工具及其所需的输入模式。\
​**​(3) 工具调用：​**​ 在适当的时候，模型可以决定调用工具并确保其响应符合工具的输入模式。\
​**​(4) 工具执行：​**​ 可以使用模型提供的参数执行工具。

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/31763d7f69974d57bc74e7b313855a1f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758200431&x-orig-sign=DCyPQRzysWLn8PsSIR753rt3khU%3D)

## 推荐用法

以下伪代码展示了使用工具调用的推荐工作流程。创建的工具作为列表传递给`.bindTools()`方法。可以像往常一样调用此模型。如果进行了工具调用，模型的响应将包含工具调用的参数。工具调用的参数可以直接传递给工具。

```typescript
// 工具创建
const tools = [myTool];
// 工具绑定
const modelWithTools = model.bindTools(tools);
// 工具调用
const response = await modelWithTools.invoke(userInput);
```

## 工具创建

推荐使用`tool`函数创建工具。

```typescript
import { tool } from "@langchain/core/tools";

const multiply = tool(
  ({ a, b }: { a: number; b: number }): number => {
    /**
     * 两个数字相乘。
     */
    return a * b;
  },
  {
    name: "multiply",
    description: "将两个数字相乘",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);
```

> 进一步阅读
>
> * 查看我们的工具概念指南以获取更多细节。
> * 查看支持工具调用的模型集成。
> * 查看关于工具调用的操作指南。

对于不需要执行函数的工具调用，你也可以只定义工具模式：

```typescript
const multiplyTool = {
  name: "multiply",
  description: "将两个数字相乘",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
};
```

## 工具绑定

许多 模型提供商支持工具调用。

需要理解的核心概念是，LangChain提供了一个标准化的接口，用于将工具连接到模型。`.bindTools()`方法可用于指定模型可以调用哪些工具。

```typescript
const llmWithTools = model.bindTools([toolsList]);
```

作为一个具体示例，让我们将一个函数`multiply`作为工具绑定到支持工具调用的模型。

```typescript
const multiply = tool(
  ({ a, b }: { a: number; b: number }): number => {
    /**
     * 将a和b相乘。
     *
     * @param a - 第一个数字
     * @param b - 第二个数字
     * @returns a和b的乘积
     */
    return a * b;
  },
  {
    name: "multiply",
    description: "将两个数字相乘",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);

const llmWithTools = model.bindTools([multiply]);
```

## 工具调用

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/313b7df535864a8d9a67c26a46dc6e3d~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758200431&x-orig-sign=E2sJBI%2FByUjchX1zHRwqf5TceB8%3D)

工具调用的一个关键原则是，模型根据输入的相关性决定何时使用工具。模型并不总是需要调用工具。例如，给定一个不相关的输入，模型不会调用工具：

```typescript
const result = await llmWithTools.invoke("Hello world!");
```

```text
AIMessage {
  "content": "Hello! How can I assist you today?",
  "additional_kwargs": {},
  "tool_calls": [], 
  "invalid_tool_calls": [],
  // 省略其他不重要的信息...
}
```

结果将是一个包含模型自然语言响应（例如“Hello!”）的`AIMessage`。然而，如果我们传递一个与工具相关的输入，模型应该选择调用它：

```typescript
const result = await llmWithTools.invoke("2乘以3等于多少？");
```

```text
AIMessage {
  "content": "",
  "additional_kwargs": {
    "tool_calls": [
      {
        "function": "[Object]",
        "id": "call_wft9unvz0nufdxsvjd2n0fdd",
        "type": "function"
      }
    ]
  },
  "response_metadata": {
    "tokenUsage": {
      "promptTokens": 176,
      "completionTokens": 22,
      "totalTokens": 198
    },
    "finish_reason": "tool_calls",
    "model_name": "deepseek-v3-250324"
  },
  "tool_calls": [
    {
      "name": "multiply",
      "args": {
        "a": 2,
        "b": 3
      },
      "type": "tool_call",
      "id": "call_wft9unvz0nufdxsvjd2n0fdd"
    }
  ],
  "invalid_tool_calls": []
}
```

和之前一样，输出`result`将是一个`AIMessage`。但如果工具被调用，`result`将有一个`tool_calls`属性。此属性包括执行工具所需的一切，包括工具名称和输入参数：

```ts
result.tool_calls
```

```text
{'name': 'multiply', 'args': {'a': 2, 'b': 3}, 'id': 'xxx', 'type': 'tool_call'}
```

有关用法的更多细节，请参阅我们的[操作指南](https://js.langchain.com/docs/how_to/#tools)！

## 工具执行

工具实现了Runnable接口，这意味着它们可以直接被调用（例如`tool.invoke(args)`）。

LangGraph提供了预构建的组件（例如`ToolNode`），通常会代表用户调用工具。

> 进一步阅读
>
> * 查看我们的工具调用操作指南。
> * 查看LangGraph关于使用ToolNode的文档。

## 最佳实践

在设计模型使用的工具时，重要的是要记住：

* 具有明确工具调用API的模型在工具调用方面比未经微调的模型表现更好。
* 如果工具具有精心选择的名称和描述，模型的性能会更好。
* 简单、范围狭窄的工具比复杂工具更容易被模型使用。
* 要求模型从大量工具中选择会给模型带来挑战。

# 如何将工具输出传递给聊天模型

本指南将演示如何利用这些工具调用来实际执行函数，并将结果正确返回给模型。

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/8ce1fc7f8651409181841d8bff99096f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758200431&x-orig-sign=GGmrf9xGn%2FK5nnkL5%2F84psrJr4s%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/08442b58dace4304a103391c16f7cfa6~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758200431&x-orig-sign=pTBMVJ8KUisr1n9Xp8IdGIgW9uQ%3D)

```ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";

const addTool = tool(async ({ a, b }) => {
  return a + b;
}, {
  name: "add",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  description: "将两个数字相加",
});

const multiplyTool = tool(async ({ a, b }) => {
  return a * b;
}, {
  name: "multiply",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  description: "将两个数字相乘",
});

const tools = [addTool, multiplyTool];
```

现在，我们将让模型调用工具。我们会将其添加到作为对话历史记录的消息列表中：

```ts
import { HumanMessage } from "@langchain/core/messages";

const llmWithTools = model.bindTools(tools);

const messages = [
  new HumanMessage("3乘以12是多少? 还有, 11+49是多少?"),
];

const aiMessage = await llmWithTools.invoke(messages);

console.log(aiMessage);

messages.push(aiMessage);
```

接下来，让我们使用模型生成的参数来调用工具函数！

方便的是，如果我们用 `ToolCall` 调用 LangChain 的 `Tool`，它会自动返回一个可以反馈给模型的 `ToolMessage`：

```ts
const toolsByName = {
  add: addTool,
  multiply: multiplyTool,
}

for (const toolCall of aiMessage.tool_calls) {
  const selectedTool = toolsByName[toolCall.name];
  const toolMessage = await selectedTool.invoke(toolCall);
  messages.push(toolMessage);
}

console.log(messages);
```

```text
[
  HumanMessage {
    "content": "3乘以12是多少? 还有, 11+49是多少?",
    "additional_kwargs": {},
    "response_metadata": {}
  },
  AIMessage {
    "id": "02174850158423247ec89029d8000ca2c3a009559e9dc1ae84b31",
    "content": "",
    "additional_kwargs": {
      "tool_calls": [
        {
          "function": "[Object]",
          "id": "call_b88swfz7zqiyquph399jkp9t",
          "type": "function"
        },
        {
          "function": "[Object]",
          "id": "call_fl3bxokzdjtjsy2tqtxwr25u",
          "type": "function"
        }
      ]
    },
    "response_metadata": {
      "tokenUsage": {
        "promptTokens": 334,
        "completionTokens": 48,
        "totalTokens": 382
      },
      "finish_reason": "tool_calls",
      "model_name": "deepseek-v3-250324"
    },
    "tool_calls": [
      {
        "name": "multiply",
        "args": {
          "a": 3,
          "b": 12
        },
        "type": "tool_call",
        "id": "call_b88swfz7zqiyquph399jkp9t"
      },
      {
        "name": "add",
        "args": {
          "a": 11,
          "b": 49
        },
        "type": "tool_call",
        "id": "call_fl3bxokzdjtjsy2tqtxwr25u"
      }
    ],
    "invalid_tool_calls": [],
    "usage_metadata": {
      "output_tokens": 48,
      "input_tokens": 334,
      "total_tokens": 382,
      "input_token_details": {
        "cache_read": 0
      },
      "output_token_details": {
        "reasoning": 0
      }
    }
  },
  ToolMessage {
    "content": "36",
    "name": "multiply",
    "additional_kwargs": {},
    "response_metadata": {},
    "tool_call_id": "call_b88swfz7zqiyquph399jkp9t"
  },
  ToolMessage {
    "content": "60",
    "name": "add",
    "additional_kwargs": {},
    "response_metadata": {},
    "tool_call_id": "call_fl3bxokzdjtjsy2tqtxwr25u"
  }
]
```

最后，我们将使用工具调用的结果再次调用模型。模型会基于这些信息生成针对原始问题的最终回答：

```ts
await llmWithTools.invoke(messages);
```

```text
AIMessage {
  "id": "021748501676873032f7ddc5f9cefd0e01af52376a34c5388dcbc",
  "content": "3乘以12是36，11加49是60。",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "promptTokens": 386,
      "completionTokens": 12,
      "totalTokens": 398
    },
    "finish_reason": "stop",
    "model_name": "deepseek-v3-250324"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "output_tokens": 12,
    "input_tokens": 386,
    "total_tokens": 398,
    "input_token_details": {
      "cache_read": 0
    },
    "output_token_details": {
      "reasoning": 0
    }
  }
}
```

请注意，每个 `ToolMessage` 必须包含与模型原始工具调用中 `id` 相匹配的 `tool_call_id`。这有助于模型将工具响应与工具调用关联起来。

像 [LangGraph](https://langchain-ai.github.io/langgraphjs/tutorials/introduction/?_gl=1*v27l1x*_gcl_au*NzMwNjE3NjkuMTc0Nzc5ODc1NA..*_ga*MTUxMDY5NTUyOC4xNzQxNzYyMTE1*_ga_47WX3HKKY2*czE3NDg1MDAzODAkbzI3JGcxJHQxNzQ4NTAwOTY2JGo2MCRsMCRoMA..) 中的工具调用代理，就是使用这种基础流程来回答问题并完成任务。

## 相关内容

您已了解如何将工具调用结果传回模型。

接下来可能会对这些指南感兴趣：

* [LangGraph 快速入门](https://langchain-ai.github.io/langgraphjs/tutorials/introduction/?_gl=1*v27l1x*_gcl_au*NzMwNjE3NjkuMTc0Nzc5ODc1NA..*_ga*MTUxMDY5NTUyOC4xNzQxNzYyMTE1*_ga_47WX3HKKY2*czE3NDg1MDAzODAkbzI3JGcxJHQxNzQ4NTAwOTY2JGo2MCRsMCRoMA..)
* [工具使用的 小样本提示](https://js.langchain.com/docs/how_to/tools_few_shot/)
* [工具调用的 流式处理](https://js.langchain.com/docs/how_to/tool_streaming/)
* [向工具传递 运行时参数](https://js.langchain.com/docs/how_to/tool_runtime)
* [从模型获取 结构化输出](https://js.langchain.com/docs/how_to/structured_output/)
