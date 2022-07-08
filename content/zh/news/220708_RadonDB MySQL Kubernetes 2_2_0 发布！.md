---
title: "RadonDB MySQL Kubernetes 2.2.0 发布！"
date: 2022-07-08T14:52:11+08:00
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/news/220708_RadonDB%20MySQL%20Kubernetes%202_2_0%20%E5%8F%91%E5%B8%83%EF%BC%81/0.png
---
欢迎社区小伙伴试用体验新版本，社区还有精美周边相送！
<!--more-->
# 摘要

RadonDB MySQL Kubernetes v2.2.0 于近日发布！该版本开始支持 MySQL 8.0，备份功能优化，并全面提升高可用稳定性。社区同步发起“新版试用赢周边”活动！

## 致谢

感谢 @runkecheng、@acekingke、@andyli029、@zhl003 、@hayleyling 提交的修改。

下载地址：https://github.com/radondb/radondb-mysql-kubernetes/releases

距离上一个版本 v2.1.4 已经过去三个月了。通过下载量分析可知，v2.1.4 较前几个版本受关注度大大增加。所以该版本也成了使用反馈最多的一个版本，这些反馈成为 v2.2.0 在功能性、易用性、稳定性和文档内容等方面提升的重要参考。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/220708_RadonDB%20MySQL%20Kubernetes%202_2_0%20%E5%8F%91%E5%B8%83%EF%BC%81/1.png)

另外，根据 Google 搜索结果可知，RadonDB MySQL Kubernetes 是目前最活跃的高可用 MySQL 集群 Operator 之一。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/220708_RadonDB%20MySQL%20Kubernetes%202_2_0%20%E5%8F%91%E5%B8%83%EF%BC%81/2.png)

项目不断活跃的同时，社区也在不断完善基础设施，在 Q2 上线了社区官网 [www.radondb.com](https://www.radondb.com)， 欢迎大家访问。

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/220708_RadonDB%20MySQL%20Kubernetes%202_2_0%20%E5%8F%91%E5%B8%83%EF%BC%81/3.png)

# 新版本功能一览

## 新特性

* **支持 MySQL 8.0**
    * 镜像 Percona 8.0.25（默认版本 5.7）
* **支持自定义备份**
    * 可以将集群数据备份到 S3 或者指定的卷
* **支持定时备份**
    * 可以用定时任务的方式，自动备份集群
* **增加集群恢复功能**
    * 现在可以基于备份创建新的集群
* **支持用户自定义 MySQL 参数**
    * 配置 `my.cnf` 更加灵活
* 集群服务端支持 TLS 加密
    * 客户端可以选择使用加密连接和服务端通信
* 增加自动适配参数的功能
    * 集群根据 Pod 的配额自动设置一些关键参数
* 增加 `custom resource` 参数自动校验
    * 自动检测不合法的参数
    * 例如，在 MySQL 8.0 中，不能在线修改 `lower_case_table_names` 参数
* 增加 `custom resource` 附加打印列
    * 例如，可以通过 `kubectl get clusername` 查看承担当前集群 Leader 角色的 Pod
* 增加备份状态记录
    * 支持查询集群的历史备份信息
## 优化

* **极大增强高可用性，故障转移更加可靠**
* 简化 Operator 日志内容，日志更加简洁和清晰
* 完善使用文档，并提供英文版本
## 修复

* 修复集群在启用 IPv6 环境下的适配问题
 

>注意：如果本地已经安装过历史版本，需要手动更新 CRD。
## 新版试用赢周边

值此新版本发布之际，社区邀请大家抢先试用新版本，多款社区周边等你领取。活动详情请扫描图中二维码或直接点击[活动页面](https://kubesphere.com.cn/forum/d/7623-radondb-mysql-kubernetes-220)

![](https://dbg-files.pek3b.qingstor.com/radondb_website/news/220708_RadonDB%20MySQL%20Kubernetes%202_2_0%20%E5%8F%91%E5%B8%83%EF%BC%81/4.jpeg)
