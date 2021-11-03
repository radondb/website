---
title: "MySQL 容器化"
date: 2021-09-11T16:52:11+08:00
# 相关文章，通过keywords匹配
keywords:
  - mysql
# 排序，从小到大
weight: 1
short: MySQL
subtitle: 基于 MySQL 的开源、高可用、云原生集群解决方案
description: 支持一主多从高可用架构，并具备安全、自动备份、监控告警、自动扩容等全套管理功能。支持在 Kubernetes 和 KubeSphere 上安装部署和管理。
logo: /images/projects/mysql/mysql.svg
# 背景图片
header_image: /images/projects/mysql/mysql_header.png
# 立即开始
start_url: https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/kubernetes/deploy_radondb-mysql_operator_on_k8s.md
github_url: https://github.com/radondb/radondb-mysql-kubernetes
# 特性
features:
  - picture: /images/projects/mysql/feature-1.svg
    title: 高可用
    description: 无中心化自动选主，主从秒级切换，集群切换的数据强一致性
  - picture: /images/projects/mysql/feature-2.svg
    title: 集群管理
    description: 无中心化自动选主，主从秒级切换，集群切换的数据强一致性
  - picture: /images/projects/mysql/feature-3.svg
    title: 监控告警
    description: 无中心化自动选主，主从秒级切换，集群切换的数据强一致性
  - picture: /images/projects/mysql/feature-4.svg
    title: 日志管理
    description: 无中心化自动选主，主从秒级切换，集群切换的数据强一致性
  - picture: /images/projects/mysql/feature-5.svg
    title: 帐户管理
    description: 无中心化自动选主，主从秒级切换，集群切换的数据强一致性
# 快速开始
fast_start:
  helm:
    - text: 在 kubernetes 上部署 radonDB mySQL 集群
      url: /
    - text: 在 kubernetes 上部署 radonDB mySQL 集群
      url: /
    - text: 在 kubernetes 上部署 radonDB mySQL 集群
      url: /
  operator:
    - text: 在 kubernetes 上部署 radonDB mySQL 集群
      url: /
# 架构
architecture:
  picture: /images/projects/mysql/mysql-architecture.png
  intros:
    - 通过 raft 协议实现无中心化领导者自动选举
    - 通过 semi-sync 基于 GTID 模式同步数据
    - 通过 Xenon 提供高可用能力
roadmap:
  - title: 1.0 Helm
    content:
      - mySQL 高可用
      - 无中心化领导自动选举
      - 主从秒级切换
      - 数据强一致性
      - 集群管理
      - 监控告警
      - 集群日志管理
      - 账户管理
  - title: 2.0 Operator
    content:
      - 增删节点
      - 自动扩缩容
      - 升级集群
      - 备份与恢复
      - 故障自动转移
      - 自动重建节点
      - 自动重启服务
      - 账户管理（提供 API 接口）
      - 在线迁移
  - title: 3.0 Operator
    content:
      - 自动化运维
      - 多节点角色
      - 灾备集群
      - SSL 传输加密
# <!--more-->是分割线，它前面的文字为摘要（.Summary属性访问），它后面的都是Markdown格式内容（.Content），会自动匹配格式转成HTML
---

基于 MySQL 的开源、高可用、云原生集群解决方案。支持一主多从高可用架构，具备安全、自动备份、监控告警、自动扩容等全套管理功能。支持在 Kubernetes 和 KubeSphere 上安装部署和管理。

<!--more-->

### Title

some content
