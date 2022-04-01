---
title: "工具 | PG 集群复制管理工具 repmgr"
date: 2021-12-01T15:39:00+08:00
author: "颜博"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - PostgreSQL
  - 源码
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/211201_%E5%B7%A5%E5%85%B7%20%7C%20PG%20%E9%9B%86%E7%BE%A4%E5%A4%8D%E5%88%B6%E7%AE%A1%E7%90%86%E5%B7%A5%E5%85%B7%20repmgr/0.png
---
repmgr 是一套开源工具，用于管理 PostgreSQL 服务器集群内的复制和故障转移。repmgr 支持并增强了 PostgreSQL 的内置流复制，它提供了一个单一的读/写主服务器和一个或多个只读备用服务器。
<!--more-->
作者：颜博 青云科技数据库研发工程师

目前从事 PostgreSQL 产品开发工作，热衷于 PostgreSQL 数据库的学习和研究 

-----------------------

# | REPMGR 简介

repmgr[1] 是一套开源工具，用于管理 PostgreSQL 服务器集群内的复制和故障转移。repmgr 支持并增强了 PostgreSQL 的内置流复制，它提供了一个单一的读/写主服务器和一个或多个只读备用服务器。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211201_%E5%B7%A5%E5%85%B7%20%7C%20PG%20%E9%9B%86%E7%BE%A4%E5%A4%8D%E5%88%B6%E7%AE%A1%E7%90%86%E5%B7%A5%E5%85%B7%20repmgr/1.jpg) 


repmgr 流复制管理工具对 PostgreSQL 集群节点的管理是基于分布式的管理方式。集群每个节点都具备一个 repmgr.conf 配置文件，用来记录本节点的 ID、节点名称、连接信息、数据库的 PGDATA 目录等配置参数。在完成参数配置后，就可以通过 repmgr 命令实现对集群节点的 “**一键式**” 部署。

repmgr 架构图（图片来源：[https://repmgr.org/](https://repmgr.org/) ）如下：
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211201_%E5%B7%A5%E5%85%B7%20%7C%20PG%20%E9%9B%86%E7%BE%A4%E5%A4%8D%E5%88%B6%E7%AE%A1%E7%90%86%E5%B7%A5%E5%85%B7%20repmgr/2.jpg)

集群节点部署完成后，每个节点都可通过 repmgrd 守护进程来监控节点数据库状态；每个节点元数据表可独立维护，这些元数据表将记录所有集群节点的信息。

## 选举原理

在发生 Auto Failover 时，备节点在尝试多次连接主节点失败后（尝试次数及尝试间隔可以通过 repmgr.conf 配置文件修改），repmgrd 会在所有备节点中选举一个候选备节点（选举机制参考下文）提升为新主节点，其他备节点去 Follow 到该新主上，形成一个新的集群。

repmgr 选举候选备节点按照以下顺序选举：LSN > Priority > Node_ID

* 系统将优先选举一个 LSN 较大的节点，作为候选备节点；
* 若 LSN 一样，会根据 Priority 优先级进行比较（该优先级是在配置文件中进行参数配置，如果 Priority 为 0，则代表该节点被禁止提升为主节点）；
* 若优先级也一样，会比较节点的 Node ID，小者会优先选举。
## 两个工具

repmgr 主要提供了 repmgr 和 repmgrd 两个工具。

repmgr 是一个执行管理任务的命令行工具，方便进行 PostgreSQL 服务器集群的管理。具备以下功能特点：

* 设置备用服务器
* promote 备
* 主从切换
* 显示复制集群中服务器的状态
repmgrd 是一个守护进程，它主动监视复制集群中的服务器并支持以下任务：

* 监控和记录复制集群信息
* 故障检测、故障转移
* 集群中事件的通知（需要自定义脚本接受通知）
## 用户与元数据

为了有效地管理复制集群，repmgr 需要将集群中节点的相关信息存储在 repmgr 专用数据库表中。此架构由 repmgr 扩展自动创建，该扩展在初始化由 repmgr 管理的集群（repmgr primary register）的第一步中安装，并包含以下对象：

* Tables：
    * `repmgr.events`: records events of interest
    * `repmgr.nodes`: 复制集群中每个节点的连接和状态信息
    * `repmgr.monitoring_history`: repmgrd 写入的历史备用监控信息
* Views：
    * `repmgr.show_nodes`: 基于 `repmgr.nodes` 表，另外显示服务器上游节点的名称
    * `repmgr.replication_status`: 当启用 repmgrd 的监控时，显示每个 standby 的监控状态。repmgr 元数据信息可以存储在已有的数据库或在自己的专用数据库。
>注意：repmgr 元数据信息不能存储在不属于 repmgr 管理的复制集群的 PostgreSQL 服务器上。repmgr 需要一个可以访问数据库和执行必要的更改的用户，该用户可以不是超级用户，但是某些操作（例如 repmgr 扩展的初始安装）将需要超级用户连接（可以在需要时使用命令行选项指定 --superuser）。 
# | 安装 repmgr

