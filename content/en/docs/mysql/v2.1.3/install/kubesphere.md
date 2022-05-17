---
# menu 优先显示shortTitle，没有shortTitle显示Title
shortTitle: "Deploy on KubeSphere"
title: "RadonDB MySQL Operator and MySQL Cluster Deploy on KubeSphere"
# weight按照从小到大排列
weight: 3
# pdf的url，如：/pdf/test.pdf
pdf: ""
---

This document demonstrates the deployment of RadonDB MySQL kubernetes operator and MySQL high availability cluster on [KubeSphere](https://kubesphere.com.cn).

# Prerequisites
- You need to enable the [OpenPitrix System](https://kubesphere.io/zh/docs/pluggable-components/app-store)
- Create an enterprise space, a project and a user for this [operation](https://kubesphere.io/zh/docs/quick-start/create-workspace-and-project)
    - During the installation process, please log in to the console as admin and operate in the `demo-project` project in the enterprise space `demo`
- You need to enable the gateway in your project to provide external access. If they are not ready, refer to [Project Gateway](https://kubesphere.io/zh/docs/project-administration/project-gateway).

# Deployment
## Step 1: Add an app repository
1. Log in to the KubeSphere Web console.
2. In `demo` workspace, go to **App Repositories** under **App Management**, and then click **Create**.
3. In the dialog that appears, enter an app repository name and URL.
    - Enter `radondb-mysql-operator` for the app repository name.
    - Enter `https://radondb.github.io/radondb-mysql-kubernetes/` for the MeterSphere repository URL. Click Validate to verify the URL.

4. You will see a green check mark next to the URL if it is available. Click **OK** to continue.

Your repository displays in the list after it is successfully imported to KubeSphere.
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image.png)

## Step 2: Deploy RadonDB MySQL Operator

1. In the `demo-project` project, enter the application page under the application load and click deploy new application.
2. In the dialog that appears, select **From App Template**.
3. On the new page that appears, select `radondb-mysql-operator` from the drop-down list.
4. Click `MySQL operator` , check and config RadonDB MySQL Operator.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(1).png)

5. In the profile tab, you can view and edit values Yaml configuration file; The version number can be viewed in the selection box.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(2).png)

6. Click deploy to enter the MySQL-operator application basic information configuration page, and confirm the application name, application version and configuration deployment location.

7. Click next to enter the MySQL operator application configuration page and confirm values Yaml configuration information. You can edit the file and modify the configuration.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(3).png)

8. Click deploy to return to the application template page. When the application status is switched to running, the application deployment is successful.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(4).png)

### Update Operator

If the historical version of operator has been deployed in kubesphere, you can choose the following method to update to the latest version.

1. Delete the historical version of the operator application on the kubesphere platform.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(5).png)

2. Refer to the above steps to install the latest version of operator.

3. Execute the following command to update the CRD version. The following example is to update CRD to version 2.1.2.

```plain
kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/v2.1.2/charts/mysql-operator/crds/mysql.radondb.com_mysqlclusters.yaml
```

## Step 3: Deploy a RadonDB MySQL cluster

You can refer to RadonDB MySQL template to deploy a cluster, or you can customize the yaml file to deploy a cluster.

Take `mysql_v1alpha1_mysqlcluster.yaml` template as an example to create a RadonDB MySQL cluster.

1. Hover your cursor over the hammer icon in the lower-right corner, and then select **Kubectl**.
2. Run the following command to install RadonDB MySQL cluster.
```plain
kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml --namespace=<project_name>
```
**Notice**

When no project is specified, the cluster will be installed in the kubesphere-controls-system project by default. To specify a project, the install command needs to add the `--namespace=<project_name>` field.

**Expected results**

```plain
$ kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml --namespace=demo-project
mysqlcluster.mysql.radondb.com/sample created
```

3. You can run the following command to view all services of RadonDB MySQL cluster.
```plain
kubectl get statefulset,svc
```

**Expected results**

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
# Deployment Validation

In the `demo-project` project, view the status of RadonDB MySQL Cluster.

1. Enter the **service** page under **application load** to view the cluster service information.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(6).png)

2. In Workloads under Application Workloads, click the StatefulSets tab, and you can see the StatefulSets are up and running.

Click a single StatefulSet to go to its detail page. You can see the metrics in line charts over a period of time under the Monitoring tab.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(7).png)

3. In **Pods** under **Application** Workloads, you can see all the Pods are up and running.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(8).png)

4. In **Volumes** under **Storage**, you can see the ClickHouse Cluster components are using persistent volumes.

Volume usage is also monitored. Click a volume item to go to its detail page.

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(9).png)

So far, the deployment of RadonDB MySQL Cluster in KubeSphere has been completed.