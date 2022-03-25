---
title: "容器化 | 在 KubeSphere 中部署 MySQL 集群"
date: 2022-02-24T15:39:00+08:00
author: "程润科 张莉梅"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 容器化
  - 高可用
  - Operator
  - KubeSphere

# 相关文章会通过keywords来匹配
keywords:
  - mysql
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/0.png
---

<!--more-->

作者：程润科 数据库研发工程师

目前从事 RadonDB MySQL  Kubernetes 研发，热衷于研究数据库内核、K8s 相关技术。

张莉梅 高级文档工程师

目前负责数据库产品文档开发、维护和管理工作。 

本文将演示如何在 KubeSphere[1] 上部署 RadonDB MySQL on Kubernetes 2.1.2，快速实现高可用的 MySQL on K8s。

# 部署准备

* 确保已启用 OpenPitrix 系统[2]
* 创建一个企业空间、一个项目和一个用户供本操作使用[3]
* 安装过程中，请以`admin` 身份登录控制台，在企业空间 `demo` 中的 `demo-project` 项目中进行操作
* 确保 KubeSphere 项目网关已开启外网访问[4]

# 动手实验

## 1、添加应用仓库

1. 登录 KubeSphere 的 Web 控制台。
2. 在 `demo` 企业空间中，进入应用管理下的应用仓库页面，点击添加，弹出仓库配置对话框。
3. 输入仓库名称和仓库 URL。
    1. 输入 `radondb-mysql-operator` 作为应用仓库名称。
    2. 输入 `https://radondb.github.io/radondb-mysql-kubernetes/` 作为仓库的 URL，并点击验证以验证 URL，在 URL 旁边呈现一个绿色的对号，验证通过后，点击确定继续。
4. 将仓库成功导入到 KubeSphere 之后，在列表中即可查看 RadonDB MySQL 仓库。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image.png)


## 2、部署 RadonDB MySQL Operator

1. 在 demo-project 项目中，进入应用负载下的应用页面，点击部署新应用。
2. 在对话框中，选择来自应用模板，进入应用模版页面。
3. 从下拉菜单中选择 radondb-mysql-operator 应用仓库。
4. 点击 mysql-operator 应用图标，查看和配置应用信息。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(1).png)

5. 在配置文件选项卡，可查看和编辑 values.yaml 配置文件；在版本列框区域，可查看和选择版本号。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(2).png)

6. 点击部署，进入 mysql-operator 应用基本信息配置页面，确认应用名称、应用版本以及配置部署位置。
7. 点击下一步，进入 mysql-operator 应用配置页面，确认 values.yaml 配置信息，可编辑文件修改配置。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(3).png)

8. 点击部署，返回应用模版页面。待应用状态切换为运行中，则应用部署成功。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(4).png)

### 更新 Operator

若已在 KubeSphere 部署过历史版本 Operator，可以选择如下方式更新到最新版本。

1. 在 KubeSphere 平台删除历史版本 Operator 应用。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(5).png)

2. 参考如上步骤，安装最新版本 Operator 。
3. 执行如下命令更新 CRD 版本。如下示例为更新 CRD 到 2.1.2 版。
```plain
kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/v2.1.2/charts/mysql-operator/crds/mysql.radondb.com_mysqlclusters.yaml
```
## 3、部署 RadonDB MySQL 集群

可任选一个 RadonDB MySQL 配置示例[5] 部署，或自定义配置部署。

以 `mysql_v1alpha1_mysqlcluster.yaml` 模版为例，创建一个 RadonDB MySQL 集群。

1. 在右下角 工具箱中选择 Kubectl 工具，打开终端窗口。
2. 执行以下命令，安装 RadonDB MySQL 集群。
```plain
kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml --namespace=<project_name>
```
**注意**

未指定项目时，集群将被默认安装在 `kubesphere-controls-system` 项目中。若需指定项目，安装命令需添加 `--namespace=<project_name>`。

**预期结果**

```plain
$ kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml --namespace=demo-project
mysqlcluster.mysql.radondb.com/sample created
```
3. 集群创建成果后，执行如下命令，可查看 RadonDB MySQL 集群节点服务。
```plain
kubectl get statefulset,svc
```
**预期结果**
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
### 部署校验

在 `demo-project` 项目中，查看 RadonDB MySQL 集群状态。

1. 进入 **应用负载** 下的 **服务** 页面，可查看集群服务信息。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(6).png)

2. 进入 **应用负载** 下的 **工作负载** 页面，点击 **有状态副本集**，可查看集群状态。进入一个 **有状态副本集** 详情页面，点击 **监控** 标签页，可查看一定时间范围内的集群指标。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(7).png)

3. 进入 应用负载 下的 容器组 页面，可查看集群节点运行状态。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(8).png)

4. 进入 存储 下的 存储卷 页面，可查看存储卷。查看某个存储卷用量信息，以其中一个数据节点为例，可以看到当前存储的存储容量和剩余容量等监控数据。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220224_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20KubeSphere%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/image%20(9).png)

至此，完成在 KubeSphere 中部署 RadonDB MySQL 集群。

### 参考引用

[1]：KubeSphere：[https://kubesphere.com.cn](https://kubesphere.com.cn)

 [2]：OpenPitrix：[https://kubesphere.io/zh/docs/pluggable-components/app-store](https://kubesphere.io/zh/docs/pluggable-components/app-store)

 [3]：创建操作：[https://kubesphere.io/zh/docs/quick-start/create-workspace-and-project](https://kubesphere.io/zh/docs/quick-start/create-workspace-and-project)

 [4]：项目网关：[https://kubesphere.io/zh/docs/project-administration/project-gateway](https://kubesphere.io/zh/docs/project-administration/project-gateway)

 [5]：配置示例：[https://github.com/radondb/radondb-mysql-kubernetes/blob/main/config/samples](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/config/samples)

