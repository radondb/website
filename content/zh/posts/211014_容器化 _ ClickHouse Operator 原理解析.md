---
title: "容器化 | ClickHouse on K8s 部署篇【建议收藏】"
date: 2021-10-14T15:39:00+08:00
author: "苏厚镇"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - 容器化
  - ClickHouse
  - Kubernetes
  - 源码
# 相关文章会通过keywords来匹配
keywords:
  - ClickHouse
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/211014_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20ClickHouse%20Operator%20%E5%8E%9F%E7%90%86%E8%A7%A3%E6%9E%90/0.png
---
本篇将基于 Operator 基本概念和源码解析，深度解析 ClickHouse Operator 运行原理。
<!--more-->
>作者：苏厚镇 青云科技数据库研究工程师
>从事 RadonDB ClickHouse 相关工作，热衷于研究数据库内核。 

通过《ClickHouse on K8s 部署篇》，对比了 RadonDB ClickHouse 集群在 Kubernetes 中部署的几种方案，表明使用 Operator 进行部署和管理是最方便快捷的。

那么到底什么才是 Operator，Operator 又是如何与 Kubernetes 进行协同工作的，Operator 的代码逻辑又是怎样的？本篇将基于 Operator 基本概念和源代码解析，深度解析 ClickHouse Operator 运行原理。

# 什么是 Operator？

在 Kubernetes 官方文档[[1]](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)中，对 Operator 的定义如下：

>Operators are software extensions to Kubernetes that make use of custom resources to manage applications and their components. Operators follow Kubernetes principles, notably the control loop. 

**简单来说：Operator = 定制资源 + 控制器。**

那么定制资源和控制器又是什么呢？

## 定制资源

在 Kubernetes 官方文档[[1]](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)中，对定制资源的定义如下：

>*Custom resources* are extensions of the Kubernetes API.
>   It represents a customization of a particular Kubernetes installation. 

Kubernetes 提供了一系列的资源，包括 Statefulset、Service、Configmap 等。但是这些资源并不能完全满足使用需求，例如在 K8s 中部署 ClickHouse 应用时，需定制一个 ClickHouse 应用资源。

Kubernetes 提供了两种方式向集群中添加定制资源：

* CRD：无需编程。K8s 从 1.7 版本增加了 CRD 来扩展 API，通过 CRD 可以向 API 中增加新资源类型，无需修改 K8s 源码或创建自定义的 API server，该功能大大提高了 Kubernetes 的扩展能力。
* API 聚合：需要编程。但支持对 API 行为进行更多的控制，例如数据如何存储以及在不同 API 版本间如何转换等。

ClickHouse Operator 在定制资源方面，选用了 CRD 方式添加定制资源。

但是使用 CRD 定制资源后，仅仅是让 Kubernetes 能够识别定制资源的身份。创建定制资源实例后，Kubernetes 只会将创建的实例存储到数据库中，并不会触发任何业务逻辑。在 ClickHouse 数据库保存定制资源实例是没有意义的，如果需要进行业务逻辑控制，就需要创建**控制器**。

## 控制器

Controller 的作用就是监听指定对象的新增、删除、修改等变化，并针对这些变化做出相应的响应，关于 Controller 的详细设计，可以参考 Harry (Lei) Zhang 老师在 twitter 上的分享，基本架构图如下：

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/211014_%E5%AE%B9%E5%99%A8%E5%8C%96%20%7C%20ClickHouse%20Operator%20%E5%8E%9F%E7%90%86%E8%A7%A3%E6%9E%90/1.png)

从图中可看出，定制资源实例的变化会通过 Informer 存入 WorkQueue，之后 Controller 会消费 WorkQueue，并对其中的数据做出业务响应。

Operator 其实就是图中除了 API Server 和 etcd 的剩余部分。由于 Client、Informer 和 WorkQueue 是高度相似的，所以有很多项目可以自动化生成 Controller 之外的业务逻辑（如 Client、Informer、Lister），因此用户只需要专注于 Controller 中的业务逻辑即可。

