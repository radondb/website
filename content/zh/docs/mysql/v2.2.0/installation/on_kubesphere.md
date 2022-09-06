---
# menu 优先显示shortTitle，没有shortTitle显示Title
shortTitle: "KubeSphere 部署"
title: "在 KubeSphere 上部署 RadonDB MySQL 和集群"
# weight按照从小到大排列
weight: 4
# pdf的url，如：/pdf/test.pdf
pdf: ""
---

本教程展示如何在 [KubeSphere](https://kubesphere.com.cn) 上部署 RadonDB MySQL 集群。

> RadonDB MySQL Kubernetes 2.x 版本通用。

## 部署准备

- 请确保 [已启用 OpenPitrix 系统](https://kubesphere.io/zh/docs/pluggable-components/app-store/)。
- 您需要创建一个企业空间、一个项目和一个用户帐户供本教程操作使用。本教程中，请以 `admin` 身份登录控制台，在企业空间 `demo` 中的 `demo-project` 项目中进行操作。有关更多信息，请参见 [创建企业空间、项目、用户和角色](https://kubesphere.io/zh/docs/quick-start/create-workspace-and-project/)。
- 请确保 KubeSphere 项目网关已开启外网访问。有关更多信息，请参见 [项目网关](https://kubesphere.io/zh/docs/project-administration/project-gateway/)。

## 部署步骤

### 步骤 1：添加应用仓库

1. 登录 KubeSphere 的 Web 控制台。

2. 在 `demo` 企业空间中，进入**应用管理**下的**应用仓库**页面，点击**添加**，弹出仓库配置对话框。

3. 输入仓库名称和仓库 URL。

   输入 `radondb-mysql-operator` 作为应用仓库名称。  
   输入 `https://radondb.github.io/radondb-mysql-kubernetes/` 作为仓库的 URL，并点击**验证**以验证 URL。

4. 在 URL 旁边呈现一个绿色的对号，验证通过后，点击**确定**继续。

   将仓库成功导入到 KubeSphere 之后，在列表中即可查看 RadonDB MySQL 仓库。

![certify URL](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/RadonDB%20MySQL%20Kubernetes%20docs-zh-cn/certify_url.png)

### 步骤 2：部署 RadonDB MySQL Operator

1. 在 `demo-project` 项目中，进入**应用负载**下的**应用**页面，点击**部署新应用**。

2. 在对话框中，选择**来自应用模板**，进入应用模版页面。

3. 从下拉菜单中选择 `radondb-mysql-operator` 应用仓库。

4. 点击 `mysql-operator` 应用，查看和配置 RadonDB MySQL Operator 应用信息。  

   在**配置文件**选项卡，可查看和编辑 `.yaml` 配置文件。  
   在**版本**列框区域，可查看和选择版本号。

   ![operator 配置文件](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/RadonDB%20MySQL%20Kubernetes%20docs-zh-cn/operator_yaml.png)

5. 点击**部署**，进入 `mysql-operator` 应用基本信息配置页面。  

   确认应用名称、应用版本，以及配置部署位置。

6. 点击**下一步**，进入 `mysql-operator` 应用配置页面。  

   确认 `values.yaml` 配置信息，并可编辑文件修改配置。

7. 点击**部署**，返回**应用模版**页面。

   待应用状态切换为`运行中`，则应用部署成功。

### 更新 Operator

如果您已经安装 Operator 的历史版本，可以进行更新。

1. 删除历史版本 Operator。

![Delete historical version](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(5).png)

2. 按照上述步骤更新 Operator。
3. 执行如下命令更新 CRD，以更新至 2.1.2 版本为例。

```plain
kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/v2.1.2/charts/mysql-operator/crds/mysql.radondb.com_mysqlclusters.yaml
```

### 步骤 3：部署 RadonDB MySQL 集群

您可以任选一个 [RadonDB MySQL 配置示例](https://github.com/radondb/radondb-mysql-kubernetes/tree/main/config/samples) 部署，或自定义配置部署。

下面以模版 `mysql_v1alpha1_mysqlcluster.yaml` 为例，创建一个 RadonDB MySQL 集群。

1. 在右下角**工具箱**中选择 **Kubectl** 工具，打开终端窗口。

2. 执行如下命令，部署 RadonDB MySQL 集群。

   ```bash
   kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml --namespace=<project_name>
   ```

   > **注意**
   >
   > 未指定项目时，集群将被默认安装在 `kubesphere-controls-system` 项目中。若需指定项目，安装命令需添加 `--namespace=<project_name>`。

   **预期结果**

   ```powershell
   $ kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml --namespace=demo-project
   mysqlcluster.mysql.radondb.com/sample created
   ```

3. 集群创建成果后，执行如下命令，可查看 RadonDB MySQL 集群节点服务。

   ```bash
   kubectl get statefulset,svc
   ```

   **预期结果**

   ```powershell
   $ kubectl get statefulset,svc
   NAME                            READY   AGE
   statefulset.apps/sample-mysql   3/3     10m

   NAME                           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
   service/default-http-backend   ClusterIP   10.96.69.202    <none>        80/TCP     3h2m
   service/sample-follower        ClusterIP   10.96.9.162     <none>        3306/TCP   10m
   service/sample-leader          ClusterIP   10.96.255.188   <none>        3306/TCP   10m
   service/sample-mysql           ClusterIP   None            <none>        3306/TCP   10m
   ```

## 步骤 4：部署校验

在 `demo-project` 项目中，查看 RadonDB MySQL 集群状态。

1. 进入**应用负载**下的**服务**页面，可查看集群服务状态。

2. 进入**应用负载**下的**工作负载**页面，点击**有状态副本集**，可查看集群状态。

   进入一个有状态副本集群详情页面，点击**监控**标签页，可查看一定时间范围内的集群指标。

3. 进入**应用负载**下的**容器组**页面，可查看集群节点运行状态。

4. 进入**存储**下的**存储卷**页面，可查看存储卷，所有组件均使用了持久化存储。

   查看某个存储卷用量信息，以其中一个数据节点为例，可以看到当前存储的存储容量和剩余容量等监控数据。

## 访问 RadonDB MySQL

以下步骤演示在 KubeSphere 访问 RadonDB MySQL 的方式。

### 方式 1：通过终端访问

进入 `demo-project` 项目管理页面，通过容器组终端访问 RadonDB MySQL。

1. 进入**应用负载**下的**容器组**页面。

2. 在**容器组**下，点击集群其中一个容器组名称，进入容器组详情页面。

3. 在**资源状态**中**容器**列框下，点击 **mysql** 容器的**终端**图标。

4. 在终端窗口中，输入命令连接集群。

![访问 RadonDB MySQL](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/RadonDB%20MySQL%20Kubernetes%20docs-zh-cn/pod_terminal.png)

### 方式 2：通过 kubectl 访问

在右下角**工具箱**中选择 **kubectl** 工具，通过 kubectl 工具访问 RadonDB MySQL。

执行如下命令连接集群，连接成功后即可使用 RadonDB MySQL 应用。

```shell
kubectl exec -it <pod_name> -c mysql -n <project_name> -- mysql --user=<user_name> --password=<user_password>
```

例如，使用如下参数进行连接：

- **pod_name**：`sample-mysql-0`
- **project_name**：`demo-project`  
- **user_name**：`radondb_usr`  
- **user_password**：`RadonDB@123`

![访问 RadonDB MySQL](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/RadonDB%20MySQL%20Kubernetes%20docs-zh-cn/kubectl_terminal.png)