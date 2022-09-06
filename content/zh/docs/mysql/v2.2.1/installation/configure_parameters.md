---
title: "配置参数"
weight: 6
---

查看 [GitHub 文档](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/zh-cn/config_para.md)。

## 配置参数

### 容器配置

| 参数                               | 描述                         | 默认值                                                      |
| :--------------------------------- | :--------------------------- | :---------------------------------------------------------- |
| MysqlVersion                       | MySQL 版本号                 | 5.7                                                         |
| MysqlOpts.RootPassword             | MySQL Root 用户密码          | ""                                                          |
| MysqlOpts.User                     | 默认新建的 MySQL 用户名称    | radondb_usr                                                 |
| MysqlOpts.Password                 | 默认新建的 MySQL 用户密码    | RadonDB@123                                                 |
| MysqlOpts.Database                 | 默认新建的 MySQL 数据库名称  | radondb                                                     |
| MysqlOpts.InitTokuDB               | 是否启用 TokuDB              | true                                                        |
| MysqlOpts.MysqlConf                | MySQL 配置                   | -                                                           |
| MysqlOpts.Resources                | MySQL 容器配额               | 预留：CPU 100M，内存 256Mi；</br> 限制：CPU 500M，内存 1Gi  |
| XenonOpts.Image                    | Xenon （高可用组件）镜像     | radondb/xenon:1.1.5-alpha                                   |
| XenonOpts.AdmitDefeatHearbeatCount | 允许的最大心跳检测失败次数   | 5                                                           |
| XenonOpts.ElectionTimeout          | 选举超时时间（单位为毫秒）   | 10000ms                                                     |
| XenonOpts.Resources                | Xenon 容器配额               | 预留：CPU 50M，内存 128Mi；</br> 限制：CPU 100M，内存 256Mi |
| MetricsOpts.Enabled                | 是否启用 Metrics（监控）容器 | false                                                       |
| MetricsOpts.Image                  | Metrics 容器镜像             | prom/mysqld-exporter:v0.12.1                                |
| MetricsOpts.Resources              | Metrics 容器配额             | 预留：CPU 10M，内存 32Mi；</br> 限制：CPU 100M，内存 128Mi  |

### 节点配置

| 参数                        | 描述                                                                                                                                                                    | 默认值                       |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------- |
| Replicas                    | 集群节点数，只允许为0、2、3 和 5                                                                                                                                        | 3                            |
| PodPolicy.ImagePullPolicy   | 镜像拉取策略, 只允许为 Always/IfNotPresent/Never                                                                                                                        | IfNotPresent                 |
| PodPolicy.Labels            | 节点 Pod [标签](https://kubernetes.io/zh/docs/concepts/overview/working-with-objects/labels/)                                                                           | -                            |
| PodPolicy.Annotations       | 节点 Pod [注解](https://kubernetes.io/zh/docs/concepts/overview/working-with-objects/annotations/)                                                                      | -                            |
| PodPolicy.Affinity          | 节点 Pod [亲和性](https://kubernetes.io/zh/docs/concepts/scheduling-eviction/assign-pod-node/#%E4%BA%B2%E5%92%8C%E6%80%A7%E4%B8%8E%E5%8F%8D%E4%BA%B2%E5%92%8C%E6%80%A7) | -                            |
| PodPolicy.PriorityClassName | 节点 Pod [优先级](https://kubernetes.io/zh/docs/concepts/configuration/pod-priority-preemption/)对象名称                                                                | -                            |
| PodPolicy.Tolerations       | 节点 pod [污点容忍度](https://kubernetes.io/zh/docs/concepts/scheduling-eviction/taint-and-toleration/)列表                                                             | -                            |
| PodPolicy.SchedulerName     | 节点 Pod [调度器](https://kubernetes.io/zh/docs/concepts/scheduling-eviction/kube-scheduler/)名称                                                                       | -                            |
| PodPolicy.ExtraResources    | 节点容器配额（除 MySQL 和 Xenon 之外的容器）                                                                                                                            | 预留：CPU 10M，内存 32Mi     |
| PodPolicy.SidecarImage      | Sidecar 镜像                                                                                                                                                            | radondb/mysql-sidecar:latest |
| PodPolicy.BusyboxImage      | Busybox 镜像                                                                                                                                                            | busybox:1.32                 |
| PodPolicy.SlowLogTail       | 是否开启慢日志跟踪                                                                                                                                                      | false                        |
| PodPolicy.AuditLogTail      | 是否开启审计日志跟踪                                                                                                                                                    | false                        |

### 持久化配置

| 参数                     | 描述           | 默认值        |
| :----------------------- | :------------- | :------------ |
| Persistence.Enabled      | 是否启用持久化 | true          |
| Persistence.AccessModes  | 存储卷访问模式 | ReadWriteOnce |
| Persistence.StorageClass | 存储卷类型     | -             |
| Persistence.Size         | 存储卷容量     | 10Gi          |

## 配置示例

```yaml
apiVersion: mysql.radondb.com/v1alpha1
kind: MysqlCluster
metadata:
  name: sample
spec:
  replicas: 3
  mysqlVersion: "5.7"
  
  # the backupSecretName specify the secret file name which store S3 information,
  # if you want S3 backup or restore, please create backup_secret.yaml, uncomment below and fill secret name:
  # backupSecretName: 
  
  # if you want create mysqlcluster from S3, uncomment and fill the directory in S3 bucket below:
  # restoreFrom: 
  
  mysqlOpts:
    rootPassword: "RadonDB@123"
    rootHost: localhost
    user: radondb_usr
    password: RadonDB@123
    database: radondb
    initTokuDB: true

    # A simple map between string and string.
    # Such as:
    #    mysqlConf:
    #      expire_logs_days: "7"
    mysqlConf: {}

    resources:
      requests:
        cpu: 100m
        memory: 256Mi
      limits:
        cpu: 500m
        memory: 1Gi

  xenonOpts:
    image: radondb/xenon:1.1.5-alpha
    admitDefeatHearbeatCount: 5
    electionTimeout: 10000

    resources:
      requests:
        cpu: 50m
        memory: 128Mi
      limits:
        cpu: 100m
        memory: 256Mi

  metricsOpts:
    enabled: false
    image: prom/mysqld-exporter:v0.12.1

    resources:
      requests:
        cpu: 10m
        memory: 32Mi
      limits:
        cpu: 100m
        memory: 128Mi

  podPolicy:
    imagePullPolicy: IfNotPresent
    sidecarImage: radondb/mysql-sidecar:latest
    busyboxImage: busybox:1.32

    slowLogTail: false
    auditLogTail: false

    labels: {}
    annotations: {}
    affinity: {}
    priorityClassName: ""
    tolerations: []
    schedulerName: ""
    # extraResources defines quotas for containers other than mysql or xenon.
    extraResources:
      requests:
        cpu: 10m
        memory: 32Mi

  persistence:
    enabled: true
    accessModes:
    - ReadWriteOnce
    #storageClass: ""
    size: 20Gi
```