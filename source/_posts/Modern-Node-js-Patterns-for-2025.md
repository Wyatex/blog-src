---
title: 2025 年现代 Node.js 模式​
date: 2025-07-04 21:02:58
tags:
- node.js
categories: JavaScript
---

> 原文：[Modern Node.js Patterns for 2025](https://kashw1n.com/blog/nodejs-2025/)，翻译来自DeepSeek-R1

Node.js 自诞生以来经历了显著的变革。如果您使用 Node.js 已有数年，您很可能亲身见证了它的演进——从重度依赖回调、CommonJS 主导的环境，发展到如今基于标准的、简洁的开发体验。这些变化不仅仅是表面的；它们代表了我们在服务器端 JavaScript 开发方法上的根本性转变。现代 Node.js 拥抱 Web 标准，减少外部依赖，并提供更直观的开发体验。让我们探索这些转变，并理解它们为何对您 2025 年的应用程序至关重要。

<!-- more -->

## 1. 模块系统：ESM 成为新标准

模块系统可能是您感受到最大差异的地方。CommonJS 曾经很好地服务了我们，但 ES 模块 (ESM) 已成为明确的赢家，提供了更好的工具支持并与 Web 标准保持一致。

### 传统方式 (CommonJS)
让我们看看我们过去是如何构建模块的。这种方法需要显式导出和同步导入：


```js
// math.js
function add(a, b) {
  return a + b;
}
module.exports = { add };

// app.js
const { add } = require('./math');
console.log(add(2, 3));
```

这种方式工作正常，但它有局限性——不支持静态分析，无法进行摇树优化（tree-shaking），并且与浏览器标准不一致。

### 现代方式 (使用 node: 前缀的 ES 模块)

现代 Node.js 开发拥抱 ES 模块，并增加了一个关键特性——对内置模块使用 `node:` 前缀。这种显式命名防止了混淆，并使依赖关系变得极其清晰：


```js
// math.js
export function add(a, b) {
  return a + b;
}

// app.js
import { add } from './math.js';
import { readFile } from 'node:fs/promises'; // 现代的 node: 前缀
import { createServer } from 'node:http';

console.log(add(2, 3));
```

`node:` 前缀不仅仅是一个约定——它向开发者和工具都发出了一个明确的信号：您正在导入 Node.js 内置模块，而不是 npm 包。这防止了潜在的冲突，并使您的代码对其依赖关系更加明确。

### 顶层 Await：简化初始化

最具变革性的功能之一是顶层 await。不再需要将整个应用程序包裹在一个 async 函数中，仅仅为了在模块级别使用 `await`：


```js
// app.js - 无需包裹函数的简洁初始化
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const config = JSON.parse(await readFile('config.json', 'utf8'));
const server = createServer(/* ... */);
console.log('App started with config:', config.appName);
```

## 2. 内置 Web API：减少外部依赖

Node.js 大规模拥抱了 Web 标准，将 Web 开发者已经熟知的 API 直接引入运行时环境。这意味着更少的依赖项和跨环境的一致性。

### Fetch API：不再需要 HTTP 库依赖

还记得每个项目都需要 `axios`、`node-fetch` 或类似的库来进行 HTTP 请求吗？这些日子一去不复返了。Node.js 现在原生包含了 Fetch API：


```js
// 传统方式 - 需要外部依赖
const axios = require('axios');
const response = await axios.get('https://api.example.com/data');

// 现代方式 - 内置的 fetch 及其增强功能
const response = await fetch('https://api.example.com/data');
const data = await response.json();
```

但现代方法不仅仅是替换您的 HTTP 库。您还能获得内置的复杂超时和取消支持：


```js
async function fetchData(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000) // 内置超时支持
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('请求超时');
    }
    throw error;
  }
}
```

这种方法消除了对超时库的需求，并提供了一致的错误处理体验。`AbortSignal.timeout()` 方法特别优雅——它创建一个信号，在指定时间后自动中止。

### AbortController：优雅的操作取消

现代应用程序需要优雅地处理取消操作，无论是用户发起的还是由于超时。`AbortController` 提供了一种标准化的取消操作方式：


```js
// 干净地取消长时间运行的操作
const controller = new AbortController();
// 设置自动取消
setTimeout(() => controller.abort(), 10000);

try {
  const data = await fetch('https://slow-api.com/data', {
    signal: controller.signal
  });
  console.log('数据接收成功:', data);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('请求被取消 - 这是预期行为');
  } else {
    console.error('意外错误:', error);
  }
}
```


```
// 传统方式 - 需要外部依赖
const axios = require('axios');
const response = await axios.get('https://api.example.com/data');

// 现代方式 - 内置的 fetch 及其增强功能
const response = await fetch('https://api.example.com/data');
const data = await response.json();
```

但现代方法不仅仅是替换您的 HTTP 库。您还能获得内置的复杂超时和取消支持：

```
async function fetchData(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000) // 内置超时支持
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('请求超时');
    }
    throw error;
  }
}
```

这种方法消除了对超时库的需求，并提供了一致的错误处理体验。`AbortSignal.timeout()` 方法特别优雅——它创建一个信号，在指定时间后自动中止。

### AbortController：优雅的操作取消

现代应用程序需要优雅地处理取消操作，无论是用户发起的还是由于超时。`AbortController` 提供了一种标准化的取消操作方式：

```
// 干净地取消长时间运行的操作
const controller = new AbortController();
// 设置自动取消
setTimeout(() => controller.abort(), 10000);

try {
  const data = await fetch('https://slow-api.com/data', {
    signal: controller.signal
  });
  console.log('数据接收成功:', data);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('请求被取消 - 这是预期行为');
  } else {
    console.error('意外错误:', error);
  }
}
```

这种模式适用于许多 Node.js API，而不仅仅是 `fetch`。您可以使用相同的 `AbortController` 来处理文件操作、数据库查询以及任何支持取消的异步操作。

## 3. 内置测试：无需外部依赖的专业测试

过去，测试需要在 Jest、Mocha、Ava 或其他框架之间做出选择。Node.js 现在包含了一个功能齐全的测试运行器，无需任何外部依赖即可满足大多数测试需求。

### 使用 Node.js 内置测试运行器进行现代测试

内置测试运行器提供了一个简洁、熟悉的 API，感觉既现代又完整：


```js
// test/math.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { add, multiply } from '../math.js';

describe('数学函数', () => {
  test('正确相加数字', () => {
    assert.strictEqual(add(2, 3), 5);
  });

  test('处理异步操作', async () => {
    const result = await multiply(2, 3);
    assert.strictEqual(result, 6);
  });

  test('无效输入时抛出异常', () => {
    assert.throws(() => add('a', 'b'), /无效输入/);
  });
});
```

其强大之处在于它与 Node.js 开发工作流的无缝集成：


```sh
# 使用内置运行器运行所有测试
node --test

# 开发时的监视模式 (watch mode)
node --test --watch

# 覆盖率报告 (Node.js 20+)
node --test --experimental-test-coverage
```

监视模式在开发过程中尤其有价值——当您修改代码时，您的测试会自动重新运行，无需任何额外配置即可提供即时反馈。

## 4. 复杂的异步模式

虽然 `async/await` 并不新鲜，但围绕它的模式已经显著成熟。现代 Node.js 开发更有效地利用这些模式，并将它们与更新的 API 结合使用。

### 使用增强错误处理的 Async/Await

现代错误处理将 `async/await` 与复杂的错误恢复和并行执行模式相结合：


```js
import { readFile, writeFile } from 'node:fs/promises';

async function processData() {
  try {
    // 并行执行独立操作
    const [config, userData] = await Promise.all([
      readFile('config.json', 'utf8'),
      fetch('/api/user').then(r => r.json())
    ]);

    const processed = processUserData(userData, JSON.parse(config));
    await writeFile('output.json', JSON.stringify(processed, null, 2));
    return processed;
  } catch (error) {
    // 带有上下文的结构化错误日志记录
    console.error('处理失败:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}
```

这种模式将并行执行（用于性能）与全面的错误处理结合起来。`Promise.all()` 确保独立操作并发运行，而 `try/catch` 提供了一个单一的错误处理点，并带有丰富的上下文信息。

### 使用 AsyncIterators 的现代事件处理

事件驱动编程已经超越了简单的事件监听器。AsyncIterators 提供了一种更强大的方式来处理事件流：


```js
import { EventEmitter, once } from 'node:events';

class DataProcessor extends EventEmitter {
  async *processStream() {
    for (let i = 0; i < 10; i++) {
      this.emit('data', `chunk-${i}`);
      yield `processed-${i}`; // 模拟异步处理时间
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.emit('end');
  }
}

// 作为异步迭代器消费事件
const processor = new DataProcessor();
for await (const result of processor.processStream()) {
  console.log('已处理:', result);
}
```

这种方法特别强大，因为它结合了事件的灵活性和异步迭代的控制流。您可以按顺序处理事件，自然地处理背压（backpressure），并干净地退出处理循环。

## 5. 与 Web 标准集成的先进流 (Streams)

流 (Streams) 仍然是 Node.js 最强大的功能之一，但它们已经演进以拥抱 Web 标准并提供更好的互操作性。

### 现代流处理

流处理通过更好的 API 和更清晰的模式变得更加直观：

```js
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';

// 使用简洁、专注的逻辑创建转换流
const upperCaseTransform = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

// 使用健壮的错误处理处理文件
async function processFile(inputFile, outputFile) {
  try {
    await pipeline(
      createReadStream(inputFile),
      upperCaseTransform,
      createWriteStream(outputFile)
    );
    console.log('文件处理成功');
  } catch (error) {
    console.error('管道处理失败:', error);
    throw error;
  }
}
```

结合 Promise 的 `pipeline` 函数提供了自动清理和错误处理，消除了流处理的许多传统痛点。

### Web 流互操作性

现代 Node.js 可以与 Web 流无缝协作，实现与浏览器代码和边缘运行时环境更好的兼容性：

```js
// 创建一个 Web 流 (与浏览器兼容)
const webReadable = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello ');
    controller.enqueue('World!');
    controller.close();
  }
});

// 在 Web 流和 Node.js 流之间转换
const nodeStream = Readable.fromWeb(webReadable);
const backToWeb = Readable.toWeb(nodeStream);
```

这种互操作性对于需要在多个环境中运行或在服务器和客户端之间共享代码的应用程序至关重要。

## 6. 工作线程 (Worker Threads)：为 CPU 密集型任务实现真正的并行性

JavaScript 的单线程特性并不总是适合 CPU 密集型工作。工作线程提供了一种有效利用多核的方法，同时保持 JavaScript 的简洁性。

### 无阻塞的后台处理

工作线程非常适合那些会阻塞主事件循环的计算密集型任务：

```
// worker.js - 隔离的计算环境
import { parentPort, workerData } from 'node:worker_threads';

function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(workerData.number);
parentPort.postMessage(result);
```

主应用程序可以委托繁重的计算而不阻塞其他操作：


```js
// main.js - 非阻塞委托
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

async function calculateFibonacci(number) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      fileURLToPath(new URL('./worker.js', import.meta.url)),
      { workerData: { number } }
    );
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`工作线程以退出码 ${code} 停止`));
      }
    });
  });
}

// 您的主应用程序在整个过程中保持响应
console.log('开始计算...');
const result = await calculateFibonacci(40);
console.log('Fibonacci 结果:', result);
console.log('应用程序在整个过程中保持响应！');
```

这种模式允许您的应用程序利用多个 CPU 核心，同时保持熟悉的 `async/await` 编程模型。

## 7. 增强的开发体验

现代 Node.js 通过内置工具优先考虑开发者体验，而这些工具过去需要外部包或复杂配置。

### 监视模式和环境管理

内置的监视模式和环境文件支持显著简化了开发工作流程：


```js
{
  "name": "modern-node-app",
  "type": "module",
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "node --watch --env-file=.env app.js",
    "test": "node --test --watch",
    "start": "node app.js"
  }
}
```

`--watch` 标志消除了对 `nodemon` 的需求，而 `--env-file` 则移除了对 `dotenv` 的依赖。您的开发环境变得更简单、更快速：


```env
# .env 文件通过 --env-file 自动加载
DATABASE_URL=postgres://localhost:5432/mydb
API_KEY=secret123
```

```js
// app.js - 环境变量立即可用
console.log('连接到:', process.env.DATABASE_URL);
console.log('API 密钥已加载:', process.env.API_KEY ? '是' : '否');
```

这些功能通过减少配置开销和消除重启周期，使开发更加愉快。

## 8. 现代安全性和性能监控

安全性和性能已成为首要关注点，内置工具用于监控和控制应用程序行为。

### 用于增强安全性的权限模型

实验性的权限模型允许您限制应用程序的访问权限，遵循最小权限原则：


```js
# 以受限的文件系统访问权限运行
node --experimental-permission --allow-fs-read=./data --allow-fs-write=./logs app.js

# 网络限制
node --experimental-permission --allow-net=api.example.com app.js
```

这对于处理不受信任代码或需要证明安全合规性的应用程序特别有价值。

### 内置性能监控

性能监控现已内置于平台中，无需外部 APM 工具即可进行基本监控：

```js
import { PerformanceObserver, performance } from 'node:perf_hooks';

// 设置自动性能监控
const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 100) { // 记录慢操作
      console.log(`检测到慢操作: ${entry.name} 耗时 ${entry.duration} 毫秒`);
    }
  }
});
obs.observe({ entryTypes: ['function', 'http', 'dns'] });

// 检测您自己的操作
async function processLargeDataset(data) {
  performance.mark('processing-start');
  const result = await heavyProcessing(data);
  performance.mark('processing-end');
  performance.measure('data-processing', 'processing-start', 'processing-end');
  return result;
}
```

这提供了对应用程序性能的可见性，而无需外部依赖，帮助您在开发早期识别瓶颈。

## 9. 应用程序分发与部署

现代 Node.js 通过单文件可执行应用程序等特性简化了应用程序分发。

### 单文件可执行应用程序 (Single Executable Applications)

您现在可以将 Node.js 应用程序打包成一个单一的可执行文件，简化部署和分发：


```bash
# 创建一个自包含的可执行文件
node --experimental-sea-config sea-config.json
```

配置文件定义了应用程序的打包方式：


```js
{
  "main": "app.js",
  "output": "my-app-bundle.blob",
  "disableExperimentalSEAWarning": true
}
```

这对于 CLI 工具、桌面应用程序或任何您希望分发应用程序而不要求用户单独安装 Node.js 的场景特别有价值。

## 10. 现代错误处理和诊断

错误处理已经超越了简单的 `try/catch` 块，发展到了结构化的错误处理和全面的诊断。

### 结构化错误处理

现代应用程序受益于结构化、带上下文的错误处理，提供更好的调试信息：

```js
class AppError extends Error {
  constructor(message, code, statusCode = 500, context = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// 使用丰富上下文的用法
throw new AppError('数据库连接失败', 'DB_CONNECTION_ERROR', 503, {
  host: 'localhost',
  port: 5432,
  retryAttempt: 3
});
```

这种方法为调试和监控提供了更丰富的错误信息，同时在应用程序中保持一致的错误接口。

### 高级诊断

Node.js 包含复杂的诊断功能，帮助您了解应用程序内部发生的情况：

```js
import diagnostics_channel from 'node:diagnostics_channel';

// 创建自定义诊断通道
const dbChannel = diagnostics_channel.channel('app:database');
const httpChannel = diagnostics_channel.channel('app:http');

// 订阅诊断事件
dbChannel.subscribe((message) => {
  console.log('数据库操作:', {
    operation: message.operation,
    duration: message.duration,
    query: message.query
  });
});

// 发布诊断信息
async function queryDatabase(sql, params) {
  const start = performance.now();
  try {
    const result = await db.query(sql, params);
    dbChannel.publish({
      operation: 'query',
      sql,
      params,
      duration: performance.now() - start,
      success: true
    });
    return result;
  } catch (error) {
    dbChannel.publish({
      operation: 'query',
      sql,
      params,
      duration: performance.now() - start,
      success: false,
      error: error.message
    });
    throw error;
  }
}
```

这些诊断信息可以被监控工具消费、记录分析或用于触发自动补救操作。

## 11. 现代包管理和模块解析

包管理和模块解析变得更加复杂，更好地支持 monorepos、内部包和灵活的模块解析。

### 导入映射 (Import Maps) 和内部包解析

现代 Node.js 支持导入映射，允许您创建清晰的内部模块引用：

```json
{
  "imports": {
    "#config": "./src/config/index.js",
    "#utils/*": "./src/utils/*.js",
    "#db": "./src/database/connection.js"
  }
}
```

这为内部模块创建了一个清晰、稳定的接口：

```js
// 整洁的内部导入，在您重组代码时不会中断
import config from '#config';
import { logger, validator } from '#utils/common';
import db from '#db';
```

这些内部导入使重构更容易，并在内部和外部依赖之间提供了清晰的区分。

### 用于灵活加载的动态导入

动态导入支持复杂的加载模式，包括条件加载和代码拆分：

```js
// 基于配置或环境加载功能
async function loadDatabaseAdapter() {
  const dbType = process.env.DATABASE_TYPE || 'sqlite';
  try {
    const adapter = await import(`#db/adapters/${dbType}`);
    return adapter.default;
  } catch (error) {
    console.warn(`数据库适配器 ${dbType} 不可用，回退到 sqlite`);
    const fallback = await import('#db/adapters/sqlite');
    return fallback.default;
  }
}

