---
title: "工具 | 一条 SQL 实现 PostgreSQL 数据找回"
date: 2021-11-23T15:39:00+08:00
author: "张连壮"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - PostgreSQL
# 相关文章会通过keywords来匹配
keywords:
  - 
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/211123_%E5%B7%A5%E5%85%B7%20%7C%20%E4%B8%80%E6%9D%A1%20SQL%20%E5%AE%9E%E7%8E%B0%20PostgreSQL%20%E6%95%B0%E6%8D%AE%E6%89%BE%E5%9B%9E/0.png
---
快速找回丢失数据，是数据库的一项重要功能需求，一般建议使用官方推荐的工具。面向开源数据库，生态中也出现很多好用的开源工具。
<!--more-->
作者：张连壮 PostgreSQL 研发工程师

从事多年 PostgreSQL 数据库内核开发，对 citus 有非常深入的研究。 

-------------------------------------------

快速找回丢失数据，是数据库的一项重要功能需求，一般建议使用官方推荐的工具。面向开源数据库，生态中也出现很多好用的开源工具。

PostgreSQL 是非常流行的开源数据库，接下来介绍一款近期在社区开源的 PostgreSQL 数据找回工具 **pg_recovery** ，并实例演示如何找回误操作而丢失的数据。

# 什么是 pg_recovery?

pg_recovery 是一款 PostgreSQL 数据找回工具。可以恢复 COMMIT / DELETE / UPDATE / ROLLBACK / DROP COLUMN 操作后导致的数据变化，并以表的形式返回。安装方便，操作简单。仓库地址：[https://github.com/radondb/pg_recovery](https://github.com/radondb/pg_recovery)

## 快速安装

根据环境配置 PG_CONFIG。

```plain
$ make PG_CONFIG=/home/lzzhang/PG/postgresql/base/bin/pg_config
gcc -Wall -Wmissing-prototypes -Wpointer-arith -Wdeclaration-after-statement -Werror=vla -Wendif-labels -Wmissing-format-attribute -Wformat-security -fno-strict-aliasing -fwrapv -fexcess-precision=standard -Wno-format-truncation -Wno-stringop-truncation -g -g -O0 -fPIC -I. -I./ -I/home/lzzhang/PG/postgresql/base/include/server -I/home/lzzhang/PG/postgresql/base/include/internal  -D_GNU_SOURCE   -c -o pg_recovery.o pg_recovery.c
gcc -Wall -Wmissing-prototypes -Wpointer-arith -Wdeclaration-after-statement -Werror=vla -Wendif-labels -Wmissing-format-attribute -Wformat-security -fno-strict-aliasing -fwrapv -fexcess-precision=standard -Wno-format-truncation -Wno-stringop-truncation -g -g -O0 -fPIC -shared -o pg_recovery.so pg_recovery.o -L/home/lzzhang/PG/postgresql/base/lib    -Wl,--as-needed -Wl,-rpath,'/home/lzzhang/PG/postgresql/base/lib',--enable-new-dtags  

$ make install PG_CONFIG=/home/lzzhang/PG/postgresql/base/bin/pg_config
/usr/bin/mkdir -p '/home/lzzhang/PG/postgresql/base/lib'
/usr/bin/mkdir -p '/home/lzzhang/PG/postgresql/base/share/extension'
/usr/bin/mkdir -p '/home/lzzhang/PG/postgresql/base/share/extension'
/usr/bin/install -c -m 755  pg_recovery.so '/home/lzzhang/PG/postgresql/base/lib/pg_recovery.so'
/usr/bin/install -c -m 644 .//pg_recovery.control '/home/lzzhang/PG/postgresql/base/share/extension/'
/usr/bin/install -c -m 644 .//pg_recovery--1.0.sql  '/home/lzzhang/PG/postgresql/base/share/extension/'
```
初始化插件成功，返回如下信息。
```plain
$ create extension pg_recovery ;
CREATE EXTENSION
```
# 数据找回演示

## 1. 准备初始化数据

准备一个表和一些数据。

```plain
$ create table lzzhang(id int, dp int);
CREATE TABLE
# insert into lzzhang values(1, 1);
INSERT 0 1
$ insert into lzzhang values(2, 2);
INSERT 0 1
```
## 2. 找回 UPDATE 数据

对数据进行变更操作，不加 WHERE 条件。

```plain
$ update lzzhang set id=3, dp=3;
UPDATE 2
lzzhang=# select * from pg_recovery('lzzhang') as (id int, dp int);
 id | dp 
----+----
  1 |  1
  2 |  2
(2 rows)

$ select * from lzzhang;
 id | dp 
----+----
  3 |  3
  3 |  3
(2 rows)
```
## 3. 找回 DELETE 数据

尝试恢复 DELETE 的数据。

```plain
$ delete from lzzhang;
DELETE 2
lzzhang=# select * from lzzhang;
 id | dp 
----+----
(0 rows)

$ select * from pg_recovery('lzzhang') as (id int, dp int);
 id | dp 
----+----
  1 |  1
  2 |  2
  3 |  3
  3 |  3
(4 rows)
```
## 4. 找回 ROLLBACK 数据

尝试恢复回滚操作之前的数据。

```plain
$ begin ;
BEGIN
$ insert into lzzhang values(4, 4);
INSERT 0 1
$ rollback ;
ROLLBACK
$ select * from lzzhang;
 id | dp 
----+----
(0 rows)

$ select * from pg_recovery('lzzhang') as (id int, dp int);
 id | dp 
----+----
  1 |  1
  2 |  2
  3 |  3
  3 |  3
  4 |  4
(5 rows)
```
## 5. 找回 DROP COLUMN 数据

尝试恢复表中被删除的列及数据。

```plain
$ alter table lzzhang drop column dp;
ALTER TABLE
$ select attnum from pg_attribute, pg_class where attrelid = pg_class.oid and pg_class.relname='lzzhang' and attname ~ 'dropped';
 attnum 
--------
      2
(1 row)

$ select * from lzzhang;
 id 
----
(0 rows)

$ select * from pg_recovery('lzzhang') as (id int, dropped_attnum_2 int);
 id | dropped_attnum_2 
----+------------------
  1 |                1
  2 |                2
  3 |                3
  3 |                3
  4 |                4
(5 rows)

-- dropped_attnum_2: if the drop attnum is 5, set dropped_attnum_2 to dropped_attnum_5
```
## 6. 显示找回数据

显示该表历史上所有写入过的数据。

```plain
$ insert into lzzhang values(5);
INSERT 0 1
$ select * from lzzhang;
 id 
----
  5
(1 row)

$ select * from pg_recovery('lzzhang', recoveryrow => false) as (id int, recoveryrow bool);
 id | recoveryrow 
----+-------------
  1 | t
  2 | t
  3 | t
  3 | t
  4 | t
  5 | f
(6 rows)
```
# 注意事项

* **支持的 PostgreSQL 版本**

目前 pg_revovery工具已支持 PostgreSQL 12/13/14 。

* **可恢复事务数**

PostgreSQL 通过参数  `vacuum_defer_cleanup_age`  值大小，可限制可恢复的事务数。如果预期需要恢复的数据量较大，可通过配置参数值，提高可恢复的事务数。

pg_recovery 通过读取 PostgreSQL dead 元组来恢复不可见的表数据。如果元组被 vacuum 清除掉，那么 pg_recovery 便不能恢复数据。

* **锁请求**

pg_recovery 使用期间，支持正常的读表的锁请求。此外 pg_recovery未使用期间，不会对数据库造成任何额外的开销或是影响，无需暂停服务。 