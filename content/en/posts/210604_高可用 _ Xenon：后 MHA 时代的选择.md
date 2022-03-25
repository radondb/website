---
title: "高可用 | Xenon：后 MHA 时代的选择"
date: 2021-06-04T15:39:00+08:00
author: "知数堂"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - Xenon
  - 高可用
# 相关文章会通过keywords来匹配
keywords:
  - xenon
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210604_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%EF%BC%9A%E5%90%8E%20MHA%20%E6%97%B6%E4%BB%A3%E7%9A%84%E9%80%89%E6%8B%A9/0.png
---
开源 MySQL 高可用组件 Xenon 的简介及架构设计原理。
<!--more-->
在 MySQL（5.5 及以下）传统复制的时代，MHA（Master High Availability）在 MySQL 高可用应用中非常成熟。在 MySQL（5.6）及 GTID 时代开启以后，MHA 却没有与新的 MySQL 一起顺应时潮。 

MHA 由日本 DeNA 公司 youshimaton 开发，他认为在 GTID 环境下 MHA 存在的价值不大，MHA 最近一次发版是 2018 年。现如今使用 MySQL 已离不开 GTID ，无论是从功能、性能角度，还是从维护角度，GTID 能具备更优异的表现，针对数据业务要求不高场景，常使用 **GTID+ROW+Semi-Sync** 方案。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210604_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%EF%BC%9A%E5%90%8E%20MHA%20%E6%97%B6%E4%BB%A3%E7%9A%84%E9%80%89%E6%8B%A9/1.png)

MHA 活跃度

基于 MHA  和 GTID 发展现状，为适应 MySQL 版本更新的高可用业务场景，下面介绍一款可替代 MHA 的高可用方案：**MySQL + Xenon**

# | 什么是 Xenon？

Xenon [\[ˈziːnɒn\]](https://github.com/radondb/xenon) 是一款由 RadonDB 开发团队研发并开源的新一代 MySQL 集群高可用工具。基于 Raft 协议进行无中心化选主，实现主从秒级切换；基于 Semi-Sync 机制，保障数据不丢失，实现数据强一致性。并结合 MySQL（5.7 及以上版本）并行复制特性，实现 Binlog 并行回放，大大降低从库延迟。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210604_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%EF%BC%9A%E5%90%8E%20MHA%20%E6%97%B6%E4%BB%A3%E7%9A%84%E9%80%89%E6%8B%A9/2.png)

# | Xenon 架构

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210604_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%EF%BC%9A%E5%90%8E%20MHA%20%E6%97%B6%E4%BB%A3%E7%9A%84%E9%80%89%E6%8B%A9/3.png)

* **自动选主**

基于 Raft（依赖于 GTID）自动选主，数据一致性依赖于增强半同步 Semi-Sync。

* **故障自动切换**

借助于配置项 `leader-start-command` 和  `leader-stop-command` 调用脚本完成故障切换，也可以结合 Consul，ZooKeeper 自由扩展。

* **Xtrabackup 备份调度集成**

# | Xenon 工作原理

结合架构图，可看出 Xenon 就是基于 **Raft + Semi-Sync + GTID** 实现的高可用，保证大多数节点接收到数据。

而 Raft 基于心跳管理，如果从节点超时收不到主的心跳，会尝试发起选举，若得到超过半数（非 IDLE 节点）的选票，则会当选为主节点。

下面以三节点（一主两从）Xenon 集群来简单说明工作原理。

{Leader,  [GTID:{1,2,3,4,5}]

{Follower1,  [GTID:{1,2,3,4,5}]

{Follower2,  [GTID:{1,2,3}]

1. 当 Leader 不可用时，Follower1 和 Follower2 立即参与竞选成为主节点。
2. Xenon 校验 GTID 值较高的 Follower 成为新主节点，示例中 GTID 值较高的是 Follower1。
3. 当 GTID 值最高的 Follower 被选举成为新主时，将结束竞选。示例中 Follower1 成为新主节点后，将会拒绝 Follower2 的选举。
4. 自动完成主从切换。

# | Xenon 企业级核心特性

* **一主多从架构，确保金融级强一致性**

高可用架构大多采用一主两从的初始节点架构设计，并通过 MySQL 5.7 版本中的 Semi-Sync 特性实现数据的多副本同步复制，多个从节点的设置将极大的屏蔽掉单点故障带来的影响，确保至少一个从节点与主节点始终保持数据的完全一致，提供金融级数据强一致性。

* **主副本秒级切换，确保业务高可用**

节点之间使用 Raft 协议进行管理，当主节点出现故障不可用时，集群会秒级响应并选出新的主节点（与主节点数据完全同步的从节点），并立即接管读写请求，确保业务的连续高可用。这一过程，无需设置后端集群中各节点的角色，一切由系统自动切换。集群中最多可以添加 6 个从节点，主节点可读可写，从节点设置为只读。同时，集群提供两个 VIP，分别是高可用读 IP 和高可用写 IP。读 IP 可将请求在所有节点之间进行负载分担，提供读取性能的同时，也消除了单点故障的影响，提供业务可靠性。写 IP 则始终指向主节点（Leader）。

* **系统自动运维，优化系统空间使用效率**

通过对 binlog 日志的保留周期 `expire_logs_days` 的配置（1～4 天），主节点会定期清理不再使用的 binlog 日志，其他从节点已复制完毕，提高系统的空间利用率。

# | Xenon 的优势

相比 MHA，Xenon 的优势如下：

- 多版本内核支持

    支持 MySQL 5.6、5.7、8.0 内核版本。

- 多平台支持

    支持物理机、虚拟机/云平台、容器/ Kubernetes 平台部署。

- 稳定性更好

    MySQL 新版本特性兼容。

- 性能更佳

    与 GTID、MTS（并行复制） 结合，并行日志复制、并行日志回放。

- 架构更简单

    不需要管理节点，机器成本更低。

- 数据更安全

    增强半同步复制不会降级为异步，保证数据零丢失，不会存在 MHA 在 GTID 模式下丢数据的风险。

- 故障修复全自动

    Xenon 对于故障节点会自动先自我修复。

- 节点恢复快

    配合 Xtrabackup 等可以实现快速恢复。

- 操作更简单，维护成本更低

- 持续更新
  
    Xenon 由 RadonDB 数据库开发团队持续维护更新。

# 相关参考

[https://github.com/radondb/xenon/tree/master/docs](https://github.com/radondb/xenon/tree/master/docs)

[https://www.fatalerrors.org/a/separation-of-mha-atlas-for-mysql-high-availability.html](https://www.fatalerrors.org/a/separation-of-mha-atlas-for-mysql-high-availability.html)

[https://github.com/yoshinorim](https://github.com/yoshinorim)

[https://code.google.com/archive/p/mysql-master-ha/](https://code.google.com/archive/p/mysql-master-ha/)

[https://dev.mysql.com/doc/refman/5.6/en/replication-gtids-concepts.html](https://dev.mysql.com/doc/refman/5.6/en/replication-gtids-concepts.html) 
