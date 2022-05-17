---
title: "Monitor"
weight: 1
---

> RadonDB MySQL Kubernetes 2.1.0+

# Background
[Prometheus](https://prometheus.io/) is a text-based exposure format has become the de facto standard format in the field of cloud native monitoring.

RadonDB MySQL monitoring engine is defined based on [Prometheus MySQLd Exporter](https://github.com/prometheus/mysqld_exporter). Grab RadonDB MySQL service indicators through `mysqld-exporter`, and then realize the visualization of monitoring indicators by accessing the third-party application platform.

This article demonstrates how to enable RadonDB MySQL monitoring indicators.

# Prerequisites

- [Kubernetes](../install/kubernetes.md) Cluster or [KubeSphere](../install/kubesphere.md) Cluster
- RadonDB MySQL Kubernetes 2.1.0+

# Procedure

## Setp 1:  Configure servicemonitor

`Servicemonitor ` will be bound automatically after being enabled ` mysqld_ Exporter ` and Prometheus.

`servicemonitor` parameter contains the following fields:

```shell
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

You can click Configure 'servicemonitor' in yaml file `charts/mysql-operator/values.yaml`.

- When the Operator is newly deployed, `servicemonitor.enabled` is **true** by default, which means it is enabled by default.
- The cluster with Operator version less than 2.1.0 has been deployed, and the operator needs to be redeployed.

## Step 2: Configure metricsOpts

`Metricsopts` is the parameter of RadonDB MySQL Cluster Monitoring defined in CRD `mysqlclusters.mysql.radondb.com`. The monitoring service can be started by configuring the parameter value in the `mysql_v1alpha1_mysqlcluster.yaml` file.

`metricsOpts` parameter contains the following fields:

```shell
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

`metricsOpts.enabled ` is **false** by default and needs to be manually set to **true**.

- Select settings `metricsopts.enabled` the status is **true**, and the cluster monitoring function is enabled.
- Set the resource parameter value and define the resource quota size of the monitoring container.

After modifying the file parameters, use the following instructions to apply the configuration and deploy / update the cluster echo information as follows:

```bash
$ kubectl apply -f config/sample/mysql_v1alpha1_mysqlcluster.yaml
cluster.mysql.radondb.com/sample created/configured
```

# View monitoring services

## View on Client

You can view the cluster monitoring service and `serviceMonitor` information through the following instructions.

```shell
$ kubectl get service,servicemonitor

$ kubectl describe servicemonitor <serviceName>
```

**Anticipate Result**

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

## View on KubeSphere

For RadonDB MySQL Operators and clusters deployed in Kubesphere Enterprise space, after monitoring is enabled, you can view the monitoring service status on the following page.

- On the **service** page under **Application Load** in the project space, click `< clusterName>-metrics` to view the monitoring service information.

![View monitoring services](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/features/monitoring/monitor_service.png)

- On the **Container Group** page under **Application Load** in the project space, click the name of a container to view the status of `metrics` resources in the container.

![View monitoring resource status](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/features/monitoring/pod_metrics.png)

# View monitoring

## Custom monitoring on kubesphere

Kubesphere's monitoring engine is based on Prometheus and Prometheus operator. Use kubesphere's custom monitoring function to support the monitoring of radondb MySQL indicators in a visual form.

1. In the same cluster project, select **user defined monitoring** under **monitoring alarm** and click **create**.
2. In the dialog box, select **MySQL** template and continue to configure the monitoring template.

![Select Template](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/features/monitoring/mysql_exporter.png)

3. Click **save template** to create a new monitoring template.

![Save Monitoring Template](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/features/monitoring/config_dashboard.png)

4. Wait about ten minutes for the new monitoring panel to view the monitoring data.

![View Monitoring](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/features/monitoring/monitor_overview.png)

For more details, please check kubesphere [Custom Monitoring Introduction](https://kubesphere.io/zh/docs/project-user-guide/custom-application-monitoring/introduction/) and [Visual Monitoring](https://kubesphere.io/zh/docs/project-user-guide/custom-application-monitoring/visualization/overview/).

## Using Prometheus + grafana platform

[Grafana](https://github.com/grafana/grafana) is a cross platform, open source data visualization network application platform. The basic principle of monitoring through Prometheus + grafana platform is as follows:

- Through [mysql_exporter](https://github.com/prometheus/mysqld_exporter) Get radondb MySQL service monitoring data
- Through [node_exporter](https://github.com/prometheus/node_exporter) Obtain the monitoring data of radondb MySQL server.
- Transfer monitoring data to [Prometheus](https://prometheus.io/download/) After that, by configuring the data source, rich monitoring data charts and warnings are finally presented in grafana.


![Basic principles](https://dbg-files.pek3b.qingstor.com/radondb_website/docs/features/monitoring/prometheus_grafana.png)

For more instructions on grafana visual monitoring, see [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)。

