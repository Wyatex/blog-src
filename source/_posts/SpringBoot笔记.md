---
title: SpringBoot笔记
date: 2023-05-17 09:35:50
tags:
- SpringBoot
- 学习笔记
categories: 学习笔记
---

记录一下简单使用SpringBoot的一些知识点

<!-- more -->

## 不配置数据启动
如果不配置数据库，启动SpringBoot有可能会报错，需要添加不检查数据库的配置

```java
@SpringBootApplication(exclude={DataSourceAutoConfiguration.class, HibernateJpaAutoConfiguration.class})
public class DemoApplication {
	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
}
```

应该是SpringBoot默认配置就设置了数据库相关的配置，导致启动时检查数据库配置报错无法启动。