---
shortTitle: "On KubeSphere"
title: "Deploy RadonDB MySQL Operator and cluster on KubeSphere"
weight: 4
---

This tutorial displays how to deploy the RadonDB MySQL Operator and cluster on [KubeSphere](https://kubesphere.com.cn/en/).

## Prerequisites
- You need to enable the [OpenPitrix System](https://kubesphere.io/docs/pluggable-components/app-store/).
- You need to create a workspace, project and user. For more information, see [Create Workspaces, Projects, Users, and Roles](https://kubesphere.io/docs/quick-start/create-workspace-and-project/). During the installation process, log in to the Web console as `admin` and operate in the **demo-project** of the **demo** workspace.
- You need to enable a [gateway](https://kubesphere.io/docs/project-administration/project-gateway/) for external access.
## Procedure
## Step 1 Add an app repository.
1. Log in to the KubeSphere Web console.
2. In the **demo** workspace, go to **App Management** > **App Repositories**, and click **Add** in the right pane.
3. In the dialog displayed, specify an app repository name and add your repository URL.
    - Specify `radondb-mysql-operator` as the repository name.
    - Add `https://radondb.github.io/radondb-mysql-kubernetes/` as the repository URL. Click **Validate** to verify the URL.

4. A green check mark is displayed next to the URL if it is available. Click **OK** to continue.

Your repository is displayed in the list after being imported.

### Step 2 Deploy RadonDB MySQL Operator.

1. In **demo-project**, go to **Application Workloads** > **Apps** and click **Create** in the right pane.
2. In the dialog displayed, select **From App Template**.
3. On the new page displayed, select **radondb-mysql-operator** from the drop-down list.
4. Click **mysql-operator**, check and config RadonDB MySQL Operator.
    On the **Chart Files** tab, you can view and edit the **YAML** configuration files. On the **Version** list, you can view the app versions and select a version.

5. Click **Install**, and go to the **Basic Information** page.
Confirm the app name, app version, and deployment location.

1. Click **Next** to continue, and go to the **App Settings** page.
You can customize settings by modifying the **YAML** file.

1. Click **Install**, and return to the **Apps** page. The application is successfully deployed when the application status changes to **running**.

### Update the operator

If a historical version of the Operator has been deployed on KubeSphere, you can update it to the latest version as follows.

1. Delete the historical version on KubeSphere.

![Delete historical version](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/RadonDB%20MySQL%20Kubernetes%20docs-en/Delete%20historical%20version.jpg)

1. Install the latest Operator with previous steps.

2. Run the following command to update the CRD. Take updating CRD to version 2.1.2 as an example:

```plain
kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/v2.1.2/charts/mysql-operator/crds/mysql.radondb.com_mysqlclusters.yaml
```

## Step 3 Deploy a RadonDB MySQL cluster.

You can deploy a cluster with a [configuration sample](https://github.com/radondb/radondb-mysql-kubernetes/tree/main/config/samples), or a customized **YAML** file.

For example, create a RadonDB MySQL cluster with the `mysql_v1alpha1_mysqlcluster.yaml` template.

1. Hover your cursor over the hammer icon in the lower-right corner, and then select **kubectl**.
2. Run the following command to deploy the RadonDB MySQL cluster.
```plain
kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml --namespace=<project_name>
```
> **Notice**
>
> When the project is not specified, the cluster will be installed in the **kubesphere-controls-system** project by default. To specify a project, the `--namespace=<project_name>` field needs to added to the installation command.

**Expected output**

```plain
$ kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml --namespace=demo-project
mysqlcluster.mysql.radondb.com/sample created
```

3. You can run the following command to view all services of the RadonDB MySQL cluster.
```plain
kubectl get statefulset,svc
```

**Expected output**

```plain
$ kubectl get statefulset,svc
NAME                            READY   AGE
statefulset.apps/sample-mysql   3/3     10m

NAME                           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/default-http-backend   ClusterIP   10.96.69.202    <none>        80/TCP     3h2m
service/sample-follower        ClusterIP   10.96.9.162     <none>        3306/TCP   10m
service/sample-leader          ClusterIP   10.96.255.188   <none>        3306/TCP   10m
service/sample-mysql           ClusterIP   None            <none>        3306/TCP   10m
```
## Step 4 View the status of the RadonDB MySQL cluster.

1. In **demo-project**, go to **Application Workloads** > **Services** for the information of services.

2. Go to **Application Workloads** > **Workloads** and click the **StatefulSets** tab in the right pane for the cluster status.
Click a StatefulSet to go to its detail page, and click the **Monitoring** tab to see the metrics over a period in the line charts.

3. Go to **Application Workloads** > **Pods** for the node status.

4. Go to **Storage** > **Volumes** to check volume usage. Persistent storage is used for all components. Click a data node to view its monitoring information, including the total capacity and available capacity.

## Access RadonDB MySQL

This section displays how to access RadonDB MySQL on KubeSphere.

### By terminal
1. Go to **Application Workloads** > **Pods**.
2. In the **Pods** page, click a Pod to go to the detail page of containers.
3. In the **Containers** pane under the **Resource Status** tab, click the **Terminal** icon of a container.
4. In the terminal, run the following command to access the cluster.

```plain
mysql -u radondb_usr -p
```

### By kubectl CLI

1. Hover your cursor over the hammer icon in the right-bottom and click **kubectl**.
2. Run the following command to access RadonDB MySQL.

```plain
kubectl exec -it <pod_name> -c mysql -n <project_name> -- mysql --user=<user_name> --password=<user_password>
```

For example, access RadonDB MySQL with the following parameters:

- **pod_name**: `sample-mysql-0`
- **project_name**: `demo-project`  
- **user_name**: `radondb_usr`  
- **user_password**: `RadonDB@123`

```plain
kubectl exec -it sample-mysql-0 -c mysql -n demo-project -- mysql --user=radondb_usr --password=RadonDB@123
```