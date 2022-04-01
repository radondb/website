---
title: "高可用 | Xenon 实现 MySQL 高可用架构 部署篇"
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
  - xenon

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210825_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%20%E5%AE%9E%E7%8E%B0%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%20%E9%83%A8%E7%BD%B2%E7%AF%87/0.png
---
Xenon 实现 MySQL 高可用架构的部署操作。
<!--more-->
在《[高可用 | Xenon：后 MHA 时代的选择](/posts/210604_高可用-_-xenon后-mha-时代的选择/)》一文中，我们对 Xenon 的实现原理、应用场景等做了简要介绍。文章发布后，社区小伙伴都在咨询 ***Xenon 如何与 MySQL 配合使用？***

本文来自知数堂投稿，是一篇基于 Xenon 架构原理，部署 **一主两从** 架构的 MySQL 高可用集群的实操文档。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210825_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%20%E5%AE%9E%E7%8E%B0%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%20%E9%83%A8%E7%BD%B2%E7%AF%87/1.png)

Xenon 架构图 

环境信息：

* Redhat 7
* MySQL 5.7
* Xenon 1.0.7
* XtraBackup 24

**另：Xenon 支持 MySQL 5.6/5.7/8.0 内核，本文以 5.7 为例*。

# 1. 搭建 MySQL 增强半同步复制架构

## 1.1 准备单机 MySQL

准备三台单机 MySQL，安装步骤（略）。

* db1 (10.10.10.10)
* db2 (10.10.10.11)
* db3 (10.10.10.18)
## 1.2 配置主从复制

配置三台单机 MySQL 主从 复制关系，配置步骤（略）。

## 1.3 配置增强半同步复制

在 db1 服务器上，开启 `semi_sync`插件。

```plain
set global super_read_only=0;   ---默认
set global read_only=0;         ---默认
INSTALL PLUGIN rpl_semi_sync_slave SONAME 'semisync_slave.so';
INSTALL PLUGIN rpl_semi_sync_master SONAME 'semisync_master.so';
show plugins;
```
在 db2 和 db3 服务器上执行并查看结果。
```plain
stop  slave io_thread;
start slave io_thread;
2020-01-05T12:16:01.269943Z 20 [Note] Aborted connection 20 to db: 'unconnected' user: 'root' host: 'localhost' (Got timeout reading communication packets)
2020-01-05T12:25:57.193720Z 13 [Note] Slave I/O thread killed while reading event for channel ''
2020-01-05T12:25:57.193804Z 13 [Note] Slave I/O thread exiting for channel '', read up to log 'mysql-bin.000002', position 2310
2020-01-05T12:25:57.227685Z 22 [Note] Slave I/O thread: Start semi-sync replication to master 'repl@10.10.10.10:3306' in log 'mysql-bin.000002' at position 2310
2020-01-05T12:25:57.227782Z 22 [Warning] Storing MySQL user name or password information in the master info repository is not secure and is therefore not recommended. Please consider using the USER and PASSWORD connection options for START SLAVE; see the 'START SLAVE Syntax' in the MySQL Manual for more information.
2020-01-05T12:25:57.230523Z 22 [Note] Slave I/O thread for channel '': connected to master 'repl@10.10.10.10:3306',replication started in log 'mysql-bin.000002' at position 2310
```
至此，**一主两从** 增强半同步复制就配置好了，接下来即可使用 Xenon 搭建高可用架构。
# 2. 使用 Xenon 搭建高可用架构

## 2.1 环境准备

### 2.1.1 配置帐号

修改 MySQL 的路径和帐号密码，由 `/sbin/nologin` 修改为 `/bin/bash`，并修改 MySQL 帐号的密码。

说明：MySQL 默认路径为 `/bin/bash`。

```plain
chsh mysql
Changing shell for mysql.
New shell [/sbin/nologin]: /bin/bash
passwd mysql
```
为 Xenon 的帐号添加 `sudo /usr/ip` 权限。
```plain
visudo 
mysql   ALL=(ALL)       NOPASSWD: /usr/sbin/ip
# 添加权限前
[mysql@db1 ~]$ sudo /sbin/ip a a 10.10.10.30/16 dev enp0s3 && arping -c 3 -A  172.18.0.100  -I enp0s3
bind: Cannot assign requested address 
# 添加权限后
[mysql@db1 ~]$ ping 10.10.10.30
PING 10.10.10.30 (10.10.10.30) 56(84) bytes of data.
64 bytes from 10.10.10.30: icmp_seq=1 ttl=64 time=0.021 ms
[1]+  Stopped                 ping 10.10.10.30
```
### 2.1.2 建立互信关系

