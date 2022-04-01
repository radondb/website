---
title: "高可用 | repmgr 构建 PostgreSQL 高可用集群部署文档"
date: 2021-12-03T15:39:00+08:00
author: "颜博"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - PostgreSQL
  - 开源
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/211203_%E9%AB%98%E5%8F%AF%E7%94%A8%20%7C%20repmgr%20%E6%9E%84%E5%BB%BA%20PostgreSQL%20%E9%AB%98%E5%8F%AF%E7%94%A8%E9%9B%86%E7%BE%A4%E9%83%A8%E7%BD%B2%E6%96%87%E6%A1%A3%E3%80%90%E5%BB%BA%E8%AE%AE%E6%94%B6%E8%97%8F%E3%80%91/0.png
---
本文将详细介绍 repmgr 构建 PostgreSQL 高可用集群的部署过程。
<!--more-->

作者：颜博 青云科技数据库研发工程师

目前从事 PostgreSQL 产品开发工作，热衷于 PostgreSQL 数据库的学习和研究 

--------------------------

上一期我们介绍了 [PG 集群复制管理工具 repmgr](/posts/211201_工具_-pg-集群复制管理工具-repmgr/) ，能够轻松的搭建出 PostgreSQL 的高可用集群，在主节点宕机后，挑选备机提升为主节点，继续提供服务。

本文将详细介绍 repmgr 构建 PostgreSQL 高可用集群的部署过程。

## 准备工作

1. 集群所有服务器安装 repmgr 工具
2. 主服务器安装 PostgreSQL 数据库，初始化完成并正常启动数据库（Primary）
# 1 主库部分

## 1.1 修改 postgresql.conf 文件

```plain
$ vim postgresql.conf
max_wal_senders = 10
max_replication_slots = 10
wal_level = 'hot_standby'
hot_standby = on
archive_mode = on   # repmgr 本身不需要 WAL 文件归档。
archive_command = '/bin/true'
```
在 PG9.6 之前的版本中，wal_level 允许设置为`archive`和`hot_standby`。新版本中，仍然接受这些值，但是它们会被映射成`replica`。
## 1.2 创建 repmgr 用户和库

为 repmgr 元数据信息创建 PostgreSQL 超级用户和数据库

```plain
# su - postgres 
$ /usr/lib/postgresql/11/bin/createuser -s repmgr
$ /usr/lib/postgresql/11/bin/createdb repmgr -O repmgr

alter user repmgr with password 'test1234';
```
## 1.3 修改 pg_hba.conf 文件

```plain
repmgr 用户作为 repmgr 工具默认使用的数据库用户
$ vim pg_hba.conf
local   replication   repmgr                              trust
host    replication   repmgr      127.0.0.1/32            trust
host    replication   repmgr      0.0.0.0/0               trust

local   repmgr        repmgr                              trust
host    repmgr        repmgr      127.0.0.1/32            trust
host    repmgr        repmgr      0.0.0.0/0               trust
```
repmgr 免密登录设置
```plain
# 修改 pg_hba.conf 文件后 reload 数据库生效
$ su - postgres -c "/usr/lib/postgresql/11/bin/pg_ctl reload"

# su postgres
$ vim ~/.pgpass

# 添加以下内容到 ~/.pgpass 文件，用户、数据库和密码修改为自己的即可
*:*:repmgr:repmgr:test1234

# 修改 ~/.pgpass 文件权限
chmod 600 ~/.pgpass
```
## 1.4 创建 repmgr.conf 文件

在主服务器上创建一个 repmgr.conf 文件

