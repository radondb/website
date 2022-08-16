---
shortTitle: "关于 RadonDB MySQL"
title: "关于 RadonDB MySQL Kubernetes"
weight: 1
---

# 什么是 RadonDB MySQL Kubernetes？
RadonDB MySQL 是一款基于 MySQL 的开源、高可用的云原生集群解决方案。它采用一主多从高可用架构，并具备安全、自动备份、监控告警、自动扩容等全套管理功能。目前已经在生产环境中大规模的使用，用户包含银行、保险、传统大企业等。其服务的高可用性由已经开源的 MySQL 集群高可用组件 Xenon 实现。

随着国内外云原生技术蓬勃发展，数据库容器化技术趋于成熟，各大 Kubernetes 社区用户对 MySQL 容器化高可用方案的需求呼声不断。因此，社区决定将 **RadonDB MySQL 完整的移植到 Kubernetes 平台（[RadonDB MySQL Kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)）**，并于 2021 年将其正式开源。此项目意在为广大的 Kubernetes 和 MySQL 开发者们提供一款企业级的 MySQL 容器化高可用方案。

RadonDB MySQL Kubernetes 支持在 **Kubernetes、KubeSphere 和 Rancher** 等平台安装、部署和管理，并自动执行 RadonDB MySQL 集群运行的相关任务。

# 核心功能
- MySQL 高可用
    - 无中心化自动选主
    - 主从秒级切换
    - 集群切换的数据强一致性
- 集群管理
- 监控告警
- 备份
- 集群日志管理
- 账户管理

# 架构图
- 通过 Raft 协议实现无中心化领导者自动选举
- 基于 GTID 模式进行半同步复制
- 通过 [Xenon](https://github.com/radondb/xenon) 提供高可用能力
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211108_MySQL%20Operator%2001%20%7C%20%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E6%A6%82%E8%A7%88/3.jpg)

# Roadmap

## 1.0 Helm Chart
- MySQL 高可用
- 无中心化领导自动选举
- 主从秒级切换
- 数据强一致性
- 集群管理
- 监控告警
- 集群日志管理
- 账户管理

## 2.0 Operator

- 增删节点
- 自动扩缩容
- 升级集群
- 备份与恢复
- 故障自动转移
- 自动重建节点
- 自动重启服务
- 账户管理（提供 API 接口）
- 在线迁移

## 3.0 Operator

- 自动化运维
- 多节点角色
- 灾备集群
- SSL 传输加密

# 协议
RadonDB MySQL 基于 Apache 2.0 协议，详见 [License](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/LICENSE)。

# 社区信息

论坛：[https://kubesphere.com.cn/forum/t/radondb](https://kubesphere.com.cn/forum/t/radondb)

第一时间了解社区新闻及活动详情，请添加微信群助手微信：radondb。