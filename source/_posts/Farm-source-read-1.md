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

// farm 或者 farm start 命令的参数和start命令对应的执行逻辑
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

使用koa2提供开发服务端，src/index.ts的start其中调用了该文件里的createDevServer：

```ts
export async function createDevServer(
  compiler: Compiler,
  resolvedUserConfig: ResolvedUserConfig,
  logger: Logger
) {
  const server = new Server({ compiler, logger });
  await server.createDevServer(resolvedUserConfig.server);

  return server;
}
```

然后看看src/server/index.ts

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
  public async createDevServer(options: NormalizedServerConfig) {
    if (!this.compiler) {
      throw new Error('DevServer requires a compiler for development mode.');
    }

    await this.createServer(options);

    this.hmrEngine = new HmrEngine(this.compiler, this, this.logger);

    this.createWebSocket();

    this.invalidateVite();

    this.applyServerMiddlewares(options.middlewares);
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
  async listen(): Promise<void> {
    if (!this.server) {
      this.logger.error('HTTP server is not created yet');
      return;
    }
    const { port, open, protocol, hostname } = this.config;

    const start = Date.now();
    // start启动的话，会在这里执行编译，等待编译完成
    await this.compile();
    // 统计和打印编译时间
    bootstrap(Date.now() - start, this.compiler.config);
    // 监听端口，完成服务器的启动
    await this.startServer(this.config);

    !__FARM_GLOBAL__.__FARM_RESTART_DEV_SERVER__ &&
      (await this.displayServerUrls());

    if (open) {
      const publicPath =
        this.publicPath === '/' ? this.publicPath : `/${this.publicPath}`;
      const serverUrl = `${protocol}://${hostname.name}:${port}${publicPath}`;
      openBrowser(serverUrl);
    }
  }
  async startServer(serverOptions: UserServerConfig) {
    const { port, hostname } = serverOptions;
    const listen = promisify(this.server.listen).bind(this.server);
    try {
      await listen(port, hostname.host);
    } catch (error) {
      this.handleServerError(error, port, hostname.host);
    }
  }
}
```

可以看到server部分代码还是和compiler部分紧密耦合在一起的，可以说server部分就是在compiler部分外面包一层服务器，方便调用编译。

#### HmrEngine

在创建DevServer的过程中，还初始化了HmrEngine，看看代码：

```ts
export class HmrEngine {
  // 需要更新的模块队列
  private _updateQueue: string[] = [];

  private _compiler: Compiler;
  private _devServer: Server;
  private _onUpdates: ((result: JsUpdateResult) => void)[];
  private _lastModifiedTimestamp: Map<string, string>;

  constructor(compiler: Compiler, devServer: Server, private _logger: Logger) {
    this._compiler = compiler;
    this._devServer = devServer;
    this._lastModifiedTimestamp = new Map();
  }

  callUpdates(result: JsUpdateResult) {
    this._onUpdates?.forEach((cb) => cb(result));
  }

  onUpdateFinish(cb: (result: JsUpdateResult) => void) {
    if (!this._onUpdates) {
      this._onUpdates = [];
    }
    this._onUpdates.push(cb);
  }

  recompileAndSendResult = async (): Promise<JsUpdateResult> => {
    const queue = [...this._updateQueue];

    if (queue.length === 0) {
      return;
    }

    // 处理需要更新的模块的路径
    let updatedFilesStr = queue
      .map((item) => {
        if (isAbsolute(item)) {
          return relative(this._compiler.config.config.root, item);
        } else {
          const resolvedPath = this._compiler.transformModulePath(
            this._compiler.config.config.root,
            item
          );
          return relative(this._compiler.config.config.root, resolvedPath);
        }
      })
      .join(', ');
    if (updatedFilesStr.length >= 100) {
      updatedFilesStr =
        updatedFilesStr.slice(0, 100) + `...(${queue.length} files)`;
    }

    try {
      clearScreen();
      const start = Date.now();
      // 开始调用compiler编译需要更新的模块
      const result = await this._compiler.update(queue);
      // 编译完成
      this._logger.info(
        `${bold(cyan(updatedFilesStr))} updated in ${bold(
          green(`${Date.now() - start}ms`)
        )}`
      );

      // 清理队列里已经编译过的内容，留下没编译的后续再次调用编译
      this._updateQueue = this._updateQueue.filter(
        (item) => !queue.includes(item)
      );

      // 如果有动态资源更新，在这里处理
      let dynamicResourcesMap: Record<string, Resource[]> = null;

      if (result.dynamicResourcesMap) {
        for (const [key, value] of Object.entries(result.dynamicResourcesMap)) {
          if (!dynamicResourcesMap) {
            dynamicResourcesMap = {} as Record<string, Resource[]>;
          }
          dynamicResourcesMap[key] = value.map((r) => ({
            path: r[0],
            type: r[1] as 'script' | 'link'
          }));
        }
      }

      // 将编译好的代码处理成json格式，发送给前端进行更新
      const resultStr = `{
      added: [${result.added
        .map((r) => `'${r.replaceAll('\\', '\\\\')}'`)
        .join(', ')}],
      changed: [${result.changed
        .map((r) => `'${r.replaceAll('\\', '\\\\')}'`)
        .join(', ')}],
      removed: [${result.removed
        .map((r) => `'${r.replaceAll('\\', '\\\\')}'`)
        .join(', ')}],
      immutableModules: ${JSON.stringify(result.immutableModules.trim())},
      mutableModules: ${JSON.stringify(result.mutableModules.trim())},
      boundaries: ${JSON.stringify(result.boundaries)},
      dynamicResourcesMap: ${JSON.stringify(dynamicResourcesMap)}
    }`;

      // 调用callUpdates钩子
      this.callUpdates(result);

      // 发送
      this._devServer.ws.clients.forEach((client: WebSocketClient) => {
        client.rawSend(`
        {
          type: 'farm-update',
          result: ${resultStr}
        }
      `);
      });

      // 调用onUpdateFinish钩子
      this._compiler.onUpdateFinish(async () => {
        // if there are more updates, recompile again
        if (this._updateQueue.length > 0) {
          await this.recompileAndSendResult();
        }
      });
    } catch (e) {
      clearScreen();
      // this._lastAttemptWasError = true;
      throw e;
    }
  };

