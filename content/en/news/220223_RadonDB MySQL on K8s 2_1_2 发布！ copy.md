---
title: "RadonDB MySQL on K8s 2.1.2 发布！"
date: 2022-02-23T16:52:11+08:00
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/news/220223_RadonDB%20MySQL%20on%20K8s%202.1.2%20%E5%8F%91%E5%B8%83%EF%BC%81/0.png
---
RadonDB 数据库容器化系列 MySQL 容器化项目新版发布！
<!--more-->
RadonDB MySQL on Kubernetes 于 2 月 17 日发布了新版本 2.1.2 。该版本在节点的重建、增删等方面进行了全面升级。

 致谢：

首先感谢 @andyli029 @acekingke @runkecheng @molliezhang 提交的修改。

# ｜什么是 RadonDB MySQL？

**RadonDB MySQL** 是一款基于 MySQL 的开源、高可用、云原生集群解决方案。支持一主多从高可用架构，并具备安全、自动备份、监控告警、自动扩容等全套管理功能。目前已经在生产环境中大规模的使用，用户包含银行、保险、传统大企业等。服务高可用由已经开源的 MySQL 集群高可用组件 **Xenon** 来实现。

随着国内外云原生技术蓬勃发展，数据库容器化实现技术趋于成熟，各大 K8s 社区用户对 MySQL on K8s 高可用的需求呼声不断。**社区决定将 RadonDB MySQL 完整的移植到 K8s 平台**，并于 2021 年将其正式开源。**项目意在为广大的 K8s 和 MySQL 开发者们，提供一款企业级的 MySQL on K8s 高可用方案**。

**RadonDB MySQL Kubernetes** 支持在 Kubernetes、KubeSphere、Rancher 等平台安装部署和管理，自动执行与运行 RadonDB MySQL 集群有关的任务。

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

# ｜新版本功能一览

1. 支持从已有节点克隆数据初始化
2. 支持重建节点
3. 支持显示节点 Raft 状态
4. 增删节点不再触发滚动更新
5. 支持一键配置镜像地址前缀
6. 增加多平台部署文档
7. 支持 e2e 测试框架

以下是完整 2.1.2 和 2.1.1 版本的 Release Notes。

# 2.1.2 Release Notes

## Features

* Clone init from follower node. #322
* Support for manual repair invalid nodes. #331
* Add E2E framework and simple testcase. #347
* Support more node role labels. #334
* Support unified setting images repository address. #378
* Add tutorials of deploy radondb mysql on rancher. #338
* Add tutorials of deploy radondb mysql on kubesphere. #152
## Improvements

* Upgrade E2E frame to Ginkgo v2. #360
* Update the description about access radondb mysql. #340
* Change the default path of the rbac proxy image. #146
* Make the versions provided by helm repo and release consistent. #352
* Add .gitignore about e2e logs and function. #381
## Bug fixes

* Fixed the cluster status cannot be changed after the POD exit abnormally. #366
* Fixed the container time zone is not consistent with the host time zone . #329
# 2.1.1 Release Notes

## Features

* Support clone initial when add new pod. #250#291
* Update replicas without restart. #282
* Support display the raft status of the node in nodes.conditions. #284#285
* charts: Support offline deployment. #300#301
* workflow: Manage Chart using Helm repo. #290#294
* workflow: Automatic code check and unit tests. #277
* Makefile: Synchronize the generated files to Chart while generating CRD. #280
## Improvements

* syncer: Make Nodes.Conditions only show the condition of the presence node. #283#286
* syncer: Keep PVC when closing the cluster. #304#308
* syncer: Optimize update POD trigger conditions. #321
* sidecar: Rewrite restore logic using golang. #292#293
* container: Optimize the directive of Mysql liveness check. #305#318
* Dockerfile: Provide backup of district/static:nonroot image. #287#296
* docs: Update deployment document. #298
## Bug fixes

* Fix the setting method of innodb_buffer_pool_instance. #244#265
* Fix bug of not effective version of mysql56. #203#217
* Fix failed to restore from backup after extending pvc. #370#291
* syncer: Fix bug of parallel updated nodes. #310#314
* syncer: Fix operator restart when closing cluster. #312#315
* container: Fix pod exception restart when high pressure. #305#318
* docs: Fix check CRD about mysqluser. #281

**欢迎大家下载体验！**

### 参考及下载链接：

1. Release Notes: [https://github.com/radondb/radondb-mysql-kubernetes/releases](https://github.com/radondb/radondb-mysql-kubernetes/releases)
2. RoadMap: [https://github.com/radondb/radondb-mysql-kubernetes/readme.md](https://github.com/radondb/radondb-mysql-kubernetes/readme.md)
