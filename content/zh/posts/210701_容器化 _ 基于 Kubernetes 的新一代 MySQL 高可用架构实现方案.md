---
title: "容器化 | 基于 K8s 的新一代 MySQL 高可用架构实现方案"
date: 2021-07-01T15:39:00+08:00
author: "高日耀"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 容器化
  - Kubernetes
  - KubeSphere
  - Xenon
  - 社区活动
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/0.png
---
本文是 MySQL 容器化的第三篇。主要介绍 MySQL 容器化 Helm 版本的设计思路。
<!--more-->

作者：高日耀 资深 MySQL 内核研发

-------------------

本文是 MySQL 容器化系列的第三篇文章，源于作者在 KubeSphere & Friends 2021 杭州站 的演讲内容《基于 Kubernetes 的新一代 MySQL 高可用架构实现方案》。 主要介绍 MySQL 容器化 Helm 版本[1]  的设计思路。

# Dockerfile 简介

首先 RadonDB MySQL 一个 Pod 中的容器角色中，一般包含 MySQL、Xenon、slowlog 三个容器。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/1.png)

其中，MySQL 和 Xenon Dockerfile 目录结构如下所示：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/2.png)

### MySQL  Dockerfile 解析

启动 MySQL 主进程前，需要准备数据库配置、初始化等，这些工作要在最终的 MySQL 运行之前解决。在制作镜像时，通过配置 MySQL Dockerfile 中 `ENTRYPOINT` 和 `CMD` 参数，可提前准备数据库配置、初始化等进程。

Docker 是分层的，每一条命令都会建一个镜像层，分层太多会导致快速膨胀。在制作镜像时，不建议分层太多。

MySQL `Dockerfile` 文件中命令示例如下：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/3.png)

MySQL `mysql-entry.sh` 文件中包含启动命令，其主要执行流程如下：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/4.png)

### Xenon Dockerfile 解析

Xenon Dockerfile 比较简单，跟 MySQL Dockerfile 流程类似。

Xenon `Dockerfile` 命令示例如下：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/5.png)

`xenon-entry.sh` 主要功能：

1. 生成 Xenon 配置文件，在 Xenon 启动的时候调用
2. ping host
# name 生成及环境变量

### name 生成

首先我们看下 chart 目录下功能文件列表，chart  下包含的文件如下图所示：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/6.png)

其中，`_helpers.tpl` 常需引用 `Chart.yaml` 和 `values.yaml` 中定义的变量，继而实现如下能力：

- 生成 app 名字：helm install release <版本名，如 emo> <项目名，如radondb-mysql>
- 生成 `serviceAccountName` 名字。
- 生成 chart  名字和版本。

通过命令 `helm get all demo`，可查看 demo 中所有信息。查看 service 部分 name 示例如下:

```plain
104 # Source: radondb-mysql/templates/serviceaccount.yaml
105 apiVersion: v1
106 kind: ServiceAccount
107 metadata:
108   name: demo-radondb-mysql
109   labels:
110     app: demo-radondb-mysql
111     chart: radondb-mysql-1.0.0
112     release: "demo"
113     heritage: "Helm"
```
### 环境变量

**环境变量** 主要目的是保存密码和配置参数解耦。

secrets.yaml 功能

*  
    * Opaque
    * base64 转码
    * 加密插件

configmap.yaml 功能

*  
    * 将配置参数和 docker 镜像解耦
    * 保存一些配置参数和修改 lable 的脚本

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/7.png)

# 如何识别集群中 leader、follower 角色？

识别集群节点角色，需创建一个服务账号，并授予相应的权限。通过执行在 `config` 文件中保存的脚本，调用相应的 API 来修改对应角色的 lable。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/8.png)

节点角色修改后，相应 lable 效果如下。此时，通过服务标签后缀，即可轻松辨别 Leader 和 Follower 角色的节点。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/9.png)

在 KubeSphere[2]  管理控制台，可查看到角色修改后示例如下：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/10.png)

# 如何实现读写分离？

RadonDB MySQL 读写分离，通过 Headless service for stable DNS[3] 来实现。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/11.png)

分配一个集群内部可以访问的虚拟 IP (VIP)，VIP 是固定的，而节点所绑定的 Pod 的 IP 是可以变化的，每个 Node 上分配一个端口作为外部访问入口。以此特点，可以设定一个读 IP 和一个写 IP，来达到读写分离的目的，而无需担心新绑定 Pod 致使 IP 发生变化。

以 Leader 节点为例，下图所示的 ClusterIP 对应写 IP(`10.111.92.63`)， 其绑定当前的 Pod（主）IP 为 `172.17.0.10`。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/12.png)

# 邂逅 KubeShpere

RadonDB MySQL 已经登录 KubeSphere 应用商店（3.1.0 版本推出），可以通过 KubeSphere 来实现对集群的查看和管理。

### 1、通过终端查看集群正常时 gtid 和对应的状态

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/13.png)

### 2、模拟 Follower 节点挂掉场景

kill 掉名为 demo-radondb-mysql-2 的 follower：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/14.png)

从另外一个节点登入终端再次查看集群状态，该 follower 节点 MySQL 和 IO/SQL 状态都不正常。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/15.png)

从 KubeSphere 界面查看：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/16.png)
挂掉的节点重新拉起，集群开始重新发起选举：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/17.png)

### 3、Leader （demo-radondb-mysql-0） 节点挂掉场景

leader 降级为 follower，原来另外两个从节点进入候选者状态：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/18.png)

从 KubeSphere 界面查看，这时已经查不到 leader pod：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/19.png)

等待一段时间，集群选出新主（demo-radondb-mysql-2）：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/20.png)

从 KubeSphere 看到原来的主（demo-radondb-mysql-0）变为 follower：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/21.png)

### 4、网络隔离

将新主(demo-radondb-mysql-2) 隔离。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/22.png)

等待一段时间，可以看到新主(demo-radondb-mysql-0)重新被选出：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210701_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9F%BA%E4%BA%8E%20Kubernetes%20%E7%9A%84%E6%96%B0%E4%B8%80%E4%BB%A3%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%E5%AE%9E%E7%8E%B0%E6%96%B9%E6%A1%88/23.png)

# 参考引用
[1]. RadonDB MySQL Kubernetes：[https://github.com/radondb/radondb-mysql-kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)

[2]. KubeSphere：[https://kubesphere.com.cn](https://kubesphere.com.cn)

[3]. Headless service：[https://kubesphere.com.cnhttps://kubernetes.io/docs/concepts/services-networking/service/](https://kubesphere.com.cnhttps://kubernetes.io/docs/concepts/services-networking/service/)