>node_id、node_name、conninfo 需要与从库不同 
```plain
node_id=1                                     # 节点ID，高可用集群各节点标识
node_name='node1'                             # 节点名称，高可用集群各节点名称，对应集群中 select * from pg_stat_replication; 中查到的 application_name
conninfo='host=192.168.100.2 port=5432 user=repmgr dbname=repmgr connect_timeout=2'     # 集群中的所有服务器都必须能够使用此字符串连接到本地节点
data_directory='/data/pgsql/main'             # pg数据目录
replication_user='repmgr'                     # 流复制数据库用户，默认使用repmgr
repmgr_bindir='/usr/lib/postgresql/11/bin'    # repmgr软件目录
pg_bindir='/usr/lib/postgresql/11/bin'        # pg软件目录

# 日志管理
log_level=INFO
log_file='/data/pglog/repmgr/repmgrd.log'      # log 文件需要提前创建
log_status_interval=10                         # 此设置导致 repmgrd 以指定的时间间隔（以秒为单位，默认为 300）发出状态日志行，描述 repmgrd 的当前状态， 
              # 例如：  [2021-09-28 17:51:15] [INFO] monitoring primary node "node1" (ID: 1) in normal state

# pg、repmgr服务管理命令
service_start_command='/usr/lib/postgresql/11/bin/pg_ctl -D /data/pgsql/main/ start -o \'-c config_file=/etc/postgresql/11/main/postgresql.conf\' -l /data/pglog/start.log'
service_stop_command='/usr/lib/postgresql/11/bin/pg_ctl stop'
service_restart_command='/usr/lib/postgresql/11/bin/pg_ctl -D /data/pgsql/main/ restart -o \'-c config_file=/etc/postgresql/11/main/postgresql.conf\' -l /data/pglog/start.log'
service_reload_command='su - postgres -c \'/usr/lib/postgresql/11/bin/pg_ctl reload\' '

repmgrd_pid_file='/tmp/repmgrd.pid'              # repmgrd 运行时的 pid 文件
repmgrd_service_start_command='/usr/lib/postgresql/11/bin/repmgrd -f /etc/postgresql/11/main/repmgr.conf start'
repmgrd_service_stop_command='kill -9 `cat /tmp/repmgrd.pid`'

# failover设置
failover=automatic
promote_command='/usr/lib/postgresql/11/bin/repmgr -f /etc/postgresql/11/main/repmgr.conf standby promote  --log-to-file'        #当 repmgrd 确定当前节点将成为新的主节点时 ，将在故障转移情况下执行 promote_command 中定义的程序或脚本
follow_command='/usr/lib/postgresql/11/bin/repmgr -f /etc/postgresql/11/main/repmgr.conf  standby follow --log-to-file --upstream-node-id=%n'        # %n将被替换 repmgrd与新的主节点的ID， 如果没有提供， repmgr standby follow将尝试自行确定新的主repmgr standby follow节点，
                                                                                                           # 但如果在新主节点提升后原主节点重新上线，则存在导致节点继续跟随原主节点的风险 。
# 高可用参数设置
location='location1'                # 定义节点位置的任意字符串,在故障转移期间用于检查当前主节点的可见性
priority=100                        # 节点优先级，选主时可能使用到。（lsn > priority > node_id）
                                    # 0 代表该节点不会被提升为主节点
monitoring_history=yes              # 是否将监控数据写入“monitoring_history”表
reconnect_interval=10               # 故障转移之前，尝试重新连接的间隔（以秒为单位）
reconnect_attempts=6                # 故障转移之前，尝试重新连接的次数
connection_check_type=ping          # ping: repmg 使用PQPing() 方法测试连接
                                    # connection: 尝试与节点建立新的连接
                                    # query: 通过现有连接在节点上执行 SQL 语句
monitor_interval_secs=5             # 写入监控数据的间隔
use_replication_slots=true
# failover_validation_command=      # %n (node_id), %a (node_name)。
                                    # 自定义脚本，以验证 repmgrd 做出的故障转移决策
                                    # 此脚本必须返回退出代码 0 以指示节点应提升自身为主节点。
```
本次示例 repmgr.conf 文件放到以下位置：`/etc/postgresql/11/main/repmgr.conf`。
### **【使用注意】**

* `repmgr.conf`不应存储在 PostgreSQL 数据目录中，因为在设置或重新初始化 PostgreSQL 服务器时它可能会被覆盖；
* 如果将 repmgr 二进制文件放置在 PostgreSQL 安装目录以外的位置，指定 `repmgr_bindir` 以启用 repmgr 在其他节点上执行操作（例如：repmgr cluster crosscheck）。
## 1.5 注册主服务器

要使 repmgr 支持复制集群，必须使用 repmgr 注册主节点（repmgr primary register）。这将安装 `repmgr`扩展和元数据对象，并为主服务器添加元数据记录。

