---
title: "Xenon"
date: 2021-09-11T16:52:11+08:00
# 相关文章，通过keywords匹配
keywords:
  - xenon
# 排序，从小到大
weight: 3
short: Xenon
subtitle: New generation MySQL Cluster High Availability components
description: Non centralized master selection based on raft protocol to realize master-slave second level switching; Based on the semi sync mechanism, it ensures no data loss and strong data consistency. Combined with the parallel replication characteristics of MySQL (version 5.7 and above), it realizes binlog parallel playback and greatly reduces the slave library delay.
logo: /images/projects/xenon.svg
# 立即开始
start_url: /posts/210825_高可用-_-xenon-实现-mysql-高可用架构-部署篇/
github_url: https://github.com/radondb/xenon
# 特性
features:
  - picture: /images/projects/mysql/consistency.svg
    title: 集群数据强一致
    description: 基于 Semi-Sync 机制，保障数据不丢失，实现数据强一致性。
  - picture: /images/projects/mysql/fault-switch.svg
    title: 故障秒级切换
    description: 调用脚本完成故障切换，也可以结合 Consul，ZooKeeper 自由扩展。
  - picture: /images/projects/mysql/raft.svg
    title: 无中心化选主
    description: 通过 Raft 协议实现无中心化领导者自动选举。
  - picture: /images/projects/mysql/redundant.svg
    title: 跨区容灾
    description: 多副本跨区部署实现容灾服务。
# 快速开始
fast_start:
  reading:
    - text: Xenon：后 MHA 时代的选择
      url: /posts/210604_高可用-_-xenon后-mha-时代的选择/
    - text: 关于 Xenon 高可用的一些思考
      url: /posts/210916_高可用_关于-xenon-高可用的一些思考/
  installation:
    - text: Xenon 实现 MySQL 高可用架构 部署篇
      url: /posts/210825_高可用-_-xenon-实现-mysql-高可用架构-部署篇/
    - text: Xenon 实现 MySQL 高可用架构 常用操作篇
      url: /posts/210903_高可用-_-xenon-实现-mysql-高可用架构-常用操作篇/
# 架构
architecture:
  picture: /images/projects/xenon/xenon-architecture.png
  intros:
    - 通过 raft 协议实现无中心化领导者自动选举
    - 通过 semi-sync 基于 GTID 模式同步数据

# <!--more-->是分割线，它前面的文字为摘要（.Summary属性访问），它后面的都是Markdown格式内容（.Content），会自动匹配格式转成HTML
---

New generation MySQL Cluster High Availability components. Non centralized master selection based on raft protocol to realize master-slave second level switching; Based on the semi sync mechanism, it ensures no data loss and strong data consistency. Combined with the parallel replication characteristics of MySQL (version 5.7 and above), it realizes binlog parallel playback and greatly reduces the slave library delay.

<!--more-->

### Title

some content


