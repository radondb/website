---
title: "Radon"
date: 2021-09-11T16:52:11+08:00
# 相关文章，通过keywords匹配
keywords:
  - radon
# 排序，从小到大
weight: 3
short: Radon
subtitle: Next-generation distributed database components for MySQL
description: Meet requirements for unlimited horizontal scaling, distributed transaction, and financial-grade strong data consistency, and ultra high concurrency and performance
logo: /images/projects/radon.svg
# 立即开始
start_url: https://github.com/radondb/radon/blob/master/docs/how_to_build_and_run_radon.md
github_url: https://github.com/radondb/radon/
# 特性
features:
  - picture: /images/projects/mysql/resilience.svg
    title: Elastic scaling
    description: Quick deployment of nodes in scaling
  - picture: /images/projects/mysql/consistency.svg
    title: Strong data consistency
    description: Strong data consistency without data loss under Semi-Sync mechanism
  - picture: /images/projects/mysql/distributed-storage.svg
    title: Distributed storage
    description: Storage nodes distributed with nodes
  - picture: /images/projects/mysql/distributed-transition.svg
    title: Distributed transaction
    description: Distributed transaction implemented with snapshot isolation technology
  - picture: /images/projects/mysql/join.svg
    title: Distributed Join
    description: Join statements supported for distributed nodes
# 快速开始

# 架构
architecture:
  picture: /images/projects/radon/radon-architecture.png
  intros:
      - It consists of SQL nodes and storage nodes
      - SQL nodes generate distributed execution plans
      - SQL nodes generate distributed executors and run them in parallel
      - SQL nodes coordinate distributed transactions

# <!--more-->是分割线，它前面的文字为摘要（.Summary属性访问），它后面的都是Markdown格式内容（.Content），会自动匹配格式转成HTML
---

Radon provides distributed database components based on MySQL. It supports unlimited horizontal scaling and distributed transaction, ensures strong data consistency in financial scenario, and meets the requirements of large capacity, high concurrency, high reliability and high availability for enterprise core database.

<!--more-->

### Title

some content
