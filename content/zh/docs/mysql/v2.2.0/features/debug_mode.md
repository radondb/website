---
# menu 优先显示shortTitle，没有shortTitle显示Title
title: "Debug 模式"
# weight按照从小到大排列
weight: 7
---


本文档介绍如何启用和移除 Debug 模式。


## 启用 Debug 模式

在运维阶段, 要避免 MySQL 容器在崩溃时不断自动重启，您可以使用 Debug 模式。您只需创建一个空文件 `/var/lib/mysql/sleep-forever` 即可。

示例:

```bash
kubectl exec -it sample-mysql-0 -c mysql -- sh -c 'touch /var/lib/mysql/sleep-forever'
```
该命令会阻止 Pod `sample-mysql-0` 中的 MySQL 容器在 mysqld 进程崩溃的情况下重启。

## 移除 Debug 模式

```bash
kubectl exec -it sample-mysql-0 -c mysql -- sh -c 'rm /var/lib/mysql/sleep-forever'
```
运行该命令后，Pod `sample-mysql-0` 中的 MySQL 容器会在 mysqld 进程退出后重启。