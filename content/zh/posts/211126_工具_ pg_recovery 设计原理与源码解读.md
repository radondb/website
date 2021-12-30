---
title: "工具 | pg_recovery 设计原理与源码解读"
date: 2021-11-26T16:00:00+08:00
author: "张连壮"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - PostgreSQL
  - 源码
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/211126_%E5%B7%A5%E5%85%B7%20%7C%20pg_recovery%20%E8%AE%BE%E8%AE%A1%E5%8E%9F%E7%90%86%E4%B8%8E%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB/0.png
---
本文将带大家了解 pg_recovery 工具的实现原理、设计思路，并带来源码解读。
<!--more-->

作者：张连壮 PostgreSQL 研发工程师

从事多年 PostgreSQL 数据库内核开发，对 citus 有非常深入的研究。 

---------------------------

# 数据找回的实现原理

一个数据库系统正常的数据读取方式，是从做 `select * from pg_recovery` 的查询开始（即执行事务），执行查询操作过程将同时生成事务的快照，通过 `GetActiveSnapshot()`函数，便可以看到当前可见的数据。

# 设计思路

### 1. 如何读取 Dead 元组？

PostgreSQL 通过 **快照** 来决定当前数据库数据的可见性，因此当一条数据被删除时，数据的实体仍然存在于数据库实例中，通常管这种不可见的数据叫做 Dead 元组（PostgreSQL 中一条数据称为一个元组）。

PostgreSQL 中提供了 SnapshotAny 的特殊快照（还有很多其他类型）。这个快照可以读取任何数据，pg_recovery 便是通过该方式读取的所有数据。默认情况下，只返回 recovery 的数据，不返回可见的数据。

### 2. 函数一次返回多少数据？

数据量是按行返回的，并且每次限定一行。

### 3. 如何控制内存？

函数会多次执行，而有些状态是全局级的。因此可以使用 `multi_call_memory_ctx`  （内存池的上下文）参数，来控制内存。

## 关于函数的参数

通过 SQL 创建函数时，执行如下语句。函数使用请参照上一期内容。

```plain
CREATE FUNCTION pg_recovery(regclass, recoveryrow bool DEFAULT true) RETURNS SETOF record
```
**regclass**：PostgreSQL 的表类型，会将表名自动转换成 OID（OID 数据库内部对象的唯一标识），因此只需输入表名即可。
**reconveryrow bool DEFAULT ture**：默认值 true，表示只返回 recovery 数据。取值 false, 表示返回所有数据。

 执行下列语句，修改参数默认值。

```plain
select * from pg_recovery('aa', recoveryrow => false)
```
**RETURNS SETOF record**：函数返回行类型数据。
# 源码解读

## 必要的数据

```plain
typedef struct
{
    Relation            rel;    -- 当前操作的表
    TupleDesc           reltupledesc; -- 表的元信息
    TupleConversionMap  *map; -- 表的映射图，即表的数据映射成自定义返回的列
    TableScanDesc       scan; -- 扫描表
    HTAB                *active_ctid; -- 可见数据的ctid
    bool                droppedcolumn; -- 是否删除列
} pg_recovery_ctx;
```
## 隐藏列

增加 recoveryrow 的隐藏列，当返回全部信息时，通过此列可以辨别出该行数据是 recovery 的数据，还是用户可见的数据。

```plain
static const struct system_columns_t {
    char       *attname;
    Oid         atttypid;
    int32       atttypmod;
    int         attnum;
} system_columns[] = { 
    { "ctid",     TIDOID,  -1, SelfItemPointerAttributeNumber },
    { "xmin",     XIDOID,  -1, MinTransactionIdAttributeNumber },
    { "cmin",     CIDOID,  -1, MinCommandIdAttributeNumber },
    { "xmax",     XIDOID,  -1, MaxTransactionIdAttributeNumber },
    { "cmax",     CIDOID,  -1, MaxCommandIdAttributeNumber },
    { "tableoid", OIDOID,  -1, TableOidAttributeNumber },
    { "recoveryrow",     BOOLOID, -1, DeadFakeAttributeNumber },
    { 0 },
};
```
## pg_recovery 简化代码

