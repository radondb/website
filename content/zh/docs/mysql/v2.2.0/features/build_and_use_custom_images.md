---
# menu 优先显示shortTitle，没有shortTitle显示Title
title: "创建和应用自定义镜像"
# weight按照从小到大排列
weight: 6
---
本文档介绍如何创建和应用自定义 Docker 镜像。

## 自定义 operator 镜像

**步骤 1：创建自定义的 Docker 镜像并推送到 Docker Hub 上。**

```shell
docker build -t {your repo}/mysql-operator:{your tag} . && docker push {your repo}/mysql-operator:{your tag}
```

**步骤 2：添加 RadonDB MySQL 的 Helm 库。**

```shell
helm repo add radondb https://radondb.github.io/radondb-mysql-kubernetes/
```

**步骤 3：使用自定义镜像来安装或更新 operator。**

```shell
helm upgrade demo radondb/mysql-operator --install --set manager.image={your repo}/mysql-operator --set manager.tag={your tag}
```

## 自定义 sidecar 镜像

**步骤 1：创建自定义的 sidecar 镜像并推送到 Docker Hub 上。**

```shell
docker build -f Dockerfile.sidecar -t {your repo}/mysql-sidecar:{your tag} . && docker push {your repo}/mysql-sidecar:{your tag}
```

**步骤 2：创建一个集群。**

```shell
kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml
```

**步骤 3：在已有的集群中应用自定义 sidecar 镜像。**

```shell
kubectl patch mysql sample -p '{"spec": {"podPolicy": {"sidecarImage": "{your repo}/mysql-sidecar:{your tag}"}}}' --type=merge
```

本例中集群名称为 `sample`，您可以将其修改为自己的集群名称。