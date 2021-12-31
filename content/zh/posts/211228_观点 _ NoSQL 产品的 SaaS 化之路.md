---
title: "观点 | NoSQL 产品的 SaaS 化之路"
date: 2021-12-28T15:39:00+08:00
author: "王奇"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - Redis
  - MongoDB
  - MongoDB
  - OpenSearch
  - SaaS
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/211228_%E8%A7%82%E7%82%B9%20%7C%20NoSQL%20%E4%BA%A7%E5%93%81%E7%9A%84%20SaaS%20%E5%8C%96%E4%B9%8B%E8%B7%AF/0.png
---
随着工业互联网时代的来临，NoSQL 数据库技术从 2009 年兴起到现在已经十多年了。在国内数字化转型的大趋势下，NoSQL 数据库扮演着重要角色，企业级的应用也出现了越来越多的机遇与挑战。
<!--more-->
王奇 顾问软件工程师

目前从事 PaaS 中间件服务（Redis / MongoDB / ELK 等）开发工作，对 NoSQL 数据库有深入的研究以及丰富的二次开发经验，热衷对 NoSQL 数据库领域内的最新技术动态的学习，能够把握行业技术发展趋势。 

-------------------------------

# 引言

随着工业互联网时代的来临，NoSQL 数据库技术从 2009 年兴起到现在已经十多年了。在国内数字化转型的大趋势下，NoSQL 数据库扮演着重要角色，企业级的应用也出现了越来越多的机遇与挑战。

# NoSQL 都在干什么？

根据 DB-Engines 趋势流行度排名可知，以 MongoDB 为代表的非关系型数据库表现不俗。MongoDB 排行第五，紧跟其后的是 Redis 和 Elasticsearch，这三款产品常年位居 TOP 10。它们的流行离不开成功的开源运营模式。

下图是 DB-Engines 从2013-2021年的数据库流行度排名：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211228_%E8%A7%82%E7%82%B9%20%7C%20NoSQL%20%E4%BA%A7%E5%93%81%E7%9A%84%20SaaS%20%E5%8C%96%E4%B9%8B%E8%B7%AF/1.jpg)

更值得注意的是 NoSQL 推出的 SaaS 化产品。以 MongoDB 和 Elastic 为例。

* MongoDB  Atlas 实现持续强劲的增长
* Elasticsearch  Cloud 服务表现超出预期
## MongoDB 财报情况

收入为 2.27 亿美元，同比增长 50%。其中订阅收入为 2.179 亿美元，同比增长 51%，服务收入为 900 万美元，同比增长 35%。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211228_%E8%A7%82%E7%82%B9%20%7C%20NoSQL%20%E4%BA%A7%E5%93%81%E7%9A%84%20SaaS%20%E5%8C%96%E4%B9%8B%E8%B7%AF/2.jpg)

从2021 第三季度财务情况（截止 20211031）来看，第三季度又是 MongoDB 表现出色的一个季度，其中 Atlas 收入增长了 84%，公司的客户数量增加到 31,000 多个。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211228_%E8%A7%82%E7%82%B9%20%7C%20NoSQL%20%E4%BA%A7%E5%93%81%E7%9A%84%20SaaS%20%E5%8C%96%E4%B9%8B%E8%B7%AF/3.jpg)

>图片来源：[https://www.mongodb.com](https://www.mongodb.com) 
MongoDB 股价暴涨，成唯一市值超 300 亿美元的开源上市公司。

## Elastic 财报情况

总收入为 2.060 亿美元，同比增长 42%，按固定汇率计算增长 41%。订阅客户总数超过 17,000 人。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211228_%E8%A7%82%E7%82%B9%20%7C%20NoSQL%20%E4%BA%A7%E5%93%81%E7%9A%84%20SaaS%20%E5%8C%96%E4%B9%8B%E8%B7%AF/4.jpg)

从2021 第二季度财务情况（截至 20211031）来看，第三季度 Elastic Cloud 收入为 6900 万美元，按报告和固定汇率计算，同比增长 84%。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211228_%E8%A7%82%E7%82%B9%20%7C%20NoSQL%20%E4%BA%A7%E5%93%81%E7%9A%84%20SaaS%20%E5%8C%96%E4%B9%8B%E8%B7%AF/5.jpg)

>图片来源：[https://www.elastic.co](https://www.elastic.co) 
强劲的第二季度业绩得益于 Elastic Cloud 的快速采用，预计 Elastic Cloud 收入在未来三年内将超过总收入的 50%。

根据 MongoDB Atlas 的 DBaaS 和 Elastic Cloud 的 SaaS 服务可以推断，在未来流行的 NoSQL 数据库大概率会推出自己的 SaaS 服务，依托于自身强大的技术背景，并结合产品优势来降低复杂性、自动化运营，可更快地做出数据驱动的决策。

# 二、NoSQL 与云厂商

国内外云厂商先后都提供了主流 NoSQL 服务，比如 Redis、MongoDB、Memcached 等，部分云厂商甚至是推出了基于 NoSQL 内核的新产品。在云厂商各自的生态环境下，开发者采用不同的模式完成了产品的迭代，云厂商从不同的视角满足了不同的用户需求。

开源背景下成长的 NoSQL 成为主流技术方案之后，都要面对商业化的问题。然而在商业化的过程中，开源社区与云厂商天然地存在一些冲突。

以 Elasticsearch 为例，可预见在未来很长一段时间里，Elasticsearch 仍会继续引领潮流，保持技术领先。而 OpenSearch 依托于 AWS ，相信也会成为一款优秀的搜索引擎解决方案。更多事件报道：《视野 | OpenSearch，云厂商的新选择？》

NoSQL 开源产品可以通过修改许可协议，重新定义与云厂商合作的规范，这也为 NoSQL 健康发展提供一种可借鉴策略。

# 三、NoSQL 产品 SaaS 化进程

目前，NoSQL 数据库市场仍在高速增长，2021～2025 年均复合增速可高达 13%。从 Redis、MongoDB Atlas 和 Elastic Cloud 的表现可看出，NoSQL 数据库服务通过前沿的自动化技术和方案实践，能确保可用性和可扩展性，并满足数据安全性和合规性规范要求。

如今，国外开源软件的 SaaS 化服务已经被企业接受。国内市场在数字化转型的浪潮下，越来越多的企业也逐步接受开源软件以 SaaS 化的形式完成技术的转型。依托云原生、Serverless 等技术，将为企业持续降低成本，提供更专业的服务，让企业专注于业务本身。

