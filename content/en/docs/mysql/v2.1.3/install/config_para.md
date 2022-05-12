---
title: "configuration parameter"
weight: 4
---

# Container

| Parameter                               | Desc                        | Default                                                      |
| :--------------------------------- | :-------------------------- | :---------------------------------------------------------- |
| MysqlVersion                       | MySQL Version                | 5.7                                                         |
| MysqlOpts.RootPassword             | MySQL Root User Password         | ""                                                          |
| MysqlOpts.User                     | default Created MySQL User Name   | radondb_usr                                                 |
| MysqlOpts.Password                 | default Created MySQL User Password   | RadonDB@123                                                 |
| MysqlOpts.Database                 | default Created Database Name | radondb                                                     |
| MysqlOpts.InitTokuDB               | Enable TokuDB              | true                                                        |
| MysqlOpts.MysqlConf                | MySQL Confug                  | -                                                           |
| MysqlOpts.Resources                | MySQL Container quota             | reserve: cpu 100m, mem 256Mi; </br> limit: cpu 500m, mem 1Gi  |
| XenonOpts.Image                    | xenon(MySQL HA) image       | radondb/xenon:1.1.5-alpha                                   |
| XenonOpts.AdmitDefeatHearbeatCount | Max of heartbeat failures allowed  | 5                                                           |
| XenonOpts.ElectionTimeout          | Election timeout in milliseconds   | 10000ms                                                     |
| XenonOpts.Resources                | Xenon  Container quota         | reserve: cpu 50m, mem 128Mi; </br> limit: cpu 100m, mem 256Mi |
| MetricsOpts.Enabled                | Enabled Metrics(monitor)Container  | false                                                       |
| MetricsOpts.Image                  | Metrics Container image        | prom/mysqld-exporter:v0.12.1                                |
| MetricsOpts.Resources              | Metrics  Container quota             | reserve: cpu 10m, mem 32Mi; </br> limit: cpu 100m, mem 128Mi  |

# Pod

| Parameter                        | Desc                                             | Default                    |
| :-------------------------- | :----------------------------------------------- | :------------------------ |
| Replicas                    | The number of cluster nodes. Only 0, 2, 3 and 5 are allowed                   | 3                         |
| PodPolicy.ImagePullPolicy   | The image pull policy is only allowed to be always / ifnotpresent / never | IfNotPresent              |
| PodPolicy.Labels            | pod [labels](https://kubernetes.io/zh/docs/concepts/overview/working-with-objects/labels/)                         | -                         |
| PodPolicy.Annotations       | pod [annotations](https://kubernetes.io/zh/docs/concepts/overview/working-with-objects/annotations/)                         | -                         |
| PodPolicy.Affinity          | pod [affinity](https://kubernetes.io/zh/docs/concepts/scheduling-eviction/assign-pod-node/#%E4%BA%B2%E5%92%8C%E6%80%A7%E4%B8%8E%E5%8F%8D%E4%BA%B2%E5%92%8C%E6%80%A7)                     | -                         |
| PodPolicy.PriorityClassName | pod [priority](https://kubernetes.io/zh/docs/concepts/configuration/pod-priority-preemption/) ClassName             | -                         |
| PodPolicy.Tolerations       | pod [Tolerations](https://kubernetes.io/zh/docs/concepts/scheduling-eviction/taint-and-toleration/) List               | -                         |
| PodPolicy.SchedulerName     | pod [Scheduler](https://kubernetes.io/zh/docs/concepts/scheduling-eviction/kube-scheduler/) Name                 | -                         |
| PodPolicy.ExtraResources    | Node container quota (containers other than MySQL and Xenon)     | reserve: cpu 10m, mem 32Mi  |
| PodPolicy.SidecarImage      | Sidecar image                                    | radondb/mysql-sidecar:latest |
| PodPolicy.BusyboxImage      | Busybox image                                    | busybox:1.32              |
| PodPolicy.SlowLogTail       | Enable SlowLogTail                               | false                     |
| PodPolicy.AuditLogTail      | Enable AuditLogTail                             | false                     |

# Persitence

| Parameter                   | Desc          | Default        |
| :----------------------- | :------------- | :------------ |
| Persistence.Enabled      | Enabled | true          |
| Persistence.AccessModes  | Model of Access | ReadWriteOnce |
| Persistence.StorageClass | Storage Type     | -             |
| Persistence.Size         | Size     | 10Gi          |
