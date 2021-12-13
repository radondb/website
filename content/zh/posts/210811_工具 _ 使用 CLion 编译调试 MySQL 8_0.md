---
title: "工具 | 使用 CLion 编译调试 MySQL 8.0"
date: 2021-08-11T15:39:00+08:00
author: "傅治宇"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 源码
# 相关文章会通过keywords来匹配
keywords:
  - mysql
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210811_%E5%B7%A5%E5%85%B7%20%7C%20%E4%BD%BF%E7%94%A8%20CLion%20%E7%BC%96%E8%AF%91%E8%B0%83%E8%AF%95%20MySQL%208.0/0.png
---
想阅读 MySQL 源码可以从哪些角度着手？先准备一个编译调式的环境吧！
<!--more-->

MySQL 源代码是基于关系模型理论的具体实现，是数据库理论与实践的结合。

阅读 MySQL 及相关工具的源代码，不仅是数据库研发人员的日常，也是 DBA 进阶的必经之路，全方位提高技术水平。

* **夯实原理：** 对数据库基础理论以及事务等相关理论更加深刻的认识；
* **优化性能：** 更加深入理解配置项的作用，适配环境，提升性能；
* **定位故障：** 有助于数据库故障的快速定位，知其然也知其所以然；
* **拥抱开源：** 修改源代码（修改 Bug、完善功能、提升性能），回馈开源。
# | 从哪开始阅读？

阅读 MySQL 源代码，主要是指阅读 mysql-server[1] 里面的代码。不仅需要理论知识的深入学习，还需要实际应用上手实践，具体可从以下几个角度着手，从不同维度，不同深度去了解 MySQL 源代码。

## 1. SQL 执行流程

通过环境调试，从理论基础实践掌握 SQL 语句（DDL/DML 等）完整的执行流程。

## 2. 结构层次

通过 MySQL 源代码结构层次，掌握底层技术原理。

* 接入层：MySQL 协议、连接线程池等;
* SQL 层：词法、语法解析、执行器、优化器;
* 存储引擎层：插件框架、存储引擎设计原理，例如 InnoDB、RocksDB 架构等。
## 3. 数据抽象/数据转换

数据库对于使用者展现的是二维的关系表。在阅读源码的时候，可以从数据抽象/数据转换的角度去阅读。

* 数据抽象：二维的关系表在 SQL 层/存储引擎中的数据表现形式
* 数据转换：二维关系表在 SQL 层到存储引擎的数据转换/存储引擎到磁盘的数据转换
## 4. 功能实现

通过观察数据库中每种具体功能的实现方式，来熟悉 MySQL 源代码。

# | 准备调试环境

正所谓：**“工欲善其事必先利其器”**，阅读源代码必须要阅读 **"动"** 态的代码，仅看 **"静"** 态代码必定是枯燥且无用的。那么搭建一个能够调试 MySQL 源代码的环境，则是阅读 MySQL  源代码，实践并掌握 MySQL 技术知识必不可少的过程。

本文介绍使用 CLion 在 Ubuntu 下的调试过程，来实例演示 MySQL 源代码环境的调试过程，即从实践掌握 **SQL 执行流程**。

## CLion 简介

CLion[2] 是一款专门为开发 C 及 C++ 所设计的跨平台 IDE。它包含了插件以及智能功能来帮助开发人员提高开发代码的效率。

## 环境

* 操作系统：20.04.1-Ubuntu
* CLion 版本: CLion 2021.1.1
* MySQL 版本：8.0.25
## 编译依赖

```plain
apt install libncurses-dev
apt install libssl-dev
apt install cmake
apt-get install bison
```
*MySQL 8.0.25 依赖 boost 1.73.0 版本[3]
## CLion 调试配置

通过 CLion 调试 MySQL 源代码，需将 MySQL 编译路径与 MySQL 安装路径的配置统一。

**1. 将下载的源代码放入 home 目录中**

**2. 解压源代码，并在源代码目录下创建 build 和 /build/data 两个目录**

**3. 配置 CLion 的 Cmake 的编译目录**
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210811_%E5%B7%A5%E5%85%B7%20%7C%20%E4%BD%BF%E7%94%A8%20CLion%20%E7%BC%96%E8%AF%91%E8%B0%83%E8%AF%95%20MySQL%208.0/1.png)

