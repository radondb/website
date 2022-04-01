---
title: "HTAP | MySQL 到 ClickHouse 的高速公路"
date: 2021-06-08T15:39:00+08:00
author: "TCeason"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - ClickHouse
  - 社区活动
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210608_HTAP%20%7C%20MySQL%20%E5%88%B0%20ClickHouse%20%E7%9A%84%E9%AB%98%E9%80%9F%E5%85%AC%E8%B7%AF/0.png
---
本文将介绍 MateriaLizeMySQL 引擎是如何实现 MySQL 数据同步至 ClickHouse 的。

<!--more-->

>作者：TCeason 青云科技数据库研发工程师 

---------------------

2000 年至今，MySQL[1] 一直是全球最受欢迎的 OLTP（联机事务处理）数据库，ClickHouse[2] 则是近年来受到高度关注的 OLAP（联机分析处理）数据库。那么二者之间是否会碰撞出什么火花呢？

本文将带领大家 **打破异构数据库壁垒，将 MySQL 数据同步至 ClickHouse**。

# 背景

### 1、MySQL 复制的发展历程

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210608_HTAP%20%7C%20MySQL%20%E5%88%B0%20ClickHouse%20%E7%9A%84%E9%AB%98%E9%80%9F%E5%85%AC%E8%B7%AF/1.png)

图 1-1 详细罗列了 MySQL 复制的发展历程。

- 2001 年的 MySQL 3.23 版本就已经支持了同构数据库 **异步复制**；由于是异步复制，根本无法在实际生产中大批量使用。

- 2013 年 MySQL 5.7.2 版本支持 **增强半同步复制** 能力，才勉强算得上是企业级可用的数据同步方案。

- 2016 年 MySQL 5.7.17 支持了 **MGR**，并不断地发展成熟，变成了一个金融级别可用的数据同步方案。

而对于同构的 MySQL 数据同步，接下来要做的就是不断地优化体验，提升同步时效性，解决网络异常下的各类问题。

基于此，各大厂商也开始做自己的高可用同步组件。例如由 QingCloud 数据库研发团队研发并开源的 Xenon，就具备了真正的强一致性和高可用能力。

### 2、MySQL + Xenon

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210608_HTAP%20%7C%20MySQL%20%E5%88%B0%20ClickHouse%20%E7%9A%84%E9%AB%98%E9%80%9F%E5%85%AC%E8%B7%AF/2.png)

图 1-2 中的 Xenon 是由类 Raft 算法来实现的高可用组件，用来管理 MySQL 选举和探活，并订正数据准确性。MySQL 数据同步则依然使用 Semi-Sync Replication 或者 MGR，从而达到数据强一致性、无中心化自动选主且主从秒级切换，以及依托于云的跨区容灾能力。具体请参考 [《Xenon：后 MHA 时代的选择》](/posts/210604_高可用-_-xenon后-mha-时代的选择/)

# ClickHouse 同步 MySQL 数据

为了加速 OLAP 查询，QingCloud MySQL Plus[3]（MySQL + Xenon） 借用 ClickHouse 来同步 MySQL 数据。

### 1、ClickHouse 概述

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210608_HTAP%20%7C%20MySQL%20%E5%88%B0%20ClickHouse%20%E7%9A%84%E9%AB%98%E9%80%9F%E5%85%AC%E8%B7%AF/3.png)

ClickHouse 是一个用于联机分析 (OLAP) 的列式数据库管理系统 (DBMS)。ClickHouse 构思于 2008 年，最初是为 YandexMetrica（世界第二大 Web 分析平台）而开发的。多年来一直作为该系统的核心组件被该系统持续使用着，并于 2016 年宣布开源。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210608_HTAP%20%7C%20MySQL%20%E5%88%B0%20ClickHouse%20%E7%9A%84%E9%AB%98%E9%80%9F%E5%85%AC%E8%B7%AF/4.png)

从目前最新的 DB-Engines 中可以看到其排名曲线一路高涨，并且各大厂在重要业务上已经大量部署，这是一个很明显的趋势。因此，我们似乎可以认定 ClickHouse 的火热并不只是一时现象，它将长久地存活下去。而且，ClickHouse 灵活的外部表引擎，可轻松实现与 MySQL 的数据同步，接下来让我们了解一下。

### 2、MySQL Table Engine

MySQL Table Engine 的特性。

* Mapping to MySQL table
* Fetch table struct from MySQL
* Fetch data from MySQL when executing query

ClickHouse 最开始支持表级别同步 MySQL 数据，通过外部表引擎 MySQL Table Engine 来实现同 MySQL 表的映射。从 `information_schema` 表中获取对应表的结构，将其转换为 ClickHouse 支持的数据结构，此时在 ClickHouse 端，表结构建立成功。但是此时，并没有真正去同步数据。只有向 ClickHouse 中的该表发起请求时，才会主动的拉取要同步的 MySQL 表的数据。

