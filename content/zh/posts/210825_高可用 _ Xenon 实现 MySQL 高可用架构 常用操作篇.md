---
title: "高可用 | Xenon 实现 MySQL 高可用架构 常用操作篇"
date: 2021-08-25T15:39:00+08:00
author: "知数堂"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - Xenon
  - 高可用
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210903_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%20%E5%AE%9E%E7%8E%B0%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%20%E5%B8%B8%E7%94%A8%E6%93%8D%E4%BD%9C%E7%AF%87/0.png
---
Xenon 实现 MySQL 高可用架构的部署操作。
<!--more-->

[上一篇文章](/posts/210604_高可用-_-xenon后-mha-时代的选择/)，我们详细介绍了 Xenon 实现 MySQL 高可用架构的部署过程。接下来本篇将介绍 Xenon 的常用操作，帮助大家在完成环境搭建之后，能把 Xenon 熟练的用起来，以更好的对 MySQL 高可用架构进行管理。

# | 1 启动集群

## 1.1 启动 MySQL

```plain
# db1:
[mysql@db1 ~]$ nohup mysqld_safe --defaults-file=/etc/my.cnf &
[1] 5526
[mysql@db1 ~]$ nohup: ignoring input and appending output to ‘nohup.out’

# db2:
[mysql@db2 ~]$ nohup mysqld_safe --defaults-file=/etc/my.cnf &
[1] 3637
[mysql@db2 ~]$ nohup: ignoring input and appending output to 'nohup.out'
mysql –uroot –p    # 开启增强半同步
set global  rpl_semi_sync_slave_enabled=1;
stop  slave io_thread;
start slave  io_thread;
```
db3 的启动步骤同 db2。
## 1.2 启动 Xenon

```plain
db1:
[mysql@db1 ~]$ cd /usr/local/xenon/bin/
[mysql@db1 bin]$ ./xenon -c /etc/xenon/xenon.json > /etc/xenon/log/xenon.log 2>&1 &
```
db2、db3  的启动方式同 db1。
注意：当 MySQL 未启动时，启动 Xenon 会自动启动 MySQL。

## 1.3 检查半同步复制

启动时，需要检查半同步复制是否开启。

```plain
(product)root@localhost [(none)]> show variables like '%semi%';
+-------------------------------------------+------------+
| Variable_name                             | Value      |
+-------------------------------------------+------------+
| rpl_semi_sync_master_enabled              | ON         |
| rpl_semi_sync_master_timeout              | 10000      |
| rpl_semi_sync_master_trace_level          | 32         |
| rpl_semi_sync_master_wait_for_slave_count | 1          |
| rpl_semi_sync_master_wait_no_slave        | ON         |
| rpl_semi_sync_master_wait_point           | AFTER_SYNC |
| rpl_semi_sync_slave_enabled               | OFF        |
| rpl_semi_sync_slave_trace_level           | 32         |
……
```
主要参数：主节点`rpl_semi_sync_master_enabled` 的状态为 ON，从节点 `rpl_semi_sync_slave_enabled` 的状态为 ON，表示半同步复制正常开启。
# | 2 帮助命令

通过 xenoncli 的帮助命令查看可选的命令。

```plain
[mysql@db1 bin]$ ./xenoncli  help
A simple command line client for xenon

Usage:
  xenoncli [command]

Available Commands:
  cluster     cluster related commands
  init        init the xenon config file
  mysql       mysql related commands
  perf        perf related commands
  raft        raft related commands
  version     Print the version number of xenon client
  xenon       xenon related commands

Use "xenoncli [command] --help" for more information about a command.
```
举例说明，查看 cluster 的操作命令帮助。
```plain
[mysql@db1 bin]$  ./xenoncli cluster -h
cluster related commands
Usage:
  xenoncli cluster [command]

Available Commands:
  add         add peers to leader(if there is no leader, add to local)
  gtid        show cluster gtid status
  log         merge cluster xenon.log from logdir
  mysql       show cluster mysql status
  raft        show cluster raft status
  remove      remove peers from leader(if there is no leader, remove from local)
  status      show cluster status
  xenon       show cluster xenon status

Use "xenoncli cluster [command] --help" for more information about a command.
```
# | 3 查看集群

## 3.1 查看状态

```plain
xenoncli cluster status

xenoncli cluster mysql

xenoncli cluster xenon
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210903_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%20%E5%AE%9E%E7%8E%B0%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%20%E5%B8%B8%E7%94%A8%E6%93%8D%E4%BD%9C%E7%AF%87/1.png)

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210903_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%20%E5%AE%9E%E7%8E%B0%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%20%E5%B8%B8%E7%94%A8%E6%93%8D%E4%BD%9C%E7%AF%87/2.png)

## 3.2 检查集群一致状态

```plain
xenoncli cluster raft
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210903_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%20%E5%AE%9E%E7%8E%B0%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%20%E5%B8%B8%E7%94%A8%E6%93%8D%E4%BD%9C%E7%AF%87/3.png)