>注意：必须在集群的所有节点安装相同的 “主要” repmgr 版本（例如 5.2.1.x）[2]。 
## repmgr 版本

|repmgr 版本|支持的 PostgreSQL 版本|最新版本|
|:----|:----|:----|
|repmgr 5.2|9.4, 9.5, 9.6, 10, 11, 12, 13|5.2.1 (2020-12-07)|
|repmgr 5.1|9.3, 9.4, 9.5, 9.6, 10, 11, 12|5.1.0 (2020-04-13)|
|repmgr 5.0|9.3, 9.4, 9.5, 9.6, 10, 11, 12|5.0 (2019-10-15)|
|repmgr 4.x|9.3, 9.4, 9.5, 9.6, 10, 11|4.4 (2019-06-27)|

* repmgr 2.x 和 3.x 系列不再维持，不在此罗列。
* repmgr 5.0 发布之后，将不会再发布 repmgr 4.x 系列。
## 安装过程

以 repmgr 5.2.x 版本为例，从源码仓库，Clone 并安装 repmgr。

```plain
$ git clone https://github.com/EnterpriseDB/repmgr
$ git checkout REL5_2_STABLE
$ cd repmgr/
./configure
$ make install
```
make install 成功后，pg_bin_path 里会有 repmgr、repmgrd 两个可执行文件。
# | 使用 repmgr

repmgr 工具的基本语法[3]：

```plain
repmgr [OPTIONS] primary {register|unregister}
repmgr [OPTIONS] standby {register|unregister|clone|promote|follow|switchover}
repmgr [OPTIONS] node    {status|check|rejoin|service}
repmgr [OPTIONS] cluster {show|event|matrix|crosscheck|cleanup}
repmgr [OPTIONS] witness {register|unregister}
repmgr [OPTIONS] service {status|pause|unpause}
repmgr [OPTIONS] daemon  {start|stop}
```
* 一般配置选项
```plain
  -b, --pg_bindir=PATH    PostgreSQL 二进制文件的路径（可选）
  -f, --config-file=PATH  repmgr 配置文件的路径
  -F, --force             强制执行有潜在危险的操作
```
* 数据库连接选项
```plain
  -d, --dbname=DBNAME     要连接的数据库（默认：“postgres”）
  -h, --host=HOSTNAME     数据库服务器主机
  -p, --port=PORT         数据库服务器端口（默认：“5432”）
  -U, --username=USERNAME 要连接的数据库用户名（默认：“postgres”）
```
* 特定于节点的选项
```plain
  -D, --pgdata=DIR        节点数据目录的位置
  --node-id               通过id指定节点（仅适用于部分操作）
  --node-name             按名称指定节点（仅适用于部分操作）
```
* 记录选项
```plain
   --dry-run 显示动作会发生什么，但不执行它
   -L, --log-level 设置日志级别（覆盖配置文件；默认值：NOTICE）
   --log-to-file 记录到 repmgr.conf 中定义的文件（或记录工具）
   -q, --quiet 禁止除错误之外的所有日志输出
   -t, --terse 不显示细节、提示和其他非关键输出
   -v, --verbose 显示额外的日志输出（用于调试）
```
## 常用操作

* 操作类
|命令|描述|
|:----|:----|
|repmgr primary register|注册当前节点为 primary 节点|
|repmgr primary unregister|注销 primary 主节点|
|repmgr standby clone|当前节点使用 pg_basebackup 从 primary 主节点复制数据目录|
|repmgr standby register|注册当前节点为 standby 节点|
|repmgr standby unregister|注销 standby 节点|
|repmgr standby promote|将 standby 节点提升为 primary 主节点|
|repmgr standby follow|一主多从架构中，standby 节点重新指向新的 primary 主节点|
|repmgr standby switchover|将指定 standby 节点提升为 primary 主节点，并将 primary 主节点降级为 standby 节点|
|repmgr witness register|注册当前节点为见证服务器节点|
|repmgr witness unregister|注销见证服务器节点|

* 查看类
|命令|描述|
|:----|:----|
|repmgr node status|查看各节点的基本信息和复制状态|
|repmgr node check|高可用集群节点状态信息检查|
|repmgr node rejoin|重新加入一个失效节点到集群|
|repmgr cluster show|查看集群中已注册的节点基本信息与状态|
|repmgr cluster matrix|查看集群中所有节点的 matrix 信息|
|repmgr cluster crosscheck|查看集群中所有节点间两两交叉连接检测|
|repmgr cluster event|查看集群事件记录信息|
|repmgr cluster cleanup|清理集群监控历史|

# 参考引用
[1]. repmgr：[https://github.com/EnterpriseDB/repmgr](https://github.com/EnterpriseDB/repmgr)

[2]. 5.2.1文档：[https://repmgr.org/docs/5.2/](https://repmgr.org/docs/5.2/)

[3]. 常见操作：[https://blog.csdn.net/weixin_37692493/article/details/117032458?ivk_sa=1024320u](https://blog.csdn.net/weixin_37692493/article/details/117032458?ivk_sa=1024320u) 

