---
title: "容器化 | ClickHouse on K8s 部署篇【建议收藏】"
date: 2021-08-16T15:39:00+08:00
author: "苏厚镇"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - 容器化
  - ClickHouse
  - Kubernetes
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210816_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20ClickHouse%20on%20K8s%20%E9%83%A8%E7%BD%B2%E7%AF%87%E3%80%90%E5%BB%BA%E8%AE%AE%E6%94%B6%E8%97%8F%E3%80%91/0.png
---
详细说明两种部署方式的实现步骤，集群管理中添加分片和硬盘扩容的操作。
<!--more-->
>作者：苏厚镇    青云科技数据库研发工程师
>目前从事 RadonDB ClickHouse 相关工作，热衷于研究数据库内核。 

延续上篇《[容器化 ClickHouse on K8s 基本概念解析篇](/posts/210813_容器化-_-clickhouse-on-k8s-基础篇/)》，可以了解到 Operator 提供简便管理 ClickHouse 集群功能，Helm 提供便捷部署集群功能。

本篇将以部署 RadonDB ClickHouse[1] 作为示例。在同样选用 Operator 的条件下，比较Kubectl 和 Helm 两种方式在 K8s 上部署 ClickHouse 集群的便捷性。并简要介绍如何在 K8s 上通过 Operator 轻便快速地管理 ClickHouse 集群。

# | 使用 Kubectl + Operator 部署

## 前置条件

* 已安装 Kubernetes 集群。
## 部署步骤

**1、部署 RadonDB ClickHouse Operator**

```plain
$ kubectl apply -f https://github.com/radondb/radondb-clickhouse-kubernetes/clickhouse-operator-install.yaml
```
>注意：若需 Operator 监控所有的 Kubernetes namespace，则需将其部署在 kube-system namespace 下。否则只会监控部署到的 namespace。 

**2、编写 CR 的部署文件**

以下 yaml 文件描述了应用 RadonDB ClickHouse Operator 安装两分片两副本集群的 ClickHouse 的配置规范。

```plain
apiVersion: "clickhouse.radondb.com/v1"
kind: "ClickHouseInstallation"  # 应用 Operator 创建集群
metadata:
  name: "ClickHouse"
spec:
  defaults:
 templates:                  # 磁盘挂载
   dataVolumeClaimTemplate: data
   logVolumeClaimTemplate: data
  configuration:
    clusters:                   # 集群节点描述，三分片两副本
      - name: "replicas"
        layout:
          shardsCount: 2
          replicasCount: 2
  templates:
     volumeClaimTemplates:   # 磁盘信息描述
       - name: data
            reclaimPolicy: Retain
         spec:
           accessModes:
             - ReadWriteOnce
           resources:
             requests:
               storage: 10Gi
```
**3、使用 Kubectl 部署**
以 test 名称空间为例：

```plain
$ kubectl -n test apply -f hello-kubernetes.yaml
clickhouseinstallation.clickhouse.radondb.com/ClickHouse created
```
>注意：若 RadonDB ClickHouse Operator 没有部署在 kube-system 中，则需要将 RadonDB ClickHouse 集群与 Operator 部署在同一名称空间。 

部署成功后，Kubernetes 会将 CR 信息存入  `etcd`  中，而 Operator 则将感知  `etcd`  的变化。当 Operator 获取 CR 变化内容时，将根据 CR 的内容创建对应的 StatefulSet、Service 等相关内容。

**4、查看集群的运行情况**

可获取四个正在运行的 RadonDB ClickHouse Pod，组成两片两副本的集群，同时提供一个 LoadBalancer SVC，供外部访问使用。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210816_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20ClickHouse%20on%20K8s%20%E9%83%A8%E7%BD%B2%E7%AF%87%E3%80%90%E5%BB%BA%E8%AE%AE%E6%94%B6%E8%97%8F%E3%80%91/1.png)