## 3.3 检查集群 GTID 状态

```plain
xenoncli cluster gtid
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210903_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%20%E5%AE%9E%E7%8E%B0%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%20%E5%B8%B8%E7%94%A8%E6%93%8D%E4%BD%9C%E7%AF%87/4.png)

# | 4 关闭集群

```plain
xenoncli mysql stopmonitor
xenoncli mysql shutdown
pkill xenon
```
# | 5 添加/删除节点

## 5.1 添加节点

```plain
xenoncli cluster add 192.168.0.2:8801,192.168.0.3:8801,192.168.0.5:8801
```
Xenon 允许添加已经添加过的节点。如果节点已经在集群里面，将直接被忽视，不做任何操作。
## 5.2 删除节点

```plain
xenoncli cluster  remove 192.168.0.2:8801,192.168.0.3:8801,192.168.0.5:8801
```
# | 6 备份 MySQL 到本地

```plain
[root@db1 backup]# xenoncli mysql backup
Usage:
  xenoncli mysql backup --to=backupdir [flags]
[mysql@db1 bin]$ ./xenoncli mysql backup --to=/backup/data
 2020/02/10 04:28:43.924306       [WARNING]     rebuildme.found.best.slave[10.10.10.11:8801].leader[10.10.10.10:8801]
 2020/02/10 04:28:43.924576       [WARNING]     S1-->found.the.best.backup.host[10.10.10.11:8801]....
 2020/02/10 04:28:43.945828       [WARNING]     S2-->rm.and.mkdir.backupdir[/backup/data]
 2020/02/10 04:28:43.945845       [WARNING]     S3-->xtrabackup.begin....
 2020/02/10 04:28:43.946692       [WARNING]     rebuildme.backup.req[&{From: BackupDir:/backup/data SSHHost:10.10.10.10 SSHUser:mysql SSHPasswd:123456 SSHPort:22 IOPSLimits:100000 XtrabackupBinDir:/usr/bin}].from[10.10.10.11:8801]
 2020/02/10 04:29:06.360412       [WARNING]     S3-->xtrabackup.end....
 2020/02/10 04:29:06.360444       [WARNING]     S4-->apply-log.begin....
 2020/02/10 04:29:11.010835       [WARNING]     S4-->apply-log.end....
 2020/02/10 04:29:11.011275       [WARNING]     completed OK!
 2020/02/10 04:29:11.011300       [WARNING]     backup.all.done....
```
因 xenoncli 会尝试先删除 backupdir 再 mkdir，故不建议使用 /backup  根目录路径。若使用这种路径，rm 可以成功，mkdir 会失败。
# | 7 Rebuild 重建

选择最佳状态的从节点，进行 XtraBackup 流式重建，from 参数可指定重建源节点。

* 作用：重建当前节点 MySQL
* 场景：节点坏掉需要快速重建
```plain
// 在要做重建的节点执行： 
xenoncli mysql rebuildme

// 如果想以指定节点为准重建，执行： 
xenoncli mysql -h

