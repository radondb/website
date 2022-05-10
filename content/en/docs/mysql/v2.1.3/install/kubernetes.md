---
# menu 优先显示shortTitle，没有shortTitle显示Title
shortTitle: "Deploy on Kubernetes"
title: "RadonDB MySQL Operator and MySQL Cluster Deploy on Kubernetes"
# weight按照从小到大排列
weight: 2
# pdf的url，如：/pdf/test.pdf
pdf: ""
---

This document demonstrates the deployment, verification, access and uninstall of RadonDB MySQL Operator and Cluster on Kubernetes.

# Prerequisites

- Kubernetes cluster
- MySQL Client Tools

# Procedure

## Step 1: Add a Helm Repository
Add a Helm Repository named `radondb`.

```shell
$ helm repo add radondb https://radondb.github.io/radondb-mysql-kubernetes/
```

Check that a chart named `radondb/mysql-operator` exists in the repository.

```shell
$ helm search repo
NAME                            CHART VERSION   APP VERSION                     DESCRIPTION                 
radondb/mysql-operator          0.1.0           v2.1.x                          Open Source，High Availability Cluster，based on MySQL                     
```

## Step 2: Install Operator

The following sets the release name to demo and creates a [Deployment](https://kubernetes.io/zh/docs/concepts/workloads/controllers/deployment/) named `demo-mysql-operator`.

```shell
$ helm install demo radondb/mysql-operator
```
 
> This step also creates the  [CRD](https://kubernetes.io/zh/docs/concepts/extend-kubernetes/api-extension/custom-resources/) required by the cluster.

## Step 3: Install a RadonDB MySQL Cluster

Run the following command to create an instance of the `mysqlclusters.mysql.radondb.com` CRD and thereby create a RadonDB MySQL cluster by using the default parameters. You can customize the cluster parameters by referring to [Configuration Parameters](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/zh-cn/config_para.md).

```shell
$ kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml
```
> For customized cluster deployment parameters, refer to [configuration parameters](../config_para/).

# Verification

## Verify RadonDB MySQL Operator

Run the following command to check the `demo` deployment and its monitoring service. If the following information is displayed, the installation is successful.

```shell
$ kubectl get deployment,svc
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
demo-mysql-operator   1/1     1            1           7h50m

NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/mysql-operator-metrics   ClusterIP   10.96.142.22    <none>        8443/TCP   8h
```

## Verify the RadonDB MySQL Cluster

Run the following command to check the CRDs.

```shell
$ kubectl get crd | grep mysql.radondb.com
backups.mysql.radondb.com                             2021-11-02T07:00:01Z
mysqlclusters.mysql.radondb.com                       2021-11-02T07:00:01Z
mysqlusers.mysql.radondb.com                          2021-11-02T07:00:01Z
```

Run the following command to check the cluster. If a statefulset of three replicas (RadonDB MySQL nodes) and services used to access the nodes are displayed, the installation is successful.

```shell
$ kubectl get statefulset,svc
NAME           READY   AGE
sample-mysql   3/3     7h33m

NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/sample-follower          ClusterIP   10.96.131.84    <none>        3306/TCP   7h37m
service/sample-leader            ClusterIP   10.96.111.214   <none>        3306/TCP   7h37m
service/sample-mysql             ClusterIP   None            <none>        3306/TCP   7h37m
```

# Access RadonDB MySQL

In the kubernetes cluster, it supports `service_name` or `clusterIP` mode to access RadonDB MySQL.

> RadonDB MySQL provides a leader service and a follower service, which are used to access the leader node and follower nodes respectively. The leader service always points to the leader node that supports read and write, and the follower service always points to the follower nodes that are read-only.
![](https://radondb.com/images/projects/mysql/mysql-architecture.png)

The following is how the client and database access RadonDB MySQL in the same kubernetes cluster.

> If the client is installed in a different Kubernetes cluster from the database, you need to configure port forwarding rules and load balancing by referring to [Access Applications in a Cluster](https://kubernetes.io/zh/docs/tasks/access-application-cluster/). 

## Use a Cluster IP Address

The HA read-and-write IP address of RadonDB MySQL points to the `cluster IP` address of the leader service, and the HA read-only IP address points to the IP address of the follower service.

```shell
$ mysql -h <clusterIP> -P <mysql_Port> -u <user_name> -p
```

For example, run the following command to access the leader service, where the username is `radondb_usr` and the cluster IP address of the leader service is `10.10.128.136`:

```shell
$ mysql -h 10.10.128.136 -P 3306 -u radondb_usr -p
```

## Use a service_name 

Pods in the Kubernetes cluster can access RadonDB MySQL by using a service name.

> `service name` cannot be used to access RadonDB MySQL from the host machines of the Kubernetes cluster.

* Access the leader service (RadonDB MySQL leader node)

```shell
$ mysql -h <leader_service_name>.<namespace> -u <user_name> -p
```

For example, run the following command to access the leader service, where the username is `radondb_usr`, the release name is `sample`, and the namespace of RadonDB MySQL is `default`:

```shell
$ mysql -h sample-leader.default -u radondb_usr -p
```

* Access the follower service (RadonDB MySQL follower nodes)

```shell
$ mysql -h <follower_service_name>.<namespace> -u <user_name> -p
```

For example, run the following command to access the follower service, where the username is `radondb_usr`, the release name is `sample`, and the namespace of RadonDB MySQL is `default`:

```shell
$ mysql -h sample-follower.default -u radondb_usr -p  
```

# Uninstallation

## Uninstall Operator

Uninstall RadonDB MySQL Operator with the release name `demo` in the current namespace.

```shell
$ helm delete demo
```

## Uninstall RadonDB MySQL

Uninstall the RadonDB MySQL cluster with the release name `sample`.

```shell
$ kubectl delete mysqlclusters.mysql.radondb.com sample
```

## Uninstall the Custom Resources

```shell
$ kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlclusters.mysql.radondb.com
$ kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlusers.mysql.radondb.com
$ kubectl delete customresourcedefinitions.apiextensions.k8s.io backups.mysql.radondb.com
```

