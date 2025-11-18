---
title: 用GoFrame把一个前端产物打包进可执行文件
date: 2025-01-13 22:32:55
tags:
- Go
- GoFrame
categories: Go
---

总所周知，一般前后端项目都会使用nginx来部署前端项目，有些小伙伴可能会想到go的打包部署非常方便，那有没有一种可能直接把前端内容也打包进产物里面呢？（类似gitea）

有的兄弟，有的，这么简单的需求，只需要用goframe的cli将前端产物文件转译成类似base64编码的的方式，将文件转成一个go代码，然后通过fs读取即可，话不多说咱们直接开始。

## gf-cli

首先我们会需要用到gf-cli的pack方法将整个前端产物转译，直接去github下载最新的gf-cli，<https://github.com/gogf/gf/releases> ，比如我的是windows系统就是下载gf\_windows\_amd64.exe

下载完直接改名gf.exe然后丢到`C:\Windows\System32`，或者其他在PATH里的目录即可。

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/fdf20946f33649ac848e8bcf1b39127f~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206035&x-orig-sign=FZeBY3JBGj%2FCgcGeY31vEOrjVd8%3D)

在终端输入gf能正常打印说明安装成功。

## 创建项目然后打包

我们可以通过gf的init创建一些标准的后端目录结构，但是我这里因为演示的是只是怎么使用gf打包前端项目，这里我们使用最简单的目录结构，一个main.go和那种，我们直接使用goland来创建一个简单项目：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/c4363a8132684827a48506d8b866712e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206035&x-orig-sign=yhTIWlk9%2B1oJrG9%2B7tysRZoqjMg%3D)

然后我们再找一个前端项目，我这里就选SoybeanAdmin吧，使用我自己的一个脚手架创建项目：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/4b07b16383144141b34b07fafdda7a68~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206035&x-orig-sign=EefU5EgwMbyrr5Q4TO9D8bV%2B0%2F4%3D)

修改一下`.env.prod`加入：

    VITE_BASE_URL=/web

然后build出来之后，将dist里的产物放到我们的go项目，然后使用我们的pack命令来打包一下

```js
gf pack ./web packed/data.go -n=packed
```

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/5373b8543e0d4be598bec1fd70cd57b6~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206035&x-orig-sign=LGNkWjO9NCMgT04UFbIkfQ%2BMTnA%3D)

最后修改一下我们的 `main.go`

```go
package main

import (
    "io/fs"
    "net/http"

    "github.com/gogf/gf/v2/frame/g"
    "github.com/gogf/gf/v2/net/ghttp"
    "github.com/gogf/gf/v2/os/gres"

    _ "awesomeProject1/packed"
)

type GFPackFS struct {
    Fallback string
}

// Open GFPackFS实现FS接口
func (f *GFPackFS) Open(name string) (fs.File, error) {
    file := gres.Get(name)
    // file == nil的逻辑用来模仿nginx的try_files配置，如果没有对应的文件，则返回index.html
    // 如果是访问首页，既/web路径的时候，也同样返回我们index.html
    if file == nil || name == "web" {
       fullback := gres.Get(f.Fallback)
       return fullback, nil
    }
    return file, nil
}

func main() {
    s := g.Server()
    // 创建一个路由组，前缀是/web即我们的前端页面
    s.Group("/web", func(group *ghttp.RouterGroup) {
       group.ALL("/*", ghttp.WrapH(http.FileServer(http.FS(&GFPackFS{"web/index.html"}))))
    })
    s.SetPort(8199)
    s.Run()
}
```

访问一下：<http://localhost:8199/web/>

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/3a5861fb56134cf08d7212d73fda6c7b~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206035&x-orig-sign=bGbc3puy%2BYBTkdtpEooWcVwHLjw%3D)

## 配置下打包参数

众所周知go交叉编译非常方便，而使用gf之后更加方便，只需要在配置文件配置一下目标架构和系统，直接一个build命令即可打包出所有的标架构和系统可执行文件，这里直接创建个配置文件 `config.yaml` ：

```yaml
gfcli:
  build:
    name:     "gf"
    arch:     "amd64"
    system:   "linux,windows"
    path: "./dist/"
```

然后直接一个 `gf build`

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/d382083c95a3459d9382c92c48c60342~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758206035&x-orig-sign=9XBkp9QsreUvB7B1cjmayfL4SEs%3D)

就这么简单，部署当然也就一个可执行文件丢上去就完事了！

当然这样只是为了搞个小程序玩玩，正经部署最好还是用nginx哦
