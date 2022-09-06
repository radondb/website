---
shortTitle: "用户管理"
title: "使用 MysqlUser CRD 管理用户"
weight: 8
---

> RadonDB MySQL Kubernetes 2.1.0+ 支持。

## 前提条件

* 已部署 [RadonDB MySQL 集群](../../installation/on_kubernetes)。

## 创建用户帐号

### 校验 CRD

运行如下命令，将查看到名称为 `mysqlusers.mysql.radondb.com` 的 CRD。

```plain
kubectl get crd | grep mysqluser
mysqlusers.mysql.radondb.com                          2021-09-21T09:15:08Z
```

### 创建 Secret

RadonDB MySQL 使用 K8s 中的 [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) 对象保存用户的密码。

运行如下指令，将使用[示例配置](#secret)创建一个名为 `sample-user-password` 的 Secret。

```plain
kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/main/config/samples/mysqluser_secret.yaml
```

### 创建用户

运行如下指令，将使用[示例配置](#mysqluser)创建一个名为 `sample_user` 的用户。

```plain
kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/main/config/samples/mysql_v1alpha1_mysqluser.yaml 
```

> **注意：** 直接修改 `spec.user` （用户名）等同于以该用户名创建一个新用户。如需创建多个用户，请确保 `metadata.name`（自定义资源实例名）与 `spec.user`一一对应。

## 修改用户帐号信息

用户帐号信息由 `spec` 字段中的参数定义，目前支持：

* 修改 `hosts` 字段参数。
* 新增 `permissions` 字段参数。

### 配置可访问主机 IP 地址

可通过 `hosts` 字段的参数定义用户帐号可访问的主机 IP 地址。

* % 表示所有主机均可访问。
* 可配置一个或多个主机的 IP 地址。

```plain
  hosts: 
    - "%"
```

### 配置用户权限

可通过 MysqlUser 中 `permissions` 字段的参数定义用户帐号数据库访问权限；可通过新增 `permissions` 字段参数值，新增用户帐号的权限。

```plain
permissions:
    - database: "*"
      tables:
        - "*"
      privileges:
        - SELECT
```

* `database` 参数表示允许该用户帐号访问的数据库；`*` 表示访问集群所有数据库均允许访问。
* `tables` 参数表示允许该用户帐号访问的数据库表；* 表示允许访问数据库中所有的表。
* `privileges` 参数表示该用户帐号的数据库权限；更多权限说明，请参见 [Privileges Supported by MySQL](https://dev.mysql.com/doc/refman/5.7/en/grant.html#grant-privileges)。

## 删除用户帐号

运行如下指令将删除使用[示例配置](#mysqluser)创建的 MysqlUser 自定义资源。

```plain
kubectl delete mysqluser sample-user-cr
```

> 说明：删除 MysqlUser 自定义资源会自动删除其对应的 MySQL 用户。

## 示例配置

### Secret

```plain
apiVersion: v1
kind: Secret
metadata:
  name: sample-user-password   # 密钥名称，应用于 MysqlUser 中的 secretSelector.secretName。  
data:
  pwdForSample: UmFkb25EQkAxMjMKIA==  #密钥键，应用于 MysqlUser 中的 secretSelector.secretKey。示例密码为 base64 加密的 RadonDB@123
  # pwdForSample2:
  # pwdForSample3:
```

### MysqlUser

```plain
apiVersion: mysql.radondb.com/v1alpha1
kind: MysqlUser
metadata:
 
  name: sample-user-cr  # 用户 CR 名称，建议使用一个用户 CR 管理一个用户。
spec:
  user: sample_user  # 需要创建/更新的用户的名称。
  hosts:            # 支持访问的主机，可以填多个，% 代表所有主机。 
       - "%"
  permissions:
    - database: "*"  # 数据库名称，* 代表所有数据库。 
      tables:        # 表名称，* 代表所有表。
         - "*"
      privileges:     # 权限，参考 https://dev.mysql.com/doc/refman/5.7/en/grant.html。
         - SELECT
  
  userOwner:  # 指定被操作用户所在的集群，不支持修改。  
    clusterName: sample
    nameSpace: default # radondb mysql 集群所在的命名空间。
  
  secretSelector:  # 指定用户的密钥和保存当前用户密码的键。
    secretName: sample-user-password  # 密钥名称。   
    secretKey: pwdForSample  # 密钥键，一个密钥可以保存多个用户的密码，以键区分。
```