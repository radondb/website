---
title: "S3 backup and recovery"
weight: 4
---

This tutorial demonstrates how to back up and recover the RadonDB MySQL cluster with S3.

View [GitHub documentation](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/en-us/backup_and_restoration_s3.md).

## Prerequisites
* You need to deploy the [RadonDB MySQL cluster](../../installation/on_kubernetes).

## Configure the backup

### Step 1 Create the Secret file.
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
The value `s3-xxxx` is base64-encoded. You can encode the value as follows, and do not encode line breaks.

```shell
echo -n "your value"|base64
```
Then, create the backup Secret.
```shell
kubectl create -f config/samples/backup_secret.yaml
```

### Step 2 Configure the backup Secret for the Operator cluster.
Configure the `backupSecretName` property in `mysql_v1alpha1_mysqlcluster.yaml`. The following sets its value to `sample-backup-secret`.

```yaml
spec:
  replicas: 3
  mysqlVersion: "5.7"
  backupSecretName: sample-backup-secret
  ...
```
Create the YAML configuration file `mysql_v1alpha1_backup.yaml` as follows.

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

The configured property `hostName` stands for the pod name in the cluster, while `clusterName` refers to the cluster name.

## Start the backup

> **Note:**
> 
> Before starting the backup, you need to start the cluster.

```shell
kubectl apply -f config/samples/mysql_v1alpha1_backup.yaml
```

After starting the backup successfully, view the backup status as follows.

```shell
kubectl get backups.mysql.radondb.com 
NAME            BACKUPNAME             BACKUPDATE            TYPE
backup-sample   sample_2022526155115   2022-05-26T15:51:15   S3
```

## Recover the cluster from the backup
Check the S3 bucket to find out the backup directory with a name in the form of `sample_2022526155115`. Create the `RestoreFrom` property in the `mysql_v1alpha1_mysqlcluster.yaml` file and set its value to the backup directory name.

```yaml
...
spec:
  replicas: 3
  mysqlVersion: "5.7"
  backupSecretName: sample-backup-secret
  restoreFrom: "sample_2022526155115"
...
```
Then, run the following command to recover the database from the backup directory.

```shell
kubectl apply -f config/samples/mysql_v1alpha1_mysqlcluster.yaml     
```