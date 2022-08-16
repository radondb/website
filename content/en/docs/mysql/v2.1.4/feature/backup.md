---
title: "Backup and recovery"
weight: 2
---

> This feature is supported in RadonDB MySQL Kubernetes 2.1.0 and later versions.

# Quick Start

## Step 1 Install Operator.
Install the operator named `test`:

```shell
$ helm install test charts/mysql-operator
```

## Step 2 Configure backup for S3.

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

The value `s3-xxxx` is base64-encoded. You can obtain the encoded value as follows.

```shell
$ echo -n "hello"|base64
```

Create the Secret in Kubernetes.

```shell
$ kubectl create -f config/samples/backup_secret.yaml
```

Add the backupSecretName property in `mysql_v1alpha1_mysqlcluster.yaml`.

```yaml
spec:
  replicas: 3
  mysqlVersion: "5.7"
  backupSecretName: sample-backup-secret
  ...
```

Create the backup file `mysql_v1alpha1_backup.yaml`.

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
| Parameter | Description  | 
|------|--------|
|hostname| The pod name in the cluster|
|clustname| The cluster name|

## Step 3 Start cluster.

```shell
$ kubectl apply -f config/samples/mysql_v1alpha1_mysqlcluster.yaml     
```

## Step 4 Start backup.

Start the backup after the cluster is successfully started.

```shell
$ kubectl apply -f config/samples/mysql_v1alpha1_backup.yaml
```

# Uninstallation
## Uninstalling operator

Uninstall the cluster named `test`:

```shell
$ helm uninstall test

$kubectl delete -f config/samples/mysql_v1alpha1_backup.yaml
```

## Uninstalling cluster

Uninstall the cluster named `sample`:
```shell
$ kubectl delete mysqlclusters.mysql.radondb.com sample
```

## Uninstalling CRD

```shell
$ kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlclusters.mysql.radondb.com
```

## Restore of cluster from backup
Check the S3 bucket and set the `RestoreFrom` property in the **YAML** file to the backup directory, for example, `backup_2021720827`.

```yaml
...
spec:
  replicas: 3
  mysqlVersion: "5.7"
  backupSecretName: sample-backup-secret
  restoreFrom: "backup_2021720827"
...
```
Then run the following command to restore a cluster from the backup_2021720827 copy in the S3 bucket.

```shell
$ kubectl apply -f config/samples/mysql_v1alpha1_mysqlcluster.yaml     
```

- To recover a cluster from an NFS server, operate as follows.

## Creating image

```shell
$ docker build -f Dockerfile.sidecar -t  acekingke/sidecar:0.1 . && docker push acekingke/sidecar:0.1
$ docker build -t acekingke/controller:0.1 . && docker push acekingke/controller:0.1
```

You can replace acekingke/sidecar:0.1 with your own label.

## Deploying your own image
```shell
$ make manifests
$ make install 
$ make deploy IMG=acekingke/controller:0.1 KUSTOMIZE=~/radondb-mysql-kubernetes/bin/kustomize 
```