```plain
# su - postgres -c "/usr/lib/postgresql/11/bin/repmgr -f /etc/postgresql/11/main/repmgr.conf primary register"
INFO: connecting to primary database...
NOTICE: attempting to install extension "repmgr"
NOTICE: "repmgr" extension successfully installed
NOTICE: primary node record (ID: 1) registered
```
* 查看集群信息
```plain
# su - postgres -c "/usr/lib/postgresql/11/bin/repmgr -f /etc/postgresql/11/main/repmgr.conf cluster show"
 ID | Name  | Role    | Status    | Upstream | Location | Priority | Timeline | Connection string                                                                          
----+-------+---------+-----------+----------+----------+----------+----------+---------------------------------------------------------------------------------------------
 1  | node1 | primary | * running |          | default  | 100      | 1        | host=127.0.0.1 port=5432 user=repmgr dbname=repmgr connect_timeout=2 password=test1234
```
* 查看 repmgr 元数据表
```plain
repmgr=# SELECT * FROM repmgr.nodes;

 node_id | upstream_node_id | active | node_name |  type   | location | priority |                                          conninfo                                           | repluser | slot_name |             config_file             
---------+------------------+--------+-----------+---------+----------+----------+---------------------------------------------------------------------------------------------+----------+-----------+-------------------------------------
       1 |                  | t      | node1     | primary | default  |      100 | host=127.0.0.1 port=5432 user=repmgr dbname=repmgr connect_timeout=2 password=test1234 | repmgr   |           | /etc/postgresql/11/main/repmgr.conf
```
* 配置文件发生改变，需要在每个节点执行
```plain
$ repmgr primary register --force -f /path/to/repmgr.conf
$ repmgr standby register --force -f /path/to/repmgr.conf
$ repmgr witness register --force -f /path/to/repmgr.conf -h primary_host
```
### **【使用注意】**

repmgr 不能以 root 用户运行。

## 1.6 启动 repmgrd

**1、修改 postgresql.conf 文件**

加入 repmgr 共享库（在之前的共享库中在加入 repmgr 即可）。

```plain
shared_preload_libraries = 'passwordcheck, repmgr'
```
**2、重启数据库**
```plain
/usr/lib/postgresql/11/bin/pg_ctl restart
```
**3、启动 repmgrd 服务**
```plain
# 创建日志文件，repmgrd 的日志文件需要手动创建
su postgres
mkdir -p /data/pglog/repmgr/
touch /data/pglog/repmgr/repmgrd.log

# 启动 repmgrd 服务
/usr/lib/postgresql/11/bin/repmgrd -f /etc/postgresql/11/main/repmgr.conf start
```
## 1.7 repmgrd 日志轮换

为确保当前的 repmgrd 日志文件（`repmgr.conf`配置文件中用参数`log_file`指定的文件）不会无限增长，请将您的系统配置`logrotate`为定期轮换它。

```plain
vim /etc/logrotate.d/repmgr
    /data/pglog/repmgr/repmgrd.log {
        missingok
        compress
        rotate 52
        maxsize 100M
        weekly
        create 0600 postgres postgres
        postrotate
            /usr/bin/killall -HUP repmgrd
        endscript
    }
```
## 1.8 repmgrd 重载配置

```plain
# 1、kill 旧进程
kill -9 `cat /tmp/repmgrd.pid`

# 2、start
/usr/lib/postgresql/11/bin/repmgrd -f /etc/postgresql/11/main/repmgr.conf start
```
# 2 备库部分

### **【使用注意】**

在备用数据库上，不要创建 PostgreSQL 实例（即不要执行 initdb 或任何包提供的数据库创建脚本），但要确保目标数据目录（以及您希望 PostgreSQL 使用的任何其他目录）存在并归其所有 postgres 系统用户。权限必须设置为 0700 (drwx------)。

## 2.1 创建 repmgr.com 文件

在备用服务器上创建一个 repmgr.conf 文件，repmgr 配置文件与主库相同，注意修改其中的 node_id、node_name、conninfo 为本节点即可。

## 2.2 检查备库是否可克隆

备服务器节点注册前，不需要对 PostgreSQL 数据库进行初始化，可通过 repmgr 工具“一键式”部署。在对备用服务器进行克隆前，可以使用以下命令测试是否可以克隆。

使用`--dry-run`选项来检查备库是否可以克隆

