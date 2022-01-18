---
title: "工具 | 常用 PostgreSQL 预防数据丢失方案"
date: 2022-01-18T15:39:00+08:00
author: "张连壮"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - PostgreSQL

# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/220118_%E5%B7%A5%E5%85%B7%20%7C%20%E5%B8%B8%E7%94%A8%20PostgreSQL%20%E9%A2%84%E9%98%B2%E6%95%B0%E6%8D%AE%E4%B8%A2%E5%A4%B1%E6%96%B9%E6%A1%88/0.png
---

<!--more-->

作者：张连壮 PostgreSQL 研发负责人

从事多年 PostgreSQL 数据库内核开发，对 Citus 有非常深入的研究。 
PostgreSQL 本身不具备数据闪回和数据误删除保护功能，但在不同场景下也有对应的解决方案。

本文由作者在 2021 PCC 大会的演讲主题《PostgreSQL 数据找回》整理而来，上一篇 [常用 PostgreSQL 数据恢复方案概览](/posts/220112_盘点-_-常用-pg-数据恢复方案概览建议收藏/) 介绍了 PostgreSQL 常见的 数据恢复方案。本篇延续前文话题，介绍常见 预防数据丢失方案的实现原理及使用示例。

# 预防数据丢失方案

前文提到数据丢失的主要操作为 DDL 和 DML 。

本篇主要介绍关于 DDL 和 DML 操作，如何预防数据丢失的方案。

## DDL 操作

### 事件触发器

当事件以其定义的方式在数据库中相关的发生时，触发事件触发器。主要可预防以下四种 DDL 事件。

|**事件**|**说明**|
|:----:|:----|
|**ddl_command_start**|DDL 执行前执行|
|**ddl_command_end**|DDL 执行后执行， 通过 pg_event_trigger_ddl_commands() 可以获取操作的对象|
|**sql_drop**|DDL 执行后执行， 通过 pg_event_trigger_dropped_objects() 可以获取所有被删除的对象|
|**table_rewrite**|DDL 执行前执行， 例如 ALTER TABLE、ALTER TYPE 等|

当表被删除后，可以通过 **ddl_command_start** 事件组织删除操作。

```sql
CREATE OR REPLACE FUNCTION disable_drops()
    RETURNS event_trigger LANGUAGE plpgsql AS $$
BEGIN
     RAISE EXCEPTION 'drop table denied';
END
$$; -- 创建事件触发器函数

CREATE EVENT TRIGGER event_trigger_disable_drops
    ON ddl_command_start WHEN TAG in('drop table')
    EXECUTE PROCEDURE disable_drops(); -- 创建事件触发器，禁止drop table操作
```
事件触发器，无法修改 drop 的任何行为，因此只能拒绝，来确保数据不被删除，由其他拥有更高权限的数据库管理员删除。
```plain
test=# \dy
                                        事件触发器列表
            名称             |       Event       | 拥有者  | 使能 |     函数      |    标签    
-----------------------------+-------------------+---------+------+---------------+------------
 event_trigger_disable_drops | ddl_command_start | lzzhang | 启用 | disable_drops | DROP TABLE
(1 行记录)

test=# drop table lzzhang;
ERROR:  drop table denied
CONTEXT:  PL/pgSQL function disable_drops() line 3 at RAISE
```
删除表的操作由拥有更高级权限的数据库管理员操作。
```sql
BEGIN;
ALTER EVENT TRIGGER event_trigger_disable_drops DISABLE;
DROP TABLE lzzhang;
ALTER EVENT TRIGGER event_trigger_disable_drops ENABLE;
COMMIT;
```
### 回收站

DDL 会将文件从操作系统中完全删除，因此唯一的办法是将**删除**改为**换一个"位置"**，类似 Windows 中回收站。

pgtanshscan[1] 便是一种回收站工具，并且只能通过插件采用 hook 的方式来实现。

```plain
if (nodeTag(parsetree) == T_DropStmt)
{
                if (stmt->removeType == OBJECT_TABLE)
{
AlterObjectSchemaStmt *newstmt = makeNode(AlterObjectSchemaStmt);
newstmt->newschema = pstrdup(trashcan_nspname);
```
通过其代码示例可以看出， `DROP TABLE` 操作被转换成了  `ALTER`  操作。

## DML 操作

通过参数 `vacuum_defer_cleanup_age` 来调整 Dead 元组在数据库中的量，以便恢复误操作的数据。接下来将根据 **流复制延迟恢复**和 **备份恢复**两种设计方案来具体介绍：

### 流复制延迟恢复

PostgreSQL 流复制时可以通过 `recovery_min_apply_delay` 设置相应的延迟时间。例如设置 5 小时，备库可以延迟应用最近 5 小时的日志，提供最多 5 小时的数据恢复窗口，延迟的应用日志的同时并不影响日志的接受，源库的日志仍然是实时的被延迟恢复节点接受。

找回数据的具体操作步骤如下:

1. 暂停延迟恢复 `pg_wal_replay_pause()` ；
2. 通过 pg_dump 或 copy 操作将其需要的数据找出来；
3. 通过 psql、copy、pg_restore 等操作将数据导入源库中；
4. 继续延迟 `pg_wal_replay_resume()` 。
### 备份恢复

从备份模式的角度来说，备份主要包括以下两种：

* **逻辑备份** 不能进行实时备份，因此不太适用于数据找回，会丢失很多数据。
* **物理备份** 物理备份拥有与源集群完全一致的数据，因此可以持续使用源集群的 WAL 日志，达到数据找回的目标，原理上也是延迟恢复。
物理备份与 PITR 结合，可恢复数据到任意时间点。可选用工具有很多，如下几种是常用的恢复工具。

* pg_basebackup[2]
* pg_probackup[3]
* pgbackrest[4]
* barman[5]
* pg_rman[6]

# 总结

1. 注意权限划分。危险操作或是 DDL 等影响大的操作，一定要由**第二个数据库管理员**操作。
2. 提前做好数据找回和数据安全的方案规划。
3. 流复制延迟恢复，同样需要设置 recovery_target_xid 、recovery_target_time 或recovery_target_lsn 来精准的定位到完整的数据集。
4. pg_waldump 是数据找回必备的一个功能。
5. 如果方案是重型的，轻型的插件有时会是更好的选择。
6. 若无任何准备，且不能安装任何插件，可**第一时间将数据库关机**！！！防止 Dead 元组被清理，拷贝整个集群，使用拷贝后的集群用 pg_resetwal 进行数据恢复。

### 参考引用

1. pgtrashcan：[https://github.com/petere/pgtrashcan](https://github.com/petere/pgtrashcan)

2. pg_basebackup：[https://www.postgresql.org/docs/10/app-pgbasebackup.html](https://www.postgresql.org/docs/10/app-pgbasebackup.html)

3. pg_probackup：[https://github.com/postgrespro/pg_probackup](https://github.com/postgrespro/pg_probackup)

4. pgbackrest：[https://github.com/pgbackrest/pgbackrest](https://github.com/pgbackrest/pgbackrest)

5. barman：[https://github.com/EnterpriseDB/barman](https://github.com/EnterpriseDB/barman)

6. pg_rman：[https://github.com/ossc-db/pg_rman](https://github.com/ossc-db/pg_rman) 

