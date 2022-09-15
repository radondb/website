---
title: "详谈 MySQL 8.0 原子 DDL 原理"
date: 2022-09-15T08:00:00+08:00
author: "RadonDB 开源社区 "
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - Kubernetes
# 相关文章会通过keywords来匹配
keywords:
  - MySQL
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/220915_%E5%AE%B9%E5%99%A8%E5%8C%96%EF%BD%9C%E8%87%AA%E5%BB%BA%20MySQL%20%E9%9B%86%E7%BE%A4%E8%BF%81%E7%A7%BB%E5%88%B0%20Kubernetes/%E5%BE%AE%E4%BF%A1%E6%96%87%E7%AB%A0%E5%B0%81%E9%9D%A2%20(1).png
---
 MySQL 集群迁移实操指南

<!--more-->

## 背景

如果你有自建的 MySQL 集群，并且已经感受到了云原生的春风拂面，想将数据迁移到 Kubernetes 上，那么这篇文章可以给你一些思路。

文中将自建 MySQL 集群数据，在线迁移到 Kubernetes 的 MySQL 集群的中，快速实现了 MySQL on Kubernetes。

## 适用场景

自建 MySQL 数据库迁移至 Kubernetes 中。优点是停机时间短，数据一致性强。

## 前提条件

* 掌握 RadonDB MySQL Kubernetes[1] 的使用 
* 自建集群 MySQL 版本同 RadonDB MySQL Kubernetes 的 MySQL 大版本一致。如：自建集群 MySQL 8.0.22，RadonDB MySQL Kubernetes 中 MySQL 8.0.35
* 自建集群开启 Binlog 和 GTID
## 操作步骤

### Step 1：自建集群开启 GTID

用超级管理员登录自建 MySQL 集群，确保开启 GTID。

```sql
# 检查输出是否为 1
mysql -uroot -e "select @@gtid_mode,@@log_bin";

# 如果不为 1 则在 MySQL 终端中执行下面的 SQL
set global ENFORCE_GTID_CONSISTENCY = ON;
set global GTID_MODE = OFF_PERMISSIVE;
set global GTID_MODE = ON_PERMISSIVE;
set global GTID_MODE = ON;
```

### Step 2：容器集群在线迁移全量数据

全量数据迁移期间，容器集群停止所有的写入。

```bash
# 在进行操作的节点上安装 screen 工具，防止终端退出
apt install screen -y

# 开启一个 screen 终端
screen -S migration

# 将节点 scale 成 2 节点
kubectl scale mysqlcluster sample --replicas=2

# 将 Follower 角色 Xenon 容器执行 raft disable
kubectl exec -it $(kubectl get po -l role=FOLLOWER,mysql.radondb.com/cluster=sample  -o jsonpath="{.items[*].metadata.name}") -c xenon -- xenoncli raft disable

# 进入 Leader 角色 MySQL 容器
kubectl exec -it $(kubectl get po -l role=LEADER,mysql.radondb.com/cluster=sample  -o jsonpath="{.items[*].metadata.name}") -c  mysql -- bash
```
>screen 窗口可以按`Ctrl + a` ，然后输入 d 退出。用`screen -R migration` 重新进入迁移数据的终端。 
 

通过管道进行不落地导入全量数据。

```bash
mysqldump --all-databases \
--single-transaction \
--triggers \
--routines \
--events \
--max-allowed-packet=805306368 \
--ignore-table=mysql.user \
--ignore-table=mysql.db \
--ignore-table=mysql.tables_priv \
--set-gtid-purged=ON \
-uroot -hxxx -pxxx|mysql -uroot -h127.0.0.1
```

### Step 3：进行增量同步

全量同步完成之后，配置增量同步。

```bash
# 重新进入终端
screen -R migration

# 再次进入 Leader 角色 MySQL 容器
kubectl exec -it $(kubectl get po -l role=LEADER,mysql.radondb.com/cluster=sample  -o jsonpath="{.items[*].metadata.name}") -c  mysql -- bash

# 设置主从同步参数
mysql -uroot -h 127.0.0.1
CHANGE MASTER TO MASTER_HOST='xx', MASTER_PORT=xx, MASTER_USER='root', MASTER_PASSWORD='xx', MASTER_AUTO_POSITION=1;start slave;

# 检查主从同步进度
kubectl exec -it  sample-mysql-0 -c xenon -- xenoncli cluster mysql
```
Seconds_Behind 变为 0 则代表自建集群和容器集群数据完全一致，可以进行下一步操作。
### Step 4：同步数据到容器集群的其他节点

```bash
# sample-mysql-1 为刚才 raft disable 的 Follower 节点
kubectl label pod sample-mysql-1 rebuild=true

# 查看集群状态等待同步完成
kubectl exec -it  sample-mysql-0 -c xenon -- xenoncli cluster gtid
kubectl logs sample-mysql-1 -c init-sidecar -f

# 同步完成后将集群扩容成 3 节点，并按照相同的步骤进行数据同步
kubectl scale mysqlcluster sample --replicas=3;kubectl label pod sample-mysql-2 rebuild=true
```

### Step 5：业务切换

停止自建数据库的业务，启动容器上的业务负载。

### Step 6：停止同步

```bash
kubectl exec -it $(kubectl get po -l role=LEADER,mysql.radondb.com/cluster=sample  -o jsonpath="{.items[*].metadata.name}") -c  mysql -- bash

mysql -uroot -h 127.0.0.1
stop slave;reset slave all;
```
 
至此，自建 MySQL 集群就已经成功迁移到 Kubernetes 上了。

## 总结

如果业务规划有停机时间，那么可以在停止写入之后，对源端数据库进行 FTWRL 之后直接进行全量同步。这样省去了增量同步的步骤，缺点是业务停机时间较长。上述全量数据的迁式也可以使用 Xtrabackup 工具，后续将基于 Xtrabackup 的迁移方式进行阐述。

## 参考

- [https://www.percona.com/blog/2013/06/10/migrating-between-mysql-schemas-with-percona-xtrabackup/](https://www.percona.com/blog/2013/06/10/migrating-between-mysql-schemas-with-percona-xtrabackup/)

- [https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)

- [https://www.percona.com/blog/2012/03/23/how-flush-tables-with-read-lock-works-with-innodb-tables/](https://www.percona.com/blog/2012/03/23/how-flush-tables-with-read-lock-works-with-innodb-tables/)