// 基于指定节点复制重建当前 MySQL 节点
[mysql@db1 bin]$ ./xenoncli mysql rebuildme --from=10.10.10.11:8801
 2020/02/11 01:19:40.907645       [WARNING]     =====prepare.to.rebuildme=====
                        IMPORTANT: Please check that the backup run completes successfully.
                                   At the end of a successful backup run innobackupex
                                   prints "completed OK!".

 2020/02/11 01:19:40.908418       [WARNING]     S1-->check.raft.leader
 2020/02/11 01:19:40.911586       [WARNING]     S2-->prepare.rebuild.from[10.10.10.11:8801]....
 2020/02/11 01:19:40.913050       [WARNING]     S3-->check.bestone[10.10.10.11:8801].is.OK....
 2020/02/11 01:19:40.913066       [WARNING]     S4-->set.learner
 2020/02/11 01:19:40.915499       [WARNING]     S5-->stop.monitor
 2020/02/11 01:19:40.916758       [WARNING]     S6-->kill.mysql
 2020/02/11 01:19:40.947717       [WARNING]     S7-->check.bestone[10.10.10.11:8801].is.OK....
 2020/02/11 01:19:40.950867       [WARNING]     S8-->rm.datadir[/backup/data]
 2020/02/11 01:19:40.950879       [WARNING]     S9-->xtrabackup.begin....
 2020/02/11 01:19:40.951632       [WARNING]     rebuildme.backup.req[&{From: BackupDir:/backup/data SSHHost:10.10.10.10 SSHUser:mysql SSHPasswd:123456 SSHPort:22 IOPSLimits:100000 XtrabackupBinDir:/usr/bin}].from[10.10.10.11:8801]
 2020/02/11 01:19:51.200092       [WARNING]     S9-->xtrabackup.end....
 2020/02/11 01:19:51.200116       [WARNING]     S10-->apply-log.begin....
 2020/02/11 01:19:56.666199       [WARNING]     S10-->apply-log.end....
 2020/02/11 01:19:56.666209       [WARNING]     S11-->start.mysql.begin...
 2020/02/11 01:19:56.666757       [WARNING]     S11-->start.mysql.end...
 2020/02/11 01:19:56.666766       [WARNING]     S12-->wait.mysqld.running.begin....
 2020/02/11 01:19:59.680987       [WARNING]     wait.mysqld.running...
 2020/02/11 01:19:59.709382       [WARNING]     S12-->wait.mysqld.running.end....
 2020/02/11 01:19:59.709395       [WARNING]     S13-->wait.mysql.working.begin....
 2020/02/11 01:19:59.710943       [WARNING]     S13-->wait.mysql.working.end....
 2020/02/11 01:19:59.710955       [WARNING]     S14-->stop.and.reset.slave.begin....
 2020/02/11 01:19:59.731108       [WARNING]     S14-->stop.and.reset.slave.end....
 2020/02/11 01:19:59.731121       [WARNING]     S15-->reset.master.begin....
 2020/02/11 01:19:59.739414       [WARNING]     S15-->reset.master.end....
 2020/02/11 01:19:59.739455       [WARNING]     S15-->set.gtid_purged[1520b6dd-2fb1-11ea-ab64-080027d70146:1-14
].begin....
 2020/02/11 01:19:59.742273       [WARNING]     S15-->set.gtid_purged.end....
 2020/02/11 01:19:59.742284       [WARNING]     S16-->enable.raft.begin...
 2020/02/11 01:19:59.743512       [WARNING]     S16-->enable.raft.done...
 2020/02/11 01:19:59.743534       [WARNING]     S17-->wait[3000 ms].change.to.master...
 2020/02/11 01:19:59.743551       [WARNING]     S18-->start.slave.begin....
 2020/02/11 01:19:59.763468       [WARNING]     S18-->start.slave.end....
 2020/02/11 01:19:59.763478       [WARNING]     completed OK!
```
# | 8 手动 Failover/switchover

手动触发主从切换。

```plain
(product)root@localhost [(none)]> set global read_only=on;
Query OK, 0 rows affected (0.00 sec)

[mysql@db1 bin]$ ./xenoncli raft trytoleader
 2020/02/11 01:48:51.219975       [WARNING]     [10.10.10.10:8801].prepare.to.propose.this.raft.to.leader
 2020/02/11 01:48:51.255617       [WARNING]     [10.10.10.10:8801].propose.done
[mysql@db1 bin]$ ./xenoncli  cluster status
+------------------+-------------------------------+---------+---------+--------------------------+---------------------+----------------+------------------+
|        ID        |             Raft              | Mysqld  | Monitor |          Backup          |        Mysql        | IO/SQL_RUNNING |     MyLeader     |
+------------------+-------------------------------+---------+---------+--------------------------+---------------------+----------------+------------------+
| 10.10.10.10:8801 | [ViewID:4 EpochID:0]@LEADER   | RUNNING | ON      | state:[NONE]
            | [ALIVE] [READWRITE] | [true/true]    | 10.10.10.10:8801 |
|                  |                               |         |         | LastError:               |                     |                |                  |
+------------------+-------------------------------+---------+---------+--------------------------+---------------------+----------------+------------------+
| 10.10.10.11:8801 | [ViewID:4 EpochID:0]@FOLLOWER | RUNNING | ON      | state:[NONE]
            | [ALIVE] [READONLY]  | [true/true]    | 10.10.10.10:8801 |
|                  |                               |         |         | LastError:               |                     |                |                  |
+------------------+-------------------------------+---------+---------+--------------------------+---------------------+----------------+------------------+
| 10.10.10.18:8801 | [ViewID:4 EpochID:0]@FOLLOWER | RUNNING | ON      | state:[NONE]
            | [ALIVE] [READONLY]  | [true/true]    | 10.10.10.10:8801 |
|                  |                               |         |         | LastError:               |                     |                |                  |
+------------------+-------------------------------+---------+---------+--------------------------+---------------------+----------------+------------------+
```
# | 9 MySQL Stack Info

查看 MySQL 如何调用堆栈信息。Quick Stack 功能速度快，对流程几乎没有影响。

```plain
xenoncli perf -h
perf related commands

