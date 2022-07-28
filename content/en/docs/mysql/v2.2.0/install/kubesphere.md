---
# menu 优先显示shortTitle，没有shortTitle显示Title
shortTitle: "On Kubesphere"
title: "Deployment on Kubesphere"
# weight按照从小到大排列
weight: 3
# pdf的url，如：/pdf/test.pdf
pdf: ""
---

This section displays how to deploy RadonDB MySQL operator and high-availability MySQL cluster on [KubeSphere](https://kubesphere.com.cn/en/).

# Prerequisites
- You need to enable the [OpenPitrix System](https://kubesphere.io/docs/pluggable-components/app-store/)
- You need to create a workspace, project and user. For more information, see [Create Workspaces, Projects, Users, and Roles](https://kubesphere.io/docs/quick-start/create-workspace-and-project/).
    - During the installation process, log in to the Web console as `admin` and operate in the **demo-project** of the **demo** workspace.
- You need to enable a [gateway](https://kubesphere.io/docs/project-administration/project-gateway/) for external access.
# Procedure
## Step 1: Add an app repository.
1. Log in to the KubeSphere Web console.
2. In **demo** workspace, go to **App Repositories** under **App Management**, and then click **Add**.
3. In the dialog displayed, specify an app repository name and add your repository URL.
    - Specify `radondb-mysql-operator` as the repository name.
    - Add `https://radondb.github.io/radondb-mysql-kubernetes/` as the repository URL. Click **Validate** to verify the URL.

4. A green check mark is displayed next to the URL if it is available. Click **OK** to continue.

Your repository is displayed in the list after being imported.
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image.png)

## Step 2: Deploy RadonDB MySQL Operator.

1. In **demo-project**, go to **Apps** under **Application Workloads** and click **Deploy New App**.
2. In the dialog displayed, select **From App Template**.
3. On the new page displayed, select **radondb-mysql-operator** from the drop-down list.
4. Click **MySQL operator** , check and config RadonDB MySQL Operator.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(1).png)

5. On the **Chart Files** tab, you can view the configuration and edit the **YAML** files.
On the **Version** list, you can view the app versions and select a version.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(2).png)

6. Click **Deploy**, and go to the **Basic Information page**.
Confirm the app name, app version, and deployment location.

7. Click **Next** to continue, and go to the **App Configuration** page.
You can customize settings by modifying the **YAML** file.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(3).png)

8. Click **Deploy**, and return to the **App Template** page. The application is successfully deployed when the application status changes to **running**.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(4).png)

### Update Operator.

If a historical version of Operator has been deployed on Kubesphere, you can update it to the latest version as follows.

1. Delete the historical version on the Kubesphere platform.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(5).png)

2. Install the latest Operator with previous steps.

3. Run the following command to update the CRD. Take updating CRD to version 2.1.2 as an example:

```plain
kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/v2.1.2/charts/mysql-operator/crds/mysql.radondb.com_mysqlclusters.yaml
```

## Step 3: Deploy a RadonDB MySQL cluster.

You can deploy a cluster by referring to the [RadonDB MySQL sample](https://github.com/radondb/radondb-mysql-kubernetes/tree/main/config/samples), or customizing the **YAML** file.

Take `mysql_v1alpha1_mysqlcluster.yaml` template as an example to create a RadonDB MySQL cluster.

1. Hover your cursor over the hammer icon in the lower-right corner, and then select **Kubectl**.
2. Run the following command to install the RadonDB MySQL cluster.
```plain
kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml --namespace=<project_name>
```
**Notice**

When no project is specified, the cluster will be installed in the **kubesphere-controls-system** project by default. To specify a project, the install command needs to add the `--namespace=<project_name>` field.

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
In **demo-project**, go to **Services under Application Workloads** for the information of services.

1. Enter the **service** page under **application load** to view the cluster service information.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(6).png)

2. Go to the **Workloads** page under **Application Workloads** and click the **StatefulSets** tab for the cluster status.
Click a StatefulSet to go to its detail page and click the Monitoring tab to see the metrics in line charts over a period.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(7).png)

3. Go to the **Pods** page under **Application Workloads** for the node status.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(8).png)

4. Go to the **Volumes** page under **Storage** to check volume usage. Clicking a data node to view the monitoring information, including the current storage capacity and remaining storage.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(9).png)