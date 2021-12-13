---
title: "云原生 | 混沌工程工具 ChaosBlade Operator Pod 篇"
date: 2021-08-19T15:39:00+08:00
author: "丁源"
# weight从小到达排序，值越小越靠前
weight: 10
tags:
  - 云原生
  - Kubernetes
  - KubeSphere
  - ChaosBlade
# 相关文章会通过keywords来匹配
keywords:

picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/0.png
---
混沌工程工具 ChaosBlade Operator 系列第三篇，介绍五类 Pod 类测试场景。
<!--more-->
>作者：丁源 RadonDB 测试负责人
>负责 RadonDB 云数据库、容器化数据库的质量性能测试，迭代验证。对包括云数据库以及容器化数据库性能和高可用方案有深入研究。 

继《混沌工程工具 ChaosBlade Opeator 系列》的 [入门篇](/posts/210715_云原生-_-混沌工程工具-chaosblade-operator-入门篇/) 和 [Node 篇](/posts/210805_云原生-_-混沌工程工具-chaosblade-operator-node-篇/) 之后。本期将针对 Pod 类资源的应用场景进行测试，测试场景包括：

* 资源场景，比如删除 Pod
* 网络资源场景，比如网络延迟
* 文件系统异常场景
* 不可用异常场景
# | 实验环境

## 测试对象

基于 KubeSphere 平台的 RadonDB MySQL 容器化数据库进行测试。

RadonDB MySQL 部署说明请参见 《在 KubeSphere 中部署 RadonDB MySQL 集群》。

## 环境参数

|集群名称|主机类型|CPU|Memory|Total Disk|Node Counts|Replicate counts|Shard counts|
|:----|:----|:----|:----|:----|:----|:----|:----|
|KubeSphere|高可用类型|8C|16G|500GB|4|-|-|
|RadonDB MySQL|-|4C|16G|POD: 50G DataDir: 10 G|3|2|1|

测试环境部署完成后，即可从以下五大类场景做相应验证。

# 1. Pod 删除资源场景

## 1.1 测试目标

删除 ChaosBlade 命名空间下标签是 `chaosblade-tool-nhzds` 的 Pod。

## 1.2 开始测试

查看 Pod 状态。

```plain
$ kubectl get pod chaosblade-tool-nhzds -n chaosblade  -w
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/1.png)

查看 delete_pod_by_labels.yaml 中参数信息。

```plain
apiVersion: chaosblade.io/v1alpha1
kind: ChaosBlade
metadata:
  name: delete-two-pod-by-labelsspec:
  experiments:
  - scope: pod
    target: pod
    action: delete
    desc: "delete pod by labels"
    matchers:
    - name: labels
      value:
      - "demo-radondb-mysql-1"
    - name: namespace
      value:
      - "chaosblade"
    - name: evict-count
      value:
      - "2"
```
新建终端删除 Pod。
```plain
$ kubectl apply -f delete_pod_by_labels.yaml
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/2.png)

## 1.3 测试验证

查看测试状态。

```plain
$ kubectl get blade delete-pod-by-labels -o json
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/3.png)

查看测试结果。

可以看到 Pod 被删除并重启，结果符合预期。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/4.png)

KubeSphere 平台

# 2. Pod 网络延迟场景

## 2.1 测试目标

Pod 网络资源场景，比如网络延迟。

对 ChaosBlade 命名空间中，对 `demo-radondb-mysql-0`  Pod 的本地 3306 端口添加 3000 毫秒访问延迟，延迟时间上下浮动 1000 毫秒。

## 2.2 开始测试

配置 `delay_pod_network_by_names.yaml` 中参数信息。

```plain
apiVersion: chaosblade.io/v1alpha1
kind: ChaosBlade
metadata:
  name: delay-pod-network-by-names
spec:
  experiments:
  - scope: pod
    target: network
    action: delay
    desc: "delay pod network by names" #实验模型名称
    matchers:
    - name: names
      value:
      - "radondb-g4r992-radondb-postgresql-0" #测试对象pod名称
    - name: namespace
      value:
      - "chaosblade"      #namespace名称
    - name: local-port     
      value: ["5432"]     #pod本地端口6379      
