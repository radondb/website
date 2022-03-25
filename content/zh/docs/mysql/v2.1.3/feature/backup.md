---
title: "备份与恢复"
weight: 2
---

支持版本：2.1.0 +

# 快速开始备份

## 步骤 1：安装 Operator
安装名为 `test` 的 Operator。

```shell
$ helm install test charts/mysql-operator
```

## 步骤 2：配置备份

添加保密文件。

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

s3-xxxx 的值是试用 base64 算法加密的，你可以这样获得。

```shell
$ echo -n "hello"|base64
```

然后在 K8s 中创建加密配置。
```
$ kubectl create -f config/samples/backup_secret.yaml
```

请在 `mysql_v1apha1_mysqlcluster.yaml` 文件中添加 backupSecretName 属性。

```yaml
spec:
  replicas: 3
  mysqlVersion: "5.7"
  backupSecretName: sample-backup-secret
  ...
```

现在，如下创建备份文件 `mysql_v1apha1_backup.yaml` 如下。

```yaml
apiVersion: mysql.radondb.com/v1alpha1
kind: Backup
metadata:
  name: backup-sample1
spec:
  # Add fields here
  hostname: sample-mysql-0
  clustname: sample

```
| name | function  | 
|------|--------|
|hostname|pod name in cluser|
|clustname|cluster name|

## 步骤 3：开启集群

```shell
$ kubectl apply -f config/samples/mysql_v1alpha1_mysqlcluster.yaml     
```
## 步骤4：开始备份
在集群运行成功后开始备份。

```shell
$ kubectl apply -f config/samples/mysql_v1alpha1_backup.yaml
```

# 卸载

## 卸载 Operator
卸载名为 `test` 的 Operator。
```shell
$helm uninstall test

$kubectl delete -f config/samples/mysql_v1alpha1_backup.yaml
```

## 卸载集群
卸载名为 `sample` 的集群。

```shell
$ kubectl delete mysqlclusters.mysql.radondb.com sample
```

## 卸载资源

```shell
$ kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlclusters.mysql.radondb.com
```

# 从备份中恢复集群
检测你的 S3 bucket，获取你备份的目录，比如：`backup_2021720827`，并且将设置为 yaml 文件的 `restoreFrom` 属性中。

```yaml
...
spec:
  replicas: 3
  mysqlVersion: "5.7"
  backupSecretName: sample-backup-secret
  restoreFrom: "backup_2021720827"
...
```
此时执行：

```shell
$ kubectl apply -f config/samples/mysql_v1alpha1_mysqlcluster.yaml     
```

could restore a cluster from the `backup_2021720827 ` copy in the S3 bucket. 

完成，已经从名为 `backup_2021720827` 的 S3 备份中恢复一个集群。

## 创建镜像
如下：
```
$ docker build -f Dockerfile.sidecar -t  acekingke/sidecar:0.1 . && docker push acekingke/sidecar:0.1
$ docker build -t acekingke/controller:0.1 . && docker push acekingke/controller:0.1
```

可以将 acekingke/sidecar:0.1 改为你自己的标签。

## deploy your own manager
```shell
$ make manifests
$ make install 
$ make deploy IMG=acekingke/controller:0.1 KUSTOMIZE=~/radondb-mysql-kubernetes/bin/kustomize 
```