```plain
# 查看 Pod 运行状态
$ kubectl get pods -n test
NAME                               READY   STATUS    RESTARTS   AGE
pod/chi-ClickHouse-replicas-0-0-0   1/1     Running   0          3m13s
pod/chi-ClickHouse-replicas-0-1-0   1/1     Running   0          2m51s
pod/chi-ClickHouse-replicas-1-0-0   1/1     Running   0          2m34s
pod/chi-ClickHouse-replicas-1-1-0   1/1     Running   0          2m17s

# 查看 SVC 运行状态
$ kubectl get service -n test
NAME                                 TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                         AGE
service/chi-ClickHouse-replicas-0-0   ClusterIP      None            <none>        8123/TCP,9000/TCP,9009/TCP      2m53s
service/chi-ClickHouse-replicas-0-1   ClusterIP      None            <none>        8123/TCP,9000/TCP,9009/TCP      2m36s
service/chi-ClickHouse-replicas-1-0   ClusterIP      None            <none>        8123/TCP,9000/TCP,9009/TCP      2m19s
service/chi-ClickHouse-replicas-1-1   ClusterIP      None            <none>        8123/TCP,9000/TCP,9009/TCP      117s
service/clickhouse-ClickHouse         LoadBalancer   10.96.137.152   <pending>     8123:30563/TCP,9000:30615/TCP   3m14s
```
至此，如何使用 Kubectl + Operator 的方式部署 RadonDB ClickHouse 集群便介绍完毕，可看到整个过程还是需要一定 K8s 知识 “功底” 的。
# | 使用 Helm + Operator 部署

## 前置条件

* 已安装 Kubernetes 集群；
* 已安装 Helm 包管理工具。
## 部署步骤

**1、添加 RadonDB ClickHouse 的 Helm 仓库**

```plain
$ helm repo add ck https://radondb.github.io/radondb-clickhouse-kubernetes/
$ helm repo update
```
**2、部署 RadonDB ClickHouse Operator**
```plain
$ helm install clickhouse-operator ck/clickhouse-operator
```
**3、部署 RadonDB ClickHouse 集群**
```plain
$ helm install clickhouse ck/clickhouse-cluster
```
**4、查看集群的运行情况**
可获取六个正在运行的 RadonDB ClickHouse Pod，以及三个 Zookeeper Pod，组成三分片两副本的集群，同时提供一个 ClusterIP service，供访问使用。如果需要在外部对集群进行访问，此处可通过  `kubectl edit service/clickhouse-ClickHouse` 将 service 的类型自行修改为 NodePort 或 LoadBalancer。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210816_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20ClickHouse%20on%20K8s%20%E9%83%A8%E7%BD%B2%E7%AF%87%E3%80%90%E5%BB%BA%E8%AE%AE%E6%94%B6%E8%97%8F%E3%80%91/2.png)

```plain
# 查看 Pod 运行状态
$ kubectl get pods -n test
NAME                                READY   STATUS    RESTARTS   AGE
pod/chi-ClickHouse-replicas-0-0-0   2/2     Running   0          3m13s
pod/chi-ClickHouse-replicas-0-1-0   2/2     Running   0          2m51s
pod/chi-ClickHouse-replicas-1-0-0   2/2     Running   0          2m34s
pod/chi-ClickHouse-replicas-1-1-0   2/2     Running   0          2m17s
pod/chi-ClickHouse-replicas-2-0-0   2/2     Running   0          115s
pod/chi-ClickHouse-replicas-2-1-0   2/2     Running   0          48s
pod/zk-clickhouse-cluster-0         1/1     Running   0          3m13s
pod/zk-clickhouse-cluster-1         1/1     Running   0          3m13s
pod/zk-clickhouse-cluster-2         1/1     Running   0          3m13s

# 查看 SVC 运行状态
$ kubectl get service -n test
NAME                                  TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                         AGE
service/chi-ClickHouse-replicas-0-0   ClusterIP   None            <none>        8123/TCP,9000/TCP,9009/TCP      2m53s
service/chi-ClickHouse-replicas-0-1   ClusterIP   None            <none>        8123/TCP,9000/TCP,9009/TCP      2m36s
service/chi-ClickHouse-replicas-1-0   ClusterIP   None            <none>        8123/TCP,9000/TCP,9009/TCP      2m19s
service/chi-ClickHouse-replicas-1-1   ClusterIP   None            <none>        8123/TCP,9000/TCP,9009/TCP      117s
service/chi-ClickHouse-replicas-2-0   ClusterIP   None            <none>        8123/TCP,9000/TCP,9009/TCP      50s
service/chi-ClickHouse-replicas-2-1   ClusterIP   None            <none>        8123/TCP,9000/TCP,9009/TCP      13s
service/clickhouse-ClickHouse         ClusterIP   10.96.137.152   <none>        8123/TCP,9000/TCP               3m14s
service/zk-client-clickhouse-cluster  ClusterIP   10.107.33.51    <none>        2181/TCP,7000/TCP               3m13s
service/zk-server-clickhouse-cluster  ClusterIP   None            <none>        2888/TCP,3888/TCP               3m13s
```
至此 ，通过 Helm 方式部署 RadonDB ClickHouse on Kubernetes 集群完毕，可以看到 Helm 部署方式相对更方便和简捷。简化了 CR 部署文件配置过程，无需掌握全部 Kubernetes 的 Yaml 语法和 CR 部署文件各参数含义，可以通过打包应用快速部署。
# | 使用 Operator 管理 RadonDB ClickHouse 集群

