---
title: 使用docker部署mysql
date: 2020-05-06 22:58:15
tags: 
- mysql
- 笔记
- docker
categories: 笔记
---

总是会忘docker部署mysql的方法，所以拿小本本记下来。

<!-- more -->

# 拉镜像
`docker pull mysql:8.0.20`

Other tags: `latest`,`5.7.30`,`5.6.48`

查看镜像：`docker images | grep mysql`

# 启动容器

```
docker run -p 3306:3306 --name mysql8 -e MYSQL_ROOT_PASSWORD=123456 -v /root/mysql/data:/var/lib/mysql -d mysql:8.0.20
```

查看容器：`docker ps`

# 设置可以远程登录
从上面得到容器id，然后进入容器：`docker exec -it 容器id bash`

登录mysql：`mysql -u root -p`，然后输入密码

进入MySQL表：`use mysql;`

授权root用户：`GRANT ALL ON *.* TO 'root'@'%;'`

可以修改密码：`ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '新的密码';`

刷新权限：`flush privileges;`

> 经过测试，MySQL5.7.30并不需要设置远程登录权限，可以直接使用。