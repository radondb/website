---
title: "RadonDB MySQL on K8s 2.1.0 发布！"
date: 2021-11-02T16:00:00+08:00
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/cover/211102.png
---
RadonDB MySQL Kubernetes 于 10 月 22 日发布了第四个版本 2.1.0 [1]。该版本也是由 Operator 方式实现的第二个版本。
<!--more-->
RadonDB MySQL Kubernetes 于 10 月 22 日发布了第四个版本 2.1.0 [1]。该版本也是由 Operator 方式实现的第二个版本。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/211102_RadonDB%20MySQL%20on%20K8s%202.1.0%20%E5%8F%91%E5%B8%83%EF%BC%81/1.jpg)

**该项目的开源，意在为广大的 K8s 和 MySQL 开发者们，提供一款企业级的 MySQL on K8s 高可用解决方案。**

## 致谢

首先感谢 @andyli029 @hustjieke @zhyass @runkecheng @acekingke @molliezhang 提交的修改。

# | 什么是 RadonDB MySQL？

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/211102_RadonDB%20MySQL%20on%20K8s%202.1.0%20%E5%8F%91%E5%B8%83%EF%BC%81/2.jpg)

**RadonDB MySQL** 是一款基于 MySQL 的开源、高可用、云原生集群解决方案。支持一主多从高可用架构，并具备安全、自动备份、监控告警、自动扩容等全套管理功能。目前已经在生产环境中大规模的使用，用户包含银行、保险、传统大企业等。服务高可用由已经开源的 MySQL 集群高可用工具 **Xenon** 来实现。

随着近几年国内外云原生技术蓬勃发展，数据库容器化实现技术也趋于成熟。各大 K8s 社区用户对 MySQL on K8s 高可用版本的需求呼声不断。**社区决定将 RadonDB MySQL 完整的移植到 K8s 平台（RadonDB MySQL Kubernetes）**，并于今年将其正式开源。

**RadonDB MySQL Kubernetes** 支持在 **Kubernetes** 和 **KubeSphere** 上安装部署和管理，自动执行与运行 RadonDB MySQL 集群有关的任务。

**RadonDB MySQL Kubernetes 从 2.0.0 开始，已经由 Helm 迁移至 Operator 方式实现，并且完全兼容 1.0 版本的所有功能特性。**

**代码仓库地址：**

* [https://github.com/radondb/radondb-mysql-kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)
* [https://github.com/radondb/xenon](https://github.com/radondb/xenon)
# | 新版本功能一览

**1. 增加 MySQL 集群服务监控**

开启监控功能后，将创建监控服务并自动对接 Prometheus。

**2. 基于 S3 的数据库备份恢复**

只要拥有 S3 对象存储的 bucket 与 API key，直接将 Pod 的数据库内容备份到 S3 对象存储中，也可以从 S3 对象存储中的备份恢复出新的数据库集群。

**3. 完善数据库账户管理**

通过 CR 管理 MySQL 用户。对 CR 的增删改将自动转化为对相应用户的操作，支持针对数据库，表授权。

**4. 支持磁盘动态扩容**

可修改 yaml 存储容量，自动升级扩容存储，并升级数据库集群。

**5. 优化优雅启停逻辑**

**6. 丰富集群状态粒度**

支持集群中间状态显示，例如：初始化中，更新中等；新增集群状态已关闭。

**7. 支持外网服务访问**

**8. 优化代码和迭代更新**

**9. 完善单元测试**

**10. 丰富工作流和 Travis CI 支持自动构建镜像，格式检查，单元测试**

# | RoadMap

后续 RadonDB MySQL Kubernetes 的技术路线：

1. 支持更多方式的数据库备份恢复
2. StatefulSet 完善为 Multi StatefulSet
3. 支持更细粒度的配置更新
4. 支持 MySQL 8.0
5. 抽象完善外部调用 API
6. 进一步提升服务质量，减少特殊场景下启停时间
7. 完善周期调度 job 功能更高效支持重复工作
8. 支持在线迁移

**期待更多开发者参与到开源项目中来！**

以下是 2.1.0 和 2.0.0 版本完整的 Release Notes 。

# 2.1.0 Release Notes

## Features

* Add serviceMonitor for operator #169 #174
* Backup to S3 and restore from S3 #116 #144 #197
* Add ci for images management and greeting. #207
* Support user management through crd. #175 #198 #228
* Support extranet access service. #251 #252
* Make the cluster state cover more scenarios. #253 #264
## Improvements

* Change the related name of qingcloud to the name related to radondb. #190
* Format the code with gofumpt #212 #213
* Simplify backup code #226 #227
* Modify the default name and password #191 #233
* Optimize the logic of creating sqlrunner. #229 #230
* Remove the helm version deployment document link and fix operator deployment document. #241
* Add user management tutorial. #245 #260
* Change kind type cluster to mysqlcluster #249 #261

## Bug fixes

* Fix the bug for preUpdate #184 #185
* Fix the bug for status reset leader #178 #180
* Fix default mysql version 5.7.33 to 5.7.34 #205
* Fix the bug which historyLimit do not work #222 #223
* Fix the bug for infinite loop #201, #219 #206
* Xenon postStart script loop forever #201
* Fix the bug which historyLimit do not work #222 #223
* Fix make test fail by init sidercar test #256 #259
* Fix typo randondb to radondb #266 #267
* Fix the problem of password conflict between backup and user management of root user. #257 #268

# 2.0.0 Release Notes

## Improvements

* Add post-start and pre-stop script #155
* Add PreStop for xenon container #145
* Move the charts images and change the key word #140 #142
* Support roll update #133 #121
* Unit test for container, cluster #131 #130
* Add the document about the deployment of operator version #132 #127
* Update the path of helm chart #126 #129
* Update mysql version to 5.7.34 #124 #123
* Add status api to support update the cluster status #120 #119
* Add operator sidecar #120 #117
* Update the config files, helm files, the Dockerfile, Makefile #120
* Update kubebuilder from v2 to v3 #114 #113
* Modify the repo #112
* Adjust the dir for operator #111
* Add operator init #123 #109
* Add rolling update feature code annotation #165
* Add ignore dir `vendor` and `testbin` #153 #154

## Bug Fixes

* Fix the auditLog container #181 #179
* Fix the incorrect description about MetricsOpts #177
* Fix the bug about PostStartHookError that command 'sh -c /scripts/post-start.sh' exited with 126 #171
* Fix the path from docker to radondb #167
* Fix the bug about the pods‘s status when the yaml have been changed #166 #164 #161 #158
* Fix the bug that xenoncli cannot create user #163 #162
* Fix the bug about reflect.SliceHeader vet error when go 1.16.6 #141 #139
* Move the init.sql to mysql config dir radondb #128
* Fix the bug that `innodb_buffer_pool_size` cannot be set correctly when its size greater than int32 #125

欢迎大家下载体验！

# 参考及下载链接

[1]. Release Notes: [https://github.com/radondb/radondb-mysql-kubernetes/releases](https://github.com/radondb/radondb-mysql-kubernetes/releases)

[2]. RoadMap: [https://github.com/radondb/radondb-mysql-kubernetes/readme.md](https://github.com/radondb/radondb-mysql-kubernetes/readme.md)

