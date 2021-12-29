---
title: "分享 | RadonDB 的开源之路"
author: "李志昂"
date: 2021-09-07T16:00:00+08:00
weight: 10
tags:
  - 社区活动
  - Meetup
  - 云原生
  - CIC
  - 开源
keywords:
  - mysql
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/cover/210907.jpg
---
本文为 RadonDB 2021 Meetup 北京站的分享议题《RadonDB：新一代云数据库的实践与展望》的整理文稿，相关视频已投稿至 B 站社区账号 RadonDB 开源社区，欢迎关注~
<!--more-->
>作者：李志昂 资深数据库专家
>目前负责 MySQL 云数据库和分布式数据库的研发工作，曾做过分布式存储、分布式缓存、分布式数据库内核研发

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/1.jpg)

本文为 RadonDB 2021 Meetup 北京站的分享议题《RadonDB：新一代云数据库的实践与展望》的整理文稿，相关视频已投稿至 B 站社区账号 **RadonDB 开源社区**，欢迎关注~

**【内容大纲】**

1. RadonDB 概述
2. 核心技术实现
3. 开源社区
4. 未来展望
5. Q&A 环节

**B 站视频链接**
[https://www.bilibili.com/video/BV1Vq4y1Q7EH?share_source=copy_web](https://www.bilibili.com/video/BV1Vq4y1Q7EH?share_source=copy_web)

# 开场白

RadonDB 团队一直以 **拥抱开源、回馈开源** 为宗旨，不断摸索市场需求和用户痛点，持续探究数据库开源技术，将沉淀的经验回馈开源项目。历经七年时间，RadonDB 数据库平台的产品已被上千家企业使用。今天将为大家分享 RadonDB 团队这几年在开源领域探索的一些成果。

# RadonDB 概述

RadonDB 原本是一款分布式关系型数据库，并于 2018 年开源。

2021 年 RadonDB 正式升级为开源数据库品牌，不再单指一款分布式数据库，而是一个开源数据库产品家族【商业】。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/2.jpg)

图 1-1 产品家族

大家也许会问，为什么 RadonDB 数据库平台的产品有这么多的种类？随着用户量不断增加，会衍生出很多不同的用户业务场景，同时也伴随着不同的数据库需求。

那不同的需求怎么办呢？大家也许看过《人月神话》这本书，书中提到 **软件行业没有统一的银弹**，通俗点来讲就是**很难用一个数据库应对所有场景**。针对不同场景，RadonDB团队做了很多工作，并将多项数据库成果贡献给社区。以下是目前 RadonDB **已开源项目**。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/3.jpg)

图 1-2 发展历程

* 2017 ：MySQL 高可用组件 Xenon
* 2018 ：分布式数据库 RadonDB
* 2019 ：分析型时序数据库 ChronusDB
* 2020 ：MaterializeMySQL
* 2021 ：数据库容器化

# 核心技术实现

## MySQL 高可用组件 Xenon

RadonDB 开源项目最早是从 MySQL 高可用组件开始做起的。当时 MySQL 用户数量较大，收到很多高可用需求，所以亟需设计实现一种高可用集群方案。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/4.jpg)

图 2-1 高可用痛点

项目初始，团队核心成员调研分析了市面上已有的 MySQL 高可用方案，这些方案在易用性、自动化运维、疑难问题处理等方面都存在一些问题。

出于 **拥抱开源，回馈开源** 的宗旨， RadonDB 团队开始自研新一代 MySQL 高可用集群组件 Xenon（以惰性气体命名，寓意是希望数据服务的稳定，也不乏对高性能的追求）。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/5.jpg)

图 2-1 MySQL 高可用组件 Xenon

通常意义上，真正的高可用组件需要具备以下特点：

1. 满足集群各节点间的数据强一致；
2. 出现主从切换等异常情况，能做到秒级切换；
3. 无中心化自由选举，能提供逻辑主从；
4. 不仅满足高可用，而且支持跨区容灾（两地三中心、三地五中心等等）。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/6.jpg)

