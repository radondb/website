---
title: "容器化 | 在 Kubernetes 上部署 RadonDB MySQL 集群"
date: 2021-06-23T15:39:00+08:00
author: "程润科"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 容器化
  - Kubernetes
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/cover/210623.png
---
如何将 RadonDB MySQL 集群部署在 Kubernetes 平台上，一些初始化操作及注意事项。
<!--more-->
作者：程润科 数据库研发工程师

目前从事 RadonDB MySQL Kubernetes 研发，热衷于研究数据库内核、K8s 相关技术。 

-------------------------

**RadonDB MySQL** 是一款基于 MySQL 的开源、高可用、云原生集群解决方案。支持一主多从高可用架构，并具备安全、自动备份、监控告警、自动扩容等全套管理功能。目前已经在生产环境中大规模的使用，包含 **银行、保险、传统大企业**等。

RadonDB MySQL Kubernetes[1] 支持在 Kubernetes 上安装部署和管理，自动执行与运行 RadonDB MySQL 集群有关的任务。

本教程主要演示如何使用 Git 和 Repo 命令行两种方式在 Kubernetes 上部署 RadonDB MySQL 集群。

# 部署准备

已准备可用 Kubernetes 集群。

## 方式一：通过 Git 部署

执行如下命令，将 RadonDB MySQL Chart 克隆到 Kubernetes 中。

```plain
$ git clone https://github.com/radondb/radondb-mysql-kubernetes.git
```
在 radondb-mysql-kubernetes 目录路径下，选择如下方式，部署 release 实例。

release 是运行在 Kubernetes 集群中的 Chart 的实例。通过命令方式部署，需指定 release 名称。 

以下命令指定 release 名为 `demo`，将创建一个名为 `demo-radondb-mysql` 的有状态副本集。

* **默认部署方式**

```plain
<For Helm v3>
 cd charts/helm
 helm install demo .
```

* **指定参数部署方式**

在 `helm install` 时使用 `--set key=value[,key=value]` 可指定参数部署。

以创建一个标准用户，且创建指定可访问数据库为例。用户名为 `my-user`、密码为 `my-password`、授权数据库为 `my-database`。

```plain
cd charts/helm
helm install demo \
 --set mysql.mysqlUser=my-user,mysql.mysqlPassword=my-password,mysql.database=my-database .
```
* **配置 yaml 参数方式**

执行如下命令，可通过 value.yaml 配置文件，在安装时指定参数配置。

```plain
cd charts/helm
helm install demo -f values.yaml .
```
## 方式二：通过 repo 部署

添加并更新 helm 仓库。

```plain
$ helm repo add test https://charts.kubesphere.io/test
$ helm repo update
```

以下命令指定 release 名为 `demo`，将创建一个名为 `demo-radondb-mysql` 的有状态副本集。

```plain
$ helm install demo test/radondb-mysql
NAME: demo
LAST DEPLOYED: Wed Apr 28 08:08:15 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
The cluster is comprised of 3 pods: 1 leader and 2 followers. Each instance is accessible within the cluster through:
    <pod-name>.demo-radondb-mysql
To connect to your database:
1. Get mysql user `qingcloud`s password:
    kubectl get secret -n default demo-radondb-mysql -o jsonpath="{.data.mysql-password}" | base64 --decode; echo
2. Run an Ubuntu pod that you can use as a client:
    kubectl run ubuntu -n default --image=ubuntu:focal -it --rm --restart='Never' -- bash -il
3. Install the mysql client:
    apt-get update && apt-get install mysql-client -y
4. To connect to leader service in the Ubuntu pod:
    mysql -h demo-radondb-mysql-leader -u qingcloud -p
5. To connect to follower service (read-only) in the Ubuntu pod:
    mysql -h demo-radondb-mysql-follower -u qingcloud -p    
```
# 部署校验

集群创建成功后，默认将创建一个有状态副本集（StatefulSet ），以及三个用于访问节点的服务。

以默认部署为例，可获取如下资源信息，则集群部署成功。

