---
title: "源码 | 解析 Redo Log 实现方式"
date: 2021-09-01T15:39:00+08:00
author: "柯煜昌"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 源码
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210901_%E6%BA%90%E7%A0%81%20%7C%20%E8%A7%A3%E6%9E%90%20Redo%20Log%20%E5%AE%9E%E7%8E%B0%E6%96%B9%E5%BC%8F/0.png
---
基于 Redis 缓存设计思想，优化缓存业务代码。
<!--more-->
柯煜昌 顾问软件工程师

目前从事 RadonDB 容器化研发，华中科技大学研究生毕业，有多年的数据库内核开发经验。 

-------------------------


# | 前言

提及 Redo Log（重做日志）与 LSN（log sequece number）时，经常被问及以下问题：

* MySQL 的 InnoDB 为什么要有 Redo Log？
* LSN 是什么？
* LSN 与 Redo Log 之间有什么相互关系？
* Redo Log 如何轮换？
* ……

基于 MySQL 8.0 的源码，以及对 InnoDB 机制一些内部探讨与分享，写了几篇关于 Redo Log 的文章。本篇先讲一下 Redo Log 的日志结构。

## 什么是页？

讲 Redo Log 之前，先来了解一下 Jeff Dean 对计算机系统中各种存储系统访问时间的总结[1]：

```plain
Latency Comparison Numbers
--------------------------
L1 cache reference                           0.5 ns
Branch mispredict                            5   ns
L2 cache reference                           7   ns                      14x L1 cache
Mutex lock/unlock                           25   ns
Main memory reference                      100   ns                      20x L2 cache, 200x L1 cache
Compress 1K bytes with Zippy             3,000   ns        3 us
Send 1K bytes over 1 Gbps network       10,000   ns       10 us
Read 4K randomly from SSD*             150,000   ns      150 us          ~1GB/sec SSD
Read 1 MB sequentially from memory     250,000   ns      250 us
Round trip within same datacenter      500,000   ns      500 us
Read 1 MB sequentially from SSD*     1,000,000   ns    1,000 us    1 ms  ~1GB/sec SSD, 4X memory
Disk seek                           10,000,000   ns   10,000 us   10 ms  20x datacenter roundtrip
Read 1 MB sequentially from disk    20,000,000   ns   20,000 us   20 ms  80x memory, 20X SSD
Send packet CA->Netherlands->CA    150,000,000   ns  150,000 us  150 ms
Notes
-----
1 ns = 10^-9 seconds
1 us = 10^-6 seconds = 1,000 ns
1 ms = 10^-3 seconds = 1,000 us = 1,000,000 ns
Credit
------
By Jeff Dean:               http://research.google.com/people/jeff/
Originally by Peter Norvig: http://norvig.com/21-days.html#answers
```
从总结内容可知：**内存的访问速度至少是 SSD 的 4 倍、磁盘顺序访问的 80 倍！** 磁盘、SSD 顺序读写明显要快于随机读写，而且磁盘、SSD 对频繁的小写均不友好。因此主流的数据库采用一次读写一个块，并且使用 **buffer/cache** 技术尽量减少读写次数。InnoDB 称这种读写块为 **页**。
## 写放大怎么办？

对于一次事务来说，写一行数据，对应页中一个记录。但是要实现事务的持久化，不光是要往磁盘中写数据页，还要写 Undo 页。这就是出现了修改一行，需要持久化多个页到磁盘中，因此性能的损失会比较大，这也就是通常所说的写放大问题。因此人们提出了先写日志 **WAL**(write ahead log) 的方式进行优化，即将 **页** 中修改的操作，转换为重做日志（Redo Log）。

在事务提交时，不需要保证修改的页持久化到磁盘中，只需保证日志已经持久化存储到磁盘中即可。如果出现掉电或者故障的场景，内存的页虽然丢失，但是可以通过磁盘的页进行 Redo 重做，恢复更改的内存页。

在绝大部分情况下，Redo Log 数据比数据页和 Undo 页要小，而且按顺序写入，性能也比写放大后的好。由此可以看出，数据库使用 Redo 对数据的操作，速度上接近内存，持久性接近磁盘。

# | Redo Log 的实现方式

## 设计思路

InnoDB 的 Redo Log 是一组文件的集合，默认是两个。每个日志文件又由一组 512 Byte 大小的日志块组成。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210901_%E6%BA%90%E7%A0%81%20%7C%20%E8%A7%A3%E6%9E%90%20Redo%20Log%20%E5%AE%9E%E7%8E%B0%E6%96%B9%E5%BC%8F/1.png)

图 1. 日志文件结构

