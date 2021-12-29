---
title: "视野 | OpenSearch，云厂商的新选择？"
date: 2021-11-17T15:39:00+08:00
author: "王奇"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - Elasticsearch
  - OpenSearch
  - AWS
# 相关文章会通过keywords来匹配
keywords:
  - 
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/211117_%E8%A7%86%E9%87%8E%20%7C%20OpenSearch%EF%BC%8C%E4%BA%91%E5%8E%82%E5%95%86%E7%9A%84%E6%96%B0%E9%80%89%E6%8B%A9%EF%BC%9F/0.png
---
Elastic 与 AWS 事件后，OpenSearch 是否可以作为 Elasticsearch 的替代方案。
<!--more-->
>王奇 顾问软件工程师
>目前从事 PaaS 中间件服务（Redis / MongoDB / ELK 等）开发工作，对 NoSQL 数据库有深入的研究以及丰富的二次开发经验，热衷对 NoSQL 数据库领域内的最新技术动态的学习，能够把握行业技术发展趋势。 
# | 最流行的全文搜索引擎

Elasticsearch 是一款广泛使用的开源分布式全文搜索引擎，源于 Apache Lucene[1]，许可证为 Apache 2.0。由于出色的搜索引擎、高扩展性和丰富的统计分析能力，深受用户喜爱。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211117_%E8%A7%86%E9%87%8E%20%7C%20OpenSearch%EF%BC%8C%E4%BA%91%E5%8E%82%E5%95%86%E7%9A%84%E6%96%B0%E9%80%89%E6%8B%A9%EF%BC%9F/1.jpg)


基于 Lucene 的 Elasticsearch

2010 年开源的  Elasticsearch 随着全球搜索引擎业务的飞速发展，也变得更加流行。在国内外积累了大量的核心用户并受到社区的强烈欢迎。根据 DB-Engines[2] 网站对于 Search Engine 类数据库的流行度趋势统计，2016 年至今 Elasticsearch 始终保持第一。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211117_%E8%A7%86%E9%87%8E%20%7C%20OpenSearch%EF%BC%8C%E4%BA%91%E5%8E%82%E5%95%86%E7%9A%84%E6%96%B0%E9%80%89%E6%8B%A9%EF%BC%9F/2.jpg)

 

Search Engine 流行趋势

# | Elastic 与 AWS 事件

Elastic 成立于 2012 年，是很多来自硅谷的开源软件独角兽公司之一。Elasticsearch 的成功离不开 Elastic 公司的成功运营。随着云计算技术的不断发展壮大，以 AWS 为首的云厂商 **SaaS 模式** 趋于火热，越来越多的用户愿意接受 SaaS 模式。部分云厂商将开源产品以服务的方式发布并盈利，但并未回馈开源。

Elastic 公司在这样的背景下，决定有针对性的修改了许可授权，各大云厂商们面临在非授权的情况下，将无法继续更新 Elasticsearch 版本的困境（旧版本不影响）。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211117_%E8%A7%86%E9%87%8E%20%7C%20OpenSearch%EF%BC%8C%E4%BA%91%E5%8E%82%E5%95%86%E7%9A%84%E6%96%B0%E9%80%89%E6%8B%A9%EF%BC%9F/3.jpg)

Elasticsearch 版本协议说明

AWS 没有选择与 Elastic 合作，而是在 2019 年开始尝试新的可能。2021 年 AWS 正式开源了基于 Elasticsearch 的 OpenSearch 项目，并在 AWS 商店正式推出了 OpenSearch[3] 服务来取代原有的 Elasticsearch 服务。

这一系列事件，对全球云厂商对开源软件的使用也许会产生深远的影响。接下来我们梳理一下整个事件的时间线。

## 时间线

**2010 年 2 月**

Elastic 发布了 Elasticsearch，源于 Apache Lucene，许可证为 Apache 2.0。

**2018 - 2019 年**

Elastic 修改了 Kibana（配套可视化工具） 和 Elasticsearch 的开源协议（ ALv2 -> SSPL & Elastic 双授权），意味着 7.10.2 版本后不再提供开源版本。

**2019 年 3 月**

AWS 推出 Open Distro for Elasticsearch（OpenSearch 的前身），一个 100% 的开源发行版。

**2021 年 4 月**

AWS 宣布推出 OpenSearch 项目，基于 7.10.2 版本创建分支，并重构了所有 ODFE 插件与 OpenSearch 配合使用，ODFE 在 1.13 版本结束。

**2021 年 9 月**

AWS 将 AWS Electicsearch Service 服务更新为 AWS OpenSearch Service。

## ELv2 与 SSPL 协议

事件中，以 Elastic 公司修改开源协议为重要转折点。

**ELv2**：由 Elastic 制定的源代码许可。该协议适用于 Elastic 的分发版以及 Elasticsearch 和 Kibana 所有免费和付费功能的源代码。ELv2 的目标是在尽可能宽松的情况下防止滥用。该许可允许免费使用、修改、创建衍生作品和重新分发，但有三个基本的限制条件：

* 不得将产品作为托管服务提供给其他人
* 不得规避许可密钥功能或删除/隐藏受许可密钥保护的功能
* 不得删除或隐藏任何许可协议、版权或其他声明

**SSPL**：由 MongoDB 制定的源代码许可。针对云服务提供商做出了限制，即要求云服务提供商在未对项目做出贡献的情况下，不得发布自己的开源产品即服务。SSPL 允许用户以自由且不受限制的方式使用并修改代码成果，唯一的要求是：**如果将产品以作为一种服务进行交付，那么必须同时公开发布所有关于修改及 SSPL 之下管理层的源代码。**