图 2-2 Xenon 特性

Xenon 自然也满足以上特点，核心架构和功能如下：

1. 每个 Xenon 管理一个 MySQL；
2. Xenon 基于 Raft 算法，主要有三种角色：Leader、Follower、Candidate；

Leader 节点对外提供写服务，并定期向 Follower 发送心跳；如果 Follower 在一个任期时间内没有收到 Leader 心跳且当前节点未发生网络分区，会变为 Candidate ，发起选举，若当选则变为 Leader 状态，反之，则变为 Follower 。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/7.jpg)

图 2-3 Xenon 核心架构&功能

选举规则如下：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/8.jpg)

图 2-4 选举规则

角色职责如下：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/9.jpg)

图 2-5 角色职责

Xenon 在企业生产环境中的节点数量已达到 1W+，很好的支撑了绝大多数用户的需求。但也存在数据量或业务压力比较大的场景，同时伴随国内分布式数据库火热趋势，团队着力开始探索如何通过分布式数据库方案来解决这些用户痛点。

了解更多：
[高可用 | Xenon：后 MHA 时代的选择](/posts/210604_高可用-_-xenon后-mha-时代的选择/)

## 分布式数据库 RadonDB

单机数据库在数据量和业务压力较大时，常常不能满足用户业务需求。虽然可以通过一些办法扩展存储能力，但单机的计算能力最终会达到极限。不同场景下，客户也有特殊的需求，比如指定数据的分配位置等。而业务自开发的分片方案也容易存在无法满足分布式事务的问题。

通过前期对不同业务场景的分析，提炼出共通痛点，抽象出通用需求。RadonDB 团队对存储和计算节点的分工进行了辨证分析。参考数据库理论技术研究论文（苹果的 FoundationDB、谷歌的 Spanner），考虑团队人员和时间成本（团队一直不断关注着国际前沿数据库技术理论），结合市场的现状（MySQL 流行度高、生态稳定、DBA 团队技术成熟、解决方案全面等），经过多方面比对取舍，选定 MySQL 作为存储节点。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/10.jpg)

图 2-6 存储和计算节点的选择

尽量互用已有的组件和产品，缩短开发周期和降低风险。如图，分布式数据库 RadonDB 架构底层的每个存储节点是独立的高可用MySQL集群，采用上面介绍的Xenon技术。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/11.jpg)

图 2-7 RadonDB 整体架构

RadonDB 架构在一些用户的生产环境上也“跑了”两年多，用户的应用体验也非常好。就像开头说的 **软件行业没有统一的银弹。** 针对不同的场景，要有不同的解决方案，开源鼓励多样性。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/12.jpg)

图 2-8 RadonDB 层核心架构

感兴趣的同学可以到 Github 仓库，查看更多关于 Radon 的信息。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/13.jpg)

图 2-9 分布式数据库 RadonDB

## MySQL HTAP 方案

在团队研发高可用组件和分布式数据库的同时，有些用户在使用 OLTP 的时候提出实时OLAP 的需求，针对这些需求我们做了MySQL HTAP 相关的调研。

传统的实时数据分析解决方案偏离线，用 MySQL 完成 TP，用 Canal、Kafka 等 ETL 工具从 MySQL 中抽取数据，再传输到大数据平台做数据分析。整个过程不仅非实时，而且增加了新组件，增加维护复杂度。有客户提出能不能提供一体化的解决方案，即同时提供 TP 和 AP 的功能，用户仅需关注业务。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/14.jpg)

图 2-10 传统实现思路

来自俄罗斯的 Yandex公司的 ClickHouse OLAP 性能突出让人眼前一亮。这里展示一下 Yandex 官方 benchmark 的一个数据截图，呈现了 ClickHouse 与很多同类分析型数据库的性能对比。在一些场景下 ClickHouse 展示出比其它项目高出几倍、几十倍甚至更多的性能优势。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/15.jpg)

图 2-11 What is ClickHouse?

