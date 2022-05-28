---
title: 部署docker镜像服务器
date: 2020-05-08 20:47:55
tags: 
- registery
- 笔记
- docker
categories: 笔记
---

这里基于Registry搭建私有仓库，需要准备两台服务器。

<!-- more -->

# 搭建仓库

1. 下载registry镜像并启动：`docker pull registry`,最新tag：2.7.1

2. 启动一个容器实例：`docker run -d -p 5000:5000 --restart always --name registry registry:latest`

p.s. 如果使用-v会导致重启而且重启失败，所有建议不要使用，不知道因为什么问题

3. 可以在另一台服务器上使用`curl http://your-server-ip:5000/v2/_catalog`拿到json数据，或者浏览器直接访问这个地址，这时候一般显示：`{"repositories":[]}`

# 上传镜像
1. 为了能快速访问搭建的镜像仓库，需要修改/etc/docker/daemon.json，改为：
```json
{
    "insecure-registries" : ["your-server-ip:5000"]
}
```
记得改成你的服务器ip或者域名

> PS：如果不设置可信任源，又没有配置HTTPS证书，那么会遇到这个错误：`error: Get https://ip:port/v1/_ping: http: server gave HTTP response to HTTPS client.`

2. 为了使得配置生效，重新启动docker服务：`systemctl restart docker`

3. 为需要上传的镜像打上tag:`docker tag your-image-name:tagname your-server-ip:5000/your-image-name:tagname`

4. 正式上传镜像：`docker push your-registry-server-ip:5000/your-image-name:tagname`

5. 再次访问一下/v2/_catalog这个API拿到仓库内容列表，或者通过/v2/your-image/tags/list，查看镜像都有哪些tag

# 下载镜像
下载直接使用pull即可：`docker pull your-server-ip:5000/your-image-name:tagname`

