---
title: "云原生 | 混沌工程工具 ChaosBlade Operator Node 篇"
date: 2021-08-05T15:39:00+08:00
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
  - 测试
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/0.png
---
接上期《[混沌工程工具 ChaosBlade Opeator 系列的入门篇](/posts/210715_云原生-_-混沌工程工具-chaosblade-operator-入门篇/)》，本期将使用 ChaosBlade Opeator 工具，针对 Node 类资源的应用场景进行测试。
<!--more-->
>作者：丁源 RadonDB 测试负责人
>负责 RadonDB 云数据库、容器化数据库的质量性能测试，迭代验证。对包括云数据库以及容器化数据库性能和高可用方案有深入研究。 

测试场景包括：

1. CPU 负载场景
2. 网络延迟场景
3. 网络丢包场景
4. kill 指定进程
5. stop 指定进程
# | 实验环境

## 测试对象

基于 KubeSphere 平台的 RadonDB MySQL 容器化数据库进行测试。

RadonDB MySQL 部署说明请参见 在 KubeSphere 中部署 RadonDB MySQL 集群。

## 环境参数

|集群名称|主机类型|CPU|Memory|
|:----|:----|:----|:----|
|KubeSphere|高可用类型|8C|16G|
|RadonDB MySQL|-|4C|16G|
|测试环境部署完成后，即可从以下五个针对节点的场景做相应验证。|    |    |    |

# 1. CPU 负载场景

## 1.1 测试目标

指定节点做 CPU 负载 80% 验证。

## 1.2 开始测试

配置 yaml 测试参数值。

```plain
apiVersion: chaosblade.io/v1alpha1
kind: ChaosBlade
metadata:
  name: cpu-lode
spec:
  experiments:
  - scope: node
    target: cpu
    action: fulllode
    desc: "increase node cpu load by names"  #实验模型名称
    matchers:
    - name: names
      value:
      - "worker-s001"  #测试对象 node 名称
    - name: cpu-percent
      value: "80"      #节点负载百分比
    - name: ip
      value:192.168.0.20      #节点负载百分比
```
选择一个节点，修改 `node_cpu_load.yaml` 中的 names 值。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/1.png)

## 1.3 测试验证

在 Node 节点，使用 top 命令可以看到节点 CPU 达到负载 80% 预期效果。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/2.png)

# 2. 网络延迟场景

## 2.1 测试准备

登录 Node 节点，使用 ifconfig 命令查看网卡信息，将系统默认的网卡名称指定到 `eth0`。

## 2.2 测试目标

指定节点 `worker-s001` 添加 3000 毫秒访问延迟，延迟时间上下浮动 1000 毫秒。

## 2.3 开始测试

选择一个节点，修改 `delay_node_network_by_names.yaml` 中的 names 值。对 `worker-s001` 节点访问丢包率 100%。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/3.png)

开始测试。

```plain
kubectl apply -f delay_node_network_by_names.yaml
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/4.png)

查看实验状态。

```plain
kubectl get blade delay-node-network-by-names -o json
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/5.png)

## 2.4 测试验证

从节点访问 Guestbook。

```plain
$ time echo "" | telnet 192.168.0.18
echo ""  0.00s user 0.00s system 35% cpu 0.003 total
telnet 192.168.1.129 32436  0.01s user 0.00s system 0% cpu 3.248 total
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/6.png)

停止测试。可以删除测试进程或者直接删除 blade 资源。

```plain
kubectl delete -f delay_node_network_by_names.yaml

kubectl delete blade delay-node-network-by-names
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/7.png)

# 3. 网络丢包场景

## 3.1 测试目标

指定节点注入丢包率 100% 的故障。

## 3.2 开始测试

选择一个节点，修改 `loss_node_network_by_names.yaml` 中的 names 值。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/8.png)

执行以下命令，开始测试。