上面演示了如何使用 Operator 部署 RadonDB ClickHouse 集群，下面我们来验证一下 Operator 管理集群的功能。

## 添加分片

如果需要给 ClickHouse 添加一个额外的分片应该怎么操作呢？此时只需要修改我们部署的 CR 即可。

```plain
$ kubectl get chi -n test
NAME         CLUSTERS   HOSTS   STATUS
clickhouse   1          6       Completed

$ kubectl edit chi/clickhouse -n test
# 这里我们仅截取需要修改的内容
spec:
  configuration:
    clusters:
      - name: "replicas"
        layout:
          shardsCount: 4        # 将分片改为 4
          replicasCount: 2
```
修改成功后，Kubernetes 会将 CR 信息存入  `etcd`  中，而 Operator 则将感知  `etcd`  的变化。当 Operator 获取 CR 变化内容时，将根据 CR 的内容创建对应的 StatefulSet、Service 等相关内容。
下面查看 RadonDB ClickHouse 集群的运行情况，可以看到增加了两个 RadonDB ClickHouse Pod，完成集群分片的增加。

```plain
$ kubectl get pods -n test
NAME                               READY   STATUS    RESTARTS   AGE
pod/chi-ClickHouse-replicas-0-0-0   1/1     Running   0          14m
pod/chi-ClickHouse-replicas-0-1-0   1/1     Running   0          14m
pod/chi-ClickHouse-replicas-1-0-0   1/1     Running   0          13m
pod/chi-ClickHouse-replicas-1-1-0   1/1     Running   0          13m
pod/chi-ClickHouse-replicas-2-0-0   1/1     Running   0          13m
pod/chi-ClickHouse-replicas-2-1-0   1/1     Running   0          12m
pod/chi-ClickHouse-replicas-3-0-0   1/1     Running   0          102s
pod/chi-ClickHouse-replicas-3-1-0   1/1     Running   0          80s
```
## 硬盘扩容

同样的，如果需要给 ClickHouse Pods 进行扩容，也只需修改 CR 即可。

```plain
$ kubectl get chi -n test
NAME         CLUSTERS   HOSTS   STATUS
clickhouse   1          8       Completed

$ kubectl edit chi/clickhouse -n test
```
以修改存储容量为 20 Gi 为例。
```plain
volumeClaimTemplates:
- name: data
  reclaimPolicy: Retain
  spec:
    accessModes:
    - ReadWriteOnce
    resources:
      requests:
        storage: 20Gi 
```
修改成功后，Operator 将自动申请扩容，重建 StatefulSet，并挂载扩容后的硬盘。
通过查看集群的 PVC 挂载情况，可以看到硬盘已经更新为 20Gi 容量。

```plain
$ kubectl get pvc -n clickhouse
NAME                                          STATUS   VOLUME   CAPACITY   ACCESS MODES
data-chi-clickhouse-cluster-all-nodes-0-0-0   Bound    pv4      20Gi       RWO         
data-chi-clickhouse-cluster-all-nodes-0-1-0   Bound    pv5      20Gi       RWO         
data-chi-clickhouse-cluster-all-nodes-1-0-0   Bound    pv7      20Gi       RWO         
data-chi-clickhouse-cluster-all-nodes-1-1-0   Bound    pv6      20Gi       RWO         
...
```
# 结语

至此，我们便了解到在 Kubernetes 平台上部署 RadonDB ClickHouse 集群的两种方法，以及 Operator 管理 ClickHouse 集群的基本操作。

# 参考

[1]. RadonDB ClickHouse：[https://github.com/radondb/radondb-clickhouse-kubernetes](https://github.com/radondb/radondb-clickhouse-kubernetes) 