- name: interface
      value: ["eth0"]     #接口eth0
    - name: time
      value: ["3000"]      #添加3000毫秒访问
    - name: offset
      value: ["1000"]      #延迟时间上下浮动1000毫秒
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/5.png)

配置后

保存为文件，并部署应用。

```plain
$ kubectl apply -f delay_pod_network_by_names.yaml
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/6.png)

查看部署状态。

```plain
$ kubectl get blade delay-pod-network-by-names -o json
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/7.png)

## 2.3 测试验证

获取测试 Pod IP。

```plain
$ kubectl get pod -l app=redis,role=master -o jsonpath={.items..status.podIP}

$ kubectl get pod kubectl get pod demo-radondb-mysql-0 -o wide
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/8.png)

进入观测 Pod。

```plain
$  kubectl exec -ti demo-radondb-mysql-1 /bin/bash
```
在 Pod 中安装 Telnet。
```plain
$ apt-get update && apt-get install -y telnet
```
获取测试时间，并分析测试结果。
```plain
$ time echo "" | telnet 10.10.131.182 3306
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/9.png)

可以看到访问实验 Pod 3306 端口的延迟为 3s 左右，结果符合预期。

# 3. Pod 网络丢包场景

## 3.1 测试目标

在 ChaosBlade 命名空间中，对 `demo-radondb-mysql-0` Pod 注入丢包率 100% 的故障，只针对 IP 为 192.168.0.18 的 pod 生效，也就是除 192.168.0.18 以外的 Pod 都能正常访问 `demo-radondb-mysql-0`。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/10.png)
针对指定 IP

## 3.2 开始测试

执行命令部署应用。

```plain
$ kubectl apply -f loss_pod_network_by_names.yaml
```
查看部署状态。
```plain
$ kubectl get blade loss-pod-network-by-names -o json
```
## 3.3 测试验证

获取测试 Pod IP。

```plain
$ kubectl get pod -l app=redis,role=master -o \
jsonpath={.items..status.podIP}10.42.69.44
```
进入观测 Pod，IP 为 10.42.69.42，设置丢包率 100%。
```plain
$ kubectl exec -it redis-slave-6dd975d4c8-lm8jz bash
```
Ping 测试 Pod IP。
```plain
$ ping 10.42.69.44
PING 10.42.69.44 (10.42.69.44) 56(84) bytes of data.
```
回显信息反馈 Ping 无响应。
进入观测 Pod，该 Pod 未被指定丢包。

```plain
$ kubectl exec -it redis-slave-6dd975d4c8-2zrkb bash
```
再次 Ping 测试 Pod IP。
```plain
$ ping 10.42.69.44

PING 10.42.69.44 (10.42.69.44) 56(84) bytes of data.64 
bytes from 10.42.69.44: icmp_seq=1 ttl=63 time=0.128 ms64 
bytes from 10.42.69.44: icmp_seq=2 ttl=63 time=0.128 ms64 
bytes from 10.42.69.44: icmp_seq=3 ttl=63 time=0.092 ms...
```
回显信息反馈 Ping 响应正常。测试结果符合预期。
# 4. Pod 文件系统 I/O 故障场景

## 4.1 测试准备

* 已部署 chaosblade-admission-webhook
* 已注入故障的 volume ，即设置 `mountPropagation` 为 **HostToContainer**。
* 已在 Pod 中添加了如下 annotations：
    * `chaosblade/inject-volume: "data"` 为需要注入故障的 volume name
    * `chaosblade/inject-volume-subpath: "conf" //volume`  为挂载的子目录
## 4.2 测试目标

在 Kubernetes 的 Pod 中注入文件系统 I/O 故障。

注意：此场景需要激活 `--webhook-enable` 参数。可在 ChaosBlad Operator 参数中添加 `--webhook-enable`，也可在部署数据库时指定 `--set webhook.enable=true`。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/11.png)

