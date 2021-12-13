---
title: "云原生 | 混沌工程工具 ChaosBlade Operator 入门篇"
date: 2021-07-15T15:39:00+08:00
author: "丁源"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - 云原生
  - Kubernetes
  - KubeSphere
  - ChaosBlade
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210715_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20%E5%85%A5%E9%97%A8%E7%AF%87/0.png
---
快速了解面向云原生的混沌工具 ChaosBlade Operator 的部署和实验环境。
<!--more-->
>作者：丁源 RadonDB 测试负责人
>负责 RadonDB 云数据库、容器化数据库的质量性能测试，迭代验证。对包括云数据库以及容器化数据库性能和高可用方案有深入研究。 

近日，国内多家网站同时发生短期服务不可用现象，一夜冲上圈内热搜。据官方答复，是由于部分服务器机房发生故障，导致网站无法访问。为了避免这种情况，提高系统架构的可靠性，保障业务的连续性，希望能在故障之前找到导致 “崩盘” 的缺口。

十多年前，国外的互联网公司就已经在云化、分布式、微服务等前沿技术的使用过程中，遇到了类似的问题，并由此诞生了**混沌工程**。

## 什么是混沌工程？

混沌工程即 Chaos Engineering[1]，被定义为 **在分布式系统上进行实验的学科，目的是建立对系统抵御生产环境中失控条件的能力以及信心**。混沌工程属于一门新兴的技术学科，是一种提高技术架构弹性能力的复杂技术手段。最早由 Netflix 技术部门创建了名为 Chaos Monkey 的项目，通过随机性测试，来检测系统架构的健康情况，并设计足够的预案来应对可能到来的新一轮故障。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210715_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20%E5%85%A5%E9%97%A8%E7%AF%87/1.png)

随着云化技术的发展和云原生(Cloud Native)的概念的提出，混沌工程的反脆弱哲学思想，也引入了云原生体系，可简单高效地为系统提高容错能力。

## 什么是 ChaosBlade Operator？

ChaosBlade[2] 是阿里巴巴开源的一款遵循混沌工程原理和混沌实验模型的实验注入工具，帮助企业提升分布式系统的容错能力，并且在企业上云或往云原生系统迁移过程中业务连续性保障。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210715_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20%E5%85%A5%E9%97%A8%E7%AF%87/2.png)

而ChaosBlade Operator[3] 是 Kubernetes 平台实验场景的实现，将混沌实验通过 Kubernetes 标准的 CRD 方式定义，很方便的使用 Kubernetes 资源操作的方式来创建、更新、删除实验场景，包括使用 kubectl、client-go 等方式执行，而且还可以使用上述的 chaosblade cli 工具执行。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210715_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20%E5%85%A5%E9%97%A8%E7%AF%87/3.png)

把实验定义为 Kubernetes CRD 资源，将实验模型中的四部分映射为 Kubernetes 资源属性，完美将混沌实验模型与 Kubernetes 声明式设计结合在一起（依靠混沌实验模型便捷开发场景，并结合 Kubernetes 设计理念）。

* **通过 kubectl 或者编写代码直接调用 Kubernetes API** 来创建、更新、删除混沌实验，可清晰获取资源模拟实验的执行状态，实现 Kubernetes 故障注入的标准化。
* **通过 Chaosblade cli 方式** 可非常方便的执行 Kubernetes 实验场景，查询实验状态等。
* ChaosBlade 混沌实验模型与 Kubernetes CRD 的结合，实现 **基础资源、应用服务、Docker 容器** 等场景复用，方便 Kubernetes 场景的扩展。
### 支持的场景

目前支持的实验场景由以下三大类（持续更新中）：

|分类|资源种类|详细场景|

 |:----|:----|:----|:----|

 |Node|CPU|指定 CPU 使用率|

 |    |网络|指定网卡、端口、IP 包延迟、丢包、包阻塞、包重复、包乱序、包损坏等。|

 |    |进程|指定进程 Hang、强杀指定进程等|

 |    |磁盘|指定目录磁盘填充、磁盘 IO 读写负载等|

 |    |内存|指定内存使用率|

 |Pod|网络|指定网卡、端口、IP 等包延迟、丢包、包阻塞、包重复、包乱序、包损坏等|

 |    |磁盘|指定目录磁盘填充、磁盘 IO 读写负载等|

 |    |内存|指定内存使用率|

 |    |Pod|杀 Pod|

 |Container|CPU|指定 CPU 使用率|

 |    |网络|指定网卡、端口、IP 等包延迟、丢包、包阻塞、包重复、包乱序、包损坏等|

 |    |进程|指定进程 Hang、强杀指定进程等|

 |    |磁盘|指定目录磁盘填充、磁盘 IO 读写负载等|

 |    |内存|指定内存使用率|

 |    |Container|杀 Container|

## 部署 ChaosBlade Operator

执行 Kubernetes 实验场景前，需**提前部署**ChaosBlade Operator。

>Helm 包下载地址：
>[https://github.com/chaosblade-io/chaosblade-operator/releases](https://github.com/chaosblade-io/chaosblade-operator/releases) 

*本系列文章默认 Helm v3 版本*

**注意：需要新建一个 namespace ！**

部署指令：

```plain
helm install kube-system/chaosblade-operator-1.2.0-v3.tgz
helm install chaosblade-operator chaosblade-operator-1.2.0-v3.tgz --namespace chaosblade
```
回显示例：
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210715_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20%E5%85%A5%E9%97%A8%E7%AF%87/4.png)

ChaosBlade Operator 启动后，将在每个节点分别部署 `chaosblade-tool` 和 `chaosblade-operator` Pod。通过如下指令查看部署结果，若 Pod 都处于 Running 状态，则部署成功。

```plain
kubectl get pod -n chaosblade -o wide | grep chaosblade
```
查询部署结果示例：
 

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210715_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20%E5%85%A5%E9%97%A8%E7%AF%87/5.png)

>关于部署失败的常见原因，请关注后续 **混沌工程工具系列** 专题介绍。 
## 实验环境

本系列文章将使用在 KubeSphere 上安装的 ChaosBlade Operator，对 RadonDB 系列容器化产品进行测试。

**KubeSphere 环境参数：**

* 规格 8 核 16G
* 磁盘大小 500GB
* 节点数 4

在 KubeSphere 环境部署成功后，控制台状态如下图所示。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210715_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20%E5%85%A5%E9%97%A8%E7%AF%87/6.png)

## 参考

[1]. 混沌工程原则：[https://principlesofchaos.org](https://principlesofchaos.org)

[2]. ChaosBlade:[https://github.com/chaosblade-io/chaosblade](https://github.com/chaosblade-io/chaosblade)

[3]. ChaosBlade Operator：[https://github.com/chaosblade-io/chaosblade-operator](https://github.com/chaosblade-io/chaosblade-operator)

[4].Kubernetes中文文档：[https://chaosblade-io.gitbook.io/chaosblade-help-zh-cn/blade](https://chaosblade-io.gitbook.io/chaosblade-help-zh-cn/blade) 