Usage:
  xenoncli perf [command]

Available Commands:
  quickstack  capture the stack of mysqld using quickstack
```
# | 10 Raft + Operation

不发起选主 enable 是恢复，disable 指该 Xenon 节点只复制。

```plain
xenoncli raft -h
raft related commands

Usage:
  xenoncli raft [command]

Available Commands:
  add                add peers to local
  disable            enable the node out control of raft
  disablepurgebinlog disable leader to purge binlog
  enable             enable the node in control of raft
  enablepurgebinlog  enable leader to purge binlog(default)
  nodes              show raft nodes
  remove             remove peers from local
  status             status in JSON(state(LEADER/CANDIDATE/FOLLOWER/IDLE))
  trytoleader        propose this raft as leader
```
# | 11 启动增强半同步检查

```plain
# 启动半同步复制检查
xenoncli raft enablechecksemisync

# 启动或关闭半同步复制检查
xenoncli raft disablechecksemisync
```
我们可以看到半同步的参数是：
```plain
(product)root@localhost [(none)]> show variables like '%rpl%';
+-------------------------------------------+---------------------+
| Variable_name                             | Value               |
+-------------------------------------------+---------------------+
| rpl_semi_sync_master_enabled              | ON                  |
| rpl_semi_sync_master_timeout              | 1000000000000000000 |
| rpl_semi_sync_master_trace_level          | 32                  |
| rpl_semi_sync_master_wait_for_slave_count | 1                   |
| rpl_semi_sync_master_wait_no_slave        | ON                  |
| rpl_semi_sync_master_wait_point           | AFTER_SYNC          |
| rpl_semi_sync_slave_enabled               | ON                  |
| rpl_semi_sync_slave_trace_level           | 32                  |
| rpl_stop_slave_timeout                    | 31536000            |
+-------------------------------------------+---------------------+
```
若通过 `set global` 修改半同步的 timeout，将自动订正为无限大；若基于运维临时调整，需要先执行 `xenoncli mysql disablechecksemisync` 再修改；若运维完，需要恢复自动订正的话，执行 `enablechecksemisync` 。
```plain
// 例如：修改 timeout 参数为 10,
(product)root@localhost [(none)]> set global rpl_semi_sync_master_timeout=10;
Query OK, 0 rows affected (0.00 sec)

(product)root@localhost [(none)]> show variables like '%rpl%';
+-------------------------------------------+------------+
| Variable_name                             | Value      |
+-------------------------------------------+------------+
| rpl_semi_sync_master_enabled              | ON         |
| rpl_semi_sync_master_timeout              | 10         |
| rpl_semi_sync_master_trace_level          | 32         |
| rpl_semi_sync_master_wait_for_slave_count | 1          |
| rpl_semi_sync_master_wait_no_slave        | ON         |
| rpl_semi_sync_master_wait_point           | AFTER_SYNC |
| rpl_semi_sync_slave_enabled               | ON         |
| rpl_semi_sync_slave_trace_level           | 32         |
| rpl_stop_slave_timeout                    | 31536000   |
+-------------------------------------------+------------+
9 rows in set (0.00 sec)

// 过一会儿又自动变为无穷大了
(product)root@localhost [(none)]> show variables like '%rpl%';
+-------------------------------------------+---------------------+
| Variable_name                             | Value               |
+-------------------------------------------+---------------------+
| rpl_semi_sync_master_enabled              | ON                  |
| rpl_semi_sync_master_timeout              | 1000000000000000000 |
| rpl_semi_sync_master_trace_level          | 32                  |
| rpl_semi_sync_master_wait_for_slave_count | 1                   |
| rpl_semi_sync_master_wait_no_slave        | ON                  |
| rpl_semi_sync_master_wait_point           | AFTER_SYNC          |
| rpl_semi_sync_slave_enabled               | ON                  |
| rpl_semi_sync_slave_trace_level           | 32                  |
| rpl_stop_slave_timeout                    | 31536000            |
+-------------------------------------------+---------------------+
9 rows in set (0.00 sec)
```
# | 指令分类

查询集群信息：

```plain
xenoncli cluster 指令
```
操作本机的：
```plain
xenoncli raft 指令
xenoncli perf quickstack
xenoncli mysql backup | cancelbackup | kill | rebuildme | shutdown | start | startmonitor |status | stopmonitor | sysvar
```
先尝试连接到 Leader 执行，如果没有 Leader，则在本机执行：
```plain
xenoncli mysql changepassword | createsuperuser | createuser | createuserwithgrants |
dropuser | getuser
```

