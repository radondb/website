# RadonDB 社区官网
一个基于[Hugo](https://gohugo.io/)开发的网站。

Hugo开发入门可以学习入门文档[Hugo入门](./content/zh/posts/Hugo入门.md)

# 文件目录介绍
``` shell
├── archetypes          # 命令行生成md文件的模版，hugo new posts/*.md
|   └── default.md
├── assets              # css和js资源，图片放到static/images
|   ├── js
|   └── sass
├── config/_default     # 配置
|   ├── config.yaml       # 全局配置
|   ├── languages.yaml    # 语言配置
|   ├── menus.zh.yaml     # 导航栏语言化配置
|   └── params.yaml       # 全局参数配置
├── content/zh          # md文件，也就是文章存放目录。zh文件夹下是中文的文章，en文件夹下是英文的文章
|   └── news            # 新闻列表
|   |   ├── _index.md     # 对应list.html模板渲染
|   |   └── cic_2020.md   # 新闻文章
|   ├── posts           # 技术博客列表
|   |   ├── _index.md     # 对应list.html模板渲染
|   |   └── Hugo入门.md    # 博客文章
|   └── projects        # 开源项目
|   |   └── mysql.md      # mysql开源项目内容
|   └── tags            # 分类标签
|   |   └── devops        # devops标签
|   |   |   └── _index.md   # devops内容
|   └── about.md        # 关于我们 页面
├── i18n                # 多语言翻译
|   ├── en.yaml           # 英文翻译
|   └── zh.yaml           # 中文翻译
├── layouts             # html模板
|   ├── _default
|   |   ├── baseof.html  # 基础模板，将各个局部模板拼接起来
|   |   ├── single.html  # 单页面模板，优先级最低
|   |   └── list.html
|   ├── page             # 单页面模板文件夹
|   |   └── about.html     # 关于我们页面
|   ├── partials         # 布局模板，通过{{ partial "page-header.html" . }}引用
|   |   ├── page-header.html
|   |   ├── site-header.html
|   |   ├── site-footer.html
|   |   ├── site-navigation.html
|   |   └── site-style.html
|   ├── posts            
|   |   ├── section.html   # 技术博客列表页面
|   |   └── single.html    # 技术博客详情页面
|   ├── 404.html
|   ├── index.html       # 一般定义为main，即header、main、footer布局
└── static               # 静态文件
    ├── images             # 大部分图片放在这里
    ├── css                # 可以引用外部的css和js
    └── js
```

# 快速开始
### 1. [安装Hugo](https://gohugo.io/getting-started/quick-start/#step-1-install-hugo)
```shell
brew install hugo
# or
port install hugo
# check the version
hugo version
```
### 2. 本地启动
```shell
hugo server -D
```
访问：http://localhost:1313
### 3. 创建博客
```shell
hugo new posts/my-first-post.md # 会在/content/zh/posts/目录下创建my-first-post.md文件
```

# 运营指引
## 1、创建和编辑博客
1. 在`/content/zh/posts/`目录下创建my-first-post.md文件（可以使用shell命令，或者下面的内容进行修改），如下：
```yaml
---
title: "title"
date: 2021-08-31T16:52:11+08:00
author: "作者"
# weight从小到达排序，值越小越靠前
weight: 2
tags:
  - devops
# 相关文章会通过keywords来匹配
keywords:
  - mysql
# 封面
picture: /images/intro-poster.png
# 摘要和内容之间的 <!--more--> 分隔符是必须的
---
摘要（This is summary）
<!--more--> 
md的内容（main content）
```
2. 三个短横线（---）之间是yaml格式的参数，修改对应的参数值
3. 在`/content/en/posts/`下创建英文文章，然后再编辑

## 2、插入图片
1. 将图片放在`static/images/posts/` + 博客名称 文件夹下
2. 使用绝对地址引用图片，如：
```markdown
在md文件中引入[图片](/images/posts/xtraBackup/post-img.png)
```

## 3、多语言

### 全局参数翻译
在`config/_default/languages.yml`文件中增加或者修改对应的参数的翻译，如：
```yaml
zh:
  contentDir: "content/zh/"
  languageName: "简体中文"
  title: "RadonDB 开源社区"
  weight: 10
  params:
    description: "一个面向云原生、容器化的数据库开源社区"
    kubesphereVideoPoster: "/images/intro-poster.png"
en:
  contentDir: "content/en/"
  languageName: "EN"
  title: "RadonDB OpenSource"
  weight: 20
  params:
    description: "An Open Source Community for Cloud-Native and Databases on Kubernetes"
```

### 全局导航翻译
在`config/_default/`目录下增加或者修改对应的导航的翻译，如：
menus.en.yaml
```yaml
# 主导航菜单
main:
  - identifier: projects
    name: "open source projections"
    weight: "1"
    url: "/projects"
  - name: "MySQL containerization"
    weight: '1'
    url: "/projects/mysql"
    parent: projects
```
### 其他文本翻译
1. 在`i18n/`目录下分别增加各个语言翻译词条，如：
i18n/en.yaml
```yaml
translations_id:
  other: "translations"
```
2. 在`layouts/`目录下的模板文件中使用代码`{{ i18n "translations_id" }}`引入词条

### 内部固定连接
固定连接使用`| relLangURL`管道，如：`<a href="{{ "/posts" | relLangURL }}">博客</a>`

### md文件翻译
在`content/en/`新增对应语言的翻译文档，文件名和目录结构与`content/zh/`保持一致

## 4、其他
1. 如果不知道某些参数是做什么的，建议在页面上通过`参数值`搜索，进行反向查找用途

# webhooks自动部署

# 欢迎提交PR

