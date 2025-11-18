---
title: Agent architectures
date: 2025-09-11 21:31:40
tags:
- AI
- Agent
categories: AI
---

> 原文：[Agent architectures](https://langchain-ai.github.io/langgraphjs/concepts/agentic_concepts/)

许多LLM（大型语言模型）应用程序在LLM调用之前和/或之后执行特定的步骤控制流。例如，[RAG](https://github.com/langchain-ai/rag-from-scratch)（检索增强生成）会检索与问题相关的文档，并将这些文档传递给LLM，以便为模型的回答提供依据。

<!-- more -->

我们有时希望LLM系统能够选择自己的控制流来解决更复杂的问题，而不是硬编码一个固定的控制流。这正是智能体的一种定义：*智能体是一个使用LLM来决定应用程序控制流的系统。*LLM可以通过多种方式控制应用程序：

- LLM可以在两个潜在路径之间进行路由。
- LLM可以决定调用多个工具中的哪一个。
- LLM可以决定生成的答案是否足够，或者是否需要做更多的工作。

因此，存在许多[不同类型的智能体架构](https://blog.langchain.dev/what-is-a-cognitive-architecture)，这些架构赋予LLM不同程度的控制权。

{% asset_img agent_types.png Agent-Types %}

## 路由器

路由器允许LLM从一组指定的选项中选择一个步骤。这是一种控制程度相对有限的智能体架构，因为LLM通常只管理一个决策，并且只能返回一小部分输出。路由器通常采用几种不同的概念来实现这一点。

### 结构化输出

LLM的结构化输出通过提供LLM在其响应中应遵循的特定格式或模式来工作。这与工具调用类似，但更为通用。虽然工具调用通常涉及选择和使用预定义的函数，但结构化输出可用于任何类型的格式化响应。实现结构化输出的常用方法包括：

1. **提示工程**：指示LLM以特定格式进行响应。
2. **输出解析器**：使用后处理从LLM响应中提取结构化数据。
3. **工具调用**：利用某些LLM内置的工具调用功能来生成结构化输出。

结构化输出对于路由至关重要，因为它们确保了LLM的决策可以被系统可靠地解释和执行。更多请看：[如何结构化输出](https://js.langchain.com/docs/how_to/structured_output)

## 工具调用智能体

虽然路由器允许LLM做出单一决策，但更复杂的智能体架构在两个关键方面扩展了LLM的控制权：

1. **多步决策**：LLM可以控制一系列决策，而不仅仅是一个。
2. **工具访问**：LLM可以从各种工具中进行选择和使用，以完成任务。

[ReAct](https://arxiv.org/abs/2210.03629)是一种流行的通用智能体架构，它结合了这些扩展，并集成了三个核心概念：

1. **工具调用**：允许LLM根据需要选择和使用各种工具。
2. **记忆**：使智能体能够保留和使用先前步骤中的信息。
3. **规划**：使LLM能够创建和遵循多步骤计划以实现目标。

这种架构允许更复杂和灵活的智能体行为，超越了简单的路由，实现了跨多个步骤的动态问题解决。你可以通过[createReactAgent](https://langchain-ai.github.io/langgraphjs/reference/functions/langgraph_prebuilt.createReactAgent.html)来使用它

### 工具调用

每当您希望智能体与外部系统交互时，工具都非常有用。外部系统（例如API）通常需要特定的输入模式或有效负载，而不是自然语言。例如，当我们将API绑定为工具时，我们让模型了解了所需的输入模式。模型将根据用户的自然语言输入选择调用哪个工具，并返回符合该工具模式的输出。

[许多LLM提供商都支持工具调用](https://js.langchain.com/docs/integrations/chat)，[LangChain中的工具调用接口](https://blog.langchain.dev/improving-core-tool-interfaces-and-docs-in-langchain)很简单：您可以定义一个工具模式，并将其传递给 `ChatModel.bindTools([tool])`。

{% asset_img tool_call.png tool_call %}

### 记忆

记忆对于智能体至关重要，使其能够在解决问题的多个步骤中保留和利用信息。它在不同尺度上运作：

1. **短期记忆**：允许智能体访问在序列中较早步骤中获取的信息。
2. **长期记忆**：使智能体能够回忆起先前交互中的信息，例如对话中的过去消息。

LangGraph提供了对记忆实现的完全控制：

- **状态**：用户定义的模式，指定要保留的记忆的确切结构。
- **检查点**：在不同交互的每个步骤中存储状态的机制。

这种灵活的方法允许您根据特定的智能体架构需求定制记忆系统。

有效的记忆管理可以增强智能体维护上下文、从过去经验中学习以及随着时间的推移做出更明智决策的能力。有关将记忆添加到LangGraph中的实用指南，[请参见本教程](https://langchain-ai.github.io/langgraphjs/how-tos/persistence)。

### 规划

在ReAct架构中，LLM在一个while循环中被重复调用。在每个步骤中，智能体决定调用哪些工具以及这些工具的输入应该是什么。然后执行这些工具，并将输出作为观察结果反馈给LLM。当智能体决定不再值得调用任何工具时，while循环终止。

### ReAct实现

该论文与预构建的 `createReactAgent` 实现之间存在一些差异：

- 首先，我们使用[工具调用](https://langchain-ai.github.io/langgraphjs/concepts/agentic_concepts/#tool-calling)来让LLM调用工具，而该论文使用提示+解析原始输出。这是因为在撰写论文时工具调用还不存在，但通常更好、更可靠。
- 其次，我们使用消息来提示LLM，而该论文使用字符串格式化。这是因为在撰写本文时，LLM甚至没有公开基于消息的接口，而现在这是它们公开的唯一接口。
- 第三，该论文要求工具的所有输入都是单个字符串。这主要是因为当时LLM的功能还不是很强大，并且实际上只能生成单个输入。我们的实现允许使用需要多个输入的工具。
- 第四，该论文只考虑一次调用一个工具，这主要是由于当时LLM性能的限制。我们的实现允许一次调用多个工具。
- 最后，该论文要求LLM在决定调用哪些工具之前明确生成一个“思考”步骤。这是“ReAct”中的“推理”部分。我们的实现默认情况下不这样做，主要是因为LLM已经变得好得多，这已经不那么必要了。当然，如果您希望提示它这样做，您当然可以。

## 自定义智能体架构

虽然路由器和工具调用智能体（如ReAct）很常见，但为特定任务[定制智能体架构](https://blog.langchain.dev/why-you-should-outsource-your-agentic-infrastructure-but-own-your-cognitive-architecture)通常会带来更好的性能。LangGraph提供了几个强大的功能来构建量身定制的智能体系统：

### 人机协同

人的参与可以显着提高智能体的可靠性，尤其是在敏感任务中。这可以包括：

- 批准特定操作
- 提供反馈以更新智能体的状态
- 在复杂的决策过程中提供指导

当完全自动化不可行或不可取时，人机协同模式至关重要。了解更多关于[人机协同模式](https://langchain-ai.github.io/langgraphjs/concepts/human_in_the_loop/)。

**并行化**

并行处理对于高效的多智能体系统和复杂任务至关重要。LangGraph通过其[Send API](https://langchain-ai.github.io/langgraphjs/concepts/low_level/#send)支持并行化，从而能够：

- 并发处理多个状态
- 实现类似map-reduce的操作
- 高效处理独立的子任务

有关实际实现，请参阅我们的[map-reduce教程](https://langchain-ai.github.io/langgraphjs/how-tos/map-reduce/)。

### 子图

[子图](https://langchain-ai.github.io/langgraphjs/concepts/low_level/#subgraphs)对于管理复杂的智能体架构至关重要，尤其是在[多智能体系统](https://langchain-ai.github.io/langgraphjs/concepts/multi_agent/)中。它们允许：

- 为单个智能体进行隔离的状态管理
- 智能体团队的层次化组织
- 智能体与主系统之间的受控通信

子图通过状态模式中的重叠键与父图进行通信。这实现了灵活、模块化的智能体设计。有关实现细节，请参阅我们的[子图操作指南](https://langchain-ai.github.io/langgraphjs/how-tos/subgraph/)。

### 反思(Reflection)

反思机制可以通过以下方式显着提高智能体的可靠性：

1. 评估任务完成度和正确性
2. 为迭代改进提供反馈
3. 实现自我纠正和学习

虽然通常基于LLM，但反思也可以使用确定性方法。例如，在编码任务中，编译错误可以作为反馈。本视频中演示了[使用LangGraph进行自我纠错代码生成的方法](https://www.youtube.com/watch?v=MvNdgmM7uyc)。

通过利用这些功能，LangGraph可以创建复杂的、特定于任务的智能体架构，这些架构可以处理复杂的工作流、有效协作并持续提高其性能。
