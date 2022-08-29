---
title: "Building custom operator and sidecar images"
shortTitle: "Building custom images"
weight: 6
---

This tutorial demonstrates how to build and apply custom operator and sidecar images.

View [GitHub documentation](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/en-us/build_and_use_images.md).

## Custom operator image

**Step 1 Build an operator image and push it to Docker Hub.**

```shell
docker build -t {your repo}/mysql-operator:{your tag} . && docker push {your repo}/mysql-operator:{your tag}
```

**Step 2 Add the Helm repository of RadonDB MySQL.**

```shell
helm repo add radondb https://radondb.github.io/radondb-mysql-kubernetes/
```

**Step 3 Install or update the operator using the image.**

```shell
helm upgrade demo radondb/mysql-operator --install --set manager.image={your repo}/mysql-operator --set manager.tag={your tag}
```

## Custom sidecar image

**Step 1 Build a sidecar image and push it to Docker Hub.**

```shell
docker build -f Dockerfile.sidecar -t {your repo}/mysql-sidecar:{your tag} . && docker push {your repo}/mysql-sidecar:{your tag}
```

**Step 2 Create a sample cluster.**

```shell
kubectl apply -f https://github.com/radondb/radondb-mysql-kubernetes/releases/latest/download/mysql_v1alpha1_mysqlcluster.yaml
```

**Step 3 Apply the sidecar image to the cluster.**
```shell
kubectl patch mysql sample -p '{"spec": {"podPolicy": {"sidecarImage": "{your repo}/mysql-sidecar:{your tag}"}}}' --type=merge
```

You can modify the cluster name `sample` as needed.