```plain
$ kubectl get statefulset,svc
NAME                                  READY   AGE
statefulset.apps/demo-radondb-mysql   3/3     45m
NAME                                  TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/demo-radondb-mysql            ClusterIP   None            <none>        3306/TCP   45m
service/demo-radondb-mysql-follower   ClusterIP   10.96.84.254    <none>        3306/TCP   45m
service/demo-radondb-mysql-leader     ClusterIP   10.96.178.195   <none>        3306/TCP   45m
```
## 连接 RadonDB MySQL

您需要准备一个用于连接 MySQL 的客户端。

### 与客户端在同一 NameSpace 中

当客户端与 RadonDB MySQL 集群在同一个 NameSpace 中时，可使用 leader/follower service 名称代替具体的 IP 和端口。

* 连接主节点(读写节点)。

```plain
$ mysql -h <leader service 名称> -u <用户名> -p
```

用户名为 `radondb_mysql`，release 名为 `demo` ，连接示例如下：

```plain
$ mysql -h demo-radondb-mysql-leader -u radondb_mysql -p
```
* 连接从节点(只读节点)。

```plain
$ mysql -h <follower service 名称> -u <用户名> -p
```

用户名为 `radondb_mysql`，release 名为 `demo` ，连接示例如下：

```plain
$ mysql -h demo-radondb-mysql-follower -u qradondb_mysql-p  
```
### 与客户端不在同一 NameSpace 中

当客户端与 RadonDB MySQL 集群不在同一个 NameSpace 中时，可以通过 podIP 或服务 ClusterIP 来连接对应节点。

* 查询 pod 列表和服务列表，分别获取需要连接的节点所在的 pod 名称或对应的服务名称。
```plain
$ kubectl get pod,svc
```

* 查看 pod / 服务 的详细信息，获取对应的 IP。

```plain
$ kubectl describe pod <pod 名称>
$ kubectl describe svc <服务名称>
```

注意：pod 重启后 pod IP 会更新，每次重启后需重新获取 pod IP。

- 连接节点。
 

```plain
$ mysql -h <pod IP/服务 ClusterIP> -u <用户名> -p
```

用户名为 `radondb_mysql`，pod IP 为 `10.10.128.136` ，连接示例如下：

```plain
$ mysql -h 10.10.128.136 -u radondb_mysql -p
```
# 持久化

MySQL 镜像[2] 在容器路径 `/var/lib/mysql` 中存储 MySQL 数据和配置。

默认情况下，会创建一个 PVC[3] 并将其挂载到指定目录中。 若想禁用此功能，您可以更改 `values.yaml` 禁用持久化，改用 emptyDir。

当 Pod 分配给节点后，将首先创建一个 emptyDir 卷，只要 Pod 在节点上持续运行，则存储卷便持续存在；当 Pod 节点中删除时 ，emptyDir 中的数据也将被永久删除。

**注意**
- PVC 中可以使用不同特性的持久卷（PersistentVolume，PV），其 I/O 性能会影响数据库的初始化性能。所以当使用 PVC 启用持久化存储时，可能需要调整 `livenessProbe.initialDelaySeconds` 的值。
- 数据库初始化的默认限制是60秒 (`livenessProbe.initialDelaySeconds` + `livenessProbe.periodSeconds` * `livenessProbe.failureThreshold`)。如果初始化时间超过限制，kubelet 将重启数据库容器，数据库初始化被中断，会导致持久数据不可用。

# 自定义 MySQL 配置

在 `mysql.configFiles` 中添加/更改 MySQL 配置[4]。

```yaml
configFiles:
   node.cnf: |
    [mysqld]
    default_storage_engine=InnoDB
    max_connections=65535

    # custom mysql configuration.
    expire_logs_days=7
```
# 参考引用

[1].RadonDB MySQLkubernetes：[https://github.com/radondb/radondb-mysql-kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)

[2].MySQL 镜像：[https://hub.docker.com/repository/docker/zhyass/percona57](https://hub.docker.com/repository/docker/zhyass/percona57)

[3].PVC：[https://kubernetes.io/zh/docs/concepts/storage/persistent-volumes/](https://kubernetes.io/zh/docs/concepts/storage/persistent-volumes/)

[4].Helm Charts 配置：[https://github.com/radondb/radondb-mysql-kubernetes/tree/main/charts/helm](https://github.com/radondb/radondb-mysql-kubernetes/tree/main/charts/helm)

