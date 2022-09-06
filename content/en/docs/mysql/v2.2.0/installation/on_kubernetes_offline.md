---
# menu 优先显示shortTitle，没有shortTitle显示Title
shortTitle: "On Kubernetes offline"
title: "Deploy RadonDB MySQL Operator and cluster offline on Kubernetes"
# weight按照从小到大排列
weight: 3
# pdf的url，如：/pdf/test.pdf
pdf: ""
---

This tutorial demonstrates how to deploy the RadonDB MySQL Operator and cluster offline on Kubernetes.

## Prerequisite

-  You need to prepare an available Kubernetes cluster.

## Procedure

### Step 1 Prepare resources.

- Download offline resources.

    Download the images `radondb/mysql-operator`, `radondb/mysql57-sidecar`, `radondb/mysql80-sidercar`, `percona/percona-server:5.7.34`, and `percona/percona-server:8.0.25` from Docker Hub and load them to available worker nodes.


- Import images (on each worker node).

    ```plain
    docker load -i XXXX
    ```
    Please replace `XXXX` with the names of the downloaded image files.

### Step 2 Deploy RadonDB MySQL Operator.

The following sets the release name to `demo`, and creates a [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) named `demo-mysql-operator`.

```plain
helm install demo radondb-mysql-resources/operator-chart .
```

> **Note**
> 
> By default, this step will also create the custom resource required by the cluster. You can find the corresponding [release](https://github.com/radondb/radondb-mysql-kubernetes/releases).

### Step 3 Deploy the RadonDB MySQL cluster.

The following creates an instance for the custom resource `mysqlclusters.mysql.radondb.com`, and thereby create a RadonDB MySQL cluster with the default parameters. To configure cluster parameters, see [Parameter Configuration](../configure_parameters).

```plain
kubectl apply -f radondb-mysql-resources/cluster-sample/mysql_v1alpha1_mysqlcluster.yaml
```

## Verification

### Verify RadonDB MySQL Operator

Check the `demo` Deployment and its monitoring service as follows. The deployment is successful if the following information is displayed.

```plain
$ kubectl get deployment,svc
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
demo-mysql-operator   1/1     1            1           7h50m


NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/mysql-operator-metrics   ClusterIP   10.96.142.22    <none>        8443/TCP   8h
```

### Verify the RadonDB MySQL cluster

Check the CRDs as follows.

```plain
$ kubectl get crd | grep mysql.radondb.com
backups.mysql.radondb.com                             2021-11-02T07:00:01Z
mysqlclusters.mysql.radondb.com                       2021-11-02T07:00:01Z
mysqlusers.mysql.radondb.com                          2021-11-02T07:00:01Z
```

For the default deployment, run the following command to check the cluster, and a statefulset of three replicas (RadonDB MySQL nodes) and services used to access the nodes are displayed.

```plain
$ kubectl get statefulset,svc
NAME           READY   AGE
sample-mysql   3/3     7h33m

NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/sample-follower          ClusterIP   10.96.131.84    <none>        3306/TCP   7h37m
service/sample-leader            ClusterIP   10.96.111.214   <none>        3306/TCP   7h37m
service/sample-mysql             ClusterIP   None            <none>        3306/TCP   7h37m
```

## Access RadonDB MySQL

> You need to prepare a client used to connect to MySQL.

RadonDB MySQL provides the leader and follower services to access the leader node and replicas respectively. The leader service always points to the leader node (read/write) and the follower service points to the replicas (read only).

Within the Kubernertes cluster, you can use `service_name` or `clusterIP` to access RadonDB MySQL in the Kubernetes cluster.

### By clusterIP

The HA `clusterIP` of the leader service supports reading and writing data, while the HA `clusterIP` of the follower service supports reading data only.

```shell
mysql -h <clusterIP> -P <mysql_Port> -u <user_name> -p
```

For example, run the following command to access the leader service with the username `radondb_usr` and IP address of the leader service `10.10.128.136`:

```shell
mysql -h 10.10.128.136 -P 3306 -u radondb_usr -p
```

### By service name

- Access the leader service (RadonDB MySQL leader node).
  
  ```shell
  mysql -h <leader_service_name>.<namespace> -u <user_name> -p
  ```
  
    For example, run the following command to access the leader service, with the username `radondb_usr`, release name `sample`, and namespace of RadonDB MySQL `default`:
    
    ```shell
    mysql -h sample-leader.default -u radondb_usr -p
    ```
  
- Access the follower service (RadonDB MySQL replicas)
  
  ```shell
  mysql -h <follower_service_name>.<namespace> -u <user_name> -p
  ```
  
    For example, run the following command to access the follower service with the username `radondb_usr`, release name `sample`, and namespace of RadonDB MySQL is `default`:

  ```shell
  mysql -h sample-follower.default -u radondb_usr -p  
  ```
  
> **Note**
> 
> If the client is installed in a different Kubernetes cluster, see [Access Applications in a Cluster](https://kubernetes.io/docs/tasks/access-application-cluster/) to configure port forwarding and load balancing.

## Uninstallation

### Uninstall RadonDB MySQL Operator

Uninstall the `demo` Operator in the current namespace as follows.

```shell
helm delete demo
```

### Uninstall the RadonDB MySQL cluster

Uninstall the `sample` cluster as follows.

```plain
kubectl delete mysqlclusters.mysql.radondb.com sample
```

### Uninstall custom resources

```plain
kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlclusters.mysql.radondb.com
kubectl delete customresourcedefinitions.apiextensions.k8s.io mysqlusers.mysql.radondb.com
kubectl delete customresourcedefinitions.apiextensions.k8s.io backups.mysql.radondb.com
```