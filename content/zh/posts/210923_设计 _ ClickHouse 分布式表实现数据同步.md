---
title: "设计 | ClickHouse 分布式表实现数据同步"
date: 2021-09-23T15:39:00+08:00
author: "吴帆"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - ClickHouse
  - 分布式
  - 架构
# 相关文章会通过keywords来匹配
keywords:
  - ClickHouse
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210923_%E8%AE%BE%E8%AE%A1%20%7C%20ClickHouse%20%E5%88%86%E5%B8%83%E5%BC%8F%E8%A1%A8%E5%AE%9E%E7%8E%B0%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A5/0.png
---
在多副本分布式 ClickHouse 中，分区表实现副本数据同步的两种方案。
<!--more-->
>作者：吴帆  青云数据库团队成员
>主要负责维护 MySQL 及 ClickHouse 产品开发，擅长故障分析，性能优化。 

在多副本分布式 ClickHouse 集群中，通常需要使用 Distributed 表写入或读取数据，Distributed 表引擎自身不存储任何数据，它能够作为分布式表的一层透明代理，在集群内部自动开展数据的写入、分发、查询、路由等工作。

Distributed 表实现副本数据同步有两种方案：

1. Distributed + MergeTree
2. Distributed + ReplicateMergeTree
# | Distributed + MergeTree

在使用这种方案时 internal_replication  需要设为 false，向 Distributed 表写入数据，Distributed 表会将数据写入集群内的每个副本。Distributed 节点需要负责所有分片和副本的数据写入工作。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210923_%E8%AE%BE%E8%AE%A1%20%7C%20ClickHouse%20%E5%88%86%E5%B8%83%E5%BC%8F%E8%A1%A8%E5%AE%9E%E7%8E%B0%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A5/1.png)

## 1. 集群配置

```plain
<logical_consistency_cluster>
    <shard>
        <internal_replication>false</internal_replication>
        <replica>
            <host>shard1-repl1</host>
            <port>9000</port>
        </replica>
        <replica>
            <host>shard1-repl2</host>
            <port>9000</port>
        </replica>
    </shard>
</logical_consistency_cluster>
```
## 2. 数据写入

```plain
CREATE TABLE test.t_local  on cluster logical_consistency_cluster
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
) ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate) ;

CREATE TABLE test.t_logical_Distributed on cluster logical_consistency_cluster
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
)
ENGINE = Distributed(logical_consistency_cluster, test, t_local, CounterID) ;

INSERT INTO test.t_logical_Distributed VALUES ('2019-01-16 00:00:00', 1, 1),('2019-02-10 00:00:00',2, 2),('2019-03-10 00:00:00',3, 3)
```
## 3. 数据查询

```plain
# shard1-repl1

SELECT *
FROM test.t_local

Query id: bd031554-b1e0-4fda-9ff8-1145ffae5b02

┌───────────EventDate──┬─CounterID─┬─UserID─┐
│ 2019-03-10 00:00:00 │         3 │      3 │
└─────────────────────┴───────────┴────────┘
┌───────────EventDate─┬─CounterID─┬─UserID─┐
│ 2019-02-10 00:00:00 │         2 │      2 │
└─────────────────────┴───────────┴────────┘
┌───────────EventDate─┬─CounterID─┬─UserID─┐
│ 2019-01-16 00:00:00 │         1 │      1 │
└─────────────────────┴───────────┴────────┘

3 rows in set. Elapsed: 0.004 sec. 

------------------------------------------

# shard1-repl2

SELECT *
FROM test.t_local

Query id: 636f7580-02e0-4279-bc9b-1f153c0473dc

┌───────────EventDate─┬─CounterID─┬─UserID─┐
│ 2019-01-16 00:00:00 │         1 │      1 │
└─────────────────────┴───────────┴────────┘
┌───────────EventDate─┬─CounterID─┬─UserID─┐
│ 2019-03-10 00:00:00 │         3 │      3 │
└─────────────────────┴───────────┴────────┘
┌───────────EventDate─┬─CounterID─┬─UserID─┐
│ 2019-02-10 00:00:00 │         2 │      2 │
└─────────────────────┴───────────┴────────┘

3 rows in set. Elapsed: 0.005 sec. 
```
通过写入测试我们可以看到每个副本数据是一致的。
即使本地表不使用 ReplicatedMergeTree 表引擎，也能实现数据副本的功能。但每个副本的数据是通过 Distributed 表独立写入，文件存储格式不会完全一致，可以理解这种方式为逻辑一致性。