每个日志文件前 4 个日志块保留。其中第一个日志文件里的前 4 块保存着 Redo 日志的元数据信息。日志文件大小在初始化就已经确定，日志块逻辑上组成一个环，循环使用。

细心的读者会发现，日志文件前 4 个保留日志块，有 2 个 checkpoint 块，不免会有如下两个疑问：

**1. 为什么会有两个 checkpoint 块？**

checkpoint  是崩溃恢复过程中应用日志的起点。如果 checkpoint 块写入如果出现故障或者掉电，InnoDB 就无法找到日志的起点。如果两个 checkpoint 轮换写入，遇到写入checkpoint  块失败，可以在另一个 checkpoint  块上取得上次的 checkpoint LSN 作为起点。

**2. 会不会两个 checkpoint 块都写坏？**

假设 checkpoint1 掉电损坏，则选择 checkpoint2 块选取前一个 checkpoint LSN 做恢复。按照 InnoDB 的轮换算法，第二次写入 checkpoint 点的位置仍然是 checkpoint1，再次写入掉电仍然只会在 checkpoint1 损坏，两个 checkpoint 块方法仍然是可靠的。

## Header 日志块

Header 日志块是描述日志总体信息的块，虽然只有第一个日志文件有内容，但是 InnoDB 每个日志文件都有 Header 日志块。

|宏|偏移|长度|含义|
|:----:|:----:|:----:|:----:|
|LOG_HEADER_FORMAT|0|4|格式|
|LOG_HEADER_PAD1|4|4|补齐长度，预留字段|
|LOG_HEADER_START_LSN|8|8|起始 LSN，最初为固定值 4*k. <br>  如果发现有删除 Redo 文件的动作，则可能是系统表空间第一个页 page LSN 计算。|
|LOG_HEADER_CREATOR|16|32|日志文件名称|
|LOG_HEADER_FLAGS|48|4|特殊用途|
|其他空间，通常为 0|其他空间，通常为 0|其他空间，通常为 0|其他空间，通常为 0|
|CHECKSUM|508|4|日志块的 checksum<br>checksum 用来验证 block 的是否完整和正确。|

## checkpoint 日志块

日志文件中记录检查点信息的日志块有两个，每个 checkpoint 日志块结构如下：

|宏|偏移|长度|含义|
|:----:|:----:|:----:|:----:|
|LOG_CHECKPOINT_NO|0|8|checkpoint 序号|
|LOG_CHECKPOINT_LSN|8|16|checkpoint LSN|
|LOG_CHECKPOINT_OFFSET|16|8|checkpoint 的文件偏移|
|其他空间，通常为 0|其他空间，通常为 0|其他空间，通常为 0|其他空间，通常为 0|
|CHECKSUM|508|4|日志块的 checksum|

## 普通日志块

记录日志记录信息的日志块，头 12 个字节与最后 4 个字节记录日志的描述信息，其他空间存储日志记录。日志块结构如下：

|    |偏移|长度|含义|
|:----:|:----:|:----:|:----:|
|LOG_BLOCK_HDR_NO|0|4|日志块的序号<br>最高比特位是 flushbit|
|LOG_BLOCK_HDR_DATA_LEN|4|2|块内日志长度<br>包含头部信息与 checksum，最高位指示是否加密|
|LOG_BLOCK_FIRST_REC_GROUP|6|2|第一条全新日志开始位置|
|LOG_BLOCK_CHECKPOINT_NO|8|4|本次 checkpoint 的序号|
|其他空间，用以存储日志记录|其他空间，用以存储日志记录|其他空间，用以存储日志记录|其他空间，用以存储日志记录|
|CHECKSUM|508|4|日志块的 checksum|

## 示例

**一条日志记录可以跨多个日志块，一个日志块可以包含多个日志记录。**

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210901_%E6%BA%90%E7%A0%81%20%7C%20%E8%A7%A3%E6%9E%90%20Redo%20Log%20%E5%AE%9E%E7%8E%B0%E6%96%B9%E5%BC%8F/2.png)

图 2. 几种日志块示例

*图中 block tailer 表示 checksum。

**示例结构说明**

* 上图中，三个日志块的 LOG_BLOCK_HDR_DATA_LEN 值都为 512；
* log block1 的 LOG_BLOCK_FIRST_REC_GROUP 值为 12；
* log block2 无全新日志，则值为 0；
* log block3 值为 12+ 红色部分的长度；
* 日志块的块号依据 LSN 位置换算。

**1. checkpoint 的序号是怎么计算的？**

假设当前 checkpoint 的序号为 4，InnoDB 推进检查点时候，写入到 checkpoint 块的checkpoint 序号为 4，推进检查点之后，当前系统的 checkpoint 序号就加 1 变成 5。新写的日志块的 check point 需要都是 5。

