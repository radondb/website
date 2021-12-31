---
title: "工具 | 常用 MySQL 内核 Debug 技巧"
date: 2021-12-17T15:39:00+08:00
author: "柯煜昌"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 源码
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/211217_%E5%B7%A5%E5%85%B7%7C%E5%B8%B8%E7%94%A8%20MySQL%20%E5%86%85%E6%A0%B8%20Debug%20%E6%8A%80%E5%B7%A7/0.png
---
掌握 MySQL 内核源码的阅读和调试能力，不仅是数据库研发人员的日常，也是 DBA 进阶的必经之路。
<!--more-->

作者：柯煜昌  顾问软件工程师

目前从事 RadonDB MySQL 容器化研发，华中科技大学研究生毕业，有多年的数据库内核开发经验。 

------------------------

掌握 MySQL 内核源码的阅读和调试能力，不仅是数据库研发人员的日常，也是 DBA 进阶的必经之路。

#### 阅读本文你将了解：

* 如何准备 MySQL 调试环境
* GDB 调试入门及操作示例
* Trace 文件调试及操作示例

# 一、准备 Debug 环境

首先用源码编译安装一个用来调试的 MySQL 环境。

开启 `-DWITH_DEBUG` ，在源码路径创建  `build` 目录，进入目录并执行：

```plain
cmake .. -DWITH_BOOST=../../boost -DWITH_DEBUG=1
```
然后通过如下方式，确认是否编译成功。
方式一：

```plain
$ ./bin/mysqld --verbose --version
```
回显 **debug** 版本信息，则编译的是 debug 版本。
```plain
ver 8.0.18-debug for Linux on x86_64 (Source distribution)
```
方式二：
连接数据库，执行查看版本命令。回显包含了 **debug** 字样，则编译的是 debug 版本。

```plain
$ mysql> select version();
+--------------+
| version()    |
+--------------+
| 8.0.18-debug |
+--------------+
1 row in set (0.00 sec)
```
# 二、使用 GDB 调试

GDB 全称 “GNU symbolic debugger”，是 Linux 下常用的程序调试器，通常以 gdb 命令的形式在终端（Shell）中使用。 
## 启动 GDB 编译器

执行如下命令启动 GDB 编译器（假设 `my.cnf` 在用户根目录中）。进入 GDB  后，敲入 run 即可运行。

```plain
gdb --args ./bin/mysqld --defaults-file=～/my.cnf --gdb
```
其中 --gdb 参数允许你随时 Ctrl+C 的方式中断 mysqld 进程，进行调试命令。
## GDB 常用命令

使用多窗口查看源码与调试的读者，可以使用 `layout` 命令，在 gdb 中执行 `help layout` 可以查看更多 gdb 命令用法。

```plain
(gdb) help layout
(gdb) help layoutChange the layout of windows.
Usage: layout prev | next | <layout_name>
Layout names are:
   src   : Displays source and command windows.
   asm   : Displays disassembly and command windows.
   split : Displays source, disassembly and command windows.
   regs  : Displays register window. If existing layout
           is source/command or assembly/command, the
           register window is displayed. If the
           source/assembly/command (split) is displayed,
           the register window is displayed with
           the window that has current logical focus.

(gdb)
```
可以通过 **GDB cheat sheet**[1]，了解更多 GDB 使用方式。
## Debug 示例

安装好 Debug 环境后，我们用以下两个例子，来简单演示使用思路及技巧。

### 1、取变量值

在某种情况下发现 **mysqld** 已经 **crash**，系统只有一个 core 文件，而我们要知道某个系统变量的值。但是系统变量的值，不见得与 `my.cnf` 文件一致。

此时，就可以用 gdb 命令将变量打印出来，获取变量值。

如下所示，需获取变量 `version` 的值，只需要在前面加 `mysql_sysvar_` 前缀打印即可。

```plain
Thread 1 "mysqld" received signal SIGINT, Interrupt.
0x00007ffff5f74cb9 in __GI___poll (fds=0x55555e8a3de0, nfds=2, timeout=-1) at ../sysdeps/unix/sysv/linux/poll.c:29
29    ../sysdeps/unix/sysv/linux/poll.c: No such file or directory.
(gdb) p mysql_sysvar_version
$1 = {flags = 68101, name = 0x55555e7ff738 "innodb_version", comment = 0x55555ca953e2 "InnoDB version", check = 0x555558e222f1 <check_func_str(THD*, SYS_VAR*, void*, st_mysql_value*)>, update = 0x555558e22881 <update_func_str(THD*, SYS_VAR*, void*, void const*)>,
  value = 0x55555def1c20 <innodb_version_str>, def_val = 0x55555ca89598 "8.0.18"}
(gdb)
```
### 2、调试脚本

