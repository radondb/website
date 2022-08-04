---
title: "容器化 | 在 NFS 备份恢复 RadonDB MySQL 集群数据"
date: 2022-08-03T15:39:00+08:00
author: "柯煜昌 "
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 容器化
  - 备份恢复
# 相关文章会通过keywords来匹配
keywords:
  - MySQL
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/220803_%E5%AE%B9%E5%99%A8%E5%8C%96%20_%20%E5%9C%A8%20NFS%20%E5%A4%87%E4%BB%BD%E6%81%A2%E5%A4%8D%20RadonDB%20MySQL%20%E9%9B%86%E7%BE%A4%E6%95%B0%E6%8D%AE/0.png
---

本文将为您演示如何进行 NFS 备份及恢复操作。

<!--more-->

社区于上个月发布了 [RadonDB MySQL Kubernetes v2.2.0](https://radondb.com/news/220708_radondb-mysql-kubernetes-2_2_0-%E5%8F%91%E5%B8%83/)，集群数据备份恢复的存储类型除了 S3，新增 NFS 存储。本文将为您演示如何进行 NFS 备份及恢复操作。

# 环境准备

* Kubernetes 集群
* RadonDB MySQL 集群
过程略，详细请回顾《[快速实现 MySQL 高可用集群部署](https://radondb.com/posts/220324_%E5%AE%B9%E5%99%A8%E5%8C%96-_-%E5%9C%A8-k8s-%E4%B8%8A%E9%83%A8%E7%BD%B2-radondb-mysql-operator-%E5%92%8C%E9%9B%86%E7%BE%A4/)》。

# 安装 NFS 服务与资源

## 方法一：使用 Helm 安装

```plain
helm install demo charts/mysql-operator  --set nfsBackup.installServer=true  --set nfsBackup.volume.createLocalPV=true
```
或者手动创建 PVC，再执行
```plain
helm install demo charts/mysql-operator  --set nfsBackup.installServer=true  --set nfsBackup.volume.specifiedPVC=XXXX
```
用该方法，可以在安装 Operator 时，也将 NFS 服务的 Pod 和 Service 安装到集群中。
## 方法二：使用 kubectl 安装

```plain
kubectl apply -f config/samples/nfs_pv.yaml 
kubectl apply -f config/samples/nfs_server.yaml
```
### 获取 nfsServerAddress

例如：

```plain
kubectl get svc nfs-server --template={{.spec.clusterIP}}
10.98.253.82
```
获取到 `ClusterIP`，即可以使用该地址进行 NFS 备份。这里 IP 地址为 `10.96.253.82`。
# 创建 NFS 备份

## 配置 NFS 服务的地址

```plain
# 文件 config/samples/mysql_v1alpha1_backup.yaml
nfsServerAddress: "10.96.253.82"
```
## 创建备份

```plain
kubectl apply -f config/samples/mysql_v1alpha1_backup.yaml
```
>注意：备份自定义资源与 MySQL 集群自定义资源必须在同一个命名空间中。
>验证备份
>使用如下命令，可以发现名称格式为 `<cluster name>_<timestamp>` 的备份文件夹。 
```plain
kubectl exec -it <pod name of nfs server> -- ls /exports
# 显示结果
index.html  initbackup  sample_2022419101946
```
## 备份恢复

从已有的 NFS 备份文件中恢复集群。配置 `mysql_v1alpha1_cluster.yaml`，将 `nfsServerAddress` 设置为 NFS 服务的地址。

```plain
...
restoreFrom: "sample_2022419101946"
nfsServerAddress: 10.96.253.82
```
>注意：`restoreFrom` 是备份路径的名称，可以从 NFS 服务加载的路径中看到。然后从 NFS 备份副本恢复集群，如下： 
```plain
kubectl apply -f config/samples/mysql_v1alpha1_cluster.yaml
```
恢复完成，已经从名为  `sample_2022419101946` 的 NFS 备份中恢复一个集群。 
