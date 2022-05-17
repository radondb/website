---
title: "RadonDB MySQL on K8s 2.1.3 发布！"
date: 2022-03-25T16:52:11+08:00
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/news/220325_RadonDB%20MySQL%20on%20K8s%202.1.3%20%E5%8F%91%E5%B8%83%EF%BC%81/RadonDB%20PostgreSQL%20on%20K8s%202.1.0%20%E5%8F%91%E5%B8%83%EF%BC%81.png
---
RadonDB 数据库容器化系列 MySQL 容器化项目新版发布！
<!--more-->
RadonDB MySQL Kubernetes 于 3 月 24 日正式发布新版本 2.1.3 [1]。该版本主要基于在 2.1.2 进行功能优化和升级。

## 致谢

首先感谢 @andyli029 @acekingke @runkecheng @mgw2168 @molliezhang 提交的修改。

# 什么是 RadonDB MySQL？

**RadonDB MySQL** 是一款基于 MySQL 的开源、高可用、云原生集群解决方案。支持一主多从高可用架构，并具备安全、自动备份、监控告警、自动扩容等全套管理功能。目前已经在生产环境中大规模的使用，用户包含 银行、保险、传统大企业等。服务高可用由已经开源的 MySQL 集群高可用组件 **Xenon** 来实现。

随着国内外云原生技术蓬勃发展，数据库容器化实现技术趋于成熟，各大 K8s 社区用户对 MySQL on K8s 高可用的需求呼声不断。社区决定将 **RadonDB MySQL 完整的移植到 K8s 平台（RadonDB MySQL Kubernetes）**，并于 2021 年将其正式开源。**项目意在为广大的 K8s 和 MySQL 开发者们，提供一款企业级的 MySQL on K8s 高可用方案。**

**RadonDB MySQL Kubernetes** 支持在 Kubernetes、KubeSphere、Rancher 等平台安装部署和管理，自动执行与运行 RadonDB MySQL 集群有关的任务。

## RoadMap

1. 支持更多方式的数据库备份恢复
2. 支持更细粒度的配置更新
3. 支持 MySQL 8.0
4. 抽象完善外部调用 API
5. 进一步提升服务质量，减少特殊场景下启停时间
6. 完善周期调度 job 功能更高效支持重复工作
7. StatefulSet 完善为 Multi StatefulSet
8. 支持在线迁移
9. 完善 e2e 测试框架，覆盖更多场景
## 项目地址

* [https://github.com/radondb/radondb-mysql-kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)
* [https://github.com/radondb/xenon](https://github.com/radondb/xenon)

## 部署文档

《[容器化 | K8s 部署 RadonDB MySQL Operator 和集群](https://radondb.com/posts/220324_%E5%AE%B9%E5%99%A8%E5%8C%96-_-%E5%9C%A8-k8s-%E4%B8%8A%E9%83%A8%E7%BD%B2-radondb-mysql-operator-%E5%92%8C%E9%9B%86%E7%BE%A4/)》

《[容器化 | 在 KubeSphere 中部署 MySQL 集群](https://radondb.com/posts/220224_%E5%AE%B9%E5%99%A8%E5%8C%96-_-%E5%9C%A8-kubesphere-%E4%B8%AD%E9%83%A8%E7%BD%B2-mysql-%E9%9B%86%E7%BE%A4/)》

# 新版本功能一览

1. 一键发布工作流
2. 支持按标签重建集群节点
3. 增加 Pod 调试模式

以下是完整 2.1.3 的 Release Notes[1]。

# 2.1.3 Release Notes

## Features

* workflow: Publish release only one click. [#](https://github.com/radondb/radondb-mysql-kubernetes/issues/421)[42](https://github.com/radondb/radondb-mysql-kubernetes/issues/421)[1](https://github.com/radondb/radondb-mysql-kubernetes/issues/421) ([#42](https://github.com/radondb/radondb-mysql-kubernetes/pull/422)[2](https://github.com/radondb/radondb-mysql-kubernetes/pull/422))
* mysqlcluster: Support automatic rebuild of nodes by label. ([#389](https://github.com/radondb/radondb-mysql-kubernetes/pull/389))
* mysqlcluster: Debug Mode for Pod [#](https://github.com/radondb/radondb-mysql-kubernetes/issues/375)[37](https://github.com/radondb/radondb-mysql-kubernetes/issues/375)[5](https://github.com/radondb/radondb-mysql-kubernetes/issues/375) ([#383](https://github.com/radondb/radondb-mysql-kubernetes/pull/383))

## Improvements

* .github: Adjust release-drafter ([#424](https://github.com/radondb/radondb-mysql-kubernetes/pull/424))
* chart: Update chart version to v2.1.3. ([#419](https://github.com/radondb/radondb-mysql-kubernetes/pull/419))
* config: Add podAntiAffinity sample yaml. [#371](https://github.com/radondb/radondb-mysql-kubernetes/issues/371) ([#393](https://github.com/radondb/radondb-mysql-kubernetes/pull/393))
* docs: Add troubleshoot.md [#387](https://github.com/radondb/radondb-mysql-kubernetes/issues/387) ([#414](https://github.com/radondb/radondb-mysql-kubernetes/pull/414))
* docs: Add offline deployment document. [#396](https://github.com/radondb/radondb-mysql-kubernetes/issues/396) ([#399](https://github.com/radondb/radondb-mysql-kubernetes/pull/399))
* docs: Add a description of `service_name` connection method [#401](https://github.com/radondb/radondb-mysql-kubernetes/issues/401) ([#402](https://github.com/radondb/radondb-mysql-kubernetes/pull/402))

## Bug Fixes

* cmd: Change HttpServer stop channel to buffered channel. [#411](https://github.com/radondb/radondb-mysql-kubernetes/pull/411) ([#411](https://github.com/radondb/radondb-mysql-kubernetes/pull/411))
* status: Skip the unavailable node and set default node status. [#417](https://github.com/radondb/radondb-mysql-kubernetes/issues/417) ([#418](https://github.com/radondb/radondb-mysql-kubernetes/pull/418))
* container: Add xenoncli check in the liveness probe. ([#405](https://github.com/radondb/radondb-mysql-kubernetes/pull/405))
* syncer: Uniform use of global variables set role labels. ([#394](https://github.com/radondb/radondb-mysql-kubernetes/pull/394))
* hack: Change Xenon's Dockerfile image branch to master. [#336](https://github.com/radondb/radondb-mysql-kubernetes/issues/336) ([#392](https://github.com/radondb/radondb-mysql-kubernetes/pull/392))
欢迎大家下载体验！


**参考及下载链接：**

[1]. Release Notes: [https://github.com/radondb/radondb-mysql-kubernetes/releases](https://github.com/radondb/radondb-mysql-kubernetes/releases)

[2]. RoadMap: [https://github.com/radondb/radondb-mysql-kubernetes/readme.md](https://github.com/radondb/radondb-mysql-kubernetes/readme.md)



