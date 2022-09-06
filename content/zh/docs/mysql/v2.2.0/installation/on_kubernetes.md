---
# menu 优先显示shortTitle，没有shortTitle显示Title
shortTitle: "Kubernetes 部署"
title: "在 Kubernetes 上部署 RadonDB MySQL 集群"
# weight按照从小到大排列
weight: 2
# pdf的url，如：/pdf/test.pdf
pdf: ""
---

本教程展示如何在 Kubernetes 上部署 RadonDB MySQL 集群。

> RadonDB MySQL Kubernetes 2.x 版本通用。

## 部署准备

* 可用的 Kubernetes 集群。

## 部署步骤

### 步骤 1：添加 Helm 仓库

```shell
helm repo add radondb https://radondb.github.io/radondb-mysql-kubernetes/
```

校验仓库，可查看到名为 `radondb/mysql-operator` 的 chart。

```shell
$ helm search repo
NAME                            CHART VERSION   APP VERSION                     DESCRIPTION                 
radondb/mysql-operator          0.1.0           v2.1.0                          Open-source, high-availability cluster, based on MySQL                     
```

### 步骤 2: 部署 Operator

以下指定 release 名为 `demo`，创建一个名为 `demo-mysql-operator` 的 [Deployment](https://kubernetes.io/zh/docs/concepts/workloads/controllers/deployment/)。

```shell
helm install demo radondb/mysql-operator
```

> **说明**
> 
> 在这一步骤中默认将同时创建集群所需的[自定义资源](https://kubernetes.io/zh/docs/concepts/extend-kubernetes/api-extension/custom-resources/)。

### 步骤 3: 部署 RadonDB MySQL 集群

执行以下指令，使用默认参数为自定义资源 `mysqlclusters.mysql.radondb.com` 创建一个实例，即创建 RadonDB MySQL 集群。
```shell
kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml
```
> 自定义部署集群的参数，请参见[配置参数](../configure_parameters)。

## 部署校验

### 校验 RadonDB MySQL Operator

查看 `demo` 的 Deployment 和对应监控服务，回显如下信息则部署成功。

```shell
$ kubectl get deployment,svc
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
demo-mysql-operator   1/1     1            1           7h50m


NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/mysql-operator-metrics   ClusterIP   10.96.142.22    <none>        8443/TCP   8h
```

### 校验 RadonDB MySQL 集群

执行如下命令，将查看到如下 CRD。

```shell
$ kubectl get crd | grep mysql.radondb.com
backups.mysql.radondb.com                             2021-11-02T07:00:01Z
mysqlclusters.mysql.radondb.com                       2021-11-02T07:00:01Z
mysqlusers.mysql.radondb.com                          2021-11-02T07:00:01Z
```

以默认部署为例，执行如下命令将查看到名为 `sample-mysql` 的三节点 RadonDB MySQL 集群及用于访问节点的服务。

```shell
$ kubectl get statefulset,svc
NAME           READY   AGE
sample-mysql   3/3     7h33m

NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/sample-follower          ClusterIP   10.96.131.84    <none>        3306/TCP   7h37m
service/sample-leader            ClusterIP   10.96.111.214   <none>        3306/TCP   7h37m
service/sample-mysql             ClusterIP   None            <none>        3306/TCP   7h37m
```

## 访问 RadonDB MySQL

> 准备可用于连接 MySQL 的客户端。

RadonDB MySQL 提供 leader 服务和 follower 服务用于分别访问主从节点。leader 服务始终指向主节点（读写），follower 服务始终指向从节点（只读）。
![MySQL architecture](/images/projects/mysql/mysql-architecture.png)

在 Kubernetes 集群内部，支持使用 `service_name` 或者 `clusterIP` 方式，访问 RadonDB MySQL。

### `clusterIP` 方式

RadonDB MySQL 的高可用读写 IP 地址指向 leader 服务的 `clusterIP`，高可用只读 IP 地址指向 follower 服务的 `clusterIP`。

```shell
mysql -h <clusterIP> -P <mysql_Port> -u <user_name> -p
```

以下示例中，用户名为 `radondb_usr`， leader 服务的 `clusterIP` 为 `10.10.128.136` ，连接示例如下：

```shell
mysql -h 10.10.128.136 -P 3306 -u radondb_usr -p
```

### `service_name` 方式

Kubernetes 集群的 Pod 之间支持通过 `service_name` 方式访问 RadonDB MySQL。

> **说明**
> 
> `service_name` 方式不适用于从 Kubernetes 集群的物理机访问数据库 Pod。

* 连接 leader 服务（RadonDB MySQL 主节点）

    ```shell
    mysql -h <leader_service_name>.<namespace> -u <user_name> -p
    ```

   用户名为 `radondb_usr`，release 名为 `sample`，RadonDB MySQL 命名空间为 `default` ，连接示例如下：

    ```shell
    mysql -h sample-leader.default -u radondb_usr -p
    ```

* 连接 follower 服务（RadonDB MySQL 从节点）

    ```shell
    mysql -h <follower_service_name>.<namespace> -u <user_name> -p
    ```

   用户名为 `radondb_usr`，release 名为 `sample`，RadonDB MySQL 命名空间为 `default` ，连接示例如下：

    ```shell
    mysql -h sample-follower.default -u radondb_usr -p  
    ```

> 当客户端与数据库部署在不同 Kubernetes 集群，请参考[访问集群中的应用程序](https://kubernetes.io/zh/docs/tasks/access-application-cluster/)，配置端口转发、负载均衡等连接方式。

## 卸载

### 卸载 Operator

卸载当前命名空间下 release 名为 `demo` 的 RadonDB MySQL Operator。

```shell
helm delete demo
```

### 卸载 RadonDB MySQL 集群

卸载 release 名为 `sample` RadonDB MySQL 集群。

```shell
kubectl delete mysqlclusters.mysql.radondb.com sample
```

### 卸载自定义资源

```shell
kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlclusters.mysql.radondb.com
kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlusers.mysql.radondb.com
kubectl delete customresourcedefinitions.apiextensions.k8s.io backups.mysql.radondb.com
```