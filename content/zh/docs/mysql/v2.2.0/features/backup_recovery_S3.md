---
# menu 优先显示shortTitle，没有shortTitle显示Title
title: "S3 备份与恢复"
# weight按照从小到大排列
weight: 4
---

本文档介绍如何对部署的 RadonDB MySQL 集群进行备份和恢复。

查看 [GitHub 文档](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/zh-cn/backup_and_restoration_s3.md)。

## 前提条件

* 已部署 [RadonDB MySQL 集群](./deploy_radondb-mysql_operator_on_k8s.md)。

## 配置备份

### 步骤 1: 创建 Secret 配置文件
```yaml
kind: Secret
apiVersion: v1
metadata:
  name: sample-backup-secret
  namespace: default
data:
  s3-endpoint: aHR0cDovL3MzLnNoMWEucWluZ3N0b3IuY29t
  s3-access-key: SEdKWldXVllLSENISllFRERKSUc=
  s3-secret-key: TU44TkNUdDJLdHlZREROTTc5cTNwdkxtNTlteE01blRaZlRQMWxoag==
  s3-bucket: bGFsYS1teXNxbA==
type: Opaque

```
`s3-xxxx` 字段的值采用 base64 编码，注意不要包含换行符的编码。您可以用如下命令获取 base64 编码：
```shell
echo -n "替换为您的S3-XXX值"|base64
```
然后，使用如下命令创建备份 Secret：

```shell
kubectl create -f config/samples/backup_secret.yaml
```
### 步骤 2: 将 Secret 配置到 Operator 集群
将备份 Secret 名称添加到 `mysql_v1alpha1_mysqlcluster.yaml` 中，本例中的名称为 `sample-backup-secret`：

```yaml
spec:
  replicas: 3
  mysqlVersion: "5.7"
  backupSecretName: sample-backup-secret
  ...
```
如下创建备份 YAML 配置文件 `mysql_v1alpha1_backup.yaml`：

```yaml
apiVersion: mysql.radondb.com/v1alpha1
kind: Backup
metadata:
  name: backup-sample1
spec:
  # Add fields here
  hostName: sample-mysql-0
  clusterName: sample
```

上述配置中，`hostName` 字段表示集群中 Pod 的名称，`clusterName` 字段表示数据库集群名称。

##  启动备份
> **提示：**
> 
> 启动集群后，才可以进行备份操作。

```shell
kubectl apply -f config/samples/mysql_v1alpha1_backup.yaml
```
执行成功后，可以通过如下命令查看备份状况：
```shell
kubectl get backups.mysql.radondb.com 
NAME            BACKUPNAME             BACKUPDATE            TYPE
backup-sample   sample_2022526155115   2022-05-26T15:51:15   S3
```

## 从备份副本恢复到新集群
检查您的 S3 bucket，得到您需要的备份文件夹，如 `sample_2022526155115`。
在 `mysql_v1alpha1_mysqlcluster.yaml` 中添加 `RestoreFrom` 字段，如下：

```yaml
...
spec:
  replicas: 3
  mysqlVersion: "5.7"
  backupSecretName: sample-backup-secret
  restoreFrom: "sample_2022526155115"
...
```
随后，运行如下命令，将会从备份文件夹恢复数据库：
```shell
kubectl apply -f config/samples/mysql_v1alpha1_mysqlcluster.yaml     
```