```plain
$ su - postgres -c "/usr/lib/postgresql/11/bin/repmgr -h 192.168.100.2 -U repmgr -d repmgr -f /etc/postgresql/11/main/repmgr.conf standby clone --dry-run"

NOTICE: destination directory "/data/pgsql/main" provided
INFO: connecting to source node
DETAIL: connection string is: host=192.168.100.2 user=repmgr dbname=repmgr
DETAIL: current installation size is 38 MB
INFO: "repmgr" extension is installed in database "repmgr"
INFO: replication slot usage not requested;  no replication slot will be set up for this standby
INFO: parameter "max_wal_senders" set to 10
NOTICE: checking for available walsenders on the source node (2 required)
INFO: sufficient walsenders available on the source node
DETAIL: 2 required, 10 available
NOTICE: checking replication connections can be made to the source server (2 required)
INFO: required number of replication connections could be made to the source server
DETAIL: 2 replication connections required
NOTICE: standby will attach to upstream node 1
HINT: consider using the -c/--fast-checkpoint option
INFO: would execute:
  pg_basebackup -l "repmgr base backup"  -D /data/pgsql/main -h 192.168.100.2 -p 5432 -U repmgr -X stream 
INFO: all prerequisites for "standby clone" are met
```
报错以下内容证明：primary 节点的免密登录未配置好！
```plain
NOTICE: destination directory "/data/pgsql/main" provided
INFO: connecting to source node
DETAIL: connection string is: host=192.168.100.2 user=repmgr dbname=repmgr
ERROR: connection to database failed
DETAIL: 
fe_sendauth: no password supplied
```
## 2.3 克隆备库

```plain
$ su - postgres -c "/usr/lib/postgresql/11/bin/repmgr -h 192.168.100.2 -U repmgr -d repmgr -f /etc/postgresql/11/main/repmgr.conf standby clone"

NOTICE: destination directory "/data/pgsql/main" provided
INFO: connecting to source node
DETAIL: connection string is: host=192.168.100.2 user=repmgr dbname=repmgr
DETAIL: current installation size is 38 MB
INFO: replication slot usage not requested;  no replication slot will be set up for this standby
NOTICE: checking for available walsenders on the source node (2 required)
NOTICE: checking replication connections can be made to the source server (2 required)
INFO: checking and correcting permissions on existing directory "/data/pgsql/main"
NOTICE: starting backup (using pg_basebackup)...
HINT: this may take some time; consider using the -c/--fast-checkpoint option
INFO: executing:
  pg_basebackup -l "repmgr base backup"  -D /data/pgsql/main -h 192.168.100.2 -p 5432 -U repmgr -X stream 
NOTICE: standby clone (using pg_basebackup) complete
NOTICE: you can now start your PostgreSQL server
HINT: for example: pg_ctl -D /data/pgsql/main start
HINT: after starting the server, you need to register this standby with "repmgr standby register"
```
这代表使用 PostgreSQL 的`pg_basebackup`工具从 `192.168.100.2`克隆了PostgreSQL 数据目录文件。将自动创建包含从该主服务器开始流式传输的正确参数的 recovery.conf 文件。默认情况下，主数据目录中的任何配置文件都将复制到备用。通常这些将是 postgresql.conf、postgresql.auto.conf、pg_hba.conf 和 pg_ident.conf。这些可能需要在待机启动之前进行修改。

## 2.4 修改配置文件

修改 postgresql.conf、pg_hba.conf 配置文件，配置免密登录。

## 2.5 启动备库

```plain
# su postgres
$ /usr/lib/postgresql/11/bin/pg_ctl -D /data/pgsql/main/ start -o '-c config_file=/etc/postgresql/11/main/postgresql.conf' -l /data/pglog/start.log
```
## 2.6 注册从库为备用服务器

```plain
# su postgres
$ /usr/lib/postgresql/11/bin/repmgr -f /etc/postgresql/11/main/repmgr.conf --upstream-node-id=1 standby register
```
## 2.7 启动 repmgrd

**1、修改 postgresql.conf 文件，加入repmgr 共享库**

