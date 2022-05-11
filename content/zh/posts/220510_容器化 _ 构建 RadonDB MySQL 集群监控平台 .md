---
title: "容器化 | 构建 RadonDB MySQL 集群监控平台"
date: 2022-05-10T15:39:00+08:00
author: "程润科 张莉梅 "
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - MySQL
  - 容器化
  - KubeSphere
# 相关文章会通过keywords来匹配
keywords:
  - mysql
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/220510_%E5%AE%B9%E5%99%A8%E5%8C%96%20_%20%E6%9E%84%E5%BB%BA%20RadonDB%20MySQL%20%E9%9B%86%E7%BE%A4%E7%9B%91%E6%8E%A7%E5%B9%B3%E5%8F%B0%20/0.png
---
<!--more-->

上一篇文章我们演示了如何《[在 S3 备份恢复 RadonDB MySQL 集群数据](https://radondb.com/posts/220424_%E5%AE%B9%E5%99%A8%E5%8C%96%E5%9C%A8-s3-%E5%A4%87%E4%BB%BD%E6%81%A2%E5%A4%8D-radondb-mysql-%E9%9B%86%E7%BE%A4%E6%95%B0%E6%8D%AE/)》，本文将演示在 KubeSphere[1] 中使用 Prometheus[2] + Grafana[3] 构建 MySQL 监控平台，开启所需监控指标。

文章结尾附有全部部署过程的演示视频，视频部署版本为 RadonDB MySQL Kubernetes 2.1.3[4]。

# 背景

Prometheus 基于文本的暴露格式，已经成为云原生监控领域事实上的标准格式。

RadonDB MySQL 监控引擎基于 Prometheus MySQLd Exporter[5] 定义。通过 `mysqld-exporter` 抓取 RadonDB MySQL 服务指标，再通过接入第三方应用平台实现监控指标可视化。

# 准备工作

* 已准备可用 Kubernetes 或 KubeSphere 集群
* 已部署 RadonDB MySQL 集群 《[部署文档](https://radondb.com/posts/220224_%E5%AE%B9%E5%99%A8%E5%8C%96-_-%E5%9C%A8-kubesphere-%E4%B8%AD%E9%83%A8%E7%BD%B2-mysql-%E9%9B%86%E7%BE%A4/)》
* RadonDB MySQL Kubernetes 版本 2.1.0+
# 部署步骤

## 步骤 1: 配置 serviceMonitor

`serviceMonitor` 开启后将自动绑定 `mysqld_exporter` 与 Prometheus。

`serviceMonitor` 参数包含如下字段：

```plain
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
您可以在 `charts/mysql-operator/values.yaml` 文件中配置 `serviceMonitor`。
* 新部署 Operator 时， `serviceMonitor.enabled` 默认为 **true**，表示默认开启。
* 已部署 Operator 2.1.0 以下版本的集群，需重新部署 Operator。
## 步骤 2: 配置 metricsOpts

`metricsOpts` 是 CRD  `mysqlclusters.mysql.radondb.com` 中定义 RadonDB MySQL 集群监控的参数，可通过配置`mysql_v1alpha1_mysqlcluster.yaml` 文件中参数值开启监控服务。

`metricsOpts` 参数包含如下字段：

```plain
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
`metricsOpts.enabled` 默认为 **false**，需手动设置为 **true**。
* 设置 `metricsOpts.enabled` 为 **true**，开启集群监控功能；
* 设置资源参数值，定义监控容器资源配额大小；
文件参数修改完成后，使用如下指令应用配置，部署/更新集群回显信息如下：

```bash
$ kubectl apply -f config/sample/mysql_v1alpha1_mysqlcluster.yaml
cluster.mysql.radondb.com/sample created/configured
```
# 查看监控服务

## 通过客户端查看

您可以通过如下指令查看集群监控服务和 serviceMonitor 信息。

```plain
$ kubectl get service,servicemonitor

$ kubectl describe servicemonitor <serviceName>
```
**预期效果**
```plain
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
## 在 KubeSphere 平台查看

在 KubeSphere 企业空间部署的 RadonDB MySQL Operator 和集群，开启监控后，可在如下页面查看监控服务状态。

* 在项目空间**应用负载**下的**服务**页面，点击 `<集群名称>-metrics`，可查看监控服务信息。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220510_%E5%AE%B9%E5%99%A8%E5%8C%96%20_%20%E6%9E%84%E5%BB%BA%20RadonDB%20MySQL%20%E9%9B%86%E7%BE%A4%E7%9B%91%E6%8E%A7%E5%B9%B3%E5%8F%B0%20/image.png)

* 在项目空间**应用负载**下的**容器组**页面，点击一个容器的名称，可查看该容器中 `metrics` 资源状态。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220510_%E5%AE%B9%E5%99%A8%E5%8C%96%20_%20%E6%9E%84%E5%BB%BA%20RadonDB%20MySQL%20%E9%9B%86%E7%BE%A4%E7%9B%91%E6%8E%A7%E5%B9%B3%E5%8F%B0%20/image%20(1).png)

# 查看监控内容

## 通过 KubeSphere 自定义监控

KubeSphere 的监控引擎基于 Prometheus 和 Prometheus Operator。使用 KubeSphere 的自定义监控功能支持以可视化的形式监控 RadonDB MySQL 指标。

1. 在集群同一项目中，选择 **监控告警 -> 自定义监控 -> 创建**；
2. 在对话框中，选择 **MySQL** 模版，并继续配置监控模版；

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220510_%E5%AE%B9%E5%99%A8%E5%8C%96%20_%20%E6%9E%84%E5%BB%BA%20RadonDB%20MySQL%20%E9%9B%86%E7%BE%A4%E7%9B%91%E6%8E%A7%E5%B9%B3%E5%8F%B0%20/image%20(2).png)

3. 点击 **保存模版**，即新创建监控面板。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220510_%E5%AE%B9%E5%99%A8%E5%8C%96%20_%20%E6%9E%84%E5%BB%BA%20RadonDB%20MySQL%20%E9%9B%86%E7%BE%A4%E7%9B%91%E6%8E%A7%E5%B9%B3%E5%8F%B0%20/image%20(3).png)

4. 新建监控面板需等待约十分钟，即可查看监控数据。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220510_%E5%AE%B9%E5%99%A8%E5%8C%96%20_%20%E6%9E%84%E5%BB%BA%20RadonDB%20MySQL%20%E9%9B%86%E7%BE%A4%E7%9B%91%E6%8E%A7%E5%B9%B3%E5%8F%B0%20/image%20(4).png)

更多详情，请查看 KubeSphere 自定义监控介绍[6] 和 可视化监控[7]。

## 通过 Prometheus + Grafana 平台

Grafana 是一个跨平台、开源的数据可视化网络应用程序平台。通过 Prometheus + Grafana 平台查看监控基本原理如下：

* 通过 mysql_exporter 获取 RadonDB MySQL 服务监控数据.
* 通过 node_exporter 获得 RadonDB MySQL 服务器的监控数据。
* 将监控数据传到 Prometheus 后，通过配置数据源，最终在 Grafana 呈现丰富的监控数据图表和警告。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/220510_%E5%AE%B9%E5%99%A8%E5%8C%96%20_%20%E6%9E%84%E5%BB%BA%20RadonDB%20MySQL%20%E9%9B%86%E7%BE%A4%E7%9B%91%E6%8E%A7%E5%B9%B3%E5%8F%B0%20/image%20(5).png)

更多 Grafana 可视化监控使用说明，请参见 [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)[8]。 

## 视频部分
<iframe width="760" height="427" src="//player.bilibili.com/player.html?aid=341338001&bvid=BV1SR4y1w7Br&cid=713333319&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## 参考引用

1. KubeSphere：[https://kubesphere.com.cn](https://kubesphere.com.cn)
2. Prometheus：[https://prometheus.io/](https://prometheus.io/)
3. Grafana：[https://grafana.org/](https://grafana.org/)
4. RadonDB MySQL Kubernetes 2.1.3：[https://radondb.com/projects/mysql/](https://radondb.com/projects/mysql/)
5. Prometheus MySQLd Exporter：[https://github.com/prometheus/mysqld_exporter](https://github.com/prometheus/mysqld_exporter)
6. 自定义监控：[https://kubesphere.io/zh/docs/project-user-guide/custom-application-monitoring/introduction/](https://kubesphere.io/zh/docs/project-user-guide/custom-application-monitoring/introduction/)
7. 可视化监控：[https://kubesphere.io/zh/docs/project-user-guide/custom-application-monitoring/visualization/overview/](https://kubesphere.io/zh/docs/project-user-guide/custom-application-monitoring/visualization/overview/)
8. Grafana Dashboards：[https://grafana.com/docs/grafana/latest/dashboards/](https://grafana.com/docs/grafana/latest/dashboards/)
 

