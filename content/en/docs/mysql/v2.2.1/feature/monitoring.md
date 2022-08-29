---
title: "Monitoring and alerting"
weight: 2
---

This tutorial demonstrates how to enable monitoring metrics for RadonDB MySQL clusters.

View [GitHub documentation](https://github.com/radondb/radondb-mysql-kubernetes/blob/main/docs/en-us/deploy_monitoring.md).

## Overview

The text-based format for exposing metrics adopted by [Prometheus](https://prometheus.io/) has been a de facto standard in cloud-native monitoring.

The RadonDB MySQL monitoring engine is based on [Prometheus MySQLd Exporter](https://github.com/prometheus/mysqld_exporter). It scrapes RadonDB MySQL metrics with `mysqld-exporter` and visualizes the metrics by third-party platforms.

## Prerequisites

- You need to prepare a Kubernetes or KubeSphere cluster.
- You should use RadonDB MySQL Operator 2.1.0 or a later version.

## Procedure

### Step 1	Configure serviceMonitor.

The `serviceMonitor` field defines the automatic monitoring engine of RadonDB MySQL Operator. After being enabled, the Operator is automatically connected to `mysqld_exporter` and Prometheus.

You are allowed to configure the `serviceMonitor` field in the `charts/mysql-operator/values.yaml` configuration file.

The `serviceMonitor` field contains the following subfields:

```bash
serviceMonitor:
  enabled: true
  ## Additional labels for the serviceMonitor. Useful if you have multiple prometheus operators running to select only specific ServiceMonitors
  # additionalLabels:
  #   prometheus: prom-internal
  interval: 10s
  scrapeTimeout: 3s
  # jobLabel:
  # targetLabels:
  # podTargetLabels:
  namespaceSelector:
    any: true
  selector:
    matchLabels:
      app.kubernetes.io/managed-by: mysql.radondb.com
      app.kubernetes.io/name: mysql
```

- When a new Operator is deployed, `serviceMonitor.enabled` is set to true by default, which means the serviceMonitor is enabled.
- If you have an older operator version installed, you need to deploy a supported version of the Operator.

### Step 2	Configure metricsOpts.

The `metricsOpts` field defines the RadonDB MySQL cluster monitoring in the `mysqlclusters.mysql.radondb.com` CRD. You can enable the monitoring service by configuring the field in the `mysql_v1alpha1_mysqlcluster.yaml` configuration file.

The `metricsOpts` field contains the following subfields:

```bash
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
```

`etricsOpts.enabled` is set to `false` by default. You can set it to `true` to enable the monitoring function.

- To enable the cluster monitoring function, set `metricsOpts.enabled` to `true`.
- To configure the resource quota for monitoring containers, set the `resources` field.

Apply the configuration and the following information is displayed.

```bash
$ kubectl apply -f config/sample/mysql_v1alpha1_mysqlcluster.yaml
cluster.mysql.radondb.com/sample created/configured
```

## View monitoring service

### On client

You can view the cluster monitoring service and information of `serviceMonitor` as follows.

```bash
$ kubectl get service,servicemonitor

$ kubectl describe servicemonitor <serviceName>
```

**Expected output**

```shell
$ kubectl get service,servicemonitor
NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/mysql-operator-metrics   ClusterIP   10.96.242.205   <none>        8443/TCP   3h25m
service/sample-follower          ClusterIP   10.96.2.234     <none>        3306/TCP   21h
service/sample-leader            ClusterIP   10.96.30.238    <none>        3306/TCP   21h
service/sample-metrics           ClusterIP   10.96.7.222     <none>        9104/TCP   3h24m
service/sample-mysql             ClusterIP   None            <none>        3306/TCP   21h

NAME                                                              AGE
servicemonitor.monitoring.coreos.com/demo-mysql-operator          3h25m

$ kubectl describe servicemonitor demo-mysql-operator 
Name:         test-radondb-mysql-metrics
Namespace:    default
Labels:       app=test-radondb-mysql
              app.kubernetes.io/managed-by=Helm
              app.kubernetes.io/vendor=kubesphere
              chart=radondb-mysql-1.0.0
              heritage=Helm
              release=test
Annotations:  kubesphere.io/creator: admin
API Version:  monitoring.coreos.com/v1
Kind:         ServiceMonitor
......
Spec:
  Endpoints:
    Interval:        1m
    Path:            /metrics
    Port:            metrics
    Scheme:          http
    Scrape Timeout:  10s
......
```

### On KubeSphere

After the monitoring is enabled, you can view the monitoring service status for RadonDB MySQL Operator and clusters deployed in KubeSphere workspace.

- In the project space, go to **Application Workloads** > **Services**, and click `<clusterName>-metrics` to view the monitoring service details.

- On the **Pods** page under **Application Workloads** in the project space, click a container name to view the metrics status of the container.

## View application monitoring metrics

### Customize monitoring on KubeSphere

> **Note**
> 
> RadonDB MySQL Operator and clusters need to be deployed on KubeSphere.

The KubeSphere monitoring engine is based on Prometheus and Prometheus Operator. KubeSphere custom monitoring supports visualizing RadonDB MySQL metric data.

**Step 1**	In the same project, go to **Monitoring & Alerting** > **Custom Monitoring**, and click **Create**.

**Step 2**	In the displayed dialog box, set a name for the dashboard (for example, `mysql-overview`) and select the **MySQL** template. Click **Next** to continue.

**Step 3** Click **Save Template** in the upper-right corner. A newly-created dashboard is displayed on the **Custom Monitoring Dashboards** page.


**Step 4** Wait about ten minutes to view the monitoring metrics.

For more information, see KubeSphere [Custom application monitoring](https://kubesphere.io/docs/project-user-guide/custom-application-monitoring/introduction/) and [Visualization](https://kubesphere.io/docs/project-user-guide/custom-application-monitoring/visualization/overview/).

### By Prometheus and Grafana platforms

[Grafana](https://github.com/grafana/grafana) is an open-source interactive data-visualization platform. You can view the monitoring information by using Prometheus and Grafana platforms. The following is the process of displaying monitoring metrics by Prometheus and Grafana.

- Obtain the monitoring metric data of RadonDB MySQL services by [mysql_exporter](https://github.com/prometheus/mysqld_exporter).
- Obtain the monitoring metric data of RadonDB MySQL servers by [node_exporter](https://github.com/prometheus/node_exporter).
- Transfer monitoring metric data to [Prometheus](https://prometheus.io/download/) and configure the data source to display monitoring charts and warnings on Grafana.

For more instructions on Grafana monitoring visualization, see [Grafana dashboards](https://grafana.com/docs/grafana/latest/dashboards/).