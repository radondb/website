---
title: "MySQL Operator 01 | 架构设计概览"
date: 2021-11-08T15:39:00+08:00
author: "高日耀"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 容器化
  - 架构
  - Kubernetes
  - Operator
  - 社区活动
# 相关文章会通过keywords来匹配
keywords:
  - MySQL
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/211108_MySQL%20Operator%2001%20%7C%20%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E6%A6%82%E8%A7%88/0.jpg
---
系列文章第一篇，介绍了编写 MySQL Operator 的架构概览和设计思路。
<!--more-->
>高日耀   资深数据库内核研发
>毕业于华中科技大学，喜欢研究主流数据库架构和源码，并长期从事分布式数据库内核研发。曾参与分布式 MPP 数据库 CirroData 内核开发（东方国信），现主要负责  MySQL 系列产品内核开发（青云科技）。 
# | 背景

随着云原生技术的成熟和普及，MySQL 运行在 K8s 平台提供服务的需求也越来越多。使用 MySQL on K8s 模式能够降低 MySQL 复杂的运维要求，对资源的利用也能达到更优的效果。

该系列文章将以 RadonDB MySQL Operator [1] 为例，为您介绍：如何基于成熟的 MySQL 高可用方案设计并实现编写 Operator。

什么是 RadonDB MySQL？

## 设计目标

让 RadonDB MySQL 使用 Operator 模式，支持在 Kubernetes 和 KubeSphere[2] 上安装部署和管理，自动执行与运行 RadonDB MySQL 集群有关的任务。

# | MySQL on K8s 部署架构拓扑

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211108_MySQL%20Operator%2001%20%7C%20%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E6%A6%82%E8%A7%88/1.jpg)

MySQL on K8s 架构拓扑图

该拓扑设计图中包含两部分：

1. MySQL 主从复制集群
2. 实现 Raft 选主协议的 Xenon 管理集群

三个灰色长方形矩阵代表 Pod 角色，每个 Pod 都包含 MySQL 容器、Xenon 容器、Slowlog 容器、Metrics 容器等。每一个 Pod 里面的 Xenon 管理当前 Pod 中的 MySQL，获取并保存当前状态，获取当前执行的复制状态信息等。单个 Pod 角色图解如下（仅列出主要容器）：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211108_MySQL%20Operator%2001%20%7C%20%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E6%A6%82%E8%A7%88/2.jpg)

 Pod 角色图

# | RadonDB MySQL Operator 架构

在 K8s 中 Operator 可以看作 CRD 和 Controller 的组合。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211108_MySQL%20Operator%2001%20%7C%20%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E6%A6%82%E8%A7%88/3.jpg)

Operator 架构

Operator 组件设计：

* 角色管理 (RBAC) ：使用 kube-rbac-proxy[3] 和 Kubernetes API 交互来做 RBAC 认证。
* 控制器管理(Manager)：包含一组自定义功能的控制器，其中包括最重要的通过自定义资源 Custom Resources 创建/更新 RadonDB MySQL 集群的控制器。
* 自定义资源(Custom Resources)：用来描述构建 RadonDB MySQL 集群基本信息。
* Service 服务：用于实现集群读写分离服务，分别设计了 Leader Service （用于应用读写业务）和 Follower Service （用于应用只读业务）。当然也包含了集群对应的 Service Account（未列出） Headless Service（未列出，用于解决主从切换带来的 IP 漂移问题，使集群对外暴露固定读写节点的虚 IP）。
# | 总结

以上就是 RadonDB MySQL Operator 架构概览和设计思路。下一篇，我们将进入源码解析部分，介绍 RadonDB MySQL Operator 脚手架选型和集群描述 Spec 和 集群状态 Status 定义。

[1]. RadonDB MySQL Kubernetes：[https://github.com/radondb/radondb-mysql-kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)

[2]. KubeSphere：[https://kubesphere.com.cn](https://kubesphere.com.cn)

[3]. kube-rbac-proxy：[https://github.com/brancz/kube-rbac-proxy](https://github.com/brancz/kube-rbac-proxy)

### 相关阅读

* 在 Kubernetes 上部署 RadonDB MySQL 集群
* 基于 K8s 的新一代 MySQL 高可用架构实现方案
* RadonDB MySQL on K8s 2.1.0 发布！
