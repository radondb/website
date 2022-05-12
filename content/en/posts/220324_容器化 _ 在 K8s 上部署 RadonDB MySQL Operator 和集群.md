---
title: "容器化 | K8s 部署 RadonDB MySQL Operator 和集群"
date: 2022-03-24T15:39:00+08:00
author: "程润科 "
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 容器化
  - 高可用
  - Operator
  - Kubernetes
# 相关文章会通过keywords来匹配
keywords:
  - mysql
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/220324_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20K8s%20%E4%B8%8A%E9%83%A8%E7%BD%B2%20RadonDB%20MySQL%20Operator%20%E5%92%8C%E9%9B%86%E7%BE%A4/0.png
---
本文将演示如何在 Kubernetes 上部署 RadonDB MySQL Kubernetes 2.1.2
<!--more-->

作者：程润科 数据库研发工程师
编辑：张莉梅 高级文档工程师
视频：钱芬 高级测试工程师 

本文将演示在 Kubernetes 上部署 RadonDB MySQL Kubernetes 2.X（Operator）的步骤，快速实现 MySQL 高可用集群部署，以及部署集群的校验和卸载方式。

部署版本为 [RadonDB MySQL Kubernetes 2.1.2](https://radondb.com/news/220223_radondb-mysql-on-k8s-2_1_2-%E5%8F%91%E5%B8%83/)。

# 部署准备

* Kubernetes 集群
* MySQL 客户端工具
# 部署过程

## 步骤 1: 添加 Helm 仓库

添加 Helm 仓库  `radondb` 。

```plain
helm repo add radondb https://radondb.github.io/radondb-mysql-kubernetes/
```
校验仓库信息，可查看到名为 `radondb/mysql-operator` 的 chart。
```plain
$ helm search repo
NAME                            CHART VERSION   APP VERSION                     DESCRIPTION                 
radondb/mysql-operator          0.1.0           v2.1.2                          Open Source，High Availability Cluster，based on MySQL                     
```
## 步骤 2: 部署 Operator

以下指定 release 名为 `demo` , 创建一个名为 `demo-mysql-operator` 的 [Deployment](https://kubernetes.io/zh/docs/concepts/workloads/controllers/deployment/)[1]。

```plain
helm install demo radondb/mysql-operator
```
>在这一步中，默认将同时创建集群所需的 [CRD](https://kubernetes.io/zh/docs/concepts/extend-kubernetes/api-extension/custom-resources/)[2]。 
## 步骤 3: 部署 RadonDB MySQL 集群

执行以下指令，以默认参数为 CRD `mysqlclusters.mysql.radondb.com` 创建一个实例，即创建 RadonDB MySQL 集群。

```plain
kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml
```
>自定义集群部署参数，可参考 [配置参数](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/zh-cn/config_para.md)[3]。 
# 部署校验

## 校验 RadonDB MySQL Operator

查看 `demo` 的 Deployment 和对应监控服务，回显如下信息则部署成功。

```plain
$ kubectl get deployment,svc
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
demo-mysql-operator   1/1     1            1           7h50m

NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/mysql-operator-metrics   ClusterIP   10.96.142.22    <none>        8443/TCP   8h
```
## 校验 RadonDB MySQL 集群

执行如下命令，将查看到如下 CRD。

```plain
$ kubectl get crd | grep mysql.radondb.com
backups.mysql.radondb.com                             2021-11-02T07:00:01Z
mysqlclusters.mysql.radondb.com                       2021-11-02T07:00:01Z
mysqlusers.mysql.radondb.com                          2021-11-02T07:00:01Z
```
以默认部署为例，执行如下命令将查看到名为 `sample-mysql` 的三节点 RadonDB MySQL 集群及用于访问节点的服务。
```plain
$ kubectl get statefulset,svc
NAME           READY   AGE
sample-mysql   3/3     7h33m

NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/sample-follower          ClusterIP   10.96.131.84    <none>        3306/TCP   7h37m
service/sample-leader            ClusterIP   10.96.111.214   <none>        3306/TCP   7h37m
service/sample-mysql             ClusterIP   None            <none>        3306/TCP   7h37m
```
# 访问集群

在 Kubernetes 集群内，支持使用 `service_name` 或者 `clusterIP` 方式，访问 RadonDB MySQL。

>RadonDB MySQL 提供 Leader 和 Follower 两种服务，分别用于客户端访问主从节点。Leader 服务始终指向主节点（可读写），Follower 服务始终指向从节点（只读）。 

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220324_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20K8s%20%E4%B8%8A%E9%83%A8%E7%BD%B2%20RadonDB%20MySQL%20Operator%20%E5%92%8C%E9%9B%86%E7%BE%A4/1.png)

以下为客户端与数据库在同一 Kubernetes 集群内，访问 RadonDB MySQL 的方式。

>当客户端的与数据库部署在不同 Kubernetes 集群，请参考 [Kubernetes 访问集群中的应用程序](https://kubernetes.io/zh/docs/tasks/access-application-cluster)[4]，配置端口转发、负载均衡等连接方式。 
## ClusterIP 方式

RadonDB MySQL 的高可用读写 IP 指向 Leader 服务的 `clusterIP`，高可用只读 IP 指向 Follower 服务的 `clusterIP`。

```plain
mysql -h <clusterIP> -P <mysql_Port> -u <user_name> -p
```
以下示例用户名为 `radondb_usr`， Leader 服务的 clusterIP 为 `10.10.128.136` ，连接示例如下：
```plain
mysql -h 10.10.128.136 -P 3306 -u radondb_usr -p
```
## service_name 方式

Kubernetes 集群的 Pod 之间支持通过 `service_name` 方式访问 RadonDB MySQL。

>`service_name` 方式不适用于从 Kubernetes 集群的物理机访问数据库 Pod。
>   连接 Leader 服务（RadonDB MySQL 主节点） 
```plain
mysql -h <leader_service_name>.<namespace> -u <user_name> -p
```
用户名为 `radondb_usr`，release 名为 `sample`，RadonDB MySQL 命名空间为 `default` ，连接示例如下：
```plain
mysql -h sample-leader.default -u radondb_usr -p
```
连接 Follower 服务（RadonDB MySQL 从节点）
```plain
mysql -h <follower_service_name>.<namespace> -u <user_name> -p
```
用户名为 `radondb_usr`，release 名为 `sample`，RadonDB MySQL 命名空间
为 `default` ，连接示例如下：

```plain
mysql -h sample-follower.default -u radondb_usr -p  
```
# 卸载

## 卸载 Operator

卸载当前命名空间下 release 名为 `demo` 的 RadonDB MySQL Operator。

```plain
helm delete demo
```
## 卸载集群

卸载 release 名为 `sample` RadonDB MySQL 集群。

```plain
kubectl delete mysqlclusters.mysql.radondb.com sample
```
## 卸载自定义资源

```plain
kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlclusters.mysql.radondb.com
kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlusers.mysql.radondb.com
kubectl delete customresourcedefinitions.apiextensions.k8s.io backups.mysql.radondb.com
```
### 引用参考

1. **Deployment**：[https://kubernetes.io/zh/docs/concepts/workloads/controllers/deployment/](https://kubernetes.io/zh/docs/concepts/workloads/controllers/deployment/)
2. **CRD**：[https://kubernetes.io/zh/docs/concepts/extend-kubernetes/api-extension/custom-resources/](https://kubernetes.io/zh/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
3. **配置参数**：[https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/zh-cn/config_para.md](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/zh-cn/config_para.md)
4. **Kubernetes 访问集群中的应用程序**：[https://kubernetes.io/zh/docs/tasks/access-application-cluster/](https://kubernetes.io/zh/docs/tasks/access-application-cluster/)

*相关部署视频可至 RadonDB 开源社区 B 站账号观看（搜索：RadonDB） 