## 影响与选择

Elastic公司决定修改开源协议，并不会对个人用户使用造成影响，只会限制云服务厂商将开源产品转化为软件即服务的形式。对于没有获得授权的云厂商来说，除了提供到最后一个开源版本的 Elasticsearch 服务之外，就需要开始考虑其他替代方案了。

目前各大云厂商主要采取的如下两种方案：

**PlanA -** 与 Elastic 达成商业授权协议，深度合作。

**PlanB -** 未获得商业授权的云厂商，继续使用基于 ALv2 协议下的 Elasticsearch 的开源（OSS）版本，并尝试寻找新的替代方案。

目前为止，与 Elastic 达成合作的云服务供应商：Microsoft、Google、阿里巴巴、腾讯、Clever Cloud 等。

# | 新的选择？

OpenSearch 是一个社区驱动的开源搜索和分析套件，源自 Apache 2.0 许可的 Elasticsearch 7.10.2 和 Kibana 7.10.2。它由一个搜索引擎守护进程 OpenSearch 和一个可视化和用户界面 OpenSearch Dashboards 组成。OpenSearch 使人们能够轻松摄取、保护、搜索、聚合、查看和分析数据。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211117_%E8%A7%86%E9%87%8E%20%7C%20OpenSearch%EF%BC%8C%E4%BA%91%E5%8E%82%E5%95%86%E7%9A%84%E6%96%B0%E9%80%89%E6%8B%A9%EF%BC%9F/4.jpg)

OpenSearch 官网

## 演进历程

项目早期，Open Distro 的核心仍然是普通的 Elasticsearch。Amazon 对 Open Distro 所做的是为 Elasticsearch 和 Kibana 添加功能。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211117_%E8%A7%86%E9%87%8E%20%7C%20OpenSearch%EF%BC%8C%E4%BA%91%E5%8E%82%E5%95%86%E7%9A%84%E6%96%B0%E9%80%89%E6%8B%A9%EF%BC%9F/5.jpg)

**OpenSearch 实际上是 Elasticsearch 的一个分支。**

一方面 OpenSearch 正在从开源 Elasticsearch 停止的地方开始，代码中任何有 Elasticsearch 或 Kibana 引用的地方，最后都会更改为 OpenSearch 。另一方面 Open Distro 所有功能都将添加到 OpenSearch，OpenSearch 后续将致力于保持其分支开源，并得到 AWS 的支持。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211117_%E8%A7%86%E9%87%8E%20%7C%20OpenSearch%EF%BC%8C%E4%BA%91%E5%8E%82%E5%95%86%E7%9A%84%E6%96%B0%E9%80%89%E6%8B%A9%EF%BC%9F/6.jpg)

## 可替代性

如果说 Elasticsearch 提供了非常棒的能力，利用它的大数据工具来帮助进行全栈监控、自动化、数据重新平衡、IP 过滤等的各种规模的组织，那么 OpenSearch 就是致力于聚合、查看和分析数据的企业的洞察引擎解决方案。

* 从方案的角度讲，两者都提供了大数据解决方案，且底层实现一致。
* 从功能的角度讲，OpenSearch 覆盖了开源版 Elasticsearch 的所有功能，并为其提供媲美 Elasticsearch X-Pack 的商业能力。

无论 Elasticsearch 还是 OpenSearch，用户的核心需求是搜索、安全、监控、告警、跨集群同步等集群服务，后者也可以完全满足需求。

## 最新版本

从 2021 年 4 月 12 日推出 OpenSearch 项目以来，截止到现在已更新至 1.1.0 版本，虽然该版本已媲美 X-Pack 部分功能。但是目前实践上还需要更多的验证。

随着 1.1.0 的推出，OpenSearch 已经在向自己的方向前进。有许多已推出的功能和增强功能，包括：

* 添加碎片级后压框架，以提高 OpenSearch 索引的可靠性。
* 添加许多新的可观测功能，以帮助您分析跟踪和日志数据。
* OpenSearch 的 k-NN 插件将为更新的FAISS算法增加支持，以提高性能。
* 异常检测将增加信号导致特定异常的可见性。
* 扩集群复制同步能力。
## Elastic 看 OpenSearch

在 OpenSearch 服务推出后，Elastic 官网也对该服务为用户提出了一些热门问题[4]，并做出了自己的诠释。

* 什么是 OpenSearch 项目？
* 为什么 OpenSearch 项目 fork 是从 Elasticsearch 和 Kibana 创建的？
* Amazon OpenSearch Service 是否具有 Elasticsearch 中没有的任何功能？
# | 展望

在云厂商们各自的生态环境下，开发者将采用不同的模式来完成产品的迭代，从不同的产品视角来满足不同的用户需求。

可预见在未来很长一段时间里， Elasticsearch 仍然会继续引领潮流，占据该领域的霸主地位。而 OpenSearch 依托于 AWS ，相信也会成为一个优秀的搜索引擎解决方案。

许可协议限制了在云厂商的使用，开源则提供了更多的可能。当云厂商无法使用 Elasticsearch 后续版本的时候，或许可以考虑 OpenSearch。

[1]. Apache Lucene：[http://lucene.apache.org](http://lucene.apache.org)

[2]. DB-Engines：[https://db-engines.com](https://db-engines.com)

[3]. OpenSearch：[https://opensearch.org](https://opensearch.org)

[4]. What is opensearch: [https://www.elastic.co/what-is/opensearch](https://www.elastic.co/what-is/opensearch)

### 
