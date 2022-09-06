---
# menu 优先显示shortTitle，没有shortTitle显示Title
title: "NFS 备份与恢复"
# weight按照从小到大排列
weight: 3
---

本文档介绍如何对部署的 RadonDB MySQL 集群进行备份和恢复。

##  安装 NFS server 与资源

### 方法一：使用 Helm 安装

```shell
helm install demo charts/mysql-operator  --set nfsBackup.installServer=true  --set nfsBackup.volume.createLocalPV=true
```
或者手动创建 PVC，再运行如下命令：
```shell
helm install demo charts/mysql-operator  --set nfsBackup.installServer=true  --set nfsBackup.volume.specifiedPVC=XXXX
```
> 其中 `XXX` 为 PVC 名称。

用该方法，可以在安装 operator 时, 也将 NFS server 的 Pod 和 Service 安装到集群中。

### 方法二：使用 kubectl 安装

```shell
kubectl apply -f config/samples/nfs_pv.yaml 
kubectl apply -f config/samples/nfs_server.yaml 
```

## 获取 NFS 服务的 IP 地址

例如：
```shell

kubectl get svc nfs-server --template={{.spec.clusterIP}}
10.96.253.82
```
获取到 `ClusterIp`，就可以使用该地址进行 NFS 备份。这里 IP 地址为 `10.96.253.82`。

## 创建 NFS 备份

### 1. 配置 NFS 服务的 IP 地址

```yaml
# config/samples/mysql_v1alpha1_backup.yaml
nfsServerAddress: "10.96.253.82"
```

### 2. 创建备份
    

```shell
kubectl apply -f config/samples/mysql_v1alpha1_backup.yaml
```
> 注意：备份自定义资源与 MySQL 集群自定义资源必须在同一个命名空间中。

### 3. 验证备份

使用如下命令，可以发现名称格式为 `<cluster name>_<timestamp>` 的备份文件夹。

```shell
kubectl exec -it <pod name of nfs server> -- ls /exports
index.html  initbackup  sample_2022419101946
```

## 从已有的 NFS 备份恢复集群

配置 `mysql_v1alpha1_cluster.yaml`，将 `nfsServerAddress` 设置为 NFS server 的地址。

 ```yaml
 ...
 restoreFrom: "sample_2022419101946"
 nfsServerAddress: 10.96.253.82
 ```
 
 > 注意：`restoreFrom` 字段是备份的路径名称，可以从 NFS 服务加载的路径中看到。

 然后运行如下命令从 NFS 备份副本恢复集群：

 ```shell
kubectl apply -f config/samples/mysql_v1alpha1_cluster.yaml
 ```