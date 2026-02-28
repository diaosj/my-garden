---
title: 设置一个过期时间严格为30分钟的session
date: 2012-01-11 19:13:15
description: "Archived from my original Hexo blog."
tags: ["PHP"]
---
在鸟哥博客上看到这么一道题，存一下鸟哥的讲解。

<!-- more -->

##第一种回答

最常见的一种回答是：设置session的过期时间，也就是session.gc_maxlifetime，这种回答是不正确的。原因如下：

1.首先，PHP是用一定概率运行session的gc的，也就是session.gc_probability和session.gc_divisor，默认值分别为1和100，即1%的机会，PHP会在一个session启动时，运行session.gc，不能保证到30分钟时一定会过期。

2.PHP使用一个文件来保存和一个会话相关的session变量，根据文件的修改时间来判断是否过期，如果先后设置了两个变量，那么前一个变量就不能在30分钟时被清理了。

3.PHP默认以/tmp作为session存储目录。如果不同的脚本具有不同的session.gc_maxlifetime数值，但是共享了同一个地方存储会话数据，那么具有最小数值的脚本会清理数据。

##第二种回答

设置session ID载体的过期时间，即session.cookie_lifetime。也不正确，因为这只能保证标准浏览器到期不会发送包含session ID的这个cookie，但通过构造请求的方式，仍然能使用这个session ID。

##第三种回答

使用Memcache，Redis。

##PHP正解

1.设置cookie和session的过期时间都为30分钟。

2.为每一个session值加一个timestamp，每次访问之前，判断时间戳。
