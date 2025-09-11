---
title: milvus部署踩坑笔记
date: 2025-04-07 22:39:12
tags:
- milvus
categories: 笔记
---

## 前言

最近在学RAG，学到Embedding部分，想搭建一个向量库去存数据，看了一圈网上以及问大佬，基本都是推荐milvus这个数据库，所以就开始想搭建一下玩玩。

## 部署milvus

看官方的部署文档有三种部署方式，轻量、单机、集群，其中轻量的限制linux和mac，我电脑是windows，只有虚拟机linux，而且集群的话又挺麻烦的，就选了单机版。单机版又分了单镜像和compose，单镜像还得用一个脚本来启动，我个人不怎么喜欢脚本（可能是因为不会吧），就选了compose了。

```plaintext
# Download the configuration file 
$ wget https://github.com/milvus-io/milvus/releases/download/v2.5.6/milvus-standalone-docker-compose.yml -O docker-compose.yml 

# Start Milvus 
$ sudo docker compose up -d
```

非常熟悉的docker compose，不过我启动完成后在docker desktop一看竟然没发现刚刚启动的容器，想了一下估计是因为我用sudo启动的，而docker desktop是非root启动，然后他们就被隔离开了导致看不到。

那之后删掉之前的容器，重新在当前用户启动

```
sudo docker compose down -v

docker compose up -d
```

然后发现怎么还得重新下镜像，原来不同用户连镜像都隔离开了，那好吧，我知道docker有个导出镜像的功能，就将那这几个镜像导出然后再在非root用户下导入（不知道还有没有更方便的办法，有懂的docker的大佬可以评论区告诉我拜托了）。

## 使用milvus

前面说到我是为了学ai才选了这个数据库，那么部署完成之后我就开始使用，我跑的是Langchain.js的一个demo代码：

```js
import { Milvus } from "@langchain/community/vectorstores/milvus";
import { OllamaEmbeddings } from "@langchain/ollama";
import "dotenv/config";

const vectorStore = await Milvus.fromTexts(
  [
    "Tortoise: Labyrinth? Labyrinth? Could it Are we in the notorious Little\
              Harmonic Labyrinth of the dreaded Majotaur?",
    "Achilles: Yiikes! What is that?",
    "Tortoise: They say-although I person never believed it myself-that an I\
              Majotaur has created a tiny labyrinth sits in a pit in the middle of\
              it, waiting innocent victims to get lost in its fears complexity.\
              Then, when they wander and dazed into the center, he laughs and\
              laughs at them-so hard, that he laughs them to death!",
    "Achilles: Oh, no!",
    "Tortoise: But it's only a myth. Courage, Achilles.",
  ],
  [{ id: 2 }, { id: 1 }, { id: 3 }, { id: 4 }, { id: 5 }],
  new OllamaEmbeddings({
    model: "bge-m3:latest",
  }),
  {
    collectionName: "goldel_escher_bach",
  }
);

const response = await vectorStore.similaritySearch("scared", 2);
console.log(response);
```

简单说一下这段代码，就是通过Embedding模型将文本转成向量存到milvus数据库，

但是还没跑完发现代码报错了：`Error: 14 UNAVAILABLE: No connection established. Last error: Failed to connect (2025-04-07T02:15:51.637Z)`

怎么突然就连不上了，然后去docker desktop看了一下发现容器停掉了，点进去一看全是go的panic报错，看了一下panic前面的日志，提到：`Resource requested is unreadable, please reduce your request rate`

想了一会之后我记得milvus使用minio作为存储，然后去看了一下minio的日志，发现了确实是minio报错了：

```
2025-04-03 15:39:46 API: SYSTEM()
2025-04-03 15:39:46 Time: 07:39:46 UTC 04/03/2025
2025-04-03 15:39:46 DeploymentID: 755ca3ec-ee78-4b0d-b5bd-4796144ff205
2025-04-03 15:39:46 Error: write /minio_data/.minio.sys/tmp/d5510ac8-cbca-48af-9e21-98bd3dea7b66/xl.meta: invalid argument (*fs.PathError)
2025-04-03 15:39:46        6: internal/logger/logger.go:258:logger.LogIf()
2025-04-03 15:39:46        5: cmd/storage-errors.go:165:cmd.osErrToFileErr()
2025-04-03 15:39:46        4: cmd/xl-storage.go:2402:cmd.(*xlStorage).RenameData()
2025-04-03 15:39:46        3: cmd/xl-storage-disk-id-check.go:378:cmd.(*xlStorageDiskIDCheck).RenameData()
2025-04-03 15:39:46        2: cmd/erasure-object.go:774:cmd.renameData.func1()
2025-04-03 15:39:46        1: internal/sync/errgroup/errgroup.go:123:errgroup.(*Group).Go.func1()
2025-04-03 15:39:46 Waiting for all MinIO sub-systems to be initialized.. possible cause (Unable to initialize config system: migrateConfigToMinioSys: Storage resources are insufficient for the write operation .minio.sys/config/config.json)
```

然后去minio的github搜了一遍也没找到什么解决方法。我突然想到milvus的教程里面是用root用户启动的，我就想了一下用root试了一下。最后发现root启动是没有问题，上面代码也能跑通。那应该可能是权限之类的问题了。

## 解决问题

说起来我的docker使用经验也不多，我就去问了一些大佬，大佬看了一下docker-compose.yml之后给了两个方法，一个是特权模式，另一个是将volume的绑定目录改成命名卷。特权模式我试了一下没用，改成命名卷的方式通过问ai，完成修改：

```yaml
version: '3.5'

services:
  etcd:
    container_name: milvus-etcd
    image: quay.io/coreos/etcd:v3.5.18
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
      - ETCD_SNAPSHOT_COUNT=50000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd
    command: etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 30s
      timeout: 20s
      retries: 3

  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2023-03-20T20-16-18Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    ports:
      - "9001:9001"
      - "9000:9000"
    volumes:
      - milvus-minio:/minio_data
    command: minio server /minio_data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  standalone:
    container_name: milvus-standalone
    image: milvusdb/milvus:v2.5.6
    command: ["milvus", "run", "standalone"]
    security_opt:
    - seccomp:unconfined
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 30s
      start_period: 90s
      timeout: 20s
      retries: 3
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      - "etcd"
      - "minio"

networks:
  default:
    name: milvus
    
# 定义命名卷
volumes:
  milvus-minio:
```

然后测了一下上面的代码，也能正常跑通了，minio和milvus也没有报错了。

这个问题根据github的issue所提，应该是只有在linux6.0之后的版本才会出现。
