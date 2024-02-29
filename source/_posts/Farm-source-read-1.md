---
title: Farm源码阅读（1）
date: 2024-02-27 16:50:00
categories: 源码阅读笔记
tags:
  - Farm
  - Rust
  - 编译器
  - 笔记
---

Farm RFC：

1. [Farm 核心架构设计](https://github.com/farm-fe/rfcs/blob/9fa2c57d706e13027975233b499f5852963ea762/rfcs/001-core-architecture/rfc.zh-CN.md)
2. [Farm 运行时模块管理](https://github.com/farm-fe/rfcs/blob/9fa2c57d706e13027975233b499f5852963ea762/rfcs/002-runtime-module-management/rfc.zh-CN.md)
3. [Farm 部分打包](hhttps://github.com/farm-fe/rfcs/blob/9fa2c57d706e13027975233b499f5852963ea762/rfcs/003-partial-bundling/rfc.md)

<!-- more -->

## cli

cli基本可以看作整个项目的入口，包括dev、build。

代码位于farm仓库的[packages/cli](https://github.com/farm-fe/farm/tree/main/packages/cli)目录下。

入口代码src/index.ts：

```js
import { cac } from 'cac';
const cli = cac('farm');


// cli基本的参数
cli
  .option('-c, --config <file>', 'use specified config file')
  .option('-m, --mode <mode>', 'set env mode')
  .option('--base <path>', 'public base path')
  .option('--clearScreen', 'allow/disable clear screen when logging', {
    default: true
  });

// farm start命令的参数和start命令对应的执行逻辑
cli
  .command(
    '[root]',
    'Compile the project in dev mode and serve it with farm dev server'
  )
  .alias('start')
  .option('-l, --lazy', 'lazyCompilation')
  .option('--host <host>', 'specify host')
  .option('--port <port>', 'specify port')
  .option('--open', 'open browser on server start')
  .option('--hmr', 'enable hot module replacement')
  .option('--cors', 'enable cors')
  .option('--strictPort', 'specified port is already in use, exit with error')
  .action(
    async (
      root: string,
      options: FarmCLIServerOptions & GlobalFarmCLIOptions
    ) => {
      // 处理传入的参数，包括过滤重复参数、缩写参数、设置默认值...
      // 引入@farmfe/core，并执行core提供的start方法，启动本地调试的编译环境，类似vite命令
      const { start } = await resolveCore();
      handleAsyncOperationErrors( // handleAsyncOperationErrors 用来 catch 被 reject 的 promise
        start(defaultOptions), // 处理完cli参数，交给start启动编译
        'Failed to start server'
      );
    }
  );
```

可以看出主要用了cac来作为参数解析库，全部链式操作设置参数提示、回调，非常方便。

同理在下面设置一好build、watch等命令。

```js
// 代理一下process.emit方法，将node的实验提示过滤，其余的提示按原样提示
function preventExperimentalWarning() {
  const defaultEmit = process.emit;
  process.emit = function (...args: any[]) {
    if (args[1].name === 'ExperimentalWarning') {
      return undefined;
    }
    return defaultEmit.call(this, ...args);
  };
}

preventExperimentalWarning()

// 设置help命令提示
cli.help();

// 设置cli版本
cli.version(version);

//开始解析命令和参数
cli.parse();
```

## core

### index

core包是编译器的核心部分，看看index.ts:

```ts
// 提供编译器接口
export * from './compiler/index.js';
// 提供配置相关的接口，用于提供类型定义、运行config文件传递给编译器
export * from './config/index.js';
// 提供开发服务端，使用koa
export * from './server/index.js';
// 提供一些内置的插件
export * from './plugin/type.js';
// 一些公共工具包
export * from './utils/index.js';

// 省略import

// 上面cli包的start命令解析完后交给这个start开始调用编译和启动开发服务器
export async function start(
  inlineConfig: FarmCLIOptions & UserConfig
): Promise<void> {
  const logger = inlineConfig.logger ?? new Logger();
  setProcessEnv('development');

  try {
    // 解析farm.config.js/ts文件
    const resolvedUserConfig = await resolveConfig(
      inlineConfig,
      logger,
      'development'
    );

    // 使用配置创建编译器实例
    const compiler = await createCompiler(resolvedUserConfig);

    // 使用配置创建开发服务器实例
    const devServer = await createDevServer(
      compiler,
      resolvedUserConfig,
      logger
    );

    // 开始跟踪文件改变
    createFileWatcher(devServer, resolvedUserConfig, inlineConfig, logger);
    // 服务器和文件监控都准备就绪后，调用插件的configureDevServer钩子
    resolvedUserConfig.jsPlugins.forEach((plugin: JsPlugin) =>
      plugin.configureDevServer?.(devServer)
    );
    // 开始监听端口
    await devServer.listen();
  } catch (error) {
    logger.error(`Failed to start the server: ${error.stack}`);
  }
}

export async function build(
  inlineConfig: FarmCLIOptions & UserConfig
): Promise<void> {
  const logger = inlineConfig.logger ?? new Logger();
  setProcessEnv('production');
  const resolvedUserConfig = await resolveConfig(
    inlineConfig,
    logger,
    'production'
  );

  setProcessEnv(resolvedUserConfig.compilation.mode);

  try {
    // 看下面的createBundleHandler实现代码
    await createBundleHandler(resolvedUserConfig);
    // copy resources under publicDir to output.path
    await copyPublicDirectory(resolvedUserConfig, inlineConfig, logger);
  } catch (err) {
    console.log(err);
  }
}


export async function createBundleHandler(
  resolvedUserConfig: ResolvedUserConfig,
  watchMode = false
) {
  const compiler = await createCompiler(resolvedUserConfig);

  // compilerHandler用于按照选项清空控制台、计算编译时间
  await compilerHandler(async () => {
    compiler.removeOutputPathDir();
    await compiler.compile();
    compiler.writeResourcesToDisk();
  }, resolvedUserConfig);

  // 是否配置了watch，则开始监听文件变更
  if (resolvedUserConfig.compilation?.watch || watchMode) {
    const watcher = new FileWatcher(compiler, resolvedUserConfig);
    await watcher.watch();
    return watcher;
  }
}
```

### comolier

先来看看compiler写了什么：

```ts
export class Compiler {
  // 通过napi绑定rust的编译器
  private _bindingCompiler: BindingCompiler;
  private _updateQueue: UpdateQueueItem[] = [];
  private _onUpdateFinishQueue: (() => void | Promise<void>)[] = [];

  // 标记是否已经在编译，限制只能运行一个编译任务
  public compiling = false;

  private logger: ILogger;

  constructor(public config: Config) {
    this.logger = new Logger();
    this._bindingCompiler = new BindingCompiler(this.config);
  }

  // 调用编译器完成编译
  async compile() {
    if (this.compiling) {
      this.logger.error('Already compiling', {
        exit: true
      });
    }

    this.compiling = true;
    if (process.env.FARM_PROFILE) {
      this._bindingCompiler.compileSync();
    } else {
      await this._bindingCompiler.compile();
    }
    this.compiling = false;
  }

  async update(
    paths: string[],
    sync = false,
    ignoreCompilingCheck = false
  ): Promise<JsUpdateResult> {
    let resolve: (res: JsUpdateResult) => void;

    const promise = new Promise<JsUpdateResult>((r) => {
      resolve = r;
    });

    // 如果已经有一个更新进程，加到队列里面等待执行
    if (this.compiling && !ignoreCompilingCheck) {
      this._updateQueue.push({ paths, resolve });
      return promise;
    }

    this.compiling = true;
    try {
      const res = this._bindingCompiler.update(
        paths,
        async () => {
          const next = this._updateQueue.shift();

          if (next) {
            // 如果队列里面还有任务，拿出来继续调用本方法
            await this.update(next.paths, true, true).then(next.resolve);
          } else {
            this.compiling = false;
            for (const cb of this._onUpdateFinishQueue) {
              await cb();
            }
            // 执行完回调后清空队列
            this._onUpdateFinishQueue = [];
          }
        },
        sync
      );

      return res as JsUpdateResult;
    } catch (e) {
      this.compiling = false;
      throw e;
    }
  }

  // 编译完后将资源写入到目标目录
  writeResourcesToDisk(base = ''): void {
    const resources = this.resources();
    const configOutputPath = this.config.config.output.path;
    const outputPath = path.isAbsolute(configOutputPath)
      ? configOutputPath
      : path.join(this.config.config.root, configOutputPath);

    for (const [name, resource] of Object.entries(resources)) {
      // remove query params and hash of name
      const nameWithoutQuery = name.split('?')[0];
      const nameWithoutHash = nameWithoutQuery.split('#')[0];

      const filePath = path.join(outputPath, base, nameWithoutHash);

      if (!existsSync(path.dirname(filePath))) {
        mkdirSync(path.dirname(filePath), { recursive: true });
      }

      writeFileSync(filePath, resource);
    }

    // 写入完成后，执行写入完成的回调
    this.callWriteResourcesHook();
  }

  callWriteResourcesHook() {
    for (const jsPlugin of this.config.jsPlugins ?? []) {
      (jsPlugin as JsPlugin).writeResources?.executor?.({
        resourcesMap: this._bindingCompiler.resourcesMap() as Record<
          string,
          Resource
        >,
        config: this.config.config
      });
    }
  }

  compileSync() {
    if (this.compiling) {
      this.logger.error('Already compiling', {
        exit: true
      });
    }
    this.compiling = true;
    this._bindingCompiler.compileSync();
    this.compiling = false;
  }

  // 剩下的一些都是调用compiler方法的一些方法
}
```

### config

config部分主要用来处理用户配置，这部分代码很多，只看上面用到的resolveConfig方法

```ts
export async function resolveConfig(
  inlineOptions: FarmCLIOptions, // 命令行传入的cli命令
  logger: Logger,
  mode?: CompilationMode
): Promise<ResolvedUserConfig> {
  // 使用cli命令清空控制台
  checkClearScreen(inlineOptions);
  inlineOptions.mode = inlineOptions.mode ?? mode;

  // 根据cli的值提供默认值
  const getDefaultConfig = async () => {
    const mergedUserConfig = mergeInlineCliOptions({}, inlineOptions);

    const resolvedUserConfig = await resolveMergedUserConfig(
      mergedUserConfig,
      undefined,
      inlineOptions.mode ?? mode
    );
    resolvedUserConfig.server = normalizeDevServerOptions({}, mode);
    resolvedUserConfig.compilation = await normalizeUserCompilationConfig(
      resolvedUserConfig,
      logger,
      mode
    );
    resolvedUserConfig.root = resolvedUserConfig.compilation.root;
    resolvedUserConfig.jsPlugins = [];
    resolvedUserConfig.rustPlugins = [];
    return resolvedUserConfig;
  };
  // configPath 可能是目录或者文件
  const { configPath } = inlineOptions;
  // 如果根据configPath找找不到配置文件，则使用默认配置
  if (!configPath) {
    return getDefaultConfig();
  }

  if (!path.isAbsolute(configPath)) {
    throw new Error('configPath must be an absolute path');
  }

  // loadConfigFile主要逻辑是读取config文件，如果是ts文件就调用上面的compiler对config代码进行编译打包，如果是js直接import默认名导出
  // 如果导出是对象则作为配置内容，如果是方法，先执行然后拿到配置内容。
  const loadedUserConfig = await loadConfigFile(
    configPath,
    inlineOptions,
    logger
  );

  // 没拿到config，就使用默认值
  if (!loadedUserConfig) {
    return getDefaultConfig();
  }

  const { config: userConfig, configFilePath } = loadedUserConfig;

  // 处理rust插件和js插件
  const { jsPlugins, rustPlugins } = await resolveFarmPlugins(userConfig);

  const rawJsPlugins = (await resolveAsyncPlugins(jsPlugins || [])).filter(
    Boolean
  );

  let vitePluginAdapters: JsPlugin[] = [];
  const vitePlugins = (userConfig?.vitePlugins ?? []).filter(Boolean);
  // 如果有配置vite的插件，适配成farm的
  if (vitePlugins.length) {
    vitePluginAdapters = await handleVitePlugins(
      vitePlugins,
      userConfig,
      logger
    );
  }

  // 根据优先级排序
  const sortFarmJsPlugins = getSortedPlugins([
    ...rawJsPlugins,
    ...vitePluginAdapters
  ]);

  const config = await resolveConfigHook(userConfig, sortFarmJsPlugins);

  const mergedUserConfig = mergeInlineCliOptions(config, inlineOptions);

  const resolvedUserConfig = await resolveMergedUserConfig(
    mergedUserConfig,
    configFilePath,
    inlineOptions.mode ?? mode
  );

  // 先处理 server config ，下面normalizeUserCompilationConfig可能会用到
  resolvedUserConfig.server = normalizeDevServerOptions(
    resolvedUserConfig.server,
    mode
  );

  const targetWeb = !(
    userConfig.compilation?.output?.targetEnv === 'node' ||
    mode === 'production'
  );

  try {
  // 检查端口可用性:如果发生冲突，则自动增加端口
    targetWeb &&
      (await Server.resolvePortConflict(resolvedUserConfig.server, logger));
    // eslint-disable-next-line no-empty
  } catch {}

  // 处理config里的compilation参数
  resolvedUserConfig.compilation = await normalizeUserCompilationConfig(
    resolvedUserConfig,
    logger,
    mode
  );
  resolvedUserConfig.root = resolvedUserConfig.compilation.root;
  resolvedUserConfig.jsPlugins = sortFarmJsPlugins;
  resolvedUserConfig.rustPlugins = rustPlugins;

  // 处理完config之后，调用设置的configResolved钩子
  await resolveConfigResolvedHook(resolvedUserConfig, sortFarmJsPlugins);

  return resolvedUserConfig;
}
```

看似很长，实际上是因为配置文件涉及到的很多的配置，需要对配置项规范化、设置默认值操作。

### server

使用koa2提供开发服务端，看看index.ts

```ts

interface ImplDevServer {
  createServer(options: UserServerConfig): void;
  createDevServer(options: UserServerConfig): void;
  createPreviewServer(options: UserServerConfig): void;
  listen(): Promise<void>;
  close(): Promise<void>;
  getCompiler(): Compiler;
}


export class Server implements ImplDevServer {
  private _app: Koa;
  private restart_promise: Promise<void> | null = null;
  private compiler: Compiler | null;
  public logger: Logger;

  ws: WsServer;
  config: NormalizedServerConfig & UserPreviewServerConfig;
  hmrEngine?: HmrEngine;
  server?: httpServer;
  publicDir?: string;
  publicPath?: string;
  resolvedUrls?: ServerUrls;
  watcher: FileWatcher;

  constructor({
    compiler = null,
    logger
  }: {
    compiler?: Compiler | null;
    logger: Logger;
  }) {
    this.compiler = compiler;
    this.logger = logger ?? new Logger();

    this.initializeKoaServer();

    if (!compiler) return;

    this.publicDir = normalizePublicDir(compiler?.config.config.root);

    this.publicPath =
      normalizePublicPath(
        compiler.config.config.output?.publicPath,
        logger,
        false
      ) || '/';
  }
  private initializeKoaServer() {
    this._app = new Koa();
  }
  public async createServer(options: NormalizedServerConfig) {
    const { https, host } = options;
    const protocol = https ? 'https' : 'http';

    const hostname = await resolveHostname(host);

    this.config = {
      ...options,
      protocol,
      hostname
    };

    // 因为要支持https、http2，所以要以http2.createSecureServer然后传入koa的callback这种方法起服务器
    if (https) {
      this.server = http2.createSecureServer(
        {
          ...https,
          allowHTTP1: true
        },
        this._app.callback()
      );
    } else {
      this.server = http.createServer(this._app.callback());
    }
  }
  public createWebSocket() {
    if (!this.server) {
      throw new Error('Websocket requires a server.');
    }
    this.ws = new WsServer(this.server, this.config, this.hmrEngine);
  }
}

```