```plain
$ kubectl apply -f loss_node_network_by_names.yaml
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/9.png)

执行以下命令，查看实验状态。

```plain
kubectl get blade loss-node-network-by-names -o json
```
## 3.3 测试验证

端口为 Guestbook nodeport 端口，访问实验端口无响应，但是访问未开启实验的端口可以正常使用。

获取节点 IP。

```plain
$ kubectl get node -o wide
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/10.png)

从实验节点访问 Guestbook - 无法访问。

```plain
$ telnet 192.168.0.20
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/11.png)

从非实验节点访问 Guestbook - 正常访问。

```plain
$ telnet 192.168.0.18
```
此外还可直接从浏览器访问地址，验证测试结果。
停止测试。可以删除测试进程或者直接删除 blade 资源。

```plain
kubectl delete -f delay_node_network_by_names.yaml

kubectl delete blade delay-node-network-by-names
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/12.png)

# 4. kill 指定进程

## 4.1 测试目标

删除指定节点上的 MySQL 进程。

## 4.2 开始测试

选择一个节点，修改 `kill_node_process_by_names.yaml` 中的 names 值。
![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/13.png)

执行以下命令，开始测试。

```plain
$ kubectl apply -f kill_node_process_by_names.yaml
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/14.png)

执行以下命令，查看实验状态。

```plain
kubectl get blade kill-node-process-by-names -o json
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/15.png)

## 4.3 测试验证

进入实验 node。

```plain
$ ssh 192.168.0.18
```
查看 mysql 进程号。
```plain
$ ps -ef | grep mysql
root     10913 10040  0 14:10 pts/0    00:00:00 grep --color=auto mysql
```
可以看到进程号发生了变化。
```plain
$ ps -ef | grep mysql
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/16.png)

MySQL 的进程号发生改变，说明被杀掉后，又被重新拉起。

停止测试。可以删除测试进程或者直接删除 blade 资源。

```plain
kubectl delete -f delay_node_network_by_names.yaml
kubectl delete blade delay-node-network-by-names
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/17.png)

# 5. stop 指定进程

## 5.1 测试目标

挂起指定节点上的 MySQL 进程。

## 5.2 开始测试

选择一个节点，修改 `stop_node_process_by_names.yaml` 中的 names 值。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/18.png)

执行以下命令，开始测试。

```plain
$ kubectl apply -f stop_node_process_by_names.yaml
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/19.png)

执行以下命令，查看实验状态。

```plain
kubectl get blade stop-node-process-by-names -o json
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/20.png)

## 5.3 测试验证

进入实验 node。

```plain
$ ssh 192.168.0.18
```
查看 mysql 进程号。
```plain
$ ps -ef | grep mysql
root     10913 10040  0 14:10 pts/0    00:00:00 grep --color=auto mysql
```
可以看到进程号发生了变化。
```plain
$ ps -ef | grep mysql
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/21.png)

MySQL 的进程号发生改变，说明被杀掉后，又被重新拉起。

停止测试。可以删除测试进程或者直接删除 blade 资源。

```plain
kubectl delete -f delay_node_network_by_names.yaml
kubectl delete blade delay-node-network-by-names
```

![](https://dbg-files.pek3b.qingstor.com/radondb_website/post/210805_%E4%BA%91%E5%8E%9F%E7%94%9F%20%7C%20%E6%B7%B7%E6%B2%8C%E5%B7%A5%E7%A8%8B%E5%B7%A5%E5%85%B7%20ChaosBlade%20Operator%20Node%20%E7%AF%87/22.png)

# | 结语

通过使用 ChaosBlade Operator 对 KubeSphere Node 资源进行混沌工程实验，可得出如下结论：

对于 Node 节点，ChaosBlade 依旧有简单的配置及操作来完成复杂的实验，可以通过自由组合，实现各种 Node 节点级别的复杂故障，验证 Kubernetes 集群的稳定性及可用性。同时当真正的故障来临时，由于早已模拟了各种故障情况，可以快速定位故障源，做到处变不惊，轻松处理故障。

