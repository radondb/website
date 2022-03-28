---
title: "工具 | 如何对 MySQL 进行 TPC-C 测试？"
date: 2022-01-13T15:39:00+08:00
author: "丁源"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 测试
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/220113_%E5%B7%A5%E5%85%B7%20%7C%20%E5%A6%82%E4%BD%95%E5%AF%B9%20MySQL%20%E8%BF%9B%E8%A1%8C%20TPC-C%20%E6%B5%8B%E8%AF%95%EF%BC%9F/0.png

---
根据 DWorks 2020 年发布的《中国自研数据库登顶 TPC-C 的意义》[1] 报告显示，大于 67.9% 的受访者表示在数据库选型时会参考 TPC-C 的测试结果。对用户来说，性能是数据库选型时最重要的指标之一。而 TPC-C 作为权威的测试基准，是一个能够直观反映软硬件性能的方式。
<!--more-->

作者：丁源 RadonDB 测试负责人

负责 RadonDB 云数据库、容器化数据库的质量性能测试，迭代验证。对包括云数据库以及容器化数据库性能和高可用方案有深入研究。 
# 背景

根据 DWorks 2020 年发布的《中国自研数据库登顶 TPC-C 的意义》[1] 报告显示，大于 67.9% 的受访者表示在数据库选型时会参考 TPC-C 的测试结果。对用户来说，性能是数据库选型时最重要的指标之一。而 TPC-C 作为权威的测试基准，是一个能够直观反映软硬件性能的方式。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220113_%E5%B7%A5%E5%85%B7%20%7C%20%E5%A6%82%E4%BD%95%E5%AF%B9%20MySQL%20%E8%BF%9B%E8%A1%8C%20TPC-C%20%E6%B5%8B%E8%AF%95%EF%BC%9F/1.jpg)

图片来源：2020 DWorks《中国自研数据库登顶 TPC-C 的意义》 
# 几个概念

## 一个协会

TPC（事务处理性能协会：Tracsaction Processing Performance Council），是一个大型非盈利的组织。TPC 主要制定了商务应用标准程序（Benchmark）的标准规范，性能和价格度量，并管理测试结果的发布。任何厂家或测试者都可以根据规范，执行标准性能测试。

## 一个标准

TPC-C 是在线事务处理（OLTP）的基准程序。专门针对联机事务处理系统（OLTP）的性能测试规范，其测试结果可为用户在选择相应解决方案平台时提供参考标准。

## 一个工具

TPCC-MySQL[2] 是 Percona 基于 TPC-C 衍生出来的标准规范，专门用于 MySQL 基准测试。可运行于 Windows、GNU/Linux、UNIX 以及 Mac OS 系统之上。

## 一个场景

TPC-C 有一个比较有代表意义的 OLTP 模拟场景：**在线订单处理系统**。

假设有一个大型商品批发商，拥有 N 个位于不同区域的仓库，每个仓库负责为 10 个销售点供货，每个销售点有 3000 个客户，每个客户平均一个订单有 10 项产品。由于一个仓库中不可能 存储公司所有的货物，有一些请求必须发往其它仓库，因此，数据库在逻辑上是分布的。N 是一个可变参数，测试者可以随意改变 N，以获得最佳测试效果。

## 五类事务

该场景下，TPC-C 规范对应五类事务：

| **New-Order** | 客户输入一笔新的订货交易|
|:----:|:----|
|**Payment**|更新客户账户余额以反应其支付状况|
|**Delivery**|发货（批处理交易）|
|**Order-Status**|查询客户最近交易的状态|
|**Stock-Level**|查询仓库库存状况，以便能够及时补货|

测试完成后会输出这五类事务的吞吐量和延迟，而业内关注的 TPC-C 核心性能指标只有两个：

* New-Order 事务的吞吐量（TPM）
* 延迟
其原因是 TPC 委员会制定 TPC-C 时，重点考量的是 **数据库对新订单的处理能力，以揭示该数据库的商业成本**。数据库整体报价 / TPM = 每个订单的数据库成本。这个指标对衡量一款数据库的性价比，具有非常实际的指导作用。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220113_%E5%B7%A5%E5%85%B7%20%7C%20%E5%A6%82%E4%BD%95%E5%AF%B9%20MySQL%20%E8%BF%9B%E8%A1%8C%20TPC-C%20%E6%B5%8B%E8%AF%95%EF%BC%9F/2.jpg)

TPC-C 模拟业务场景 

接下来将介绍使用 TPC-C 工具模拟业务测试场景。

# 环境准备

操作系统：Ubuntu 18.04.5 LTS

容器平台：KubeSphere V3.1.1