激活指定参数台

ChaosBlade webhook 会根据 Pod 的 annotation，注入 fuse 的 sidecar 容器：

* `chaosblade/inject-volume` 指明需要注入故障的 volume name，比如例子中的 data
* `chaosblade/inject-volume-subpath` 指明 volume 挂载路径的子目录
    * 上例中 volume 的挂载路径是 `/data`，子目录是 conf，则在 pod 内，注入I/O异常的目录是 `/data/conf`。
* 指定需要注入故障的 volume 需要指定 `mountPropagation：HostToContainer`
## 4.3 开始测试

部署测试 Pod。

```plain
$ kubectl apply -f io-test-pod.yaml
```
查看 sidecar 是否注入成功。
```plain
$ kubectl get pod test-7c9fc6fd88-7lx6b -n chaosblade
NAME                    READY   STATUS    RESTARTS   AGE
test-7c9fc6fd88-7lx6b   2/2     Running   0          4m8s
```
查看 pod_io.yaml 中参数信息。
```plain
apiVersion: chaosblade.io/v1alpha1
kind: ChaosBlade
metadata:
  name: inject-pod-by-labels
spec:
  experiments:
  - scope: pod
    target: pod
    action: IO
    desc: "Pod IO Exception by labels"
    matchers:
    - name: labels
      value:
      - "app=test"
    - name: namespace
      value:
      - "chaosblade"
    - name: method
      value:
      - "read"
    - name: delay
      value:
      - "1000"
    - name: path
      value:
      - ""
    - name: percent
      value:
      - "60"
    - name: errno
      value:
      - "28"
```
执行命令部署应用。
```plain
$ kubectl apply -f pod_io.yaml
```
## 4.4 测试验证

进入测试 Pod。

```plain
$ kubectl exec -it test-7c9fc6fd88-7lx6b bash
```
在 Pod 内读取指定目录中的文件。
```plain
$ time cat /data/conf/test.yaml
cat: read error: No space left on device
real    0m3.007s
user    0m0.002s
sys     0m0.002s

# 因为有重试，显示有 3s 的延迟

# 因为设置了 60% 的异常，所有还是有成功的情况

$ time cat /data/conf/test.yaml
123
real    0m0.004s
user    0m0.002s
sys     0m0.000s
```
结果分析文件读取异常，结果符合预期。在场景中对 Read 操作注入两种异常，异常率为 60%。
* 对 Read 操作增加 1s 的延迟
* 对 Read 操作返回错误 28
# 5. Pod 域名访问异常场景

## 5.1 测试目标

Pod 内访问指定域名异常。

## 5.2 开始测试

获取 Pod 名称，执行命令部署应用。

```plain
$ kubectl apply -f dns_pod_network_by_names.yaml
```
查看测试状态。
```plain
$ kubectl get blade dns-pod-network-by-names -o json
```
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/12.png)

## 5.3 测试验证

进入测试 Pod。

```plain
$ kubectl exec -ti demo-radondb-mysql-0 bin/bash
```
Ping 一个域名 [www.baidu.com](http://www.baidu.com)
```plain
$ ping www.baidu.com
```
查看并分析测试结果。
回显信息反馈 ping 无响应。可以看到访问指定域名 [www.baidu.com](http://www.baidu.com) 异常，结果符合预期。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210819_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Pod%20%E7%AF%87/13.png)

# | 结语

通过使用 ChaosBlade Operator 对 Kubernetes Pod 资源进行混沌工程测试，可得出如下结论：

对于 Pod 资源，ChaosBlade 的操作简单易懂且功能强大，通过模拟不同的故障，可以检验系统监控报警的时效性，也可以检验系统在遇到故障时的情况，对系统进行调整，从而完善系统架构，增加可用性。

本篇只是对于每种场景进行了简单的测试，而每个场景不止有一种测试方式，用户可以通过调整参数进行不同的测试。 

