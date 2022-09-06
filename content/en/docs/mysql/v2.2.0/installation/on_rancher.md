---
# menu 优先显示shortTitle，没有shortTitle显示Title
shortTitle: "On Rancher"
title: "Deploy RadonDB MySQL Operator and cluster on Rancher"
# weight按照从小到大排列
weight: 5
# pdf的url，如: /pdf/test.pdf
pdf: ""
---

# Deploy a RadonDB MySQL cluster on Rancher

This tutorial demonstrates how to deploy the RadonDB MySQL Operator and cluster on Rancher.

## Prerequisites

- You need to [install a Rancher cluster](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/quickstart-manual-setup/).
- You need to obtain the username and password to log in to Rancher.

## Procedure

### Step 1: Create a Helm repository.

1. Log in to the Rancher console.

2. Select a cluster to open the cluster management page.

3. Select **App&Marketplace** > **Repositories** to go to the application repository management page.

4. Click **Create** to create and configure a repository for RadonDB MySQL.

   - **Name**: Repository name.

   - **Target**: Select the HTTP(S) mode and set **Index URL** to `https://radondb.github.io/radondb-mysql-kubernetes/`.

5. Click **Create** and return to the repository management page.
   
   If the **State** of the repository changes to `Active`, the repository is running properly.

### Step 2: Install RadonDB MySQL Operator.

The RadonDB MySQL Operator only needs to be installed once for a Rancher cluster.

1. On the cluster management page, select **App&Marketplace** > **Charts** to go to the chart list page.

2. Locate **mysql-operator** to install RadonDB MySQL Operator.
   
   You can select a version of the mysql-operator chart.


3. Click **Install** and configure the basic information.
   
   You can select **Customize Helm options before install**.


4. (Optional) Click **Next** to customize the YAML configuration file of the application.


5. Click **Next** to configure the deployment options.

6. Click **Install** to go to the **Installed App** page.
   
   You can view the installation progress and status in the pane below the list. After the application installation process is complete, you can view the installed application in the list.

### Step 3: Deploy the RadonDB MySQL cluster.

#### Use kubectl CLI

1. On the cluster management page, click the kubectl command icon in the upper-right corner.
   
2. In the command pane, enter the command to deploy a cluster.
   
   The following command deploys a three-node cluster.
   
   ```shell
   # Run kubectl commands inside here
   # e.g. kubectl get all
   $ cat <<EOF | kubectl apply -f-
   apiVersion: mysql.radondb.com/v1alpha1
   kind: MysqlCluster
   metadata:
      name: sample
   spec:
      replicas: 3
   EOF
   ```

3. Press **Enter**. If `created` is displayed in the command output, the deployment is successful.
   
   The following is an example of the command output:
   
   ```shell
   mysqlcluster.mysql.radondb.com/sample created
   ```

#### Import a YAML file

1. Download the [RadonDB MySQL Cluster Configuration Sample](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/config/samples/mysql_v1alpha1_mysqlcluster.yaml) and modify the parameter values in the YAML file.
   
   For details about the parameters, see [Configure Parameters](../configure_parameters).

2. On the cluster management page of Rancher, click the YAML file import icon in the upper-right corner. In the displayed dialog box, import the modified YAML file.

## Verification

1. On the cluster management page, select **Service Discovery** > **Services** to go to the service list page.

2. Locate the installed cluster and check the service status.
   
   If the status of a service is `Active`, the service is running properly.

3. Click the service name to open the service details page and check the pod status.
   
   If the status of a pod is `Active`, the pod is running properly.

4. Click **Execute Shell** next to an active pod to open the command pane of the pod.
   
   Run the following command and enter the password to verify the database connection status.
   
   ```shell
   $ mysql -u root -p
   ```
   
   The following figure shows the command output of the successful connection:
   
   ![pod-running](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/RadonDB%20MySQL%20Kubernetes%20docs-zh-cn/pod_running.png)

## Access RadonDB MySQL

> You need to prepare a client for connection to MySQL.

RadonDB MySQL provides leader and follower services to access the leader node and follower nodes respectively. The leader service always points to the leader node supporting reading and writing data, while the follower service always points to the read-only follower nodes.

If the client is installed in the same Rancher cluster with the database, you can access RadonDB MySQL by using the service name or cluster IP address.

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

Pods in the Rancher cluster can access RadonDB MySQL by using a service name.

> **Note**
> 
> Service names cannot be used to access RadonDB MySQL from the host machines of the Rancher cluster.

* Access the leader service (RadonDB MySQL leader node).
  
  ```shell
  mysql -h <leader_service_name>.<namespace> -u <user_name> -p
  ```

  For example, run the following command to access the leader service, with the username `radondb_usr`, release name `sample`, and namespace of RadonDB MySQL `default`:
  
  ```shell
  mysql -h sample-leader.default -u radondb_usr -p
  ```

* Access the follower service (RadonDB MySQL follower nodes).
  
  ```shell
  mysql -h <follower_service_name>.<namespace> -u <user_name> -p
  ```
  
   For example, run the following command to access the follower service with the username `radondb_usr`, release name `sample`, and namespace of RadonDB MySQL is `default`:
  
  ```shell
  mysql -h sample-follower.default -u radondb_usr -p  
  ```

> **Note**
> 
> - If the client is installed in a different Rancher cluster from the database, you need to [set the load balancer and ingress controller on Rancher](https://rancher.com/docs/rancher/v2.6/en/k8s-in-rancher/load-balancers-and-ingress/).
> For more information about how to access a database from a different cluster, see [Access Applications in a Cluster](https://kubernetes.io/docs/tasks/access-application-cluster/).