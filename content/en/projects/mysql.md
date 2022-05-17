---
title: "RadonDB MySQL Kubernetes"
date: 2021-09-11T16:52:11+08:00
# 相关文章，通过keywords匹配
keywords:
  - mysql
# 排序，从小到大
weight: 1
short: RadonDB MySQL Kubernetes
subtitle: MySQL based open source, high- Availability, cloud-native Cluster Solution
description: Support installation, deployment and management on kubernetes and kubesphere.
logo: /images/projects/mysql/mysql.svg
# 立即开始
start_url: https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/en-us/deploy_radondb-mysql_operator_on_k8s.md
github_url: https://github.com/radondb/radondb-mysql-kubernetes
# 特性
features:
  - picture: /images/projects/mysql/consistency.svg
    title: Strong data consistency
    description: It adopts the architecture of one main, two standby to automatically protect the brain crack.
  - picture: /images/projects/mysql/available.svg
    title: High availability
    description: It supports a master-slave architecture to flexibly meet various availability requirements.
  - picture: /images/projects/mysql/operative.svg
    title: Automatic operation and maintenance
    description: Automatic backup strategy, monitoring alarm strategy and automatic capacity expansion strategy can be set.
  - picture: /images/projects/mysql/resilience.svg
    title: Elastic expansion capacity
    description: Expand the CPU, memory and storage capacity of the database in real time according to business needs. 
# 快速开始
fast_start:
  helm:
    - text: Deploy RadonDB MySQL Cluster on Kubernetes
      url: /posts/210623_容器化-_-在-kubernetes-上部署-radondb-mysql-集群/
  operator:
    - text: Deploy RadonDB MySQL Cluster on Kubernetes
      url: https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/en-us/deploy_radondb-mysql_operator_on_k8s.md
    - text: Deploy RadonDB MySQL Cluster on Kubesphere
      url: https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/en-us/deploy_radondb-mysql_operator_on_k8s.md
# 架构
architecture:
  picture: /images/projects/mysql/mysql-architecture.png
  intros:
    - Automatic election of decentralized leaders through raft protocol
    - Synchronize data based on gtid mode through semi-sync
    - High AvailabilityVia via Xenon
roadmap:
  - title: 1.0 Helm
    content:
      - MySQL high availability
      - Without centralized leadership
      - Master slave second switching
      - Strong data consistency
      - Cluster management
      - Monitoring alarm
      - Cluster log management
      - Account management
  - title: 2.0 Operator
    content:
      - Add / Delete node
      - Automatic capacity expansion
      - Upgrade cluster
      - Backup and Recovery
      - Automatic failover
      - Automatically rebuild nodes
      - Automatic restart service
      - Account management
      - Online migration
  - title: 3.0 Operator
    content:
      - Automatic operation and maintenance
      - Multi node role
      - Disaster recovery cluster
      - SSL transport encryption
# <!--more-->是分割线，它前面的文字为摘要（.Summary属性访问），它后面的都是Markdown格式内容（.Content），会自动匹配格式转成HTML
---

MySQL based Open Source, High-Availability, Cloud-Native Cluster Solution. It supports one master multi slave high availability architecture, and has a full set of management functions such as security, automatic backup, monitoring alarm and automatic capacity expansion. Support installation, deployment and management on kubernetes and kubesphere.

<!--more-->

### Title

some content
