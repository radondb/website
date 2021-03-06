---
title: "用户文档"
contentTitle: "RadonDB MySQL Kubernetes 用户文档"
description: "介绍 RadonDB MySQL Kubernetes 的功能特性和优势应用场景。"
docsRoot: true
---
![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/211102_RadonDB%20MySQL%20on%20K8s%202.1.0%20%E5%8F%91%E5%B8%83%EF%BC%81/2.jpg)

随着国内外云原生技术蓬勃发展，数据库容器化实现技术趋于成熟，各类 K8s 社区用户对 MySQL on Kubernetes 高可用的需求呼声不断。社区决定将 RadonDB MySQL 完整的移植到 Kubernetes 平台，并于 2021 年将其正式开源。项目意在为广大的 Kubernetes 和 MySQL 开发者们，提供一款企业级的 MySQL on Kubernetes 高可用方案。

RadonDB MySQL 是一款基于 MySQL 的开源、高可用、云原生集群解决方案。支持一主多从高可用架构，并具备安全、自动备份、监控告警、自动扩容等全套管理功能。目前已经在生产环境中大规模的使用，用户包含银行、保险、传统大企业等。服务高可用由已经开源的 MySQL 集群高可用组件 [Xenon](../../projects/xenon) 来实现。

[RadonDB MySQL Kubernetes](https://github.com/radondb/radondb-mysql-kubernetes) 支持在 Kubernetes、KubeSphere、Rancher 等平台安装部署和管理，自动执行与运行 RadonDB MySQL 集群有关的任务。