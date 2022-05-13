---
title: "Radon"
date: 2021-09-11T16:52:11+08:00
# 相关文章，通过keywords匹配
keywords:
  - radon
# 排序，从小到大
weight: 3
short: Radon
subtitle: New generation MySQL distributed database components
description: It supports unlimited horizontal expansion and distributed transactions, has strong consistency of financial level data.
logo: /images/projects/radon.svg
# 立即开始
start_url: https://github.com/radondb/radon/blob/master/docs/how_to_build_and_run_radon.md
github_url: https://github.com/radondb/radon/
# 特性
features:
  - picture: /images/projects/mysql/resilience.svg
    title: Elastic expansion
    description: Quickly realize the scalable deployment of nodes.
  - picture: /images/projects/mysql/consistency.svg
    title: Strong data consistency
    description: Based on semi-sync mechanism, ensure no data loss and realize strong data consistency.
  - picture: /images/projects/mysql/distributed-storage.svg
    title: Distributed storage
    description: Storage nodes are distributed with nodes.
  - picture: /images/projects/mysql/distributed-transition.svg
    title: Distributed transaction
    description: Use snapshot isolation technology to realize distributed transactions.
  - picture: /images/projects/mysql/join.svg
    title: Distributed Join
    description: Support the use of join statements between distributed nodes.
# 快速开始

# 架构
architecture:
  picture: /images/projects/radon/radon-architecture.png
  intros:
      - It consists of SQL node and storage node
      - SQL node production distributed execution plan
      - SQL nodes generate distributed executors and execute in parallel
      - SQL nodes coordinate distributed transactions

# <!--more-->是分割线，它前面的文字为摘要（.Summary属性访问），它后面的都是Markdown格式内容（.Content），会自动匹配格式转成HTML
---

MySQL distributed database components. It supports unlimited horizontal expansion and distributed transactions, has strong consistency of financial level data, and meets the extreme requirements of enterprise level core database for large capacity, high concurrency, high reliability and high availability.

<!--more-->

### Title

some content