Distributed 需要同时负责分片和副本的数据写入工作，单点写入很有可能会成为系统性能的瓶颈，所有有接下来的第二种方案。

# | Distributed + ReplicateMergeTree

在使用这种方案时 internal_replication 需要设为 true，向 Distributed 表写入数据。Distributed 表在每个分片中选择一个合适的副本并对其写入数据。

分片内多个副本之间的数据复制会由 ReplicatedMergeTree 自己处理，不再由 Distributed 负责。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210923_%E8%AE%BE%E8%AE%A1%20%7C%20ClickHouse%20%E5%88%86%E5%B8%83%E5%BC%8F%E8%A1%A8%E5%AE%9E%E7%8E%B0%E6%95%B0%E6%8D%AE%E5%90%8C%E6%AD%A5/2.png)

## 1. 配置文件

```plain
<physical_consistency_cluster>
    <shard>
        <internal_replication>true</internal_replication>
        <replica>
            <host>shard1-repl1</host>
            <port>9000</port>
        </replica>
        <replica>
            <host>shard1-repl2</host>
            <port>9000</port>
        </replica>
    </shard>
</physical_consistency_cluster>
```
## 2. 数据写入

```plain
CREATE TABLE test.t_local on cluster  physical_consistency_cluster 
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
)
ENGINE = ReplicatedMergeTree('{namespace}/test/t_local', '{replica}')
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID);





CREATE TABLE test.t_physical_Distributed on cluster physical_consistency_cluster
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
)
ENGINE = Distributed(physical_consistency_cluster, test, t_local, CounterID);

INSERT INTO test.t_physical_Distributed VALUES ('2019-01-16 00:00:00', 1, 1),('2019-02-10 00:00:00',2, 2),('2019-03-10 00:00:00',3, 3)
```
## 3. 数据查询

```plain
# shard1-repl1

SELECT *
FROM test.t_local

Query id: d2bafd2d-d0a8-41b4-8d79-ece37e8159e5

┌───────────EventDate──┬─CounterID─┬─UserID─┐
│ 2019-03-10 00:00:00 │         3 │      3 │
└─────────────────────┴───────────┴────────┘
┌───────────EventDate─┬─CounterID─┬─UserID─┐
│ 2019-02-10 00:00:00 │         2 │      2 │
└─────────────────────┴───────────┴────────┘
┌───────────EventDate─┬─CounterID─┬─UserID─┐
│ 2019-01-16 00:00:00 │         1 │      1 │
└─────────────────────┴───────────┴────────┘

3 rows in set. Elapsed: 0.004 sec. 

------------------------------------------

# shard1-repl2

SELECT *
FROM test.t_local

Query id: b5f0dc80-f73f-427e-b04e-e5b787876462

┌───────────EventDate─┬─CounterID─┬─UserID─┐
│ 2019-01-16 00:00:00 │         1 │      1 │
└─────────────────────┴───────────┴────────┘
┌───────────EventDate─┬─CounterID─┬─UserID─┐
│ 2019-03-10 00:00:00 │         3 │      3 │
└─────────────────────┴───────────┴────────┘
┌───────────EventDate─┬─CounterID─┬─UserID─┐
│ 2019-02-10 00:00:00 │         2 │      2 │
└─────────────────────┴───────────┴────────┘

3 rows in set. Elapsed: 0.005 sec. 
```
ReplicatedMergeTree 需要依靠 ZooKeeper 的事件监听机制以实现各个副本之间的协同，副本协同的核心流程主要有：INSERT、MERGE、MUTATION 和 ALTER 四种。
通过写入测试我们可以看到每个副本数据也是一致的，副本之间依靠 ZooKeeper 同步元数据，保证文件存储格式完全一致，可以理解这种方式是物理一致。

ReplicatedMergeTree 也是在分布式集群中最常用的一种方案，但数据同步需要依赖 ZooKeeper，在一些 DDL 比较频繁的业务中 Zookeeper 往往会成为系统性能的瓶颈，甚至会导致服务不可用。

我们需要考虑为 ZooKeeper 减负，使用第一种方案 + 负载均衡轮询的方式可以降低单节点写入的压力。

# 总结

* **internal_replication = false**

使用 Distributed + MergeTree 可实现逻辑一致分布式。

数据内容完全一致，数据存储格式不完全一致，数据同步不依赖 ZooKeeper，副本的数据可能会不一致，单点写入压力较大。

* **internal_replication = true**

使用 Distributed + ReplicateMergeTree  可实现物理一致分布式。

数据内容完全一致，数据存储格式完全一致。数据同步需要依赖 ZooKeeper，ZooKeeper 会成为系统瓶颈。 

