---
shortTitle: "About RadonDB MySQL"
title: "About RadonDB MySQL Kubernetes"
weight: 1
---
![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/211102_RadonDB%20MySQL%20on%20K8s%202.1.0%20%E5%8F%91%E5%B8%83%EF%BC%81/2.jpg)

# What is RadonDB MySQL Kubernetes？
RadonDB MySQL is an open-source, high-availability, and cloud-native cluster solution based on MySQL. It adopts the architecture of a primary database and multiple secondary databases, with a full set of management functions for security, automatic backup, monitoring and alerting, and automatic storage expansion, and so on. It has been used on a large scale in the production environment by users such as banks, insurance companies, traditional large enterprises and so on. RadonDB MySQL achieves high availability by using open-source high-availability components provided by Xenon for MySQL clusters.

RadonDB MySQL Kubernetes supports installation, deployment and management on Kubernetes, KubeSphere, Rancher and other platforms, and automatically performs tasks involved in running RadonDB MySQL clusters.

### GitHub

* [https://github.com/radondb/radondb-mysql-kubernetes](https://github.com/radondb/radondb-mysql-kubernetes)

# Key features
- MySQL high availability
    - Automatic decentralized leader selection
	- Failover within seconds
    - Strong data consistency in cluster switching

- Cluster management
- Monitoring and alerting
- Backup
- Cluster log management
- Account management


# Architecture
- Automatic decentralized leader election by Raft protocol
- Data synchronization by Semi-Sync replication based on GTID mode
- High availability with [Xenon](https://github.com/radondb/xenon)
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211108_MySQL%20Operator%2001%20%7C%20%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E6%A6%82%E8%A7%88/3.jpg)

# Roadmap

## 1.0 Helm chart

- High-availability MySQL
- Automatic decentralized leader election
- Failover within seconds
- Strong data consistency
- Cluster management
- Monitoring and alerting
- Cluster log management
- Account management

## 2.0 Operator

- Node creation/deletion
- Automatic storage expansion
- Cluster Upgrade
- Backup and recovery
- Automatic failover
- Automatic node rebuilding
- Automatic service restarting
- Account management (with APIs)
- Online migration

## 3.0 Operator

- Automatic O&M
- Multiple node roles
- Disaster recovery cluster
- SSL encryption

# License
RadonDB MySQL is based on Apache 2.0 protocol. See [License](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/LICENSE).

# Community

## Forum
https://kubesphere.com.cn/forum/t/radondb