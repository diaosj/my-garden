---
title: MySQL5.6中TIMESTAMP有变化
date: 2014-09-06 11:38:23
tags: ["MySQL"]

description: "Archived from my original Hexo blog."
---
之前的默认行为：

* TIMESTAMP默认为NOT NULL。设为NULL时则自动存储为当前timestamp。
* 第一个TIMESTAMP列，默认分配DEFAULT CURRENT_TIMESTAMP和ON UPDATE CURRENT_TIMESTAMP。
* 第二个TIMESTAMP列，默认分配'0000-00-00 00:00:00'。

<!--more-->
现在这些行为已被废弃。MySQL启动时会给出警告：

>[Warning] TIMESTAMP with implicit DEFAULT value is deprecated. Please use --explicit_defaults_for_timestamp server option.

要关闭警告，只要在my.cnf中加入
```vi
[mysqld]
explicit_defaults_for_timestamp=true
```