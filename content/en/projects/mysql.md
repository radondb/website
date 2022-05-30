---
title: "RadonDB MySQL Kubernetes"
date: 2021-09-11T16:52:11+08:00
# 相关文章，通过keywords匹配
keywords:
  - mysql
# 排序，从小到大
weight: 1
short: RadonDB MySQL Kubernetes
subtitle: Open-source, high-availability, and cloud-native cluster solution based on MySQL
description: Install, deploy and manage RadonDB MySQL clusters on kubernetes and kubesphere.
logo: /images/projects/mysql/mysql.svg
# 立即开始
start_url: https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/en-us/deploy_radondb-mysql_operator_on_k8s.md
github_url: https://github.com/radondb/radondb-mysql-kubernetes
# 特性
features:
  - picture: /images/projects/mysql/consistency.svg
    title: Strong data consistency
    description: Radondb MySQL adopts a primary and multiple secondary databases, and enables automatic split-brain protection.
  - picture: /images/projects/mysql/available.svg
    title: High availability
    description: Radondb MySQL adopts a primary and multiple secondary databases to meet various availability requirements.
  - picture: /images/projects/mysql/operative.svg
    title: Automatic O&M
    description: You can set strategies for automatic backup, monitoring and alerting, and automatic scaling up.
  - picture: /images/projects/mysql/resilience.svg
    title: Elastic scaling
    description: CPU, memory and storage capacity of the database are expanded according to business needs.
# 快速开始
fast_start:
  helm:
    - text: Deploy RadonDB MySQL cluster on Kubernetes
      url: /posts/210623_容器化-_-在-kubernetes-上部署-radondb-mysql-集群/
  operator:
    - text: Deploy RadonDB MySQL cluster on Kubernetes
      url: https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/en-us/deploy_radondb-mysql_operator_on_k8s.md
    - text: Deploy RadonDB MySQL cluster on Kubesphere
      url: https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/en-us/deploy_radondb-mysql_operator_on_k8s.md
# 架构
architecture:
  picture: /images/projects/mysql/mysql-architecture.png
  intros:
    - Automatic decentralized leader election by Raft protocol
    - Data Synchronization by Semi-Sync replication based on GTID mode
    - High-availability with Xenon
roadmap:
  - title: 1.0 Helm
    content:
      - Cluster management
      - Monitoring and alerting
      - Log management
      - Account management
  - title: 2.0 Operator
    content:
      - Node management
      - Cluster upgrade
      - Backup and recovery
      - Automatic failover
      - Node rebuilding
      - Account management
  - title: 3.0 Operator
    content:
      - Automatic O&M
      - Multiple node roles
      - Disaster recovery
      - SSL encryption
# <!--more-->是分割线，它前面的文字为摘要（.Summary属性访问），它后面的都是Markdown格式内容（.Content），会自动匹配格式转成HTML
---

RadonDB MySQL is an open-source, high-availability, and cloud-native cluster solution based on MySQL. It supports the architecture of a primary database and multiple secondary databases, with a full set of management functions for security, automatic backup, monitoring and alerting, and automatic storage expansion, and so on. It supports installation, deployment and management of RadonDB MySQL clusters on Kubernetes and KubeSphere.

<!--more-->

### Title

some content
