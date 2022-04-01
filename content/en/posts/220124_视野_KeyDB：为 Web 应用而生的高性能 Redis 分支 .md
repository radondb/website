---
title: "视野 | KeyDB：为 Web 应用而生的高性能 Redis 分支"
date: 2022-01-24T15:39:00+08:00
author: "王奇"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - Redis
  - KeyDB
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/220124_%E8%A7%86%E9%87%8E%20%7C%20KeyDB%EF%BC%9A%E4%B8%BA%20Web%20%E5%BA%94%E7%94%A8%E8%80%8C%E7%94%9F%E7%9A%84%E9%AB%98%E6%80%A7%E8%83%BD%20Redis%20%E5%88%86%E6%94%AF/0.png
---
随着 Web 2.0 的不断发展，业务需求也不断变化。Redis 是一款诞生于 2009 年的高性能内存键值数据库，在近十年的互联网架构中承担了不可替代的作用，实现了很多复杂的业务需求，深受技术爱好者的喜爱。近些年 Web 3.0 概念的提出也为 Redis 提出了更高的挑战。
<!--more-->

# 背景

最近客户提出一个问题：

**Redis 能否在不增加资源的场景下明显提高QPS？**

这是个看似不合理的问题，用户的需求是 QPS 提高，但不增加资源投入。一般提高 QPS 的思路大多是横向扩展，集群节点数越多 QPS 就越高，但成本也就越高。如果想要达成这个诉求，那 KeyDB[1] 也许是一个不错的选择。

# KeyDB 简介

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220124_%E8%A7%86%E9%87%8E%20%7C%20KeyDB%EF%BC%9A%E4%B8%BA%20Web%20%E5%BA%94%E7%94%A8%E8%80%8C%E7%94%9F%E7%9A%84%E9%AB%98%E6%80%A7%E8%83%BD%20Redis%20%E5%88%86%E6%94%AF/1.jpg)

>图片来源：[https://keydb.dev/](https://keydb.dev/) 

KeyDB 是 Redis 的分支，专注于多线程、内存效率和高吞吐量。除了多线程之外，KeyDB 还具有仅在 Redis Enterprise 中才能使用的功能，例如：Active Replication、FLASH 存储，直接备份到 S3，且对 Redis 完全兼容。

仓库地址：[https://github.com/EQ-Alpha/KeyDB](https://github.com/EQ-Alpha/KeyDB)

# 设计差异

Redis 是采用单线程设计的典范，在效率和性能之间有独特的设计逻辑。

**KeyDB 将 Redis 主线程拆分为主线程和 Worker 线程**。其中，每个 Worker 线程都是一条 I/O 线程，负责监听端口和 Accept 请求，优化读取数据和解析协议，可大幅度提升 I/O 性能。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220124_%E8%A7%86%E9%87%8E%20%7C%20KeyDB%EF%BC%9A%E4%B8%BA%20Web%20%E5%BA%94%E7%94%A8%E8%80%8C%E7%94%9F%E7%9A%84%E9%AB%98%E6%80%A7%E8%83%BD%20Redis%20%E5%88%86%E6%94%AF/2.jpg)

# 功能优势

### 1、跨域多主

KeyDB 支持多个异步复制架构的主节点彼此同步。支持复制架构中所有节点都是主节点，不需要哨兵监控节点。在 Redis 原有的高可用架构之外，又增加了新的架构思路。

### 2、垂直和水平缩放

KeyDB 是多线程设计，可以支持垂直/水平扩展，最大化资源利用率。对于那些 Redis 实例达到设备上线的情况，这是一个很好的替代选择。使用标准 KeyDB 节点最多可有效使用 10 个内核，启用 TLS 时可有效使用 16 个内核！

### 3、更方便的生存时间设置

KeyDB 提供了 Subkey EXPIRE，可以精确设置集合中成员的过期时间。EXPIREs 现在还具有近乎实时的主动删除功能。

### 4、TLS 加密

KeyDB 提供 TLS 支持，其吞吐量是 Redis + TLS 的 7 倍！

虽然 TLS 加密增加了额外的 CPU 开销，但 KeyDB 的多线程架构支持更多的工作线程来防止性能下降。

### 5、ModJS

可以使用 KeyDB 开源的 Javascript 模块创建自定义命令。建立在强大的 V8 JIT 引擎之上，ModJS 比 LUA 更快，并支持许多 node.js 模块，为常见任务提供广泛的库支持。

### 6、ARM 支持

KeyDB 支持 ARM。

# 性能优势

 ![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220124_%E8%A7%86%E9%87%8E%20%7C%20KeyDB%EF%BC%9A%E4%B8%BA%20Web%20%E5%BA%94%E7%94%A8%E8%80%8C%E7%94%9F%E7%9A%84%E9%AB%98%E6%80%A7%E8%83%BD%20Redis%20%E5%88%86%E6%94%AF/3.jpg)

>图片来源：KeyDB 官网 
# 总结

也许您对官方的性能数据存疑，下一期我们将对 KeyDB 和 Redis 进行更全面的性能测试，希望给客户的提问一个更全面的回答，敬请期待。

### 参考引用

[1]：KeyDB：[https://keydb.dev/](https://keydb.dev/)

