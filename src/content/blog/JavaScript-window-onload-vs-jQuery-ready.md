---
title: "JavaScript window.onload vs jQuery ready"
date: 2011-11-03 09:16:16
tags: ["JavaScript"]
description: "Archived from my original Hexo blog."
---
JavaScript中的onload事件不仅要等到DOM创建出来，而且要等所有的资源都加载完成。如果图片或媒体资源要花很长时间，那用户可能就得干等着。

jQuery中的ready()函数只等DOM树创建完成就好，所以执行会更快。

另外$(document).ready()可以在页面中使用多次，而onload只能独一份。
