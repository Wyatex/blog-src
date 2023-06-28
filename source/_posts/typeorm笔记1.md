---
title: typeorm笔记1
date: 2023-06-20 16:26:09
tags:
  - TypeORM
categories: TypeORM
---

来自神光的[《Nest 通关秘籍》](https://juejin.cn/book/7226988578700525605)

<!-- more -->

## 创建项目

```
npx typeorm@latest init --name typeorm-all-feature --database mysql
cd typeorm-all-feature
npm install --save mysql2
```

然后改下用户名密码数据库，把连接 msyql 的驱动包改为 mysql2，并修改加密密码的方式:

```
import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "guang",
    database: "practice",
    synchronize: true,
    logging: true,
    entities: [User],
    migrations: [],
    subscribers: [],
    poolSize: 10,
    connectorPackage: 'mysql2',
    extra: {
        authPlugin: 'sha256_password',
    }
})
```

connectorPackage要修改成mysql2

