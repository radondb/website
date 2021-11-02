---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
author: "作者"
# weight从小到达排序，值越小越靠前
weight: 2
tags:
# 相关文章会通过keywords来匹配
keywords:
  - please input keyword or delete it
# 封面
picture: /images/intro-poster.png
# 摘要和内容之间的 <!--more--> 分隔符是必须的
---
This is summary.
<!--more--> 
# title