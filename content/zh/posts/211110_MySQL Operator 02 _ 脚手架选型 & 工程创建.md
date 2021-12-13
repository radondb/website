---
title: "MySQL Operator 02 | 脚手架选型 & 工程创建"
date: 2021-11-10T15:39:00+08:00
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
  - mysql
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/211110_MySQL%20Operator%2002%20%7C%20%E8%84%9A%E6%89%8B%E6%9E%B6%E9%80%89%E5%9E%8B%20%26%20%E5%B7%A5%E7%A8%8B%E5%88%9B%E5%BB%BA/0.png
---
系列文章第二篇，介绍了 Operator 脚手架选型和工程创建过程。
<!--more-->
>高日耀   资深数据库内核研发
>毕业于华中科技大学，喜欢研究主流数据库架构和源码，并长期从事分布式数据库内核研发。曾参与分布式 MPP 数据库 CirroData 内核开发（东方国信），现主要负责  MySQL 系列产品内核开发（青云科技）。 

本文是 MySQL Operator 设计第二篇，上一篇 介绍了 MySQL Operator 架构概览和设计思路。这一期将介绍 Operator 脚手架选型和工程创建过程。

# | Operator 脚手架选型

建筑工地在建设房子的时候，最开始都要搭建一个脚手架，便于更快更安全的施工造房子。同样， Operator 工程的构建也要搭建一个脚手架，方便后续快速的开发和迭代，而 Kubernetes 社区有很多成熟的构建脚手架的工具供我们选择。

## 脚手架构建工具

* **Operator 框架 SDK**：[https://operatorframework.io/](https://operatorframework.io/)
* **Kubebuilder**：[https://book.kubebuilder.io/](https://book.kubebuilder.io/)
* **KUDO（Kubernetes 通用声明式 Operator）**：[https://kudo.dev/](https://kudo.dev/)
* **Charmed Operator 框架**：[https://juju.is/](https://juju.is/)

目前社区活跃度和使用率最高的是 **Operator SDK** 和 **Kubebuilder**。它们都使用官方的 controller-tools 和 controller-runtime，有相同的布局，不同点在于：

### Kubebuilder

* 包含 envtest 包，允许 Operator 开发人员使用独立的 etcd 和 apiserver 运行简单的测试
* 自动生成 Makefile 以帮助用户执行 Operator 任务（构建、测试、运行、代码生成等）
* 使用 kustomize 构建部署清单
* 改进了对准入和 CRD 转换 WebHooks 的支持
### Operator SDK

* 更好的支持  Ansible 和 Helm operator 这类上层操作
* 与 Operator LifecycleManager(OLM) 的集成，OLM 是 Operator Framework 的一个关键组件，对于第 2 天集群操作非常重要，比如管理 Operator 实时升级
* 包含记分卡子命令，它可以帮助您理解 Operator 是否遵循最佳实践
* 包括 e2e 测试框架，它简化了对实际集群测试操作的过程

目前两个社区逐渐在融合，Operator SDK 也在不断向 Kubebuilder 靠拢，因此我们选择更原生、更嫡系的 Kubebuilder (目前到了 3.0 版本) 作为 Operator 工程的脚手架。

# | 创建工程

## 初始化 Operator 和 Controller API

Kubebuilder 为 Operator 代码库中涉及的各种组件（如 CRD 和 Controller-API）的代码生成提供了快速教程和简单的脚手架，其架构如下所示：
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211110_MySQL%20Operator%2002%20%7C%20%E8%84%9A%E6%89%8B%E6%9E%B6%E9%80%89%E5%9E%8B%20%26%20%E5%B7%A5%E7%A8%8B%E5%88%9B%E5%BB%BA/1.jpg)

## 创建步骤

按以下两个步骤创建工程：

1. **初始化 Operator 工程**

初始化域名设置为 radondb.com，将自动生成了镜像制作脚本，Makefile，配置文件以及 main.go 。指令如下：

```plain
kubebuilder init --domain=radondb.com
```
2. **创建 Controller**

API、GVK(group, version, kind) 分别指定为 mysql, v1alpha1, MysqlCluster。

controller 参数设置为 true 意思是自动生成控制器初始的代码文件。指令如下：

```plain
kubebuilder create api --group mysql --version v1alpha1 --kind MysqlCluster --resource=true --controller=true
```
通过两条指令生成的文件目录对比，执行第二条指令后，多了 api 目录，crd 目录以及 controllers 目录。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211110_MySQL%20Operator%2002%20%7C%20%E8%84%9A%E6%89%8B%E6%9E%B6%E9%80%89%E5%9E%8B%20%26%20%E5%B7%A5%E7%A8%8B%E5%88%9B%E5%BB%BA/2.jpg)

## Project Layout 概览

以下为 radondb-mysql-kubernetes 项目的当前目录结构及功能介绍。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211110_MySQL%20Operator%2002%20%7C%20%E8%84%9A%E6%89%8B%E6%9E%B6%E9%80%89%E5%9E%8B%20%26%20%E5%B7%A5%E7%A8%8B%E5%88%9B%E5%BB%BA/3.jpg)

# | 总结

Operator 基于 Kubernetes 的资源和控制器概念之上构建，同时又包含了应用程序特定的领域知识。创建 Operator 的关键是 CRD（自定义资源）的设计。下一篇我们将解析 radondb-mysql-kubernetes 项目中自定义 CRD 的设计。

### 相关阅读

* 在 Kubernetes 上部署 RadonDB MySQL 集群
* 基于 K8s 的新一代 MySQL 高可用架构实现方案
* RadonDB MySQL on K8s 2.1.0 发布！
* MySQL Operator 01 | 架构设计概览

 