那 ClickHouse（AP） 和 MySQL（TP） 能不能在一起发生一些“化学反应”呢？答案是肯定的，《MySQL to ClickHouse data migration and replication》这篇文章中也正提到了两种技术的整合思想。发表文章的这家公司早在 2017 年就提出了 MySQL 到 ClickHouse 迁移备份的想法，但是一直没有成行。基于这一想法，RadonDB 团队实践研发了数据库新引擎 MaterializeMySQL。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/16.jpg)

图 2-12 MaterializeMySQL 核心机制

MaterializeMySQL 引擎的核心机制，简单通俗地说，就是把 ClickHouse 当作是 MySQL 的一台从机，同步过程分为全量和增量两部分。初始化后，MySQL 单独 dump 全量数据传输到 ClickHouse 里，同时 ClickHouse 实时同步 MySQL 的增量操作并更新数据，实现数据的实时同步。

从 MySQL HTAP 产品的整体架构可看出，当用户有相关的复杂查询时，可以通过 Proxy 根据 AP、TP 的需求提交到不同的查询节点，实现 AP 与 TP 一体化的需求。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/17.jpg)

图 2-13 HTAP 方案

经过测试结果显示， SQL 的查询性能得到了显著的提升。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/18.jpg)

图 2-14 性能提升

题外：原生 ClickHouse 已于 20.8 版本，正式合入 RadonDB 团队研发的 MaterializeMySQL 项目。这也正体现了 RadonDB 团队 **拥抱开源，回馈开源**的精神和技术实力。感兴趣的同学可以搜索相关 PR，阅读源代码。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/19.jpg)

图 2-15 MaterializeMySQL 社区贡献

了解更多：

[HTAP | MySQL 到 ClickHouse 的高速公路](http://mp.weixin.qq.com/s?__biz=MzkyODI0NTE0OA==&mid=2247483687&idx=1&sn=6b27db02f9715f4fd2af5273b7d5df71&chksm=c21af5d4f56d7cc22be0c7129b49331b81d58b42ab48e322f463e4f4022f721aae6bbcb99b19&scene=21#wechat_redirect)

HTAP 是目前数据库领域中最热门方案之一，但未来是云计算的时代！

## 数据库容器化

云计算平台的地位就像如今的操作系统一样，这个底座就是 Kubernetes （即 K8s）。云计算跟数据库的碰撞产生了云原生数据库，孵化出了新的理念、技术和产品。那么，在云计算时代传统数据库也将迎来更多的挑战。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/20.jpg)

图 2-16 传统数据库的挑战

容器化技术具有更轻量、更开放、更灵活的特征，并且还更符合标准化，满足跨云的需求。那容器化和数据库融合会不会有意想不到的效果呢？

在 KubeSphere 及一些 K8s 论坛上，关于数据库类型的问题和需求一直很热门。首先数据库容器化本身就具有很多优势，最大特点是支持跨云平台。此外 K8s 平台还具备秒级水平伸缩、隔离资源等特点，提升了运维效率，增加了部署升级测试的便捷性。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/21.jpg)

图 2-17 RadonDB MySQL on Kubernetes

如图 MySQL on K8s 的实现架构，图中包含了很多 K8s 的概念，对于用户而言只需了解对外提供的相关服务。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/22.jpg)

图 2-18 Release 1.0

基于用户的需求，RadonDB MySQL Kubernetes 1.0 是用 Helm 快速开发出来的一个高可用 MySQL 服务。基础软件需要客户应用来打磨，RadonDB MySQL Kubernetes 项目也不例外，前期快速开发迭代，在满足可靠的基本功能的基础上，快速投放给客户，为客户带来价值，客户提出新的需求反馈，我们会分析这些新需求并持续更新产品，形成健康的产品迭代周期。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/23.jpg)

图 2-19 Release 2.0&3.0

