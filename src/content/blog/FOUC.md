---
title: FOUC
date: 2015-07-02 09:31:56
tags: ["CSS"]
description: "Archived from my original Hexo blog."
---
即Flash Of Unstyled Content，文档样式闪烁。举个例子：

```css
<style type="text/css" media="all">@import "../fouc.css";</style>
```

原因就是IE先加载整个HTML文档的DOM，然后再去导入CSS文件，这就产生了一段没有样式的空窗期。解决办法么，就是在<head>中加入<link>就好了。