MySQL Table Engine 使用起来非常简陋，但它是非常有意义的。因为这是第一次打通 ClickHouse 和 MySQL 的数据通道。但是，缺点异常明显：

i. 仅仅是对 MySQL 表关系的映射；

ii. 查询时传输 MySQL 数据到 ClickHouse，会给 MySQL 可能造成未知的网络压力和读压力，可能影响 MySQL 在生产中正常使用。

基于 MySQL Table Engine 只能映射 MySQL 表关系的缺点，QingCloud ClickHouse 团队实现了 MySQL Database Engine。

### 3、MySQL Database Engine

MySQL Database Engine 的特性。

* Mapping to MySQL Database
* Fetch table list from MySQL
* Fetch table struct from MySQL
* Fetch data from MySQL when executing query

MySQL Database Engine 是库级别的映射，要从 `information_schema` 中拉取待同步库中包含的所有 MySQL 表的结构，解决了需要建立多表的问题。但仍然还有和 MySQL Table Engine 一样的缺点：查询时传输 MySQL 数据到 ClickHouse，给 MySQL 可能造成未知的网络压力和读压力，可能影响 MySQL 在生产中正常使用。

### 4、借用第三方软件同步

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210608_HTAP%20%7C%20MySQL%20%E5%88%B0%20ClickHouse%20%E7%9A%84%E9%AB%98%E9%80%9F%E5%85%AC%E8%B7%AF/5.png)

除去上面提到的 MySQL Table Engine 、MySQL Database Engine 两种方式，还有可以采用第三方软件来同步数据，比如 Canal 或者 Kafka，通过解析 MySQL binlog，然后编写程序控制向 ClickHouse 写入。这样做有很大的优势，即同步流程自主可控。但是也带来了额外的问题：

i. 增加了数据同步的复杂度。

ii. 增加了第三方软件，使得运维难度指数级增加。

基于此，我们又可以思考一个问题，ClickHouse 能否主动同步并订阅 MySQL 数据呢？

# Materialize MySQL

为了解决 MySQL Database Engine 依然存留的问题，支持 ClickHouse 主动同步并订阅 MySQL 数据，QingCloud ClickHouse 团队自主研发了 MaterializeMySQL[4] 引擎。

### 1、简述 MaterializeMySQL

MaterializeMySQL 引擎是由 QingCloud ClickHouse 团队自主研发的库引擎，目前作为实验特性合并到 ClickHouse 20.8 版本中，是对 MySQL 库级别关系的映射，通过消费 binlog 存储到 MergeTree 的方式来订阅 MySQL 数据。

具体使用方式就是一条简单的 CREATE DATABASE SQL 示例：

```sql
CREATE DATABASE test ENGINE = MaterializeMySQL(
  '172.17.0.3:3306', 'demo', 'root', '123'
)
```

172.17.0.3:3306 - MySQL 地址和端口

demo - MySQL 库的名称

root - MySQL 同步账户

123 - MySQL 同步账户的密码

2、MaterializeMySQL 的设计思路
* Check MySQL Vars
* Select history data
* Consume new data

MaterializeMySQL 的设计思路如下：

1. 首先检验源端 MySQL 参数是否符合规范;
2. 再将数据根据 GTID 分割为历史数据和增量数据;
3. 同步历史数据至 GTID 点;
4. 持续消费增量数据。
### 3、MaterializeMySQL 的函数流程

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210608_HTAP%20%7C%20MySQL%20%E5%88%B0%20ClickHouse%20%E7%9A%84%E9%AB%98%E9%80%9F%E5%85%AC%E8%B7%AF/6.png)

如图 3-1 所示，MaterializeMySQL 函数的主体流程为：

CheckMySQLVars -> prepareSynchronized -> Synchronized

#### （1）CheckMySQLVars

检验参数比较简单，就是要查询这些参数是否符合预期。

```plain
SHOW VARIABLES WHERE (Variable_name = 'log_bin'
AND upper(Value) = 'ON')
OR (Variable_name = 'binlog_format'
AND upper(Value) = 'ROW')
OR (Variable_name = 'binlog_row_image'
AND upper(Value) = 'FULL')
OR (Variable_name = 'default_authentication_plugin'
AND upper(Value) = 'MYSQL_NATIVE_PASSWORD')
OR (Variable_name = 'log_bin_use_v1_row_events'
AND upper(Value) = 'OFF');
```
#### （2）prepareSynchronized

这一步来实现历史数据的拉取。