建立三台服务器之间互信关系。

```plain
ssh-copy-id -i /home/mysql/.ssh/id_rsa.pub 10.10.10.18
ssh-copy-id -i /home/mysql/.ssh/id_rsa.pub 10.10.10.10
ssh-copy-id -i /home/mysql/.ssh/id_rsa.pub 10.10.10.11
```
### 2.1.3 安装 XtraBackup

```plain
yum install -y perl-DBD-MySQL
rpm -ivh libev-4.15-1.el6.rf.x86_64.rpm 
rpm -ivh percona-xtrabackup-24-2.4.15-1.el7.x86_64.rpm

root@db2 tmp]# rpm -ivh percona-xtrabackup-24-2.4.15-1.el7.x86_64.rpm 
warning: percona-xtrabackup-24-2.4.15-1.el7.x86_64.rpm: Header V4 RSA/SHA256 Signature, key ID 8507efa5: NOKEY
Preparing...                          ################################# [100%]
Updating / installing...
   1:percona-xtrabackup-24-2.4.15-1.el################################# [100%]
```
### 2.1.4 安装 Go

```plain
wget https://golang.org/doc/install?download=go1.13.4.linux-amd64.tar.gz
tar -C /usr/local -xzf go1.13.4.linux-amd64.tar.gz
echo "export PATH=\$PATH:/usr/local/go/bin" >> /etc/profile

[root@db1 tmp]# source /etc/profile
[root@db1 tmp]# which go
/usr/local/go/bin/go
[root@db1 tmp]# go version
go version go1.13.4 linux/amd64
```
## 2.2 安装 Xenon