# ClickHouse Operator 代码解析

## 代码结构

```bash
.
├── cmd         # metrics_exporter 和 operator 的入口函数
│   ├── metrics_exporter
│   └── operator
├── config      # ClickHouse 和 ClickHouse Operator 的配置文件，会通过 ConfigMap 挂载到 pod
├── deploy      # 各类组件的部署脚本和部署 yaml 文件
│   ├── dev         # clickhouse operator 开发版本安装部署
│   ├── grafana     # grafana 监控面板安装部署
│   ├── operator    # clickhouse operator 安装部署
│   ├── operator-web-installer
│   ├── prometheus  # prometheus 监控部署
│   └── zookeeper   # zookeeper 安装部署
├── dev         # 各类脚本，如镜像生成、应用构建、应用启动等
├── dockerfile  # 镜像 dockerfile
├── docs        # 文档
├── grafana-dashboard
├── hack
├── pkg         # 代码逻辑
│   ├── announcer   # 通知器
│   ├── apis        # api, 定制资源类型
│   │   ├── clickhouse.radondb.com
│   │   └── metrics
│   ├── chop        # clickhouse operator 类型
│   ├── client      # 自动生成，作用参考上面的图
│   │   ├── clientset
│   │   ├── informers
│   │   └── listers
│   ├── controller  # controller 逻辑，主要关心部分
│   ├── model       # controller 调用 model
│   ├── util        # util
│   └── version     # version 信息
└── tests       # 自动测试代码
```
## 代码逻辑

>以下代码均为简化版，仅取核心逻辑部分。 

Controller 中主要的工作逻辑存在于 Worker 中。

### Run

Run 是 Worker 中整个工作逻辑入口。Run 是一个无休止的工作循环，期望在一个线程中运行。

```go
func (w *worker) run() {
    ...

    for {
        // 消费 workqueue，该方法会阻塞，直到它可以返回一个项目
        item, shutdown := w.queue.Get()
​
        // 处理任务
        if err := w.processItem(item); err != nil {
            utilruntime.HandleError(err)
        }
​
        // 后置处理，从 workqueue 中删除项目
        w.queue.Forget(item)
        w.queue.Done(item)
    }

    ...
}
```
### processItem

processItem 处理 item，根据 item 的类型决定需要调用的处理逻辑。

```go
func (w *worker) processItem(item interface{}) error {
    ...

    switch item.(type) {
        ...
        case *ReconcileChi:
            reconcile, _ := item.(*ReconcileChi)
            switch reconcile.cmd {
            case reconcileAdd:      // 处理定制资源的新增
                return w.updateCHI(nil, reconcile.new)
            case reconcileUpdate:   // 处理定制资源的修改
                return w.updateCHI(reconcile.old, reconcile.new)
            case reconcileDelete:   // 处理定制资源的删除
                return w.deleteCHI(reconcile.old)
            }
​
            utilruntime.HandleError(fmt.Errorf("unexpected reconcile - %#v", reconcile))
            return nil
        ...
    }

    ...
}
```
### updateCHI

以最常用的 updateCHI 逻辑为例，看一下其处理逻辑。

