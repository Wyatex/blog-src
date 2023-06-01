---
title: 如何用Rust和Napi-rs在NodeJS中处理CSV文件快五倍
date: 2023-04-30 19:46:36
tags:
- node
- rust
- napi-rs
categories: 翻译
---

原文：[How to process a CSV file five times faster in NodeJs with Rust and Napi rs](https://www.alxolr.com/articles/how-to-process-a-csv-file-five-times-faster-in-node-js-with-rust-and-napi-rs)

因为原文的文件目录和文件名比较随便，所以这里会修改一下。而且修改成适合win系统环境的代码，在ubuntu下也试过没任何问题。

<!-- more -->

## Intro

本教程将教我们如何使用Rust和Napi rs在NodeJS中处理CSV文件。我们将使用Rust编程语言来加速CSV文件的处理，并使用Napi rs库创建本地nodejs扩展。

## CSV file

在本教程中，我使用了以下[CSV文件](https://www3.stats.govt.nz/2018census/Age-sex-by-ethnic-group-grouped-total-responses-census-usually-resident-population-counts-2006-2013-2018-Censuses-RC-TA-SA2-DHB.zip)。

2006年、2013年和2018年人口普查(RC、TA、SA2、DHB)，按种族划分的年龄和性别(分组总答复)，通常是常住人口统计，CSV压缩文件，103mb)

解压缩后，您将得到几个文件，最大的一个约为900Mb

## Nodejs processing

我没有使用特殊的库来处理文件，以避免将性能问题归咎于库。

所以对于nodejs，我使用了readline模块，这是nodejs核心的一部分。

> 这里先把data.csv复制到js文件同一个目录下，或者下面的路径改成解压出来的文件的目录也行

```js
const readline = require("node:readline")
const fs = require('node:fs')
// we will sum the last column of the CSV file
let sum = 0
let isHeader = true
const start = Date.now()
const file = fs.createReadStream('./data.csv') // 把压缩包解压出来最大的文件改名成data.csv，方便代码编写
const lineReader = readline.createInterface({
    input: file,
})
lineReader
    .on("line", (line) => {
        // we need to skip the first line which is the header
        if (isHeader) {
            isHeader = false
            return
        }

        // ource csv has a comma as delimiter
        const fields = line.trimEnd().split(",")
        // we get the last column and parse the value to integer
        const last = parseInt(fields[fields.length - 1])

        // there are acouple of lines with broken values we should ignore those
        if (!isNaN(last)) {
            sum += last
        }
    })
    .on("close", () => {
        console.log(`总共${sum}sum`)
        console.log(`用时${(Date.now() - start) / 1000}s`,)
    })
```

运行一下看看时间:

```sh
> node test1.js
用时 11.334s
```

脚本在10秒内处理了文件。平均吞吐量是75MiB/s左右。

## Rust processing

我使用以下代码进行Rust处理，它具有与Nodejs版本相同的逻辑。

```rust
use std::io::{BufRead, BufReader};
use std::fs::File;
use std::time::{SystemTime};
fn main() {
    let start = SystemTime::now();
    let mut sum = 0;
    let file = File::open("./data.csv").expect("Unable to open file");
    let reader = BufReader::new(file);
    let mut is_header = true;
    for line in reader.lines() {
        let line = line.expect("Unable to read line");
        if is_header {
            is_header = false;
            continue;
        }
        // we get the last column and parse the value to integer
        let res = line
            .trim_end()
            .split(",")
            .last()
            .unwrap()
            .parse::<f32>() // some values are as floats but we still parse everything to int
            .unwrap_or(0.0) as i64;

        sum += res;
    }
    println!("总共{}行", sum);
    println!("用时{}s", start.elapsed().unwrap().as_millis() as f64 / 1000.0)
}
```

运行如下命令后:

```
cargo run --release
```

> 关键点是用 `--release` 标志运行；否则，性能会差很多。

```
 Compiling nodejs_vs_rust_stream v0.1.0 (/home/alxolr/Work/rust_land/nodejs_vs_rust_stream)
    Finished release [optimized] target(s) in 0.17s
     Running `target/release/nodejs_vs_rust_stream`

总共3345553228行
用时2.542s
```

我们可以注意到Rust版本的速度比Nodejs版本快五倍。吞吐量为326MiB/s。

现在一个合乎逻辑的问题出现了:**如果我们已经有了一个巨大的Nodejs代码库，该怎么办?我们不能就这么搬去Rust**

> 有一种方法可以在Nodejs中使用Rust，那就是使用Napi rs。

## Napi rs

Napi-rs是一个允许你在Rust中创建Nodejs模块的库。它是Napi C库的包装器。

NAPI代码被编译到Nodejs可以加载的动态库中。因此，您可以使用NAPI在C/C++或Rust中创建NodeJS模块。

为了生成新的Napi模块，您需要安装Napi rs cli工具:

```
npm i -g @napi-rs/cli
```

> @napi-rs/cli用的是yarn，如果没装yarn记得把yarn也安装一下

然后，您可以使用以下命令创建一个新模块：

```
napi new async_csv_reader
```

然后提供的选项全部选默认即可

生成项目Rust代码后，将下面代码写在src/lib.rs文件中。

```rust
#![deny(clippy::all)]

use std::{
  fs::File,
  io::{self, BufRead},
  path::Path,
};

use napi::{bindgen_prelude::AsyncTask, JsNumber, Task};

#[macro_use]
extern crate napi_derive;


// we want our function to be a promise to be executed asynchronously to not block the event loop in nodejs
// and for that we need to create this weird structs AsyncReadCsv and impl the Task trait for it.

#[napi]
pub fn read_csv_async(path: String) -> AsyncTask<AsyncReadCsv> {
  AsyncTask::new(AsyncReadCsv { path })
}

pub struct AsyncReadCsv {
  path: String,
}

impl Task for AsyncReadCsv {
  type Output = i64;

  type JsValue = JsNumber;

  fn compute(&mut self) -> napi::Result<Self::Output> {
    Ok(read_csv(self.path.clone()))
  }

  fn resolve(&mut self, env: napi::Env, output: Self::Output) -> napi::Result<Self::JsValue> {
    env.create_int64(output)
  }
}


// this is the main function that receive the path to the csv file 
// and start processing the data line by line
fn read_csv(path: String) -> i64 {
  let lines = read_lines(Path::new(&path)).unwrap();

  let mut sum = 0;

  for line in lines {
    if let Ok(ip) = line {
      let res = ip
        .trim_end()
        .split(",")
        .last()
        .unwrap()
        .parse::<f32>()
        .unwrap_or(0.0) as i64;

      sum += res;
    }
  }

  sum
}

// useful function to read the lines from a file
fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
  P: AsRef<Path>,
{
  let file = File::open(filename)?;
  Ok(io::BufReader::new(file).lines())
}
```

在你的项目中运行npm run build后，你会得到一个index.js、index.d.ts和async_csv_reader.win32-x64-msvc.node文件，你可以从nodejs中调用它们。

> 我这里使用的是rust-gnu工具链进行编译，所以得到的node文件是win32-x64-gnu.node，需要去到index.js将里面的win32-x64-msvc全部改成win32-x64-gnu

在根目录新建个test.js，并且把csv文件复制过来（不复制，直接改下面路径也行）：

```js
const { readCsvAsync } = require('./index')
async function test() {
    const start = Date.now()
    const sum = await readCsvAsync('./data.csv')
    console.log("总共", sum)
    console.log("用时", (Date.now() - start) / 1000 + 's')
}
test()
```

然后运行：

```
 node test
总共 3345553228
用时 2.32s
```

## 总结

对于你的nodejs代码的CPU密集部分，你需要处理大量的数据，最好使用Rust，你可以创建一个本地扩展，并从nodejs调用它。

这种Rust和nodejs的结合非常引人注目，并且充分利用了两者的优点。

我希望这篇文章对你有所帮助。如果你喜欢它，请与你的朋友分享并留下评论;我很乐意回答所有的问题。