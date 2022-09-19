---
title: "RadonDB MySQL Kubernetes 2.2.1 发布！"
date: 2022-08-25T14:52:11+08:00
picture: https://dbg-files.pek3b.qingstor.com/radondb_website/news/220825_RadonDB%20MySQL%20Kubernetes%202.2.1%20%E5%8F%91%E5%B8%83%EF%BC%81/%E9%A1%B9%E7%9B%AE%E5%8F%91%E7%89%88%E5%B0%81%E9%9D%A2.png
---
欢迎社区小伙伴试用体验新版本！
<!--more-->
[RadonDB MySQL Kubernetes](https://github.com/radondb/radondb-mysql-kubernetes) 于近日正式发布新版本 [2.2.1](https://github.com/radondb/radondb-mysql-kubernetes/releases/tag/v2.2.1)。该版本主要在用户管理、高可用组件等进行了优化，并修复一些问题。

### 致谢

感谢 @runkecheng @acekingke @zhl003 @qianfen2021 @hayleyling  提交的修改。

# 新版本功能一览
- 支持自动修复物理节点宕机导致的事务错误
- 支持 NFS 存储的定时备份功能
- 支持创建超级用户
- 支持指定用户 SSL 类型


# 2.2.1 版本说明


## 新功能

- 新增 [Xenon](https://github.com/radondb/xenon) 容器 PreStop 脚本超时限制（#612）
- 支持通过自定义资源创建超级用户（#601）
- 支持通过用户管理修改用户密码（#585）
- 支持创建用户时指定该用户的 SSL 配置(#575）
- Xenon 容器新增管理脚本 xenonchecker（#596 #600）
- 防止和自动修复领导者 Pod 所在的物理节点因重启或者掉电造成错误事务的问题（#597）


## 优化增强

- 增强 GitHub CI 代码检查功能（#613）
- 修改 Xenon 领导者降级时所运行的钩子脚本的超时时间（#605）
- 优化 E2E 测试代码 #344（#466）
- 增加定时备份中英文文档 #564（ #582 #593）
- 优化用户管理中英文文档 #564（#610 #611）


## 问题修复

- 去掉了 MySQL 异步 IO 配置参数，解决了某些不支持异步 IO 的系统无法启动 MySQL 的问题 #576（#577）
- 修复了删除集群时不删除备份自定义资源的问题 #570（#581）
- 修复了 NFS 备份失败时不记录状态的问题（#643）

欢迎大家下载体验！

# 版本预告

下一个版本将会是 2.3.0，以下是该版本将支持的功能：
- 支持指定 MySQL 版本
- 支持从特定 pod 进行 rebuild
- 支持用户自定义初始化脚本
- 支持 Helm Chart 部署集群
- 支持从指定配置创建集群