RadonDB MySQL Kubernetes 2.0 基于 Kubernetes Operator 开发，弥补了 1.0 Helm的先天的不足，在支持 1.0 的全部功能的基础上，新增了备份恢复、滚动升级等功能，丰富了监控、账户管理等功能。为保证 2.0 质量，进行了全面的测试和验证，同时 3.0 也在路上。

因为项目的响应效率、迭代速度、代码质量等因素，吸引了一些国外类似项目团队的成员，为社区发展提出了很多宝贵的建议。不要把开源作为一个负担，应该拥抱开源，享受开源社区带来的更多用户、更多需求和更多视角。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/24.jpg)

图 2-20 RadonDB MySQL on Kubernetes

RadonDB MySQL Kubernetes 不断迭代演进的同时，RadonDB 团队还做了 PostgreSQL 和 ClickHouse 的容器化方案。

仓库地址：

* [https://github.com/radondb/radondb-clickhouse-kubernetes](https://github.com/radondb/radondb-clickhouse-kubernetes)
* [https://github.com/radondb/radondb-postgresql-operator](https://github.com/radondb/radondb-postgresql-operator)
* [https://github.com/radondb/radondb-mysql-kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)

了解更多：

[容器化 | 基于 K8s 的新一代 MySQL 高可用架构实现方案](http://mp.weixin.qq.com/s?__biz=MzkyODI0NTE0OA==&mid=2247484003&idx=1&sn=947f2c537c0807336f7348958646722e&chksm=c21af690f56d7f863e8aa9a98167bdff426179f47a4242834a9a725c0c94b750304e885d8f6e&scene=21#wechat_redirect)

[容器化 | ClickHouse on K8s 基础篇](http://mp.weixin.qq.com/s?__biz=MzkyODI0NTE0OA==&mid=2247484291&idx=1&sn=d0c06d0e48141f09e29ac178395e3ae8&chksm=c21af770f56d7e6643d10373cec7509865f8b0296c9b37f1278d5f3fddff2da31d4a937b4652&scene=21#wechat_redirect)

## 客户价值

目前 RadonDB 开源数据库系列产品已被 光大银行、浦发硅谷银行、哈密银行、泰康保险、太平保险、安盛保险、阳光保险、百年人寿、安吉物流、安畅物流、蓝月亮、天财商龙、罗克佳华、升哲科技、无锡汇跑体育、北京电信、江苏交通控股、四川航空、昆明航空、国控生物 等上千家企业及社区用户采用。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/25.jpg)

图 3-1 客户价值

# 开源社区

RadonDB 团队于今年发起了 RadonDB开源社区 —— 一个面向云原生、容器化的数据库开源社区。通过 Slogan 可以看出，RadonDB 更侧重于未来概念，以区别传统的数据库社区。除了提供云原生、容器化相关内容，也会发布最新数据库的相关技术分享和各类社区活动。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/210907_%E5%88%86%E4%BA%AB%20%7C%20RadonDB%20%E7%9A%84%E5%BC%80%E6%BA%90%E4%B9%8B%E8%B7%AF/26.jpg)

图 3-1 RadonDB开源社区

# 未来展望

首先，计算存储分离是一个方向，友商已经做了很多尝试，RadonDB 团队在这方面也一直在做一些探索。其次，serverless 也是一个方向。因为 RadonDB 数据库产品丰富多样，自治与智能化管理，也是团队的一个探索方向。当然，还有大数据与数据融合。


# Q&A 环节

**问题：你们是用什么技术手段实现将有状态的数据库和容器融合，来克服这些挑战的？**

这也是我们之前一直考虑的，K8s 这么火，为啥没有烧到数据库领域？K8s 是一个编排系统，最初的设计理念主要是服务于无状态服务。后来才到有状态的服务，甚至于数据库。数据库本身有状态，各种机制又比较复杂。目前看 K8s 有一统天下的意图，那它就必须要解决有状态服务的问题。这个过程中我们也和 KubeSphere 团队一起攻克技术难题。我们采用 Kubernetes Operator 相关技术结合 StatefulSet 解决了有状态服务问题，欢迎感兴趣的同学来我们的 Github 看一看。