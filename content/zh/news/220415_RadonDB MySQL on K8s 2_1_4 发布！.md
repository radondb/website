---
title: "RadonDB MySQL on K8s 2.1.4 发布！"
date: 2022-04-15T08:00:11+08:00
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/news/220415_RadonDB%20MySQL%20on%20K8s%202.1.4%20%E5%8F%91%E5%B8%83%EF%BC%81/0.png
---
RadonDB 数据库容器化系列 MySQL 容器化项目新版发布！
<!--more-->
RadonDB MySQL Kubernetes 于 4 月 7 日正式发布新版本 2.1.4。该版本主要对可用性进行了优化，新增中英文文档，并修复一些问题。

## **致谢**

首先感谢 @andyli029 @acekingke @runkecheng @qianfen2021 @Patrick-LuoYu  提交的修改。

# **新版本功能一览**

1. 优化 Operator 在宕机场景的可用性
2. 持久化 Xenon 元数据
3. 新增英文部署文档两篇
4. 新增镜像制作文档一篇
5. 修复无头服务标签选择不准确
6. 修复工作流 staticcheck 版本冲突
以下是完整 2.1.4 的 Release Notes。

# **2.1.4 Release Notes**

## Changes

* docs: fix typo (#429)
## Features

* Chart: optimize operator availability. (#416)
* *: Save Xenon's metadata to persistent storage. #406 (#413)
## Improvements

* docs: Add tutorial of building images. #409 (#410)
* docs: Translate 'deploy_radondb-mysql_operator_on_k8s.md' and 'deploy_radondb-mysql_operator_on_rancher.md' (#430)
## Bug Fixes

* mysqlcluser: Headless Service may select the pods of other clusters When multiple clusters. #433 (#434)
* workflow: Specify version of staticcheck. #431 (#432)
欢迎大家下载体验！


## 项目地址

* [https://github.com/radondb/radondb-mysql-kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)
* [https://github.com/radondb/xenon](https://github.com/radondb/xenon)


## 部署文档
《[容器化 | K8s 部署 RadonDB MySQL Operator 和集群](https://radondb.com/posts/220324_%E5%AE%B9%E5%99%A8%E5%8C%96-_-%E5%9C%A8-k8s-%E4%B8%8A%E9%83%A8%E7%BD%B2-radondb-mysql-operator-%E5%92%8C%E9%9B%86%E7%BE%A4/)》

《[容器化 | 在 KubeSphere 中部署 MySQL 集群](https://radondb.com/posts/220224_%E5%AE%B9%E5%99%A8%E5%8C%96-_-%E5%9C%A8-kubesphere-%E4%B8%AD%E9%83%A8%E7%BD%B2-mysql-%E9%9B%86%E7%BE%A4/)》

