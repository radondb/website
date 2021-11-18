---
title: "容器化 | ClickHouse on K8s 基础篇"
date: 2021-08-13T15:39:00+08:00
author: "苏厚镇"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - 容器化
  - ClickHouse
  - Kubernetes
# 相关文章会通过keywords来匹配
keywords:
  - ClickHouse
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210813_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20ClickHouse%20on%20K8s%20%E5%9F%BA%E7%A1%80%E7%AF%87/0.png
---
本文介绍了 Kubernetes 平台上部署和管理 RadonDB ClickHouse 集群方案，以及 Operator 和 Helm 的基本概念等内容。
<!--more-->
>作者：苏厚镇    青云科技数据库研发工程师
>目前从事 RadonDB ClickHouse 相关工作，热衷于研究数据库内核。 

**ClickHouse**[1] 是一款用于联机分析（OLAP）的列式数据库管理系统（DBMS）。由号称“俄罗斯 Google”的 Yandex 公司开发，并于 2016 年开源，近年在计算引擎技术领域受到越来越多的关注，算是数据库后起之秀。

**Kubernetes**[2] 是 Google 公司于 2014 年 6 月开源的一款容器集群管理系统。适用于管理云平台多个主机的容器化应用，旨在让部署容器化的应用简单并且高效，努力成为跨主机集群的自动部署、扩展以及运行应用程序容器的平台。

借助 K8s 和容器化技术，我们不仅可以使得应用的部署和管理更加简单高效、提高硬件资源利用率等，还可以实现健康检查和自修复、自动扩缩容、负载均衡等高级功能。

那么，如果黑马数据库 ClickHouse 遇上火热的容器化管理技术 K8s，会擦出怎样的火花呢？

# | ClickHouse 容器化方案概览

当前 ClickHouse 的主流容器化方案包括 **原生（Kubectl）部署** 和 **Helm 部署** 两种，而每种又包括 **是否使用 Operator** 两种情况。

|部署方式|Kubectl 原生部署|Kubectl 原生部署|Helm 部署|Helm 部署|
|:----|:----|:----|:----|:----|
|是否使用Operator|×|√|×|√|
|部署方便程度|难|中|易|易|
|管理方便程度|难|中|难|易|

# | Helm 部署方案

Kubernetes 基于服务力度提供了很多资源类型，比如 Service、Deployment 等。当需要部署一个应用时，尤其是有状态应用，需要组合使用大量的 Kubernetes 资源，部署之后还需要管理它们，包括升级、更新换代、删除等等。这时我们会想，是否有这样一个工具可以在更上层的维度去管理这些应用呢？这个时候就有了社区的一个包管理工具：Helm[3]。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210813_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20ClickHouse%20on%20K8s%20%E5%9F%BA%E7%A1%80%E7%AF%87/1.png)

**简单来讲，可把 Helm 看作是 Linux 中的 Yum，Java 中的 Maven**。 对于应用发布者而言，可以通过 Helm 打包应用，管理应用依赖关系，管理应用版本并发布应用到软件仓库。对于使用者而言，使用 Helm 后不用需要了解 Kubernetes 的 Yaml 语法并编写应用部署文件，可以通过 Helm 下载并在 Kubernetes 上安装需要的应用。

# | ClickHouse Operator 管理方案

Operator in Kubernetes 是一个 Kubernetes 扩展，可以简化应用的配置、管理和监控等。目前已经有很多应用开发了其 Operator in Kubernetes，比如 MySQL、PostgreSQL、MongoDB 等等，ClickHouse 也启动了 ClickHouse Operator [4] 项目，用于在 K8s 上部署和管理 ClickHouse。

可提供如下功能：

* 创建 Replicated 集群；
* 管理用户、配置文件；
* 管理版本升级；
* 管理数据持久化的存储卷；
* 导出 ClickHouse metrics 到 Prometheus；
* 配置 Pod Deployment，如 Pod 模板，关联规则等；
* ……

通过这些功能，可以让 ClickHouse 集群部署和管理过程不再繁琐，用户只需关心如何创建以及管理 CR 即可。

# | RadonDB ClickHouse

RadonDB ClickHouse[5] 是由 RadonDB 研发团队研发并开源的，基于原生 ClickHouse 的高可用、云原生集群解决方案。RadonDB ClickHouse 实现了将 Operator 管理和 Helm 部署方案相结合，并支持在 Kubernetes 上轻便快速地创建和管理 ClickHouse 集群。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210813_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20ClickHouse%20on%20K8s%20%E5%9F%BA%E7%A1%80%E7%AF%87/2.png)

简单说，如果想在 Kubernetes 上使用 ClickHouse 集群，那么 RadonDB ClickHouse 是一个不错的选择。

# 结语

本文介绍了 Kubernetes 平台上搭建 ClickHouse 集群的几种方案，以及 Operator 和 Helm 的基本概念等内容。

# 参考

[1]. ClickHouse：[https://clickhouse.tech/](https://clickhouse.tech/)

[2]. Kubernetes：[https://kubernetes.io/](https://kubernetes.io/)

[3]. Helm：[https://helm.sh/docs/](https://helm.sh/docs/)

[4]. ClickHouse Operator：[https://github.com/Altinity/clickhouse-operator/tree/master/docs](https://github.com/Altinity/clickhouse-operator/tree/master/docs)

[5]. RadonDB ClickHouse：[https://github.com/radondb/radondb-clickhouse-kubernetes](https://github.com/radondb/radondb-clickhouse-kubernetes)

