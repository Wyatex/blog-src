---
title: 用 Rust 构建你自己的 JavaScript 运行时实践（1）
date: 2023-09-15 17:54:59
tags:
- rust
- deno
categories: Rust
---

> 文章来源：
> 
> [用 Rust 构建你自己的 JavaScript 运行时(中文)](https://juejin.cn/post/7262693723493662777)
> 
> [用 Rust 构建你自己的 JavaScript 运行时(原文)](https://deno.com/blog/roll-your-own-javascript-runtime)
> 
> 下面是笔者在自己机器上实践的过程，讲解一些原文中没提到的坑，建议先过一遍上面提到的文章再跟着这个实践。

<!-- more -->

# 起步

## 准备环境
原文不清楚是使用什么环境，笔者使用的是Windows11系统，整体实践下来会有点出入。我的rustup和rustc版本：
```
$ rustup -V
rustup 1.26.0 (5af9b9484 2023-04-05)
info: This is the version for the rustup toolchain manager, not the rustc compiler.
info: The currently active `rustc` version is `rustc 1.71.1 (eb26296b5 2023-08-03)`
```

如果没安装rustup的话可以按照rustup官方文档安装即可，笔者使用了winget进行安装。

编译器后端需要选择msvc，所以toolchain要选择msvc，不能选择gnu，后面介绍为什么只能选msvc
```
$ rustup toolchain list
stable-x86_64-pc-windows-gnu
stable-x86_64-pc-windows-msvc (default)
1.60.0-x86_64-pc-windows-msvc

# 如果你当前是gnu的toolchain，可以这样设置成msvc是默认toolchain
$ rustup default stable-x86_64-pc-windows-msvc
```

既然用到msvc作为编译器后端，那么肯定要装msvc了，笔者使用的是vscode2022，这是我安装的c/c++编译组件


![微信截图_20230808171315.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4ae9903e39aa47b5bb5a8c9c599bc8c1~tplv-k3u1fbpfcp-watermark.image?)

其中必须的组件是：C++的桌面开发中的MSVC v143... 、Windows 11 SDK...

如果是旧版本或者新版本的vs可能会显示不一样的版本号，但是应该都是差不多的而且能跑的（有用vs进行windows桌面开发的大佬可以解答一下）。

除此之外，建议配置一下cargo镜像源，请看：[rsproxy](https://rsproxy.cn)，当然也可以选择ustc的镜像。

而且，建议准备一个加速器，下面的实践过程需要访问github下载v8，最好准备一个，以防万一。

## 创建项目

找个你喜欢的目录，新建个项目：
```
$ cargo init --bin runjs
     Created binary (application) package
     
# 添加deno和tokio依赖，建议使用@指定版本，不然最新的版本可能api不一样，用下面的代码会因为参数不一致无法通过编译
$ cd runjs

$ cargo add deno_core@0.174.0
    Updating `ustc` index
      Adding deno_core v0.174.0 to dependencies.
             Features:
             + v8_use_custom_libcxx
             - include_js_files_for_snapshotting
    Updating `ustc` index
$ cargo add tokio@1.25.0 --features=full
.......
```

## Hello, runjs!
修改main.rs

```rust main.rs
// main.rs
use std::rc::Rc;
use deno_core::error::AnyError;

async fn run_js(file_path: &str) -> Result<(), AnyError> {
  let main_module = deno_core::resolve_path(file_path)?;
  let mut js_runtime = deno_core::JsRuntime::new(deno_core::RuntimeOptions {
      module_loader: Some(Rc::new(deno_core::FsModuleLoader)),
      ..Default::default()
  });

  let mod_id = js_runtime.load_main_module(&main_module, None).await?;
  let result = js_runtime.mod_evaluate(mod_id);
  js_runtime.run_event_loop(false).await?;
  result.await?
}

fn main() {
  let runtime = tokio::runtime::Builder::new_current_thread()
    .enable_all()
    .build()
    .unwrap();
  if let Err(error) = runtime.block_on(run_js("./example.js")) {
    eprintln!("error: {}", error);
  }
}
```

在项目根目录添加example.js，注意不是src下是项目根目录：

```js example.js
// example.js
Deno.core.print("Hello runjs!");
```

然后运行一下，如果是正常的话会成功打印：

```
$ cargo run
.....
Hello runjs!
```

## 手动下载v8依赖
但是我相信很多在大陆的小伙伴都不会一步成功，当然如果是成功打印Hello runjs，可以跳过下面这步。
这时候控制台会提示下载`rusty_v8_release_x86_64-pc-windows-msvc.lib`失败，这是一个github的资源，这时候就需要用到你的魔法了，复制链接到浏览器进行下载，或者去github找到对应版本的v8，进行下载。


![微信截图_20230809162743.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27e97e34d71a4946a31aa88b28997e0c~tplv-k3u1fbpfcp-watermark.image?)

可以看到windows系统下只有msvc的包，前面如果你使用gnu-toolchain和mingw进行编译则会报错。

找一个地方存放这个lib文件，比如笔者打算放到：`D:\rusty_v8`，那么在这个文件夹下创建一个目录：`v0.XX.X`，比如如果你上面是按照我的命令来的话，应该是`v0.64.0`版本，然后把lib文件丢进去，
这时候的文件路径就是：`D:\rusty_v8\v0.64.0\rusty_v8_release_x86_64-pc-windows-msvc.lib`。

然后前往系统环境变量设置界面，设置环境变量：`RUSTY_V8_MIRROR`，值是：`D:\rusty_v8`

这样再执行一次 `cargo run` 应该就能看到正常打印了。

## 添加一些Api
在src目录下创建`runtime.js`：

```js src/runtime.js
// runtime.js
((globalThis) => {
    const core = Deno.core;

    function argsToMessage(...args) {
        return args.map((arg) => JSON.stringify(arg)).join(" ");
    }

    globalThis.console = {
        log: (...args) => {
            core.print(`[out]: ${argsToMessage(...args)}\n`, false);
        },
        error: (...args) => {
            core.print(`[err]: ${argsToMessage(...args)}\n`, true);
        },
    };
})(globalThis);
```

现在只是简单的封装了一下print，下一章实践实现文件系统的读写和删除文件、fetch，第三章实践添加ts转移模块，实现ts直接转js运行（如果内容不多可能合在一起写）。