**4. 配置 CLion 的 Cmake 的编译参数**

```plain
-DCMAKE_BUILD_TYPE=Debug
-DWITH_BOOST=/home/tool/boost_1_73_0
-DCMAKE_INSTALL_PREFIX=/home/code/mysql-server-mysql-8.0.25/build 
#编译路径与安装路径需一致
-DMYSQL_DATADIR=/home/code/mysql-server-mysql-8.0.25/build/data 
#数据库初始化路径
-DSYSCONFDIR= home/code/mysql-server-mysql-8.0.25/build
-DMYSQL_UNIX_ADDR=/home/code/mysql-server-mysql-8.0.25/build/data/mysql.sock
```
**5. MySQL 编译**
方法一：使用 CLion 直接编译
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210811_%E5%B7%A5%E5%85%B7%20%7C%20%E4%BD%BF%E7%94%A8%20CLion%20%E7%BC%96%E8%AF%91%E8%B0%83%E8%AF%95%20MySQL%208.0/2.png)

方法二：手动编译

```plain
cd /home/code/mysql-server-mysql-8.0.25/build
make -j 4
```
>说明：由于 CLion 导入 MySQL 源代码时，会在   `/home/code/mysql-server-mysql-8.0.25/build` 下面生成 makefile，可以直接执行 make 命令。 

**6. MySQL 数据库初始化**

```plain
# 创建 MySQL 用户组和 MySQL 用户
groupadd mysql
useradd -r -g mysql -s /bin/false mysql
# MySQL 数据库初始化
cd /home/code/mysql-server-mysql-8.0.25/build/bin
./mysqld --basedir=/home/code/mysql-server-mysql-8.0.25/build \
--datadir=/home/code/mysql-server-mysql-8.0.25/build/data \
--initialize-insecure --user=mysql
```
**7. 修改文件权限**
```plain
chmod -R 777 /home/code/mysql-server-mysql-8.0.25/build/data
```
**8. 设置 CLion 的 mysqld 配置参数**
`Program arguments` 参数设置为：

```plain
--basedir=/home/code/mysql-server-mysql-8.0.25/build --datadir=/home/code/mysql-server-mysql-8.0.25/build/data --user=mysql
```
`Working directory` 参数设置为：
```plain
/home/code/mysql-server-mysql-8.0.25/build/data
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210811_%E5%B7%A5%E5%85%B7%20%7C%20%E4%BD%BF%E7%94%A8%20CLion%20%E7%BC%96%E8%AF%91%E8%B0%83%E8%AF%95%20MySQL%208.0/3.png)

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210811_%E5%B7%A5%E5%85%B7%20%7C%20%E4%BD%BF%E7%94%A8%20CLion%20%E7%BC%96%E8%AF%91%E8%B0%83%E8%AF%95%20MySQL%208.0/4.png)

**9. 调试 mysqld**

步骤一：启动 mysqld ，并验证 mysqld 是否启动 `ps -ef | grep mysql`
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210811_%E5%B7%A5%E5%85%B7%20%7C%20%E4%BD%BF%E7%94%A8%20CLion%20%E7%BC%96%E8%AF%91%E8%B0%83%E8%AF%95%20MySQL%208.0/5.png)

步骤二：在 sql_parse.cc 中的  `do_command`  函数加上断点。

步骤三：登录 MySQL ，验证环境是否正常运行。

```plain
 ./mysql -uroot -h127.0.0.1 -P3306 -p
```
>说明：初次登录无需密码，直接回车。初始化时的参数  `--initialize-insecure`。 
# | 结语

至此 MySQL 源代码调试环境正常运行，可在调试环境上执行相关操作。了解 MySQL 源代码运行机制、实现原理、配置参数作用等。

## 参考

[1]. mysql-server：[https://github.com/mysql/mysql-server/](https://github.com/mysql/mysql-server/)

[2]. CLion：[https://www.jetbrains.com/clion/](https://www.jetbrains.com/clion/)

[3]. boost ：[https://www.boost.org/](https://www.boost.org/)

