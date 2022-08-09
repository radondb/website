---
title: "容器化｜在 S3 备份恢复 RadonDB MySQL 集群数据"
date: 2022-04-24T15:39:00+08:00
author: "程润科 钱芬 "
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 容器化
  - Kubernetes
# 相关文章会通过keywords来匹配
keywords:
  - mysql
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/220424_%E5%AE%B9%E5%99%A8%E5%8C%96%EF%BD%9C%E5%9C%A8%20S3%20%E5%A4%87%E4%BB%BD%E6%81%A2%E5%A4%8D%20RadonDB%20MySQL%20%E9%9B%86%E7%BE%A4%E6%95%B0%E6%8D%AE/0.png
---
<!--more-->
上一篇文章我们演示了如何快速实现 MySQL 高可用集群部署，以及部署集群的校验和卸载方式。本文将演示如何对集群进行备份和恢复。

部署版本为 [RadonDB MySQL Kubernetes 2.1.3](https://radondb.com/news/220325_radondb-mysql-on-k8s-2_1_3-%E5%8F%91%E5%B8%83/)。

# 环境准备

首先准备一套 Kubernetes 集群，过程略。然后创建一套 RadonDB MySQL 集群。

## 步骤 1：下载源码

```plain
$ git clone https://github.com/radondb/radondb-mysql-kubernetes.git
```
## 步骤 2：安装 Operator

以下指定 release 名为  `test` , 创建一个名为  `test-mysql-operator`  的 Deployment。。

```plain
$ helm install test charts/mysql-operator
```
## 步骤 3：配置备份信息

Kubernetes Secret 资源信息需提前准备。文章及操作视频中的资源环境为青云云平台的 qingstor 对象存储。其他平台的密钥及 S3 存储服务创建过程类似，请另行参考。

### 创建 API 密钥

登录青云云平台官网，点击 产品与服务 -> API 密钥；进入入 API 密钥页面，点击 创建 API 密钥，输入名称后下载  `s3-access-key` 、 `s3-secret-key`  明文信息。

### 创建 s3-bucket

点击 产品与服务 -> 对象存储；进入对象存储页面，点击 创建 Bucket，输入 bucket 名称后即可获得 bucket 明文信息：

* s3-endpoint: [http://s3.sh1a.qingstor.com](http://s3.sh1a.qingstor.com)
* s3-access-key:VNXYHYHQUXZKUVZFGFRY
* s3-secret-key:0zw7JKkbAAdlQKHPjTHWtoFGGQRvnQ5SJRc5P69r
* s3-bucket: radondb-mysql-bucket s3-xxxx 的值是使用 base64 算法加密的，你可以这样获得。（此处对s3-xxx信息进行脱敏处理）。
```plain
$ echo -n "http://s3.sh1a.qingstor.com"|base64
```
### 创建 Kubernetes Secret 资源

创建`backup_secret.yaml`文件用来存放 S3 对象存储相关信息。（此处对s3-xxx信息进行脱敏处理）。

```yaml
kind: Secret
apiVersion: v1
metadata:
name: sample-backup-secret
namespace: default
data:
s3-endpoint: aHR0cDovL3MzLnNoMWEucWluZ3N0b3IuY29t
s3-access-key: Vk5YWUhZSFFVWFpLVVZaRkdGUlk=
s3-secret-key: MHp3N0pLa2JBQWRsUUtIUGpUSFd0b0ZHR1FSdm5RNVNKUmM1UDY5cg==
s3-bucket: cmFkb25kYi1teXNxbC1idWNrZXQ=
type: Opaque
```
然后在 kubernetes 中执行创建加密配置。
```plain
$ kubectl create -f config/samples/backup_secret.yaml
```
## 步骤 4：创建及启动集群

请在`mysql_v1a1pha1_mysqlcluster.yaml` 文件中添加  `backupSecretName`  属性。

```yaml
spec:
replicas: 3
mysqlVersion: "5.7"
backupSecretName: sample-backup-secret
...
```
执行以下指令，即创建 RadonDB MySQL 集群。
```plain
$ kubectl apply -f config/samples/mysql_v1alpha1_mysqlcluster.yaml     
```
# 备份恢复

## 将集群数据备份到 S3 存储

创建备份文件 `mysql_v1a1pha1_backup.yaml` 内容如下。

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
|name|function|
|:----|:----|
|hostname|pod name in cluser|
|clustname|cluster name|

待集群运行成功后，执行以下指令开始备份。

```yaml
$ kubectl apply -f config/samples/mysql_v1alpha1_backup.yaml
```
备份完成后可在 S3 查看对应的备份文件。

## 从 S3 备份中恢复集群

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
此时执行以下指令：
```plain
$ kubectl apply -f config/samples/mysql_v1alpha1_mysqlcluster.yaml     
```
恢复完成，已经从名为 `backup_2021720827` 的 S3 备份中恢复一个集群。

# 卸载

卸载过程详见《[部署文档](https://radondb.com/posts/220324_%E5%AE%B9%E5%99%A8%E5%8C%96-_-%E5%9C%A8-k8s-%E4%B8%8A%E9%83%A8%E7%BD%B2-radondb-mysql-operator-%E5%92%8C%E9%9B%86%E7%BE%A4/)》 的卸载部分。

## 相关视频
实操视频：《[RadonDB MySQL 集群备份恢复](https://radondb.com/docs/mysql/v2.1.3/vadio/%E5%A4%87%E4%BB%BD%E6%81%A2%E5%A4%8D/)》