```plain
shared_preload_libraries = 'passwordcheck, repmgr'
```
**2、重启数据库**
```plain
/usr/lib/postgresql/11/bin/pg_ctl restart
```
**3、启动 repmgrd**
```plain
# 创建日志文件
su postgres
mkdir -p /data/pglog/repmgr/
touch /data/pglog/repmgr/repmgrd.log

# 启动 repmgrd 服务
/usr/lib/postgresql/11/bin/repmgrd -f /etc/postgresql/11/main/repmgr.conf start
```
## 2.8 repmgrd 日志轮换

为确保当前的 repmgrd 日志文件（`repmgr.conf`配置文件中用参数`log_file`指定的文件）不会无限增长，请将您的系统配置`logrotate`为定期轮换它。

```plain
#  vim /etc/logrotate.d/repmgr
    /data/pglog/repmgr/repmgrd.log {
         missingok
        compress
        rotate 52
        maxsize 100M
        weekly
        create 0600 postgres postgres
        postrotate
            /usr/bin/killall -HUP repmgrd
        endscript
    }
```
## 2.9 repmgrd 重载配置

```plain
# 1、kill 旧进程
kill -9 `cat /tmp/repmgrd.pid`

# 2、start
/usr/lib/postgresql/11/bin/repmgrd -f /etc/postgresql/11/main/repmgr.conf start
```
# 3 见证服务器（witness）

### **【使用注意】**

* 只有在使用 repmgrd 时，见证服务器才有用；
* 发生故障转移的情况下，见证服务器提供证据表明是主服务器本身是不可用的，而不是例如不同的物理位置之间的网络分离（防止脑裂问题出现） ；
* 请在与集群主服务器位于同一网段的服务器上设置一个普通 PostgreSQL 实例，并安装 repmgr、repmgrd，注册该实例为 witness（repmgr witness register）（见证服务器 Database system identifier 不能与集群主服务器相同）。
## 3.1 启动节点 postgres 服务

```plain
/usr/lib/postgresql/11/bin/pg_ctl -D /data/pgsql/main/ start
```
## 3.2 添加 repmgr.conf 配置

基本配置与主库相同，保持 node_id、node_name、conninfo 与主库不同即可。

## 3.3 启动 repmgrd

**1、修改 postgresql.conf 文件，加入repmgr 共享库**

```plain
shared_preload_libraries = 'passwordcheck, repmgr'
```
**2、重启数据库**
```plain
/usr/lib/postgresql/11/bin/pg_ctl -D /data/pgsql/main/ restart -o '-c config_file=/etc/postgresql/11/main/postgresql.conf' -l /data/pglog/start.log
```
**3、启动 repmgrd**
```plain
# 创建日志文件
su postgres
mkdir -p /data/pglog/repmgr/
touch /data/pglog/repmgr/repmgrd.log

# 启动 repmgrd 服务
/usr/lib/postgresql/11/bin/repmgrd -f /etc/postgresql/11/main/repmgr.conf start
```
**4、为确保当前的 repmgrd 日志文件（**`repmgr.conf`**配置文件中用参数**`log_file`**指定的文件）不会无限增长，请将您的系统配置**`logrotate`**为定期轮换它**
```plain
#  vim /etc/logrotate.d/repmgr
    /data/pglog/repmgr/repmgrd.log {
        missingok
         compress
        rotate 52
        maxsize 100M
        weekly
        create 0600 postgres postgres
        postrotate
            /usr/bin/killall -HUP repmgrd
        endscript
    }
```
## 3.4 注册 witness

```plain
/usr/lib/postgresql/11/bin/repmgr -f /etc/postgresql/11/main/repmgr.conf witness register -h 192.168.100.2
```
# 总结

至此，基于 repmgr 搭建出了一个 PostgreSQL 高可用集群（repmgr 本身不提供虚拟 ip 服务，如果需要虚拟 ip 服务，请使用 keepalived 或其它工具）。它具有集群状态监控、故障检测、故障转移等功能。更多 repmgr 高级功能及原理，例如处理网络分裂、主要可见性共识、级联复制、监控连接数、事件通知等，请参照官方文档进一步学习。

# 参考引用

[1]. repmgr.conf 配置： [https://raw.githubusercontent.com/EnterpriseDB/repmgr/master/repmgr.conf.sample](https://raw.githubusercontent.com/EnterpriseDB/repmgr/master/repmgr.conf.sample) 

