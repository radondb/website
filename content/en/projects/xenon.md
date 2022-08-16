---
title: "Xenon"
date: 2021-09-11T16:52:11+08:00
# 相关文章，通过keywords匹配
keywords:
  - xenon
# 排序，从小到大
weight: 2
short: Xenon
subtitle: High-availability components for MySQL clusters
description: Support decentralized leader election, failover within seconds, strong data consistency, and fast data synchronization
logo: /images/projects/xenon.svg
# 立即开始
start_url: https://github.com/radondb/xenon/blob/master/docs/how_to_build_and_run_xenon.md
github_url: https://github.com/radondb/xenon
# 特性
features:
  - picture: /images/projects/mysql/consistency.svg
    title: Strong data consistency
    description: Strong data consistency without data loss under Semi-Sync mechanism
  - picture: /images/projects/mysql/fault-switch.svg
    title: Failover within seconds
    description:  Running the failover script, or scaling with Consul and ZooKeeper
  - picture: /images/projects/mysql/raft.svg
    title: Decentralized leader election
    description: Automatic decentralized leader election by Raft protocol
  - picture: /images/projects/mysql/redundant.svg
    title: Cross-region disaster recovery
    description: Cross-region deployment of multiple replicas
# 快速开始
fast_start:
  reading:
    - text: 'Xenon: The choice in the post-MHA era'
      url: /posts/210604_高可用-_-xenon后-mha-时代的选择/
    - text: Some thoughts on Xenon HA
      url: /posts/210916_高可用_关于-xenon-高可用的一些思考/
  installation:
    - text: Deploy HA architecture with Xenon and MySQL
      url: /posts/210825_高可用-_-xenon-实现-mysql-高可用架构-部署篇/
    - text: Common operations of Xenon and MySQL
      url: /posts/210903_高可用-_-xenon-实现-mysql-高可用架构-常用操作篇/
# 架构
architecture:
  picture: /images/projects/xenon/xenon-architecture.png
  intros:
    - Automatic decentralized leader election by Raft protocol
    - Data synchronization by Semi-Sync replication based on GTID mode

# <!--more-->是分割线，它前面的文字为摘要（.Summary属性访问），它后面的都是Markdown格式内容（.Content），会自动匹配格式转成HTML
---

Xenon achieves decentralized primary/secondary failover within seconds based on the Raft protocol, strong data consistency based on semisynchronous replication, and Binlog parallel replay based on parallel replication, ensuring fast data synchronization for the secondary.
<!--more-->

### Title

some content