  // 对外提供的hmr更新接口，传入需要更新的文件路径
  async hmrUpdate(absPath: string | string[], force = false) {
    const paths = Array.isArray(absPath) ? absPath : [absPath];

    for (const path of paths) {
      if (this._compiler.hasModule(path) && !this._updateQueue.includes(path)) {
        const lastModifiedTimestamp = this._lastModifiedTimestamp.get(path);
        const currentTimestamp = (await stat(path)).mtime.toISOString();
        // 只有在文件的时间戳（即文件的最后修改时间）与上次检查时的时间戳不同时，才对文件进行更新。如果文件自上次检查以来没有被修改过，那么就不需要更新它。
        if (!force && lastModifiedTimestamp === currentTimestamp) {
          continue;
        }

        this._lastModifiedTimestamp.set(path, currentTimestamp);
        // 将文件路径加入到需要更新的队列
        this._updateQueue.push(path);
      }
    }

    // 如果现在没有在编译，而且队列有值，才调用上面的更新方法。
    if (!this._compiler.compiling && this._updateQueue.length > 0) {
      try {
        await this.recompileAndSendResult();
      } catch (e) {
        // eslint-disable-next-line no-control-regex
        const serialization = e.message.replace(/\x1b\[[0-9;]*m/g, '');
        const errorStr = `${JSON.stringify({
          message: serialization
        })}`;
        this._devServer.ws.clients.forEach((client: WebSocketClient) => {
          client.rawSend(`
            {
              type: 'error',
              err: ${errorStr}
            }
          `);
        });
        this._logger.error(e);
      }
    }
  }
}
```

### watcher

这部分主要实现了文件修改后，执行编译并通过hmr更新页面。在上面我们看到了start命令调用了：createFileWatcher，文件位于src/index.ts，看看他的实现：

```ts
export async function createFileWatcher(
  devServer: Server,
  resolvedUserConfig: ResolvedUserConfig,
  inlineConfig: FarmCLIOptions & UserConfig,
  logger: Logger
) {
  // 需要开启hmr并且不能是production模式启动
  if (
    devServer.config.hmr &&
    resolvedUserConfig.compilation.mode === 'production'
  ) {
    logger.error('HMR cannot be enabled in production mode.');
    return;
  }

  if (!devServer.config.hmr) {
    return;
  }

  const fileWatcher = new FileWatcher(devServer, resolvedUserConfig);
  devServer.watcher = fileWatcher;
  await fileWatcher.watch();

  const configFilePath = await getConfigFilePath(inlineConfig.configPath);
  // 监听config文件是否修改，如果config修改就需要重新启动
  const farmWatcher = new ConfigWatcher({
    ...resolvedUserConfig,
    configFilePath
  });
  farmWatcher.watch(async (files: string[]) => {
    clearScreen();

    devServer.restart(async () => {
      logFileChanges(files, resolvedUserConfig.root, logger);
      farmWatcher?.close();

      await devServer.close();
      __FARM_GLOBAL__.__FARM_RESTART_DEV_SERVER__ = true;
      // 重头开始执行start命令
      await start(inlineConfig);
    });
  });
}
```

然后是watcher核心代码src/watcher/index.ts

```ts

interface ImplFileWatcher {
  watch(): Promise<void>;
}

export class FileWatcher implements ImplFileWatcher {
  private _root: string;
  private _watcher: FSWatcher;
  private _logger: Logger;
  private _close = false;

  constructor(
    public serverOrCompiler: Server | Compiler,
    public options: ResolvedUserConfig
  ) {
    this._root = options.root;
    this._logger = new Logger();
  }

  getInternalWatcher() {
    return this._watcher;
  }

