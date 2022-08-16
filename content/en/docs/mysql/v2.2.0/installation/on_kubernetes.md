---
# menu 优先显示shortTitle，没有shortTitle显示Title
shortTitle: "On Kubernetes"
title: "Deploy RadonDB MySQL Operator and cluster on Kubernetes"
# weight按照从小到大排列
weight: 2
# pdf的url，如：/pdf/test.pdf
pdf: ""
---

This tutorial demonstrates how to deploy, verify, access, and uninstall the RadonDB MySQL Operator and cluster.

View [GitHub documentation](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/en-us/deploy_radondb-mysql_operator_on_k8s.md).

## Prerequisites

- Prepare an available Kubernetes cluster.

## Procedure

### Step 1 Add the Helm repository.

```shell
$ helm repo add radondb https://radondb.github.io/radondb-mysql-kubernetes/
```

Ensure that the chart named `radondb/mysql-operator` exists in the repository.

```shell
$ helm search repo
NAME                            CHART VERSION   APP VERSION                     DESCRIPTION                 
radondb/mysql-operator          0.1.0           v2.1.x                          Open Source，High Availability Cluster，based on MySQL                     
```

### Step 2 Deploy the operator.

Set the release name to `demo` and create a [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) `demo-mysql-operator`.

```shell
$ helm install demo radondb/mysql-operator
```
 
> This step also creates the [custom resource](https://kubernetes.io/zh/docs/concepts/extend-kubernetes/api-extension/custom-resources/) required by the cluster.

### Step 3 Deploy a RadonDB MySQL cluster.

Create an instance of the custom resource `mysqlclusters.mysql.radondb.com` and thereby create a RadonDB MySQL cluster with default parameters as follows.

```shell
$ kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml
```
> To set cluster parameters, see [Parameter Configuration](../config_para).

## Verification

### Verify RadonDB MySQL Operator

Check the `demo` Deployment and its monitoring service. The deployment is successful if the following information is displayed.

```shell
$ kubectl get deployment,svc
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
demo-mysql-operator   1/1     1            1           7h50m

NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/mysql-operator-metrics   ClusterIP   10.96.142.22    <none>        8443/TCP   8h
```

### Verify the RadonDB MySQL cluster

Run the following command to check the CRDs.

```shell
$ kubectl get crd | grep mysql.radondb.com
backups.mysql.radondb.com                             2021-11-02T07:00:01Z
mysqlclusters.mysql.radondb.com                       2021-11-02T07:00:01Z
mysqlusers.mysql.radondb.com                          2021-11-02T07:00:01Z
```

Run the following command to check the cluster. The installation is successful if a StatefulSet of three replicas (RadonDB MySQL nodes) and services used to access the nodes are displayed.

```shell
$ kubectl get statefulset,svc
NAME           READY   AGE
sample-mysql   3/3     7h33m

NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/sample-follower          ClusterIP   10.96.131.84    <none>        3306/TCP   7h37m
service/sample-leader            ClusterIP   10.96.111.214   <none>        3306/TCP   7h37m
service/sample-mysql             ClusterIP   None            <none>        3306/TCP   7h37m
```

## Access RadonDB MySQL
> Prepare the MySQL client for connection.

RadonDB MySQL provides leader and follower services to access the leader node and follower nodes respectively. The leader service always points to the leader node supporting reading and writing data, while the follower service always points to the read-only follower nodes.

![MySQL architecture](https://radondb.com/images/projects/mysql/mysql-architecture.png)

Within the Kubernetes cluster, you can use `service_name` or `clusterIP` to access RadonDB MySQL.

### By clusterIP

The HA `clusterIP` of the leader service supports reading and writing data, while the HA `clusterIP` of the follower service supports reading data only.

```shell
$ mysql -h <clusterIP> -P <mysql_Port> -u <user_name> -p
```

For example, run the following command to access the leader service with the username `radondb_usr` and IP address of the leader service `10.10.128.136`:

```shell
$ mysql -h 10.10.128.136 -P 3306 -u radondb_usr -p
```

### By service name

Pods in the Kubernetes cluster can access RadonDB MySQL by using a service name.

> `service name` cannot be used to access RadonDB MySQL from the host machines of the Kubernetes cluster.

* Access the leader service (RadonDB MySQL leader node).

```shell
$ mysql -h <leader_service_name>.<namespace> -u <user_name> -p
```

For example, run the following command to access the leader service, with the username `radondb_usr`, release name `sample`, and namespace of RadonDB MySQL `default`:

```shell
$ mysql -h sample-leader.default -u radondb_usr -p
```

* Access the follower service (RadonDB MySQL follower nodes).

```shell
$ mysql -h <follower_service_name>.<namespace> -u <user_name> -p
```

For example, run the following command to access the follower service with the username `radondb_usr`, release name `sample`, and namespace of RadonDB MySQL is `default`:

```shell
$ mysql -h sample-follower.default -u radondb_usr -p  
```

> **Note**
> 
> If the client is installed in a different Kubernetes cluster, see [Access Applications in a Cluster](https://kubernetes.io/docs/tasks/access-application-cluster/) to configure port forwarding and load balancing.

## Uninstallation

### Uninstall RadonDB MySQL Operator

Uninstall the `demo` Operator in the current namespace as follows.

```shell
$ helm delete demo
```

### Uninstall the RadonDB MySQL cluster

Uninstall the `sample` cluster as follows.

```shell
$ kubectl delete mysqlclusters.mysql.radondb.com sample
```

### Uninstall custom resources

```shell
$ kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlclusters.mysql.radondb.com
$ kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlusers.mysql.radondb.com
$ kubectl delete customresourcedefinitions.apiextensions.k8s.io backups.mysql.radondb.com
```