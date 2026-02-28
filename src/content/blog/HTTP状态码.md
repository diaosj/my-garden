---
title: "HTTP状态码"
date: 2012-03-27 20:57:52
tags: HTTP
description: "Archived from my original Hexo blog."
---
在推上看到有人这么描述HTTP状态码的本质，笑死了，好精准：

* 1xx: hold on
* 2xx: here you go
* 3xx: go away
* 4xx: you fucked up
* 5xx: I fucked up

<!--more-->

下面分别解释几个常见状态码。

#Hold on

#Here you go
##200 OK
请求已成功，请求所希望的响应头或数据体将随此响应返回。

#Go away
##304 Not Modified
如果客户端发送了一个带条件的GET请求且该请求已被允许，而文档的内容（自上次访问以来或者根据请求的条件）并没有改变，则服务器应当返回这个状态码。

304响应禁止包含消息体，因此始终以消息头后的第一个空行结尾。

#You fucked up
##403 Forbidden
服务器已经理解请求，但是拒绝执行它。

##404 Not Found

#I fucked up
##500 Internal Server Error