// 条件功能加载
async function loadOptionalFeatures() {
  const features = [];
  if (process.env.ENABLE_ANALYTICS === 'true') {
    const analytics = await import('#features/analytics');
    features.push(analytics.default);
  }
  if (process.env.ENABLE_MONITORING === 'true') {
    const monitoring = await import('#features/monitoring');
    features.push(monitoring.default);
  }
  return features;
}
```

这种模式允许您构建适应其环境并仅加载实际所需代码的应用程序。

## 前进之路：现代 Node.js (2025) 关键要点

当我们审视 Node.js 开发的现状时，几个关键原则浮现出来：

1.  ​**​拥抱 Web 标准​**​：使用 `node:` 前缀、Fetch API、`AbortController` 和 Web 流以获得更好的兼容性和减少依赖。
1.  ​**​利用内置工具​**​：测试运行器、监视模式和环境文件支持减少了外部依赖和配置复杂性。
1.  ​**​运用现代异步模式思考​**​：顶层 await、结构化错误处理和异步迭代器使代码更具可读性和可维护性。
1.  ​**​策略性地使用工作线程​**​：对于 CPU 密集型任务，工作线程提供了真正的并行性而不会阻塞主线程。
1.  ​**​采用渐进式增强 (Progressive Enhancement)​**​：使用权限模型、诊断通道和性能监控来构建健壮、可观察的应用程序。
1.  ​**​优化开发者体验​**​：监视模式、内置测试和导入映射创造了更愉快的开发工作流。
1.  ​**​规划分发部署​**​：单文件可执行应用程序和现代打包使部署更简单。

Node.js 从一个简单的 JavaScript 运行时转变为一个全面的开发平台，这一转变是显著的。通过采用这些现代模式，您不仅是在编写当代代码——您正在构建更易于维护、性能更高、并且与更广泛的 JavaScript 生态系统保持一致的应用。

现代 Node.js 的美妙之处在于它在演进的同时保持了向后兼容性。您可以逐步采用这些模式，它们可以与现有代码并存。无论您是启动一个新项目还是现代化一个现有项目，这些模式都为实现更健壮、更愉快的 Node.js 开发提供了一条清晰的路径。

展望 2025 年，Node.js 将继续演进，但我们在此探讨的基础性模式为构建在未来多年仍保持现代且可维护的应用程序奠定了坚实的基础。
