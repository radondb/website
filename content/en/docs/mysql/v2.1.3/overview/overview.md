---
shortTitle: "About RadonDB MySQL"
title: "About RadonDB MySQL Kubernetes"
weight: 1
---
![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/211102_RadonDB%20MySQL%20on%20K8s%202.1.0%20%E5%8F%91%E5%B8%83%EF%BC%81/2.jpg)

# What is RadonDB MySQL Kubernetes？
RadonDB MySQL is an open source, highly available and cloud native cluster solution based on MySQL. It supports one master multi slave high availability architecture, and has a full set of management functions such as security, automatic backup, monitoring alarm and automatic capacity expansion. At present, it has been used on a large scale in the production environment. Users include banks, insurance, traditional large enterprises and so on. Service high availability is implemented by Xenon, an open source MySQL Cluster High Availability component.

With the vigorous development of cloud native technology at home and abroad and the maturity of database containerization technology, users in major k8s communities are constantly calling for MySQL on k8s high availability. The community decided to completely transplant **RadonDB Mysql to k8s platform (RadonDB MySQL Kubernetes)**, and officially open source it in 2021. The project aims to provide an enterprise level MySQL on k8s high availability solution for k8s and MySQL developers.

Radondb MySQL Kubernetes supports installation, deployment and management on **Kubernetes, KubeSphere, Rancher** and other platforms, and automatically performs tasks related to running radondb MySQL clusters.

### Github

* [https://github.com/radondb/radondb-mysql-kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)

# Main Features
- MySQL high availability
    - Non centralized automatic master selection
    - Master slave second switching
    - Strong data consistency of cluster switching
- Cluster management
- Monitoring alarm
- Backup
- Cluster log management
- Account management


# Architecture Diagram
- Automatic election of decentralized leaders through raft protocol
- Synchronize data based on gtid mode through semi sync
- High AvailabilityVia via [Xenon](https://github.com/radondb/xenon)
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211108_MySQL%20Operator%2001%20%7C%20%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E6%A6%82%E8%A7%88/3.jpg)

# Roadmap

## 1.0 Helm Chart

- MySQL high availability
- Automatic election without centralized leadership
- Master slave second switching
- Strong data consistency
- Cluster management
- Monitoring alarm
- Cluster log management
- Account management

## 2.0 Operator

- Add / Delete node
- Automatic expansion and contraction capacity
- Upgrade cluster
- Backup and Recovery
- Automatic failover
- Automatically rebuild nodes
- Automatic restart service
- Account management (API interface provided)
- Online migration

## 3.0 Operator

- Automatic operation and maintenance
- Multi node role
- Disaster recovery cluster
- SSL transport encryption

# License
Radondb MySQL is based on Apache 2.0 protocol. See [License](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/LICENSE)。

# Community

## Forum
[https://kubesphere.com.cn/forum/t/radondb](https://kubesphere.com.cn/forum/t/radondb)
