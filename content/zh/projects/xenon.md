---
title: "Xenon 高可用集群组件"
date: 2021-09-11T16:52:11+08:00
# 相关文章，通过keywords匹配
keywords:
  - xenon
# 排序，从小到大
weight: 1
short: Xenon
subtitle: 新一代 MySQL 集群高可用组件
description: 基于 Raft 协议进行无中心化选主，实现主从秒级切换；基于 Semi-Sync 机制，保障数据不丢失，实现数据强一致性，并结合 MySQL (5.7 及以上版本) 并行复制特性，实现 Binlog 并行回放，大大降低从库延迟。
logo: /images/projects/xenon.svg
# 背景图片
header_image: /images/projects/mysql/mysql_header.png
# 立即开始
start_url: /posts/210825_高可用-_-xenon-实现-mysql-高可用架构-部署篇/
github_url: https://github.com/radondb/xenon
# 特性
features:
  - picture: /images/projects/mysql/feature-1.svg
    title: 集群数据强一致
    description: 基于 Semi-Sync 机制，保障数据不丢失，实现数据强一致性。
  - picture: /images/projects/mysql/feature-2.svg
    title: 故障秒级切换
    description: 基于 Raft 协议进行无中心化选主，实现主从秒级切换。
  - picture: /images/projects/mysql/feature-3.svg
    title: 无中心化选主
    description: 基于 Raft 协议进行无中心化选主，实现主从秒级切换。
  - picture: /images/projects/mysql/feature-4.svg
    title: 跨区容灾
    description: 高可用版及金融版可实现多可用区主从部署，具有跨可用区容灾能力。 
# 快速开始
fast_start:
  helm:
    - text: Xenon：后 MHA 时代的选择
      url: /posts/210604_高可用-_-xenon后-mha-时代的选择/
    - text: 关于 Xenon 高可用的一些思考
      url: /posts/210916_高可用_关于-xenon-高可用的一些思考/
  operator:
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

基于 MySQL 的开源、高可用、云原生集群解决方案。支持一主多从高可用架构，具备安全、自动备份、监控告警、自动扩容等全套管理功能。支持在 Kubernetes 和 KubeSphere 上安装部署和管理。

<!--more-->

### Title

some content


