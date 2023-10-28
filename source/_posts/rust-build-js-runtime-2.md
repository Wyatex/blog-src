---
title: 用 Rust 构建你自己的 JavaScript 运行时实践（2）
date: 2023-09-15 17:57:02
tags:
- rust
- deno
categories: Rust
---

> 上一篇文章：[用 Rust 构建你自己的 JavaScript 运行时实践（1）](https://wyatex.online/Rust/rust-build-js-runtime-1)

上一篇文章写了简单的封装了一个我们自己的JS运行时，这篇文章，我们添加两部分内容，就是简单的文件系统的操作、`setTimeout`。

<!-- more -->

# 开始

## 修改依赖版本
这篇教程的原文使用的`deno_core`版本比较老，实际实践的时候发现js调用rust方法的api有问题，经过Github大佬的指点，这里我们将`deno_core`的版本切换成最新的。

```toml cargo.toml
[package]
name = "runjs"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
deno_core = "0.204.0"
tokio = { version = "1.25.0", features = ["full"] }
```

## 添加文件的读、写、删方法
这里直接上代码：

```rust
use std::rc::Rc;
use deno_core::error::AnyError;
use deno_core::{op};
use deno_core::Extension;

#[op]
async fn op_read_file(path: String) -> Result<String, AnyError> {
    let contents = tokio::fs::read_to_string(path).await?;
    Ok(contents)
}

#[op]
async fn op_write_file(path: String, contents: String) -> Result<(), AnyError> {
    tokio::fs::write(path, contents).await?;
    Ok(())
}

#[op]
fn op_remove_file(path: String) -> Result<(), AnyError> {
    std::fs::remove_file(path)?;
    Ok(())
}

async fn run_js(file_path: &str) -> Result<(), AnyError> {
    let main_module = deno_core::resolve_path(file_path,  &std::env::current_dir().unwrap())?;
    let runjs_extension = Extension::builder("runjs")
        .ops(vec![
            op_read_file::decl(),
            op_write_file::decl(),
            op_remove_file::decl(),
        ])
        .build();
    let mut js_runtime = deno_core::JsRuntime::new(deno_core::RuntimeOptions {
        module_loader: Some(Rc::new(deno_core::FsModuleLoader)),
        extensions: vec![runjs_extension],
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

然后修改我们的example.js

```js example.js
// runtime.js部分代码移动到这里
const { core } = Deno;
const { ops } = core;
function argsToMessage(...args) {
    return args.map((arg) => JSON.stringify(arg)).join(" ");
}
const console = {
    log: (...args) => {
        core.print(`[out]: ${argsToMessage(...args)}\n`, false);
    },
    error: (...args) => {
        core.print(`[err]: ${argsToMessage(...args)}\n`, true);
    },
};

console.log("Hello", "runjs!");
console.error("Boom!");
await ops.op_write_file("./log.txt", 'Hello');
const log = await ops.op_read_file("./log.txt");
console.log(log)
await ops.op_remove_file("./log.txt");
```

deno_core版本更新后，原来的添加`runtime.js`的代码不适合新的api，所以这里暂时先这样写吧，后面找到方法修改再改成启动时注入`runtime.js`

因为最后执行`op_remove_file`将前面写入的文件删除了，所以最后看不到写入文件的结果，可以注释掉remove这一步，看看文件写入的结果。

## setTimeout

main.rs添加这个方法：
```
#[op]
async fn op_set_timeout(delay: u64) -> Result<(), AnyError> {
    tokio::time::sleep(std::time::Duration::from_millis(delay)).await;
    Ok(())
}

// 注册到extension
let runjs_extension = Extension::builder("runjs")
.ops(vec![
    op_read_file::decl(),
    op_write_file::decl(),
    op_remove_file::decl(),
    op_set_timeout::decl(),
])
.build();
```

example.js尝试去调用这个代码：

```js
// 省略前面的代码
globalThis.setTimeout = (callback, delay) => {
    core.opAsync("op_set_timeout", delay).then(callback);
};
setTimeout(() => {
    console.log('setTimeout Hello!')
}, 1000)
```

下一篇文章尝试添加一个ts转译器，使其能直接运行ts代码，然后注入runtime.js并创建一个deno快照。