数据库：RadonDB MySQL Kubernetes

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220113_%E5%B7%A5%E5%85%B7%20%7C%20%E5%A6%82%E4%BD%95%E5%AF%B9%20MySQL%20%E8%BF%9B%E8%A1%8C%20TPC-C%20%E6%B5%8B%E8%AF%95%EF%BC%9F/3.jpg)

>KubeSphere 界面 
环境准备完毕，RadonDB MySQL Kubernetes[3] 已经在 KubeSphere[4] 管理界面可见。

## 创建测试 Pod

```bash
kubectl run -i --tty --rm --image ubuntu test-shell bash
kubectl exec -ti test-shell -c test-shell /bin/bash
apt-get update
```
## 安装工具

先安装 make、gcc、git 等工具

```bash
apt-get install make
apt-get install gcc
apt-get install git
```
安装测试所需的 MySQL 客户端和开发环境
```bash
apt-get install mysql-server
apt-get install libmysqlclient-dev
```
源码安装 tpcc-mysql
```bash
git clone https://github.com/Percona-Lab/tpcc-mysql.git
cd tpcc-mysql/src
make
```
# 数据准备

>真实测试场景中，仓库数一般不建议少于 100 个，视服务器硬件配置而定。如果配置了  SSD 或者 PCIE SSD 这种高 IOPS 设备，建议配置仓库数不低于 1000 个。 
## 创建用户

创建用户并授权。

```sql
mysql> CREATE USER radondb@localhost IDENTIFIED BY 'mysql_password';
Query OK, 0 rows affected (0.00 sec)

mysql> grant all privileges on *.* to 'radondb'@'%'identified by 'mysql_password' with grant option;
Query OK, 0 rows affected, 1 warning (0.01 sec)
```
## 创建所需库表

使用 mysqladmin 工具创建测试数据库  tpcc1000。

```bash
mysqladmin create  tpcc1000  -h server_host   -u mysql_user -p mysql_password
```
tpcc-mysql 工具自带前面介绍的测试场景数据表  `create_table.sql` 文件、索引文件  `add_fkey_idx.sql` 文件。 
```bash
mysql -D tpcc1000 -h  server_host  -u mysql_user -p mysql_password < create_table.sql
mysql -D tpcc1000 -h  server_host  -u mysql_user -p mysql_password < add_fkey_idx.sql 
```
## 添加数据

使用 tpcc_load 工具，为指定数据库添加数据。

```bash
./tpcc_load -h server_host  -d tpcc1000 -u mysql_user -p mysql_password -w 20
```
# TPC-C 测试

## 开始测试

执行如下命令，开启一个测试案例。

```bash
./tpcc_start -h server_host  -d tpcc1000 -u mysql_user -p mysql_password  -w 20 -c 128 -r 120 -l 200  - >tpcc-output-log
```
参数说明：
|参数|说明|
|:----|:----|
|-w|指定仓库数量。|
|-c|指定并发连接数。|
|-r|指定开始测试前进行 warmup 的时间，进行预热后，测试效果更好。|
|-l|指定测试持续时间。|
|-i|指定生成报告间隔时长。|
|-f|指定生成的报告文件名。|

# 测试结果展示

## 生成图表

安装绘图工具 gnuplot[5]，并生成 tcpp.gif 图片。

```bash
yum install -y gnuplot
cat log.conf | gnuplot
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220113_%E5%B7%A5%E5%85%B7%20%7C%20%E5%A6%82%E4%BD%95%E5%AF%B9%20MySQL%20%E8%BF%9B%E8%A1%8C%20TPC-C%20%E6%B5%8B%E8%AF%95%EF%BC%9F/4.jpg)

以上就是利用容器 Pod 测试 RadonDB MySQL 数据库全部过程，可以尝试调整测试条件，获得更多测试数据。

# 总结

TPC-C 的测试结果主要参考流量和性价比两个指标。

#### 流量

Throughput，简称 tpmC。按照 TPC 的定义，流量指标描述了系统在执行 Payment、Order-status、Delivery、Stock-Level 这四种交易时，每分钟处理 New-Order 交易的数量。所有交易的响应时间必须满足 TPC-C 测试规范的要求。

**流量值越大越好！**

#### 性价比

Price/Performance，简称 Price/tpmC。即测试系统价格（指在美国的报价）与流量指标的比值。

**性价比越小越好！**

# 参考引用

1. 《中国自研数据库登顶TPC-C的意义》：[https://zhuanlan.zhihu.com/p/114152924](https://zhuanlan.zhihu.com/p/114152924)

2. TPCC-MySQL：[https://github.com/Percona-Lab/tpcc-mysql](https://github.com/Percona-Lab/tpcc-mysql)

3. RadonDB MySQL Kubernetes：[https://github.com/radondb/radondb-mysql-kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)

4. KubeSphere：[https://kubesphere.com.cn](https://kubesphere.com.cn)

5. gnuplot：[http://www.gnuplot.info](http://www.gnuplot.info) 

