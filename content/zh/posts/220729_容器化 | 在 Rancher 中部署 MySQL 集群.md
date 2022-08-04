---
title: "容器化 | 在 Rancher 中部署 MySQL 集群"
date: 2022-07-27T15:39:00+08:00
author: "张莉梅 "
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 容器化
  - Rancher
# 相关文章会通过keywords来匹配
keywords:
  - MySQL
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/220729_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20Rancher%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/0.png
---
本文将演示如何在 Rancher 上部署 RadonDB MySQL Kubernetes 2.2.0,快速获得一套 MySQL 容器化集群。

<!--more-->
我们已经介绍了如何在 [Kubernetes](https://radondb.com/posts/220324_%E5%AE%B9%E5%99%A8%E5%8C%96-_-%E5%9C%A8-k8s-%E4%B8%8A%E9%83%A8%E7%BD%B2-radondb-mysql-operator-%E5%92%8C%E9%9B%86%E7%BE%A4/) 和 [KubeSphere](https://radondb.com/posts/220224_%E5%AE%B9%E5%99%A8%E5%8C%96-_-%E5%9C%A8-kubesphere-%E4%B8%AD%E9%83%A8%E7%BD%B2-mysql-%E9%9B%86%E7%BE%A4/) 上部署 RadonDB MySQL 集群。本文将演示如何在 [Rancher](https://rancher.com) 上部署 [RadonDB MySQL Kubernetes 2.2.0](https://github.com/radondb/radondb-mysql-kubernetes)，快速获得一套 MySQL 容器化集群。

# 部署准备

* 已部署 [Rancher 集群](https://rancher.com/docs/rancher/v2.6/en/quick-start-guide/deployment/quickstart-manual-setup/)
* MySQL 客户端（非必须）
>本文中 Rancher 语言环境为中文。 
# 部署步骤

## 1、添加 Helm 仓库

登录 Rancher 管理控制台后，点击 **目标集群 > 应用及应用市场 > Chart 仓库**，创建一个新的仓库。

自定义仓库名称 **mysql-operator**，目标可选择 http(s) 方式，配置索引 URL 为：[https://radondb.github.io/radondb-mysql-kubernetes/](https://radondb.github.io/radondb-mysql-kubernetes/)

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220729_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20Rancher%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/1.png)

点击 **创建**，返回仓库列表页面。当仓库状态切换为 `Active`，表示仓库正常运行。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220729_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20Rancher%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/2.png)

## 2、部署 Operator

一个 Rancher 集群仅需部署一次 RadonDB MySQL Operator。点击 **应用和应用市场 > Charts**，进入 Charts 列表页面。搜索到 **mysql-operator**，进入部署 Operator 页面，可选择 **mysql-operator Charts 版本**（省略，默认部署最新版 2.2.0）。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220729_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20Rancher%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/3.png)

### 安装

步骤1：填写名称，勾选在安装前自定义 Helm 选项，点击下一步。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220729_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20Rancher%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/4.png)

步骤 2：自定义编辑应用 YAML，点击下一步。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220729_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20Rancher%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/5.png)

步骤 3：确认其他部署选项，点击安装。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220729_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20Rancher%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/6.png)

安装完成后，跳转到 已安装的应用 管理页面。可以在下方列表中看到应用的状态，资源，存活时间等。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220729_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20Rancher%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/7.png)

## 3、部署 RadonDB MySQL 集群

部署集群可以通过命令或者导入 YAML 的方式（视频中演示的方式）。

### 通过命令方式

在集群管理页面，点击右上角 Kubectl 命令图标。在命令窗口，输入创建集群命令。

 如下示例，部署一个三节点的样例集群。

```plain
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
回车执行命令，回显提示 created 则部署成功。预期回显信息示例：
```plain
mysqlcluster.mysql.radondb.com/sample created
```
### 通过导入 YAML 方式

在 Rancher 集群管理页面，点击右上角 YAML 导入图标。在弹出的窗口中，导入修改后的 YAML 文件。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220729_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20Rancher%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/8.png)

YAML 文件可参考 [RadonDB MySQL 集群配置样例](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/config/samples/mysql_v1alpha1_mysqlcluster.yaml)。修改 YAML 文件中配置参数值，请参见[配置参数](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/zh-cn/config_para.md)。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220729_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20%E5%9C%A8%20Rancher%20%E4%B8%AD%E9%83%A8%E7%BD%B2%20MySQL%20%E9%9B%86%E7%BE%A4/9.png)

## 4、部署验证

在集群管理页面，选择 **服务发现 > 服务**，进入服务列表页面。

找到部署的集群，查看服务状态。状态为 `Active`，表示服务正常运行。

点击服务名称，进入服务详情页面，查看 Pod 状态。状态为 `Active`，表示 Pod 正常运行。

在正在运行的 Pod 行，点击 Execute Shell，展开 Pod 命令窗口。执行如下命令并输入密码，验证数据库连接状态。

```plain
$ mysql -u root -p
```
# 访问 RadonDB MySQL

* 当客户端与数据库部署在不同 Rancher 集群，请 在 Rancher 中[设置 Load Balancer 和 Ingress Controller](https://rancher.com/docs/rancher/v2.6/en/k8s-in-rancher/load-balancers-and-ingress/)。
>更多访问方式，请参见 Kubernetes [访问集群中的应用程序](https://kubernetes.io/zh-cn/docs/tasks/access-application-cluster/) 。 
* 当客户端与数据库部署在同一 Rancher 集群内，可选择使用`service_name` 或者`clusterIP` 方式，访问 RadonDB MySQL。
**说明：RadonDB MySQL 提供 Leader 服务和 Follower 服务用于分别访问主从节点。Leader 服务始终指向主节点（读写），Follower 服务始终指向从节点（只读）。**

以下为客户端与数据库在同一 Rancher 集群内，访问 RadonDB MySQL 的方式。

## 1、service_name 方式

连接 Leader 服务(RadonDB MySQL 主节点)

```plain
$ mysql -h <leader_service_name>.<namespace> -u <user_name> -p
```
用户名为 `radondb_usr`，release 名为 `sample`，RadonDB MySQL 命名空间为`default`，连接示例如下：
```plain
$ mysql -h sample-leader.default -u radondb_usr -p
```
连接 Follower 服务(RadonDB MySQL 从节点)
```plain
$ mysql -h <follower_service_name>.<namespace> -u <user_name> -p
```
用户名为 `radondb_usr`，release 名为 `sample`，RadonDB MySQL 命名空间为 `default` ，连接示例如下：
```plain
$ mysql -h sample-follower.default -u radondb_usr -p
```
## 2、clusterIP 方式

RadonDB MySQL 的高可用读写 IP 指向 Leader 服务的 `clusterIP`，高可用只读 IP 指向 Follower 服务的 `clusterIP`。

```plain
$ mysql -h <clusterIP> -P <mysql_Port> -u <user_name> -p
```
以下示例用户名为 `radondb_usr`， Leader 服务的 clusterIP 为 `10.10.128.136` ，连接示例如下：
```plain
$ mysql -h 10.10.128.136 -P 3306 -u radondb_usr -p
```
## 视频演示

<iframe width="760" height="427" src="//player.bilibili.com/player.html?aid=728690621&bvid=BV1VS4y1E7Q5&cid=780393054&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>