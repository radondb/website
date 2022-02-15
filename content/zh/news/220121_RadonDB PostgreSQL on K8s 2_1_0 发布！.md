---
title: "RadonDB PostgreSQL on K8s 2.1.0 发布！"
date: 2022-01-21T16:52:11+08:00
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/news/220121_RadonDB%20PostgreSQL%20on%20K8s%202_1_0%20%E5%8F%91%E5%B8%83%EF%BC%81/RadonDB%20PostgreSQL%20on%20K8s%202.1.0%20%E5%8F%91%E5%B8%83%EF%BC%81.png
---
RadonDB 数据库容器化系列 PostgreSQL 容器化项目新版发布！
<!--more-->
RadonDB PostgreSQL Operator 于 1 月 21 日发布了 2.1.0[1]。

致谢：

首先感谢 @zhl003 @zlianzhuang @molliezhang 提交的修改。

# **| 什么是 RadonDB PostgreSQL？**

**RadonDB PostgreSQL** 是一款基于 PostgreSQL 使用 Operator 实现的数据库容器化项目。

* 被广泛应用于地理空间和移动领域
* 具备高可用、稳定性、数据完整性等性能
* 支持在线水平扩展
* 支持故障自动转移 ，提供 HA 功能
* 提供 PostgreSQL 常用参数接口，方便调整参数
* 提供 PostGIS 插件，具备存储、查询和修改空间关系的能力
* 提供实时监控、健康检查、日志自动清理等功能
**RadonDB PostgreSQL Operator** 可基于 KubeSphere、OpenShift、Rancher 等 Kubernetes 容器平台交付。自动执行与运行 RadonDB PostgreSQL 集群有关的任务。

**RadonDB PostgreSQL Operator** 基于 [https://github.com/CrunchyData/postgres-operator](https://github.com/CrunchyData/postgres-operator) 这个项目实现，进行了改进优化，后续会持续回馈给社区。

**代码仓库地址：**

* [https://github.com/radondb/radondb-postgresql-operator](https://github.com/radondb/radondb-postgresql-operator)
# **| 新版本功能一览**

1. **PostgreSQL 11.13、14.1内核版本支持**
在 2.0.0 版本支持 PostgreSQL 12.7 及 13.3 内核版本的基础上，2.1.0 版本还支持了 PostgreSQL  11.13 和 14.1 内核版本。

2. **更灵活的集群管理**
集群中默认安装集群管理客户端容器，便于集群运维和管理。

3. **更简便的集群创建流程**
优化集群创建的流程，提升部署体验。


# | RoadMap

后续 RadonDB PostgreSQL Kubernetes 技术路线：

1. 通过 custom resource 定义所有资源
2. 自定义数据库用户角色功能
3. 参数模板功能支持
# **2.1.0 Release Notes**

### Features

* Support PostgreSQL versions 11.13 and 14.1.
* Auto update namespace when create cluster with exsiting namespace. 
* Add servicemonitor that can export  metrics outside of cluster. 
### Improvements

* `pgo` client container enabled when deploy operator by default.
* add quickstart guid  that can run a minimum cluster in 3~5 minutes.
### Bug fixes

* fix pgo cli  parameter prompt info error.
* fix deploy pgo client using curl is unreachable. 
 

# **2.0.0 Release Notes**

### Features

* Support PostgreSQL versions 12.7 and 13.3.
* All kernel versions support PostGis plugin
* Support Scale Out and Scale Up
* High-availability based on distributed consensus protocol
* Support synchronous/asynchronous streaming replication
* Rich display of monitoring indicators  
欢迎大家体验！

**参考及下载链接：**

[1]. Release Notes: [https://github.com/radondb/radondb-postgresql-operator/releases](https://github.com/radondb/radondb-postgresql-operator/releases)

