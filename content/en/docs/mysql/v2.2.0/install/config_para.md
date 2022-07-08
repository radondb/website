---
title: "Parameter Configuration"
weight: 4
---

# Container

| Parameter                               | Desc                        | Default                                                      |
| :--------------------------------- | :-------------------------- | :---------------------------------------------------------- |
| MysqlVersion                       | MySQL version                | 5.7 (optional: 8.0)                            |
| MysqlOpts.RootPassword             | MySQL root user password         | ""                                                          |
| MysqlOpts.User                     | default MySQL username   | radondb_usr                                                 |
| MysqlOpts.Password                 | default MySQL user password   | RadonDB@123                                                 |
| MysqlOpts.Database                 | default database name | radondb                                                     |
| MysqlOpts.InitTokuDB               | TokuDB enabled              | true                                                        |
| MysqlOpts.MysqlConf                | MySQL configuration                  | -                                                           |
| MysqlOpts.Resources                | MySQL container resources             | Reserve: CPU 100M, mem 256Mi; </br> limit: CPU 500m, mem 1Gi  |
| XenonOpts.Image                    | Xenon (HA MySQL) image    | radondb/xenon:1.1.5-alpha                                   |
| XenonOpts.AdmitDefeatHearbeatCount | Max heartbeat failures allowed  | 5                                                           |
| XenonOpts.ElectionTimeout          | Election timeout period (milliseconds) |10000ms                                                     |
| XenonOpts.Resources                | Xenon Container resources         | Reserve: CPU 50m, mem 128Mi; </br> limit: CPU 100m, mem 256Mi |
| MetricsOpts.Enabled                | Metrics(monitor) container enabled  | false                                                       |
| MetricsOpts.Image                  | Metrics Container image        | prom/mysqld-exporter:v0.12.1                                |
| MetricsOpts.Resources              | Metrics  Container resources             | Reserve: CPU 10m, mem 32Mi; </br> limit: CPU 100m, mem 128Mi  |

# Pod

| Parameter                        | Desc                                             | Default                    |
| :-------------------------- | :----------------------------------------------- | :------------------------ |
| Replicas                    | The number of cluster nodes. The value 0, 2, 3 and 5 are allowed.                   | 3                         |
| PodPolicy.ImagePullPolicy   | The image pull policy is only allowed to be Always / IfnNotPresent / Never. | IfNotPresent              |
| PodPolicy.Labels            | Pod [labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels)                         | -                         |
| PodPolicy.Annotations       | Pod [annotations](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/)                         | -                         |
| PodPolicy.Affinity          | Pod [affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)                     | -                         |
| PodPolicy.PriorityClassName | pod [priority](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) class name             | -                         |
| PodPolicy.Tolerations       | Pod [toleration](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) list               | -                         |
| PodPolicy.SchedulerName     | Pod [scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/) name                 | -                         |
| PodPolicy.ExtraResources    | Node resources (containers except MySQL and Xenon)     | reserve: cpu 10m, mem 32Mi  |
| PodPolicy.SidecarImage      | Sidecar image                                    | radondb/mysql-sidecar:latest |
| PodPolicy.BusyboxImage      | Busybox image                                    | busybox:1.32              |
| PodPolicy.SlowLogTail       | SlowLogTail enabled                               | false                     |
| PodPolicy.AuditLogTail      | AuditLogTail enabled                             | false                     |

# Persitence

| Parameter                   | Desc          | Default        |
| :----------------------- | :------------- | :------------ |
| Persistence.Enabled      | Persistence enabled | true          |
| Persistence.AccessModes  | Access mode | ReadWriteOnce |
| Persistence.StorageClass | Storage Type     | -             |
| Persistence.Size         | Size     | 10Gi          |