```plain
Datum
pg_recovery(PG_FUNCTION_ARGS)
{
    FuncCallContext     *funcctx;
    pg_recovery_ctx *usr_ctx;

    recoveryrow = PG_GETARG_BOOL(1); -- 获取默认参数

    if (SRF_IS_FIRSTCALL()) -- 每条数据，函数都会调用一次，因此需要先初始化数据
    {
        funcctx = SRF_FIRSTCALL_INIT(); -- 申请上下文
        oldcontext = MemoryContextSwitchTo(funcctx->multi_call_memory_ctx); -- 使用内存池

        usr_ctx->rel = heap_open(relid, AccessShareLock); -- 增加读锁
        usr_ctx->reltupledesc = RelationGetDescr(usr_ctx->rel); -- 获取元信息
        funcctx->tuple_desc = BlessTupleDesc(tupdesc); -- 函数使用的元信息
        usr_ctx->map = recovery_convert_tuples_by_name(usr_ctx->reltupledesc,
                funcctx->tuple_desc, "Error converting tuple descriptors!", &usr_ctx->droppedcolumn); -- 列映射
        usr_ctx->scan = heap_beginscan(usr_ctx->rel, SnapshotAny, 0, NULL , NULL, 0); -- 扫描全部表数据
        active_scan = heap_beginscan(usr_ctx->rel, GetActiveSnapshot(), 0, NULL , NULL, 0); -- 扫描可见数据
        while ((tuplein = heap_getnext(active_scan, ForwardScanDirection)) != NULL)
            hash_search(usr_ctx->active_ctid, (void*)&tuplein->t_self, HASH_ENTER, NULL); -- 缓存可见数据的 ctid

    }

    funcctx = SRF_PERCALL_SETUP(); -- 获取函数之前的上下文
    usr_ctx = (pg_recovery_ctx *) funcctx->user_fctx;

get_tuple:
    if ((tuplein = heap_getnext(usr_ctx->scan, ForwardScanDirection)) != NULL)
    {
        -- 检验表该数据是否是dead
        hash_search(usr_ctx->active_ctid, (void*)&tuplein->t_self, HASH_FIND, &alive);

        tuplein = recovery_do_convert_tuple(tuplein, usr_ctx->map, alive); -- 将原表数据转换成输出格式
        SRF_RETURN_NEXT(funcctx, HeapTupleGetDatum(tuplein)); -- 转换成Datum格式,返回数据
    }
    else
    {   
        -- 读取完数据
        heap_endscan(usr_ctx->scan); -- 结束扫描表
        heap_close(usr_ctx->rel, AccessShareLock); -- 释放锁
        SRF_RETURN_DONE(funcctx); --释放函数资源
    }
}
```
## 生成映射表

```plain
TupleConversionMap *
recovery_convert_tuples_by_name(TupleDesc indesc,
                       TupleDesc outdesc,
                       const char *msg, bool *droppedcolumn)
{

    attrMap = recovery_convert_tuples_by_name_map(indesc, outdesc, msg, droppedcolumn); -- 处理recoveryrow/隐藏列/可见列的映射

    map->indesc = indesc;
    map->outdesc = outdesc;
    map->attrMap = attrMap;
    map->outvalues = (Datum *) palloc(n * sizeof(Datum));
    map->outisnull = (bool *) palloc(n * sizeof(bool));
    map->invalues = (Datum *) palloc(n * sizeof(Datum));
    map->inisnull = (bool *) palloc(n * sizeof(bool));
    map->invalues[0] = (Datum) 0;
    map->inisnull[0] = true;

    return map;
}
```
## 元组转换函数

```plain
HeapTuple
recovery_do_convert_tuple(HeapTuple tuple, TupleConversionMap *map, bool alive)
{
    heap_deform_tuple(tuple, map->indesc, invalues + 1, inisnull + 1); -- 将元组拆分,提取列数据

    for (i = 0; i < outnatts; i++)
    {
        outvalues[i] = invalues[j]; -- 转换数据
        outisnull[i] = inisnull[j]; -- 转换数据
    }

    return heap_form_tuple(map->outdesc, outvalues, outisnull); -- 将列数据转换成元组
}
```
 