在 [https://github.com/radondb/xenon/releases](https://github.com/radondb/xenon/releases) 下载 1.0.7 版本的安装包至服务器。

```plain
[root@db1 local]# tar -xvf xenon-1.0.7.tar.gz
[root@db1 local]# mv xenon-1.0.7 xenon
[root@db1 local]# cd /usr/local/xenon
[root@db1 xenon]# make build
fatal: Not a git repository (or any of the parent directories): .git
fatal: Not a git repository (or any of the parent directories): .git
fatal: Not a git repository (or any of the parent directories): .git
fatal: Not a git repository (or any of the parent directories): .git
--> Building...
# 省略……
[root@db1 xenon]# make
```
## 2.3 配置 Xenon

### 2.3.1 添加配置文件

添加 db1 的配置文件。

```plain
[mysql@db1 conf]$ cat xenon.json 
{
"server":
{
   "endpoint":"10.10.10.10:8801"
},
"raft":
{
   "meta-datadir":"raft.meta",
   "heartbeat-timeout":1000,
   "election-timeout":3000,
   "admit-defeat-hearbeat-count": 5,
   "purge-binlog-disabled": true,
   "leader-start-command":"sudo /sbin/ip a a 10.10.10.20/24 dev enp0s3 && arping -c 3 -A 10.10.10.20 -I enp0s3",
   "leader-stop-command":"sudo /sbin/ip a d 10.10.10.20/24 dev enp0s3"
},
"mysql":
{
   "admin":"root",                
   "passwd":"123456",            
   "host":"127.0.0.1",              
   "port":3306,                    
   "basedir":"/usr/local/mysql",    
   "defaults-file":"/etc/my.cnf"
},
"replication":
{
   "user":"repl",                
   "passwd":"123456"        
},
"backup":
{
   "ssh-host":"10.10.10.10",                    
   "ssh-user":"mysql",                            
   "ssh-passwd":"123456",                        
   "basedir":"/usr/local/mysql",                 
   "backup-dir":"/backup",
   "mysqld-monitor-interval": 5000,
   "backup-use-memory": "3072M",
   "ssh-port": 22,
   "backup-parallel": 2,         
   "backup-iops-limits": 100000,                 
   "xtrabackup-bindir":"/usr/bin"       
},
"rpc":
{
   "request-timeout":500
},
"log":
{
   "level":"INFO"
}
}
```
添加 db2 和 db3 的配置文件。以 db2 配置文件为示例。
```plain
[mysql@db2 ~]$ cd /usr/local/xenon/conf
[mysql@db2 conf]$ cat xenon.json 
{
"server":
{
   "endpoint":"10.10.10.11:8801"  #添加 db3 配置文件时，需设置为 10.10.10.18
},
"raft":
{
   "meta-datadir":"raft.meta",
   "heartbeat-timeout":1000,
   "election-timeout":3000,
   "admit-defeat-hearbeat-count": 5,
   "purge-binlog-disabled": true,
   "leader-start-command":"sudo /sbin/ip a a 10.10.10.20/24 dev enp0s3 && arping -c 3 -A 10.10.10.20 -I enp0s3",
   "leader-stop-command":"sudo /sbin/ip a d 10.10.10.20/24 dev enp0s3"
},
"mysql":
{
   "admin":"root",                
   "passwd":"123456",            
   "host":"127.0.0.1",              
   "port":3306,                    
   "basedir":"/usr/local/mysql",    
   "defaults-file":"/etc/my.cnf"
},
"replication":
{
   "user":"repl",                
   "passwd":"123456"        
},
"backup":
{
   "ssh-host":"10.10.10.11",                    
   "ssh-user":"mysql",                            
   "ssh-passwd":"123456",                        
   "basedir":"/usr/local/mysql",                 
   "backup-dir":"/backup",
   "mysqld-monitor-interval": 5000,
   "backup-use-memory": "3072M",
   "ssh-port": 22,
   "backup-parallel": 2,         
   "backup-iops-limits": 100000,                 
   "xtrabackup-bindir":"/usr/bin"       
},
"rpc":
{
   "request-timeout":500
},
"log":
{
   "level":"INFO"
}
}
```
注意：主机配置文件中`leader-start-command` 和  `leader-stop-command` 参数的值，10.10.10.20/24 和 enp0s3 需要根据实际情况填写。
### 2.3.2 配置备份环境

```plain
mkdir /backup & chown -R mysql.mysql /backup
```
在复制环境中创建管理员帐号。
```plain
create user 'root'@'127.0.0.1' identified by '123456';
grant all privileges on *.* to 'root'@'127.0.0.1';
flush privileges;
```
### 2.3.3 修改权限

```plain
mkdir /etc/xenon/
ln -s /usr/local/xenon/conf/xenon.json /etc/xenon/
chown mysql.mysql -R /usr/local/xenon
chown mysql.mysql -R /etc/xenon/
```
### 2.3.4 修改日志目录

```plain
mkdir /etc/xenon/log
chown mysql.mysql /etc/xenon/log
cd /usr/local/xenon/bin/
echo "/etc/xenon/xenon.json" > /usr/local/xenon/bin/config.path
```
## 2.4 启用 Xenon

### 2.4.1 登录

通过 MySQL 帐号登录并启动 Xenon。

```plain
# db1
su - mysql
/usr/local/xenon/bin/xenon -c /etc/xenon/xenon.json > /etc/xenon/log/xenon.log 2>&1 &

# db2
su - mysql
/usr/local/xenon/bin/xenon -c /etc/xenon/xenon.json > /etc/xenon/log/xenon.log 2>&1 &

# db3
su - mysql
/usr/local/xenon/bin/xenon -c /etc/xenon/xenon.json > /etc/xenon/log/xenon.log 2>&1 &
```
### 2.4.2 添加成员

```plain
/usr/local/xenon/bin/xenoncli cluster add \
10.10.10.10:8801,10.10.10.11:8801,10.10.10.18:8801
```
### 2.4.3 查看集群状态

查看集群状态。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210825_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%20%E5%AE%9E%E7%8E%B0%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%20%E9%83%A8%E7%BD%B2%E7%AF%87/2.png)

查看 MySQL 状态。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210825_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20Xenon%20%E5%AE%9E%E7%8E%B0%20MySQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E6%9E%B6%E6%9E%84%20%E9%83%A8%E7%BD%B2%E7%AF%87/3.png)

**MySQL 高可用部署成功！**

# 总结

在使用 Xenon 搭建高可用集群时，需要注意以下几点：

1. MySQL 5.7+ GTID 复制结构为基础
2. 必须有增强半同步复制插件
3. MySQL 帐号必须是 `/bin/bash`
4. Xenon 和 MySQL 必须运行在同一帐号下，一般就是 MySQL
5. MySQL 帐号在节点之前必须有 SSH 信任
6. 节点必须安装 Xtrabackup
7. 必须使用 mysqld_safe 启用 mysql