**2. 为什么会有 flushbit？**

通常情况下，log block 的序号最高位都是 1，为 0 的情况。log buffer 中日志块还未写完，而 log buffer 已经满。此时 log buffer 的日志块都写入到磁盘中，但是最后一个日志块肯定是不完整的。此时 flush bit 为 0，表示该日志块是不完整的。将来 InnoDB 会清空 log buffer，重新将该日志块写完整。

# | Redo Log 的切换写入

假设 LSN 起点为 1，每个日志文件长度为 5，下图展示了 LSN 增长时如何切换文件。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210901_%E6%BA%90%E7%A0%81%20%7C%20%E8%A7%A3%E6%9E%90%20Redo%20Log%20%E5%AE%9E%E7%8E%B0%E6%96%B9%E5%BC%8F/3.png)

图 3. 日志切换

很显然，LSN 1～5 在第一个文件，6～10 在第二个文件，LSN 11 在第一个文件 LSN 为 1 所在位置。Redo Log 应该写在哪个文件，是可以依据 LSN 计算出来的。

那么，**Redo Log 是如何将顺序写入的结构实现为一个逻辑的环呢？**

# | 从 LSN 到 Offset

**日志在逻辑上是一个环**。checkpoint LSN 表示，LSN 之前的修改的 page 已经成功持久化到磁盘中，相关的 Redo Log 的使命已经结束。作为崩溃恢复的起点，它一定是在某个 MTR 的 END LSN 位置。因此位置可能在某日志块边缘，也可能在日志块中。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210901_%E6%BA%90%E7%A0%81%20%7C%20%E8%A7%A3%E6%9E%90%20Redo%20Log%20%E5%AE%9E%E7%8E%B0%E6%96%B9%E5%BC%8F/4.png)

图 4. Checkpoint LSN 可能在的位置

通过前面的内容得知，checkpoint 块保存的信息有 checkpoint LSN 与 LOG_CHECKPOINT_OFFSET。checkpoint offset 是 checkpoint LSN 在日志文件组中的偏移位置。因此 LSN 与 offset 计算公式如下：

```plain
size_capacity = log.n_files * (log.file_size - LOG_FILE_HDR_SIZE);
```

日志的容量是文件个数乘以日志文件有效空间（文件大小减去四个 logblock）。

```plain
if (lsn >= log.current_file_lsn) {
delta = lsn - log.current_file_lsn;
 delta = delta % size_capacity;
} else {
/* Special case because lsn and offset are unsigned. */
 delta = log.current_file_lsn - lsn;
 delta = size_capacity - delta % size_capacity;
}
```

在启动时,`current_file_lsn` 通常是 checkpoint LSN， `current_file_real_offset` 通常是 checkpoint offset。LSN 比 checkpoint LSN 大，所以`delta = lsn - log.current_file_lsn`表示 LSN 与 checkpoint LSN 的距离。这个距离可能会超过 size_capacity ，因此使用了取余操作。如果 LSN 比 checkpoint LSN 小呢？这说明 LSN 在 checkpoint LSN 前面。checkpoint LSN 是起点，也是终点。checkpoint LSN + size_capacity 的位置，也是checkpoint LSN 所在的位置。所以`delta = size_capacity - delta % size_capacity;` 与`- delta % size_capacity`是等效的，为避免 offset 计算出现负数的情况，可做如下处理：

```plain
size_offset = log_files_size_offset(log, log.current_file_real_offset);
size_offset = (size_offset + delta) % size_capacity;
return (log_files_real_offset(log, size_offset));
```

这个`log_files_size_offset`是将`current_file_real_offset` 转换成日志文件有效空间的偏移位置，计算公式为：

```plain
current_file_real_offset - LOG_FILE_HDR_SIZE*(1 + current_file_real_offset/log.file_size)
```

将 curren_file_real_offset 减掉文件头的 4 个 logblock 大小，无跨文件就减一次，跨几个文件就多减几次。再加上偏移值，转换成 `file_real_offset` 就得到了真实的位置。

# | 总结

本文介绍了 Redo Log 与各个日志块的基本结构，并通过示例说明了 Redo Log 的两个checkpoint 作用以及 LSN 如何与日志位置对应。

Redo Log 是一个非常重要的组成部分，LSN 通常作为数据库中数据变更的逻辑时钟，与 Redo Log 密切不可分，弄清 Redo Log 的作用与机制，就能轻松理解 LSN、数据库持久化这些概念。

# 参考引用

[1]. [https://d-k-ivanov.github.io/docs/CheatSheets/Latency_Numbers/](https://d-k-ivanov.github.io/docs/CheatSheets/Latency_Numbers/) 

