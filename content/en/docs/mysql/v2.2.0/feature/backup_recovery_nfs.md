---
title: "NFS backup and recovery"
weight: 3
---

This tutorial demonstrates how to back up and recover the RadonDB MySQL cluster with the NFS server.

## Install NFS server and resources

### 1. Install by Helm
```shell
helm install demo charts/mysql-operator  --set nfsBackup.installServer=true  --set nfsBackup.volume.createLocalPV=true
```
Or manually create the PVC and run:
```shell
helm install demo charts/mysql-operator  --set nfsBackup.installServer=true  --set nfsBackup.volume.specifiedPVC=XXXX
```
> `XXX` stands for the PVC name.

In this way, you can install the pods and services of the NFS server in the cluster while installing the operator.

### 2. Install by kubectl
```shell
kubectl apply -f config/samples/nfs_pv.yaml 
kubectl apply -f config/samples/nfs_server.yaml 
```

## Obtain the IP address of the NFS server
For example:
```shell

kubectl get svc nfs-server --template={{.spec.clusterIP}}
10.96.253.82
```
You can perform NFS backup with `ClusterIp`, which is `10.96.253.82` in the example.

## Create an NFS backup
### 1. Configure the IP address of the NFS server

```yaml
# config/samples/mysql_v1alpha1_backup.yaml
nfsServerAddress: "10.96.253.82"
```

### 2. Create a backup
```shell
kubectl apply -f config/samples/mysql_v1alpha1_backup.yaml
```
> Note: The backup custom resource and that of the MySQL cluster must be in the same namespace.

### 3. Verify the backup
View the backup directory `<cluster name>_<timestamp>` as follows.

```shell
kubectl exec -it <pod name of nfs server> -- ls /exports
index.html  initbackup  sample_2022419101946
```

 ## Recover the cluster from the NFS backup

Configure the `nfsServerAddress` attribute to the IP address of the NFS server in the `mysql_v1alpha1_cluster.yaml` file.

 ```yaml
 ...
 restoreFrom: "sample_2022419101946"
 nfsServerAddress: 10.96.253.82
 ```
 
 > **Notice:**
 >
 > `restoreFrom` stands for the pathname of the backup cluster. You can obtain it by checking the load path of the NFS service.

Then, recover the cluster from the NFS backup as follows.

 ```
kubectl apply -f config/samples/mysql_v1alpha1_cluster.yaml
 ```