---
title: "RadonDB ClickHouse on K8s 2.1.0 发布！"
date: 2021-11-04T16:52:11+08:00
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/cover/211104.png
---
RadonDB ClickHouse Kubernetes 于 10 月 29 日发布了第三个版本 2.1.0 [1]。该版本也是由 Operator 方式实现的第二个版本。
<!--more-->
RadonDB ClickHouse Kubernetes 于 10 月 29 日发布了第三个版本 2.1.0 [1]。该版本也是由 Operator 方式实现的第二个版本。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/211104_RadonDB%20ClickHouse%20on%20K8s%202.1.0%20%E5%8F%91%E5%B8%83%EF%BC%81/1.jpg)

## 致谢

首先感谢 @dbkernel @su-houzhen @TCeason @wufan @molliezhang 提交的修改。

# | 什么是 RadonDB ClickHouse？

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/211104_RadonDB%20ClickHouse%20on%20K8s%202.1.0%20%E5%8F%91%E5%B8%83%EF%BC%81/2.jpg)

**RadonDB ClickHouse** 是一个分布式实时分析型列式存储数据库。具备高性能，支撑PB级数据，提供实时分析，稳定可扩展等特性。适用于数据仓库、BI报表、监控系统、互联网用户行为分析、广告投放业务以及工业、物联网等分析和时序应用场景。

**RadonDB ClickHouse Kubernetes** 支持在 **Kubernetes** 和 **KubeSphere** 上安装部署和管理，自动执行与运行 RadonDB ClickHouse 集群有关的任务。

**RadonDB ClickHouse Kubernetes** 从 2.0.0 开始，已经由 Helm 迁移至 Operator 方式实现，并且完全兼容 1.0 版本的所有功能特性。

**RadonDB ClickHouse Kubernetes** 基于 [https://github.com/Altinity/clickhouse-operator](https://github.com/Altinity/clickhouse-operator) 实现并改进，后续会持续回馈给社区。

**代码仓库地址**：

* Operator：[https://github.com/radondb/radondb-clickhouse-operator](https://github.com/radondb/radondb-clickhouse-operator)
* Helm Chart：[https://github.com/radondb/radondb-clickhouse-kubernetes](https://github.com/radondb/radondb-clickhouse-kubernetes)
# | 新版本功能一览

**1. 支持自动创建ZooKeeper 依赖**

开启该功能后，ZooKeeper 集群将由 Operator 创建并配置到 ClickHouse 集群中，用户无需再额外创建和管理。

**2. 丰富集群状态粒度**

在原有三种集群状态（处理中、处理完成、删除中）的基础上，新增创建中、运行中、创建失败、删除失败四种状态。原处理相关状态则转而代表更新状态。

**3. 支持磁盘动态扩容**

可修改 yaml 存储容量，自动升级扩容存储，并升级数据库集群。

**4. 支持 ClickHouse 集群监控**

开启监控功能后，将创建监控服务并自动对接 Prometheus。

**5. 优化代码和迭代更新**

**6. 完善单元测试**

# | RoadMap

后续 RadonDB ClickHouse Kubernetes 的技术路线：

1. 增加 Secret 支持
2. 支持更细粒度的配置更新
3. 支持集群层面的数据库备份恢复
4. 进一步提升服务质量，减少特殊场景下启停时间
5. 支持自动化 e2e 测试

**期待更多开发者参与到开源项目中来！**

以下是 2.1.0 和 2.0.0 版本完整的 Release Notes 。

# 2.1.0 Release Notes

## Features

* Change version from 2.0 to 2.1
* Create/delete zookeeper when create/delete clickhouse
* Rename `status` to `state`
* Add describle about cluster parameter
# 2.0.0 Release Notes

## Features

* Support deploy ClickHouse & ClickHouse Operator via Helm Charts
* Support create ClickHouse cluster based on Custom Resource specification provided
* Support customizing K8S resources through templates, include Pod, Service, VolumeClaimTemplates
* ClickHouse configuration and settings, including Zookeeper integration
* CRD Compatible api extension version v1
* Pod Disk expansion support qingcloud-csi
* Remote server config add physical & logical cluster
* ClickHouse Cluster scaling including automatic schema propagation
* Support ClickHouse version upgrades
* Exporting ClickHouse metrics to Prometheus
* Node management、Automatic failover、Automatic rebuild node
## Improvements

* Add the README and deploy documents
* Modify grafana dashboard: ck query dashboard
* Add more clickhouse cluster status:  `create`,  `running`,  `create failed`,  `update failed`
## Bug fixes

* Fix api extension version error
* Fix remote server config generate

欢迎大家下载体验！

## 参考及下载链接

[1]. Release Notes: [https://github.com/radondb/radondb-clickhouse-operator/releases](https://github.com/radondb/radondb-clickhouse-operator/releases) 