* 为先初始化 gtid 信息；
* 为了保证幂等性每次重新同步时，都要清理 ClickHouse MaterializeMySQL 引擎库下的表；
* 重新拉取历史数据，并将 MySQL 表结构在 ClickHouse 端进行改写；
* 建立与 MySQL 的 Binlog 传输通道。
```plain
std::optional<MaterializeMetadata> MaterializeMySQLSyncThread::prepareSynchronized()
{
    connection = pool.get();
    MaterializeMetadata metadata(
connection, DatabaseCatalog::instance().getDatabase(database_name)->getMetadataPath() + "/.metadata", mysql_database_name, opened_transaction);
    if (!metadata.need_dumping_tables.empty())
    {
        Position position;
        position.update(metadata.binlog_position, metadata.binlog_file, metadata.executed_gtid_set);
        metadata.transaction(position, [&]()
        {
            cleanOutdatedTables(database_name, global_context);
            dumpDataForTables(connection, metadata, query_prefix, database_name, mysql_database_name, global_context, [this] { return isCancelled(); });
         });
    }
    connection->query("COMMIT").execute();
}
```
在 MySQL 中，demo 库下有一个表 t ，主键为 ID , 普通列 col_1。
```sql
CREATE TABLE demo.t (
  id int(11) NOT NULL,
  col_1 varchar(20) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE = InnoDB;
```
在 ClickHouse 中，依然是id 作为主键列，但是，多了隐藏列 _sign 和 _version。
i. _sign：值只有 1 和 -1。其中，1 代表这行数据存在，-1 代表这行数据被删除。

ii. _version：只会读到 version 高的值，会在后台不断合并主键相同的行，最终保留 Version 最高的行。

```sql
CREATE TABLE test.t
(
    `id` Int32,
    `col_1` Nullable(String),
    `_sign` Int8 MATERIALIZED 1,
    `_version` UInt64 MATERIALIZED 1
)
ENGINE = ReplacingMergeTree(_version)
PARTITION BY intDiv(id, 4294967)
ORDER BY tuple(id)
```
#### （3）Synchronized

在 prepareSynchronized 中，我们得到了历史数据以及历史数据位点信息，并且获得了与 MySQL 的 Binlog 传输通道。接下来就是从该位点同步增量数据。通过 readOneBinlogEvent 函数读取每一条 binlog 内容，然后使用 onEvent 转换成 ClickHouse 的语句格式即可。最终为了数据安全性，调用 flushBuffersData 函数将数据落盘。

```plain
client.connect();
client.startBinlogDumpGTID(randomNumber(), mysql_database_name, metadata.executed_gtid_set, metadata.binlog_checksum);
Buffers buffers(database_name);
while (!isCancelled())
{
    BinlogEventPtr binlog_event = client.readOneBinlogEvent(std::max(UInt64(1), max_flush_time - watch.elapsedMilliseconds()));
    if (binlog_event)
        onEvent(buffers, binlog_event, *metadata);
    if (!buffers.data.empty())
        flushBuffersData(buffers, *metadata);
}
```
# HTAP 应用场景

当我们打通了 ClickHouse 和 MySQL 的复制通道，而 ClickHouse 的分析能力又是如此让人惊喜，那么我们是不是可以用 MySQL + ClickHouse 实现 HTAP 呢？

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210608_HTAP%20%7C%20MySQL%20%E5%88%B0%20ClickHouse%20%E7%9A%84%E9%AB%98%E9%80%9F%E5%85%AC%E8%B7%AF/7.png)

在图 4-1 中的架构，依然使用高可用组件 Xenon 来管理 MySQL 复制，同时 Xenon 增加了对 ClickHouse 的监管，通过 MaterializeMySQL 来同步 MySQL 数据。

在之前的架构图中，使用 MySQL 只读实例来进行商务分析、用户画像等分析业务。而现在可以直接将 ClickHouse 作为一个分析实例加入到 MySQL 复制中，替代一部分只读实例进行分析计算。同时 ClickHouse 本身支持了海量函数来支持分析能力的同时还支持标准 SQL，相信可以让使用者享受到很好的体验。

目前的 ClickHouse 可以支持同步 MySQL 5.7 和 8.0 的数据，不支持同步 MySQL 5.6 的数据。不过，作为一个实验特性， MaterializeMySQL 的时间线相当于是 2001 年刚刚支持复制的 MySQL。欢迎大家一起来贡献和维护 MaterializeMySQL。 

# 参考引用

[1]. MySQL :  [https://www.mysql.com/](https://www.mysql.com/)

[2]. ClickHouse :  [https://clickhouse.tech/docs/en/](https://clickhouse.tech/docs/en/)

[3]. MySQL Plus：[https://www.qingcloud.com/products/mysql-plus/](https://www.qingcloud.com/products/mysql-plus/)

[4]. MaterializeMySQL：[https://clickhouse.tech/docs/en/engines/database-engines/materialize-mysql/](https://clickhouse.tech/docs/en/engines/database-engines/materialize-mysql/)

