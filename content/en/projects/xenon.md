---
title: "Xenon"
date: 2021-09-11T16:52:11+08:00
# 相关文章，通过keywords匹配
keywords:
  - xenon
# 排序，从小到大
weight: 2
short: Xenon
subtitle: New generation MySQL Cluster High Availability components
description: Based on raft protocol to realize master-slave second level switching; Based on the semi sync mechanism, it ensures no data loss and strong data consistency. 
logo: /images/projects/xenon.svg
# 立即开始
start_url: https://github.com/radondb/xenon/blob/master/docs/how_to_build_and_run_xenon.md
github_url: https://github.com/radondb/xenon
# 特性
features:
  - picture: /images/projects/mysql/consistency.svg
    title: Strong data consistency
    description: Based on semi-sync mechanism, ensure no data loss and realize strong data consistency.
  - picture: /images/projects/mysql/fault-switch.svg
    title: Failover in seconds
    description: Call scripts to complete failover, or expand freely in combination with consul and zookeeper.
  - picture: /images/projects/mysql/raft.svg
    title: Non centralized master selection
    description: Implement decentralized automatic leader election through raft protocol.
  - picture: /images/projects/mysql/redundant.svg
    title: Cross regional disaster recovery
    description: Multi replica cross region deployment to realize disaster recovery service.
# 快速开始
fast_start:
  reading:
    - text: Xenon:Choice after MHA
      url: /posts/210604_高可用-_-xenon后-mha-时代的选择/
    - text: Some thoughts on Xenon HA
      url: /posts/210916_高可用_关于-xenon-高可用的一些思考/
  installation:
    - text: HA Architecture through Xenon + MySQL
      url: /posts/210825_高可用-_-xenon-实现-mysql-高可用架构-部署篇/
    - text: Xenon + MySQL Common Operations
      url: /posts/210903_高可用-_-xenon-实现-mysql-高可用架构-常用操作篇/
# 架构
architecture:
  picture: /images/projects/xenon/xenon-architecture.png
  intros:
    - Automatic election of decentralized leaders through raft protocol
    - Synchronize data based on gtid mode through semi-sync

# <!--more-->是分割线，它前面的文字为摘要（.Summary属性访问），它后面的都是Markdown格式内容（.Content），会自动匹配格式转成HTML
---

New generation MySQL Cluster High Availability components. Non centralized master selection based on raft protocol to realize master-slave second level switching; Based on the semi sync mechanism, it ensures no data loss and strong data consistency. Combined with the parallel replication characteristics of MySQL (version 5.7 and above), it realizes binlog parallel playback and greatly reduces the slave library delay.

<!--more-->

### Title

some content