```go
// updateCHI 创建或者更新 CHI
func (w *worker) updateCHI(old, new *chop.ClickHouseInstallation) error {
    ...
​
    // 判断是否需要执行处理
    update := (old != nil) && (new != nil)
    if update && (old.ObjectMeta.ResourceVersion == new.ObjectMeta.ResourceVersion) {
        w.a.V(3).M(new).F().Info("ResourceVersion did not change: %s", new.ObjectMeta.ResourceVersion)
        return nil
    }
​
    // 判断 new chi 是否正在被删除
    if new.ObjectMeta.DeletionTimestamp.IsZero() {
        w.ensureFinalizer(new)      // 如果没有，则添加 finalizer 防止 CHI 被删除
    } else {
        return w.finalizeCHI(new)   // 如果删除，则无法继续执行操作，返回
    }
​
    // 归一化，方便后面使用
    old = w.normalize(old)
    new = w.normalize(new)

    actionPlan := NewActionPlan(old, new)   // 对比 old 和 new，生成 action plan
​
    // 进行一系列的标记，方便 reconcile 进行处理，如 add、update 等，代码省略
​
    // 执行 reconcile（需要深入理解）
    if err := w.reconcile(new); err != nil {
        w.a.WithEvent(new, eventActionReconcile, eventReasonReconcileFailed).
            WithStatusError(new).
            M(new).A().
            Error("FAILED update: %v", err)
        return nil
    }
​
    // 后置处理
    // 移除需要 delete 的项目
    actionPlan.WalkRemoved(
        func(cluster *chop.ChiCluster) {
            _ = w.deleteCluster(cluster)
        },
        func(shard *chop.ChiShard) {
            _ = w.deleteShard(shard)
        },
        func(host *chop.ChiHost) {
            _ = w.deleteHost(host)
        },
    )
    // 将新的 CHI 添加到监控中
    if !new.IsStopped() {
        w.c.updateWatch(new.Namespace, new.Name, chopmodel.CreatePodFQDNsOfCHI(new))
    }

    ...
}
```
### reconcile

updateCHI 中最重要的方法即 reconcile，该方法根据添加的标记做实际的处理。 

```go
func (w *worker) reconcile(chi *chop.ClickHouseInstallation) error {
    w.a.V(2).M(chi).S().P()
    defer w.a.V(2).M(chi).E().P()
​
    w.creator = chopmodel.NewCreator(w.c.chop, chi) // cretea creator
    return chi.WalkTillError(
        // 前置处理
        // 1. 处理 CHI svc，即 svc/clickhouse-{CHIName}
        // 2. 处理 CHI configmap，即 configmap/chi-{CHIName}-common-{configd/usersd}
        w.reconcileCHIAuxObjectsPreliminary,
        // 处理集群
        // 1. 处理 Cluster svc，即 svc/cluster-{CHIName}-{ClusterName}，不过貌似没有？
        w.reconcileCluster,
        // 处理分片
        // 1. 处理 Shard svc，即 svc/shard-{CHIName}-{ClusterName}-{ShardName}，不过貌似没有？
        w.reconcileShard,
        // 处理副本
        // 0. 将副本从集群中解除
        // 1. 处理 Host Configmap，即 chi-{CHIName}-deploy-confd-{ClusterName}-{ShardName}-{HostName}
        // 2. 处理 Host StatefulSet，即 chi-{CHIName}-{ClusterName}-{ShardName}-{HostName}
        // 3. 处理 Host PV，即 chi-{CHIName}-{ClusterName}-{ShardName}-{HostName}
        // 4. 处理 Host svc，即 chi-{CHIName}-{ClusterName}-{ShardName}-{HostName}
        // 5. 解除 Host 的 add 状态
        // 6. 判断 Host 是否正常运行
        // 7. 将副本添加到集群中，如果 Host 出错，则回滚
        w.reconcileHost,
        // 后置处理
        // 1. 更新 CHI configmap，即 configmap/chi-{CHIName}-common-configd
        w.reconcileCHIAuxObjectsFinal,
    )
}
```
# 总结

至此，便揭开了 Operator 的神秘面纱。如果对 Operator 有更多兴趣，欢迎到 Github 代码库查看更多细节。

[1]. Kubernetes 官方文档 :  [https://kubernetes.io/docs/concepts/extend-kubernetes/operator/](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)

[2]. RadonDB ClickHouse Kubernetes :  [https://github.com/radondb/radondb-clickhouse-operator/tree/chronus](https://github.com/radondb/radondb-clickhouse-operator/tree/chronus)

