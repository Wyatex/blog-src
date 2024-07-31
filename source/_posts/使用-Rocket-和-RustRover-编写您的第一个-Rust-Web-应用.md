---
title: 使用 Rocket 和 RustRover 编写您的第一个 Rust Web 应用
date: 2024-03-23 09:42:53
tags:
- Rust
categories: Rust
---

> 原文来自JetBrains公众号：[使用 Rocket 和 RustRover 编写您的第一个 Rust Web 应用 | 实用教程](https://mp.weixin.qq.com/s/SRWdZpoO9_I8UkJ0tumcyg)

如果您像我一样刚刚开始使用 Rust，您的经验可能部分或绝大部分来自于其他生态系统。面对引起热议的 Rust 新技术堆栈，您也许会感觉无从下手。别担心， 我们特别为您准备了一份教程。**在这篇博文中，我们将使用 Rocket 库构建一个在 Rust 后端上运行的简单 HTML Web 应用程序。**

首先，下载我们专为 Rust 社区设计的最新 IDE [RustRover](https://www.jetbrains.com.cn/rust/)。您也需要[使用 RustRover](https://www.jetbrains.com.cm/help/rust/rust-toolchain.html) 或[社区入门指南](https://www.rust-lang.org/learn/get-started)安装 Rust。

在本教程结尾，我们将得到一个托管静态文件的 Web 应用程序、一个具有多个端点的应用程序、服务器端模板渲染、闪现消息传递和请求/响应流。我们先来看将使用的库，然后再深入研究构建示例应用程序的细节。

<!-- more -->

## **什么是 Rocket？**

[Rocket 是为 Rust 构建的 Web 框架](https://rocket.rs/)，可以让编写快速、类型安全、使用安全的 Web 应用程序更加简单。与许多现代 Web 框架一样，Rocket 通过添加可以通过唯一路径访问的端点表达其应用程序构建理念。Rocket 对路由、数据处理、验证、响应器、Cookie、Web 套接字和数据库访问提供了开箱即用的支持。这一功能齐全的框架建立在类型安全和宏这两个使 Rust 与众不同的组成部分上。

现在，您已经对 Rocket 有了大体的了解，我们可以开始构建应用程序了。

## **新建 Rocket 项目**

启动 RustRover 后，从 **New Project**（新建项目）对话框创建新项目。

项目可以随意命名，在本教程中我将项目称为 `rocketapp`。选择 **Binary (application)**  选项，然后点击 **Create**（创建）按钮。


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c9aeaa8cb544a6494d10a32a2da55d9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=878&s=211196&e=png&b=292929 "RustRover 中显示新的二进制应用程序的 New Project（新建项目）对话框。")

我们来设置项目的依赖项。在 `Cargo.toml` 文件中，添加 `rocket` 和 `rocket_dyn_templates` 依赖项。**添加新的依赖项时，RustRover 还会自动下载并更新 crate，非常好用**。


```toml
[package]  
name = "rocketapp"  
version = "0.1.0"  
edition = "2021"  
  
[dependencies]  
rocket = "0.5.0"  
rocket_dyn_templates = { version = "0.1.0", features = ["handlebars", "tera"] }
```

接下来，在 `main.rs` 文件中粘贴以下代码。在这里，我们将添加一个以 `String` 值响应的新端点。记下 `#[get(“/”)]` 特性，它将新创建的端点的额外元数据告诉 Rust 编译器。在这种情况下，新端点响应 `/` 路径上的用户 HTTP `GET` 请求。


```rust
use rocket::{get, launch, routes};  
  
#[launch]  
fn rocket() -> _ {  
    rocket::build()  
        .mount("/", routes![root])  
}  
  
#[get("/")]  
async fn root() -> String {  
    "Hello, World".to_string()  
}
```

现在，您应当能够使用 **Run Toolbar**（运行工具栏）启动 Web 应用程序的新实例来运行应用程序。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d93bf9e686db43879952241ce7b845fd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=772&s=275625&e=png&b=2a2a2a "在 RustRover 中运行 Rocket 应用程序")

恭喜！您已经成功构建了自己的第一个 Rust 应用程序。接下来，我们修改应用程序，添加静态文件托管、模板渲染，并练习一些响应流。

## **升级 Rocket 应用程序**

第一步，向项目的根添加两个新目录：`templates` 和 `public`。`templates` 目录将保存视图模板，`public` 目录将保存静态工件，例如 CSS、图像或 JavaScript 文件。

我将 [Pico CSS 库](https://picocss.com/)复制到 `css` 文件夹中，得到了一些基本样式，稍后我将在 HTML 模板中使用。


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/95c9005849674036ad29ff49ec98263a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=852&h=798&s=211072&e=png&b=2b2b2b "RustRover 中我的 rocketapp 的文件夹视图")

接下来，更新应用程序，渲染新的 **Handlebars** 模板。使用以下 HTML 将新的 `root.html.hbs` 文件添加到 `templates` 目录。


```html
<html lang="">  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport"  
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">  
    <meta http-equiv="X-UA-Compatible" content="ie=edge">  
    <link href="/public/css/pico.min.css" rel="stylesheet">  
    <title>Hello Rust</title>  
</head>  
<body>  
<main class="container">  
    <h1>{{message}}</h1>  
</main>  
</body>  
</html>
```

您可以安装 [JetBrains Marketplace 中的 Handlebars 插件](https://plugins.jetbrains.com/plugin/6884-handlebars-mustache)，让这个语法更易用。我们需要再次修改 `main.rs` 文件，但这一次，我们将注册模板系统并将静态文件目录映射到路径。


```rust
use rocket::{get, launch, routes};  
use rocket::fs::{FileServer, Options, relative};  
use rocket_dyn_templates::{context, Template};  
  
#[launch]  
fn rocket() -> _ {  
    rocket::build()  
        // 添加模板引擎系统
        .attach(Template::fairing())  
        // 使用硬盘提供内容服务
        .mount("/public", FileServer::new(relative!("/public"), Options::Missing | Options::NormalizeDirs))  
        // 注册路由
        .mount("/", routes![root])  
}  
  
#[get("/")]  
async fn root() -> Template {  
    Template::render("root", context! { message: "Hello, Rust"})  
}
```

进展不错。注意代码中使用的符号，主要是 `#` 和 `!`。这种用法称为[宏](https://doc.rust-lang.org/book/ch19-06-macros.html)，是 Rust 语言的基本组成部分。宏可用于编写声明式代码，同时向 Rust 编译器提示在编译时生成哪些代码以使应用程序正常运行。虽然其他语言可能依赖于运行时发现，但 Rust 可以确定各个部分在编译时如何交互，减少浪费的 CPU 周期和不必要的内存分配。

我们开始处理 HTML 表单中的用户数据。

## **Rocket 中的数据处理**

Rust 的重点是类型和内存安全，因此内存结构当然是语言的核心组成部分。您可以将结构视为内存中数据所在的位置，最好是速度最快的部分。Rocket 让我们使用 `struct` 表示来自 HTML 的表单请求。将以下数据类型添加到 `src` 目录的新 `models.rs` 文件中。


```rust
use rocket::{FromForm};  
  
#[derive(FromForm, Debug)]  
pub struct Person {  
    #[field(validate=len(1..))]  
    pub(crate) first_name: String,  
    #[field(validate=len(1..))]  
    pub(crate) last_name: String,  
}
```

这一小段代码中发生了几件事。

1. 我们将 `field` 宏和 `derive` 实现用于两个不同的特征，`FromForm` 和 `Debug`
2. 关键字 `pub` 表示 `struct` 及其字段可公开访问。
3. 每个字段都对长度使用内置 Rocket 验证器；还提供了更多验证器。

我们更新 `root` 模板处理使用此 `Person` 结构提交表单的情况。


```html
<!doctype html>  
<html lang="en">  
<head>  
    <meta charset="utf-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1">  
    <meta name="color-scheme" content="light dark"/>  
    <link rel="stylesheet" href="/public/css/pico.min.css">  
    <title>Hello world!</title>  
</head>  
<body>  
<main class="container">  
    <h1>Hello Rust!</h1>  
  
    {{#if errors }}  
        <article>  
            <header>🥺Oh No!</header>  
            <p>There are some invalid fields in the form</p>  
            <ul>  
                {{#each errors}}  
                    <li>{{this}}</li>  
                {{/each}}  
            </ul>  
        </article>  
    {{/if}}  
  
    <form method="POST" enctype="multipart/form-data" action="/">  
        <input type="text"  
               name="first_name"  
               placeholder="First Name"  
               aria-label="First Name"  
               value="{{ first_name }}"  
               aria-invalid="{{ first_name_error}}"  
        />  
  
        <input type="text" name="last_name"  
               placeholder="Last Name"  
               aria-label="Last Name"  
               value="{{ last_name }}"  
               aria-invalid="{{ last_name_error}}"  
        />  
  
        <button type="submit">Say Hello</button>  
    </form>  
</main>  
</body>  
</html>
```

您可能已经注意到一些 Handlebars 占位符，我们将在后续端点中使用。

在返回 Rust 之前，为我们的成功页面添加一个模板。我在 `templates` 目录中将其称为 `hello.html.hbs`。


```html
<!doctype html>  
<html lang="en">  
<head>  
    <meta charset="utf-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1">  
    <meta name="color-scheme" content="light dark" />  
    <link rel="stylesheet" href="/public/css/pico.min.css">  
    <title>Hello {{ name }}!</title>  
</head>  
<body>  
<main class="container">  
    <dialog open>  
        <article>  
            <header>  
                <a href="/" aria-label="Close" rel="prev"></a>  
                <p>  
                    <strong>🗓️ {{ message }}!</strong>  
                </p>  
            </header>  
            <p>  
                Hello {{ name }}  
            </p>  
        </article>  
    </dialog>  
</main>  
</body>  
</html>
```

我们现在需要编写两个端点，一个用于处理用户请求，另一个用于在表单有效时重定向。我们从“简单”的成功页面开始，


```rust
#[get("/hi?<name>")]  
async fn hello(name: String, flash: Option<FlashMessage>) -> Template {  
    let message = flash.map_or_else(|| String::default(), |msg| msg.message().to_string());  
    Template::render("hello", context! { name , message })  
}
```

```
这个函数中发生了一些重要的事情。
```

1. 我们正在接收 `FlashMessage`，即前一个端点存储在 Cookie 中的信息。我们很快就会展示如何设置这个值。
2. 我们从查询字符串中提取 `name` 值。

请注意，演示内容是 Rocket 提供的 Web 框架核心功能。您可以自行试验并通过 `FlashMessage` 或查询字符串传递所有值。

接下来，我们将深入研究此示例应用程序中最复杂的部分，即 `POST` 端点。在查看代码之前，我们先讨论一下期望的行为。

-   当响应*有效*时，我们要重定向到路径 `/hi?name=` 并设置 `FlashMessage`。
-   如果响应*无效*，我们希望渲染 `root` 模板并在模板上下文中设置值以向用户显示消息。

我们来查看代码并讨论响应流。


```rust
#[post("/", data = "<form>")]  
async fn create(form: Form<Contextual>) -> Result<Flash, Template> {  
    if let Some(ref person) = form.value {  
        let name = format!("{} {}", person.first_name, person.last_name);  
        let message = Flash::success(Redirect::to(uri!(hello(name))), "It Worked");  
        return Ok(message);  
    }  
  
    let error_messages: Vec = form.context.errors().map(|error| {  
        let name = error.name.as_ref().unwrap().to_string();  
        let description = error.to_string();  
        format!("'{}' {}", name, description)  
    }).collect();  
  
    Err(Template::render("root", context! {  
        first_name : form.context.field_value("first_name"),  
        last_name : form.context.field_value("last_name"),  
        first_name_error : form.context.field_errors("first_name").count() > 0,  
        last_name_error : form.context.field_errors("last_name").count() > 0,  
        errors: error_messages  
    }))  
}
```

Rocket 可以识别 Rust 的 `Result` 类型。`Result` 类型使我们能够生成一个元组，这是一种包含多个选项的结构。在示例中，我们有一个成功和失败的状态。在这里的分支逻辑中，我们处理 Rocket 的 `Form<Contextual>` 类型的状态，它为我们提供了用户表单提交的状态。在这里，我们可以使用 Rust 的模式匹配处理 `Some` 和 `Err` 这两个最重要的状态。响应流对于构建 Web 应用程序至关重要，因为您可能需要根据用户输入重定向或渲染元素，而使用 Rust 将让一切更加简单。

我们最后一次更新 `main.rs` 以连接新端点并从 `model.rs` 模块导入 `Person` 结构。

**另外，RustRover 非常擅长查找模块中的类型和更新 `use` 语句。** RustRover 功能使您可以专注于编写代码而不是寻找模块。


```rust
mod models;

use crate::models::Person;
use rocket::form::{Contextual, Form};
use rocket::fs::{relative, FileServer, Options};
use rocket::request::FlashMessage;
use rocket::response::{Flash, Redirect};
use rocket::{get, launch, post, routes, uri};
use rocket_dyn_templates::{context, Template};

#[launch]
fn rocket() -> _ {
    rocket::build()
        // add templating system
        .attach(Template::fairing())
        // serve content from disk
        .mount(
            "/public",
            FileServer::new(
                relative!("/public"),
                Options::Missing | Options::NormalizeDirs,
            ),
        )
        // register routes
        .mount("/", routes![root, create, hello])
}

#[get("/")]
async fn root() -> Template {
    Template::render("root", context! { message: "Hello, Rust"})
}

#[post("/", data = "<form>")]
async fn create(form: Form<Contextual<'_, Person>>) -> Result<Flash<Redirect>, Template> {
    if let Some(ref person) = form.value {
        let name = format!("{} {}", person.first_name, person.last_name);
        let message = Flash::success(Redirect::to(uri!(hello(name))), "It Worked");
        return Ok(message);
    }

    let error_messages: Vec<String> = form
        .context
        .errors()
        .map(|error| {
            let name = error.name.as_ref().unwrap().to_string();
            let description = error.to_string();
            format!("'{}' {}", name, description)
        })
        .collect();

    Err(Template::render(
        "root",
        context! {
            first_name : form.context.field_value("first_name"),
            last_name : form.context.field_value("last_name"),
            first_name_error : form.context.field_errors("first_name").count() > 0,
            last_name_error : form.context.field_errors("last_name").count() > 0,
            errors: error_messages
        },
    ))
}

#[get("/hi?<name>")]
async fn hello(name: String, flash: Option<FlashMessage<'_>>) -> Template {
    let message = flash.map_or_else(|| String::default(), |msg| msg.message().to_string());
    Template::render("hello", context! { name , message })
}
```

运行应用程序，我们可以看到表单并且验证有效。


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5bfe1d9f7d1c4ed784834e6237289b86~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=970&s=160078&e=png&b=1b1d27 "在浏览器中运行的显示包含验证错误的名字和姓氏表单的 Rocket 应用程序。")

我们还可以提交名字和姓氏，让应用将我们重定向到成功页面。


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ccdfe136dfa4113a3c0e0c6b6bd0203~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=575&s=48344&e=png&b=121419)

## **结论**

本教程的诞生是因为我很好奇像 Rust 这样的类型安全语言能为对 Web 开发感兴趣的人提供什么，让我惊讶的是，答案是很多。

掌握语言的一些基础知识后，Rust 开发体验会变得快速而直观。语法一开始可能看起来很难，但 [RustRover](https://www.jetbrains.com/rust/) 在呈现 Rocket 文档方面做得很好，同时，借助 [JetBrains AI Assistant](https://www.jetbrains.com/ai/)，我找到了制作这个演示所需的提示。我还要感谢 Mastodon 上 Rust 社区的帮助。

[如果您想尝试这个示例，我已经将它发布为 GitHub 仓库](https://github.com/khalidabuhakmeh/rocketapp)。我也很想听听您在生态系统中使用 Rust、Rocket、RustRover 和其他基于 Rust 的 Web 框架的经验。

**本博文英文原作者：Khalid Abuhakmeh**