假设需获取某一个连接进入 `dispatch_command` 有哪些 `command` ，可以执行 gdb 脚本[2] 获取。

gdb 脚本内容如下：

```plain
b dispatch_command
commands
    print command
    continue
end
```
执行 gdb 脚本，然后使用 mysql 客户端连接数据库，并执行 SQL 语句操作，即可查看到 gdb 调试信息。
```plain
(gdb) b dispatch_command
Breakpoint 3 at 0x555558ddb37c: file /home/kyc/mysql8/sql/sql_parse.cc, line 1581.
(gdb) commands
Type commands for breakpoint(s) 3, one per line.
End with a line saying just "end".
>print command
>continue
>end
(gdb) c
Continuing.
[Switching to Thread 0x7fffe01fc700 (LWP 5941)]

Thread 49 "mysqld" hit Breakpoint 3, dispatch_command (thd=0x7fff4c000f70, com_data=0x7fffe01fbba0, command=COM_QUERY) at /home/kyc/galaxyengine/sql/sql_parse.cc:1581
1581                          enum enum_server_command command) {
$4 = COM_QUERY
```
# 三、使用 Trace 文件调试

MySQL 的 debug 版提供了一个专门的 DBUG 包[3]。通过这个 DBUG 包，可获取正在执行操作程序的 Trace 文件。

通过控制 DBUG 开关，可以将 MySQL 的任何操作，以及所涉及的调用模块、函数、状态信息记录在 Trace 文件中。

## 设置 debug 参数

通过设置 debug 参数选项，指定跟踪方式。

```plain
--debug [ = debug_options ]
```
[ = debug _ options ] 可识别字符 `d`、`t`、`i` 、`o` 等。
## Debug 示例

若需获取代码中 `DBUG_PRINT("info:"` 打印的日志，可以使用 MySQL 客户端连上服务器，并执行如下命令，开启 debug 参数。

```plain
set debug = 'd,info';
use test;
```
查看 `mysqld.trace` 文件，可获取 `use test` 在 MySQL 中的执行流程。
```plain
do_command: info: Command on socket (46) = 3 (Query)
do_command: info: packet: '                 '; command: 3
dispatch_command: info: command: 3
gtid_pre_statement_checks: info: gtid_next->type=0 owned_gtid.{sidno,gno}={0,0}
THD::is_ddl_gtid_compatible: info: SQLCOM_CREATE:0 CREATE-TMP:0 SELECT:1 SQLCOM_DROP:0 DROP-TMP:0 trx:0
SELECT_LEX::prepare: info: setup_ref_array this 0x7fff1400d298    3 :    0    0    1    2    0    0
setup_fields: info: thd->mark_used_columns: 1
setup_fields: info: thd->mark_used_columns: 1
SELECT_LEX::setup_conds: info: thd->mark_used_columns: 1
THD::decide_logging_format: info: query: SELECT DATABASE()
THD::decide_logging_format: info: variables.binlog_format: 2
................
MDL_context::release_locks_stored_before: info: found lock to release ticket=0x7fff14019ae0
MDL_context::release_locks_stored_before: info: found lock to release ticket=0x7fff1412dd20
MDL_context::release_locks_stored_before: info: found lock to release ticket=0x7fff1412dcc0
net_send_ok: info: affected_rows: 0  id: 0  status: 2  warning_count: 0
net_send_ok: info: OK sent, so no more error sending allowed
```
本文使用几个简单的示例，演示了 MySQL 内核的 Debug 的几种常见方法。当然，仅仅起到抛砖引玉的作用，更多好玩的技巧，还需读者自行深度挖掘。
# 参考引用

[1]:  GDB cheat sheet：[https://gist.github.com/rkubik/b96c23bd8ed58333de37f2b8cd052c30](https://gist.github.com/rkubik/b96c23bd8ed58333de37f2b8cd052c30)

[2]:  GDB 脚本调试：[https://sourceware.org/gdb/current/onlinedocs/gdb/Commands.html#Commands](https://sourceware.org/gdb/current/onlinedocs/gdb/Commands.html#Commands)

[3]:  DBUG Package：[https://dev.mysql.com/doc/refman/8.0/en/dbug-package.html](https://dev.mysql.com/doc/refman/8.0/en/dbug-package.html) 

