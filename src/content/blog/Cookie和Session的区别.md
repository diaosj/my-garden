---
title: "Cookie和Session的区别"
date: 2012-02-27 20:58:28
tags: HTTP
description: "Archived from my original Hexo blog."
---
* cookie是服务器通过HTTP响应头指示浏览器生成的，存在客户端；session是写在服务器上的文件。
* session写在服务器上，所以访问增多时会影响服务器性能。
* session id是写在cookie里面的。