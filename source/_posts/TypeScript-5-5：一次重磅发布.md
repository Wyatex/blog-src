---
title: TypeScript 5.5：一次重磅发布
date: 2024-07-12 09:52:02
tags:
- TypeScript
- 翻译
categories: 翻译
---

> 原文： [TypeScript 5.5: A Blockbuster Release](https://effectivetypescript.com/2024/07/02/ts-55/)

我们TypeScript开发人员是一群幸运的人。虽然有些语言（[Python](https://en.wikipedia.org/wiki/History_of_Python)，
[JavaScript](https://en.wikipedia.org/wiki/ECMAScript_version_history)）每年发布一次，甚至每三年发布一次（
[C++](https://en.wikipedia.org/wiki/C%2B%2B#Standardization)）甚至更少，但我们每年都能获得四个新版本的TypeScript。。TypeScript 5.5于2024年6月20日发布，它确实是一个重磅更新。让我们一起来看看。

<!-- more -->

TypeScript的座右铭是“带有类型语法的JavaScript”。TypeScript的新版本不会添加新的运行时特性（这是JavaScript的职责），而是会在类型系统内部进行更改。这些更改通常包括以下几种形式：

1. 新的类型表达和关联方式（例如，TypeScript 4.1中的模板字面量类型）
1. 类型检查和推断的精度提高
1. 语言服务的改进（例如，新的快速修复）
1. 对新ECMAScript标准的支持
1. 性能提升。

TypeScript 5.5虽然没有引入新的类型语法，但它包含了其他类型的更改。[官方发布说明](https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/)中有完整的解释和示例。以下是我对每个主要更改的快速概述。之后，我们将看看新的错误，并测试一些性能提升。

## 新功能

### 推断类型谓词

这是我为TypeScript所做的贡献，我非常高兴它已经进入了官方发布！我之前在这个博客上已经详细写过它，所以在这里我不会过多赘述：

-   [TypeScript功能的制作：推断类型谓词](https://effectivetypescript.com/2024/04/16/inferring-a-type-predicate/)
-   [流节点：如何实现类型推断](https://effectivetypescript.com/2024/03/24/flownodes/)
-   [类型谓词的隐藏面](https://effectivetypescript.com/2024/02/27/type-guards/)

来自[密歇根TypeScript](https://mobile.x.com/MiTypeScript/status/1806674859201540568)的Dimitri甚至录制了一个视频，我在其中向他和[Josh Goldberg](https://www.joshuakgoldberg.com/)解释了这个特性的故事。

TypeScript会为任何适当的函数推断类型谓词，但我认为这对于箭头函数最为有用，这也是这一更改的[最初动机](https://github.com/microsoft/TypeScript/issues/16069)：

```ts
const nums = [1, 2, 3, null];
//    ^? const nums: (number | null)[]
const onlyNums = nums.filter(n => n !== null);
//    ^? const onlyNums: number[]
//    Was (number | null)[] before TS 5.5!
```

我有两个后续的PR，旨在将这一特性扩展到具有[多个返回语句](https://github.com/microsoft/TypeScript/pull/58154)的函数，并[推断断言谓词](https://github.com/microsoft/TypeScript/pull/58495)（例如，**(x: string): asserts x is string**）。我认为这两个都是不错的改进，但由于它们解决的痛点相对较少见，因此它们是否有未来尚不确定。

### 常量索引访问的控制流细化

这是一个改进类型检查精度的很好例子。以下是[动机示例](https://github.com/microsoft/TypeScript/issues/16069)：


```ts
function f1(obj: Record<string, unknown>, key: string) {
  if (typeof obj[key] === "string") {
    // Now okay, previously was error
    obj[key].toUpperCase();
  }
}
```

以前这只会对常量属性访问（如**obj.prop**）起作用。无可否认，这在类型检查的精度方面是一个胜利，但我认为我会继续使用标准的解决方法：提取变量。

```ts
function f1(obj: Record<string, unknown>, key: string) {
  const val = obj[key];
  if (typeof val === "string") {
    val.toUpperCase();  // this has always worked!
  }
}
```

这减少了代码中的重复，并避免了运行时的双重查找。它还给了你一个为变量赋予有意义名称的机会，这将使你的代码更易于阅读。

在我看来，我可以在单表达式箭头函数中欣赏这一点，因为在那里你无法引入变量：

```ts
keys.map(k => typeof obj[k] === 'string' ? Number(obj[k]) : obj[k])
```

### 正则表达式语法检查

[正则表达式](https://en.wikipedia.org/wiki/Regular_expression)可能是计算中最常见的[领域特定语言](https://en.wikipedia.org/wiki/Domain-specific_language)。以前的TypeScript版本忽略了 **/regex/** 字面量中的所有内容，但现在它们会检查几种错误类型：

- 语法错误  
- 对无效命名和编号捕获的无效反向引用  
- 使用目标ECMAScript版本中不可用的特性

正则表达式以其[难以理解和调试](https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454)而闻名（这个在线playground很方便），因此TypeScript在编写正则表达式方面的任何改进都值得赞赏。

由于现有代码库中的正则表达式可能已经过测试，因此在升级到TS 5.5时，您最有可能遇到第三种错误。ES2018添加了许多新的[正则表达式特性](https://exploringjs.com/js/book/ch_new-javascript-features.html#new-in-es2018)，如/s修饰符。如果您正在使用它们，但没有将目标设置为ES2018或更高版本，您将收到一个错误。最可能的修复方法是[提高您的目标](https://www.learningtypescript.com/articles/why-increase-your-tsconfig-target)。特别是/s（[dotAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/dotAll)）标志，在浏览器中得到了[广泛支持](https://caniuse.com/?search=dotall)，自[Node.js 8](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/dotAll)（2018）以来就已经可用。这里的通用规则是创建一个准确的环境模型，如《[Effective TypeScript](https://amzn.to/3UjPrsK)》中的[第76项](https://github.com/danvk/effective-typescript/blob/main/samples/ch-write-run/model-env.md)所述。

正则表达式类型检查是TypeScript的一个受欢迎的新领域。我对准确地为[String.prototype.replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter)的回调形式进行类型化的可能性感到好奇，这是JavaScript中最不友好的函数之一：


```ts
"str".replace(/foo(bar)baz/, (match, capture) => capture);
//                                   ^?  (parameter) capture: any
```

### 对新ECMAScript集合方法的支持

当你有两个集合时，很自然地想要找到它们之间的交集、并集和差集。我一直很惊讶JavaScript的Set没有内置这种能力。[现在它们有了](https://github.com/tc39/ecma262/pull/3306)！

虽然这些新方法是阶段4，但它们还没有被包含在任何官方的ECMAScript版本中。（它们可能会在ES2025中出现。）这意味着，要在TypeScript中使用它们，你需要将你的目标或库设置为ESNext。目前，这些方法在浏览器中的[支持率约为80%](https://caniuse.com/mdn-javascript_builtins_set_union)，在服务器上[需要Node.js 22](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/union)，因此请谨慎使用或包含一个polyfill。

### 隔离声明

isolatedDeclarations设置在“[你应该注解你的返回类型吗？](https://effectivetypescript.com/2020/04/28/avoid-inferable/)”的辩论中开辟了一个新领域。这里的主要动机是针对非常大的TypeScript项目的构建速度。采用这个特性不会让你更快地构建，至少目前不会。但它是一个基础，为更多的事情做准备。如果你想了解这个特性，我强烈推荐观看Titian在TS Congress 2023上的演讲：[使用--isolatedDeclarations加速TypeScript构建](https://portal.gitnation.org/contents/faster-typescript-builds-with-isolateddeclarations)。

你应该启用这个特性吗？可能不会，至少目前不会。一个例外可能是如果你使用了typescript-eslint中的[explicit-function-return-type](https://typescript-eslint.io/rules/explicit-function-return-type/)规则。在这种情况下，切换到**isolatedDeclarations**将只需要为你的公共API显式返回类型注解，这是一个更清晰的胜利。

我预计在后续的TypeScript版本中会有更多关于这个特性的开发。我还想指出，isolatedDeclarations与推断类型谓词有一个[有趣的合并冲突](https://github.com/microsoft/TypeScript/pull/58958)。所有这些新特性都是独立开发的，这使得很难预见它们将如何相互作用。

### 性能和大小优化性能和大小优化

我[有时喜欢问](https://effectivetypescript.com/2023/06/27/ts-51/)：你宁愿要一个新特性还是一个性能提升？在这种情况下，我们两者都有！

推断类型谓词确实会带来性能损失。在某些[极端情况](https://github.com/microsoft/TypeScript/pull/57465#issuecomment-1974921974)下，这可能是一个显著的损失，但通常是[1-2%的减速](https://github.com/microsoft/TypeScript/pull/57465#issuecomment-1965552516)。TypeScript团队决定，这是他们愿意为这个特性付出的代价。

TypeScript 5.5还包括了许多其他性能改进，因此净效果是积极的。你既得到了你的特性，也得到了性能。

[单态化](https://mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html)在TypeScript中一直是一个持续的问题。这是一个“千刀万剐”式的性能问题，很难诊断，因为它在配置文件中并不明显。单态化使对象上的所有属性访问更快。因为这些属性访问非常多，所以净效果可能很大。

我们喜欢JavaScript和TypeScript中对象的一点是，它们不必像Java或C#那样适合整齐的层次结构。但单态化正是朝着这种严格的层次结构推动的。看到这一点是由性能驱动的，而不是设计考虑，这很有趣。如果有人试图将[tsc翻译](https://twitter.com/danvdk/status/1801252274947158175)到JVM等平台上，这将有所帮助。

我对[控制流图简化](https://github.com/microsoft/TypeScript/pull/58013)特别高兴，因为PR中包含了我构建的[TS AST Viewer](https://effectivetypescript.com/2024/03/24/flownodes/)图的截图！

这些优化影响构建时间、语言服务和TypeScript API消费者。TS团队使用基于真实项目（包括TypeScript本身）的[一组基准来衡量性能](https://github.com/microsoft/typescript-benchmarking/)。我用不太科学严谨的方式比较了我自己的几个项目中的TypeScript 5.4和5.5：

- 使用literate-ts验证《[Effective TypeScript](https://amzn.to/3UjPrsK)》第二版中的934个代码示例的时间从347秒变为352秒。所以变化很小，或者可能是轻微的退化。
- 类型检查时间（**tsc --noEmit**）在我检查的所有项目中都没有受到影响。
- 使用[ts-loader](url)的项目运行webpack的时间从大约43秒变为42秒，这是一个大约2%的加速。

所以对于我的项目来说没有戏剧性的变化，但你的体验可能会有所不同。如果你看到了大的改进（或退步），请告诉我！（如果你看到了退步，你可能应该向TypeScript提交一个错误报告。

### 杂项

- 编辑器和监视模式可靠性改进：这些都是艰苦的生活质量改进，我们应该感谢TypeScript团队关注它们。
- 从ECMAScript模块更容易消费API：我一直想知道为什么你不能像其他模块一样 **import "typescript"**。现在你可以了！
- 简化的引用指令声明发射：一个奇怪、尘封的角落不再存在。耶！

### New Errors

在我将我的TypeScript项目更新到TS 5.5后，大多数项目都没有新的错误。唯一的例外是需要将我的目标更新到ES2018以获取 **/s** 正则表达式标志，如上所述。

[彭博](https://github.com/microsoft/TypeScript/issues/58587)和[谷歌](https://github.com/microsoft/TypeScript/issues/58685)都发布了GitHub问题，描述了他们在升级到TS 5.5时遇到的新错误。他们都没有遇到重大问题。

### 结论

每个新的TypeScript版本都很令人兴奋，但新形式的类型推断、**isolatedDeclarations**和潜在的性能提升使这个版本特别出色。

[有时有人](https://matklad.github.io/2024/03/22/basic-things.html#Releases)说软件依赖遵循“[反三角不等式](https://en.wikipedia.org/wiki/Triangle_inequality)”：从v1→v2→v3比直接从v1→v3更容易。这个想法是你可以一次修复一小部分问题。没有太多理由推迟采用TypeScript 5.5。现在这样做将使几个月后升级到5.6更容易。