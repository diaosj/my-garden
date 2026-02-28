---
title: "MySQL中的sql_slave_skip_counter"
date: 2013-10-09 09:02:40
tags: ["MySQL"]

description: "Archived from my original Hexo blog."
---
有一台slave只配了部分表的同步，今天发现同步报错，卡在了Update A Join B这种语句上。slave上有A无B。先跳过了这一句：

```mysql
SET GLOBAL sql_slave_skip_counter = 1
```

注意这里跳过的是一个event group。

不过显然的，长期下去A表的数据会越来越不一致的。
