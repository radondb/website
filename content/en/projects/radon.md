---
title: "Radon"
date: 2021-09-11T16:52:11+08:00
# 相关文章，通过keywords匹配
keywords:
  - radon
# 排序，从小到大
weight: 2
short: Radon
subtitle: New generation MySQL distributed database components
description: It supports unlimited horizontal expansion and distributed transactions, has strong consistency of financial level data, and meets the extreme requirements of enterprise level core database for large capacity, high concurrency, high reliability and high availability.
logo: /images/projects/radon.svg
# 立即开始
start_url: https://github.com/radondb/radon/blob/master/docs/how_to_build_and_run_radon.md
github_url: https://github.com/radondb/radon/
# 特性
features:
  - picture: /images/projects/mysql/resilience.svg
    title: 弹性伸缩
    description: 快速实现节点的伸缩部署。
  - picture: /images/projects/mysql/consistency.svg
    title: 数据强一致
    description: 增强半同步 Semi-Sync 实现数据一致性。
  - picture: /images/projects/mysql/distributed-storage.svg
    title: 分布式存储
    description: 存储节点随节点分布式部署。
  - picture: /images/projects/mysql/distributed-transition.svg
    title: 分布式事务
    description: 使用快照隔离技术实现分布式事务。
  - picture: /images/projects/mysql/join.svg
    title: 分布式 Join
    description: 支持分布式节点之间使用 Join 语句。
# 快速开始

# 架构
architecture:
  picture: /images/projects/radon/radon-architecture.png
  intros:
      - 由 SQL 节点和存储节点两大部分组成
      - SQL 节点生产分布式执行计划
      - SQL 节点生成分布式执行器且并行式执行
      - SQL 节点协调分布式事务

# <!--more-->是分割线，它前面的文字为摘要（.Summary属性访问），它后面的都是Markdown格式内容（.Content），会自动匹配格式转成HTML
---

New generation MySQL distributed database components. It supports unlimited horizontal expansion and distributed transactions, has strong consistency of financial level data, and meets the extreme requirements of enterprise level core database for large capacity, high concurrency, high reliability and high availability.

<!--more-->

### Title

some content
