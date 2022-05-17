---
title: "Backup for S3"
weight: 2
---

> RadonDB MySQL Kubernetes 2.1.0+

# Quick Start

## Step 1: Install Operator
Install the operator named `test`:

```shell
$ helm install test charts/mysql-operator
```

## Step 2: Configure backup for S3

Add the secret file.

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

s3-xxxx value is encode by base64, you can get like that.

```shell
$ echo -n "hello"|base64
```

then, create the secret in k8s.

```shell
$ kubectl create -f config/samples/backup_secret.yaml
```

Please add the backupSecretName in `mysql_v1alpha1_mysqlcluster.yaml` , name as secret file:

```yaml
spec:
  replicas: 3
  mysqlVersion: "5.7"
  backupSecretName: sample-backup-secret
  ...
```

now create backup yaml file `mysql_v1alpha1_backup.yaml` like this:

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

## Step 3: Start Cluster

```shell
$ kubectl apply -f config/samples/mysql_v1alpha1_mysqlcluster.yaml     
```

## Step 4: Start Backup

After run cluster Success.

```shell
$ kubectl apply -f config/samples/mysql_v1alpha1_backup.yaml
```

# Uninstall
## Uninstall Operator

Uninstall the cluster named `test`:

```shell
$ helm uninstall test

$kubectl delete -f config/samples/mysql_v1alpha1_backup.yaml
```

## Uninstall Cluster

Uninstall the cluster named sample:
```shell
$ kubectl delete mysqlclusters.mysql.radondb.com sample
```

## Unistall CRD

```shell
$ kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlclusters.mysql.radondb.com
```

## Restore Cluster from backup copy
check your S3 bucket, get the directory where your backup to， such as `backup_2021720827`. add it to `RestoreFrom` in yaml file.

```yaml
...
spec:
  replicas: 3
  mysqlVersion: "5.7"
  backupSecretName: sample-backup-secret
  restoreFrom: "backup_2021720827"
...
```
Then you use:

```shell
$ kubectl apply -f config/samples/mysql_v1alpha1_mysqlcluster.yaml     
```

could restore a cluster from the `backup_2021720827` copy in the S3 bucket.

if you want backup to NFS server or restore from NFS server, do it as follow:

## Create Image

```shell
$ docker build -f Dockerfile.sidecar -t  acekingke/sidecar:0.1 . && docker push acekingke/sidecar:0.1
$ docker build -t acekingke/controller:0.1 . && docker push acekingke/controller:0.1
```

You can change `acekingke/sidecar:0.1` to your own label.

## Deploy Your Own Image
```shell
$ make manifests
$ make install 
$ make deploy IMG=acekingke/controller:0.1 KUSTOMIZE=~/radondb-mysql-kubernetes/bin/kustomize 
```