  async watch() {
    // 获取compiler实例
    const compiler = this.getCompilerFromServerOrCompiler(
      this.serverOrCompiler
    );

    // 定义当文件修改之后执行的回调
    const handlePathChange = async (path: string): Promise<void> => {
      if (this._close) {
        return;
      }

      try {
        if (this.serverOrCompiler instanceof Server) {
          await this.serverOrCompiler.hmrEngine.hmrUpdate(path);
        }

        if (
          this.serverOrCompiler instanceof Compiler &&
          this.serverOrCompiler.hasModule(path)
        ) {
          compilerHandler(
            async () => {
              const result = await compiler.update([path], true);
              handleUpdateFinish(result);
              compiler.writeResourcesToDisk();
            },
            this.options,
            { clear: true }
          );
        }
      } catch (error) {
        this._logger.error(error);
      }
    };

    // 需要watch的文件
    const watchedFiles = [
      ...compiler.resolvedModulePaths(this._root),
      ...compiler.resolvedWatchPaths()
    ].filter(
      (file) =>
        !file.startsWith(this.options.root) &&
        !file.includes('node_modules/') &&
        existsSync(file)
    );

    const files = [this.options.root, ...watchedFiles];
    this._watcher = createWatcher(this.options, files);

    this._watcher.on('change', (path) => {
      if (this._close) return;
      handlePathChange(path);
    });

    // 定义hmr更新完成后的回调，作用是处理模块更新完成后的结果，并将新的模块路径添加到监视器中。
    const handleUpdateFinish = (updateResult: JsUpdateResult) => {
      const added = [
        ...updateResult.added,
        ...updateResult.extraWatchResult.add
      ].map((addedModule) => {
        const resolvedPath = compiler.transformModulePath(
          this._root,
          addedModule
        );
        return resolvedPath;
      });
      const filteredAdded = added.filter(
        (file) => !file.startsWith(this.options.root)
      );

      if (filteredAdded.length > 0) {
        this._watcher.add(filteredAdded);
      }
    };

    if (this.serverOrCompiler instanceof Server) {
      this.serverOrCompiler.hmrEngine?.onUpdateFinish(handleUpdateFinish);
    }
  }

  private getCompilerFromServerOrCompiler(
    serverOrCompiler: Server | Compiler
  ): Compiler {
    return serverOrCompiler instanceof Server
      ? serverOrCompiler.getCompiler()
      : serverOrCompiler;
  }

  close() {
    this._close = false;
    this._watcher = null;
    this.serverOrCompiler = null;
  }
}
```

可以看到这部分代码只是胶水代码，用来实现watcher和server交互的代码，看看watcher核心代码：src/watcher/create-watcher.ts

```ts
// 快速、轻量级的文件系统遍历库，用于查找文件和目录
import glob from 'fast-glob';
// 小型而且高效的跨平台文件监视库
import chokidar, { FSWatcher, WatchOptions } from 'chokidar';

function resolveChokidarOptions(
  config: ResolvedUserConfig,
  insideChokidarOptions: WatchOptions
) {
  const { ignored = [], ...userChokidarOptions } =
    config.server?.hmr?.watchOptions ?? {};
  let cacheDir = path.resolve(config.root, 'node_modules', '.farm', 'cache');

  // 如果配置中指定了持久化缓存，并且提供了cacheDir，那么函数会使用配置中的cacheDir。如果cacheDir不是绝对路径，那么函数会将其解析为相对于项目根目录的绝对路径。
  if (
    typeof config.compilation?.persistentCache === 'object' &&
    config.compilation.persistentCache.cacheDir
  ) {
    cacheDir = config.compilation.persistentCache.cacheDir;

    if (!path.isAbsolute(cacheDir)) {
      cacheDir = path.resolve(config.root, cacheDir);
    }
  }

  const options: WatchOptions = {
    // 需要忽略的部分
    ignored: [
      '**/.git/**',
      '**/node_modules/**',
      '**/test-results/**', // Playwright
      glob.escapePath(cacheDir) + '/**',
      glob.escapePath(
        path.resolve(config.root, config.compilation.output.path)
      ) + '/**',
      ...(Array.isArray(ignored) ? ignored : [ignored])
    ],
    // 这意味着在监视开始时，不会触发任何事件
    ignoreInitial: true,
    // 如果监视的文件或目录没有读取权限，chokidar不会抛出错误
    ignorePermissionErrors: true,
    // 它只有在当前平台不是Linux时才会被设置。这个对象定义了在写入文件完成之前，chokidar需要等待的时间和检查的间隔。
    awaitWriteFinish:
      process.platform === 'linux'
        ? undefined
        : {
            stabilityThreshold: 10,
            pollInterval: 10
          },
    ...userChokidarOptions,
    ...insideChokidarOptions
  };

  return options;
}

// 创建watcher
export function createWatcher(
  config: ResolvedUserConfig,
  files: string[],
  chokidarOptions?: WatchOptions
): FSWatcher {
  const options = resolveChokidarOptions(config, chokidarOptions);

  return chokidar.watch(files, options);
}
```

以上就是core部分的核心代码解析，下一篇继续看rust部分的core和compiler代码。
