---
title: "一行JavaScript代码"
date: 2014-10-13 10:07:26
description: "Archived from my original Hexo blog."
tags: ["JavaScript"]
---
今天看到一枚gist。作者的描述是“a tweet-sized debugger for visualizing your CSS layouts”。你们这些丧心病狂的人，不追求长，倒追求短……

先看代码：

```javascript
[].forEach.call($$("*"),function(a){a.style.outline="1px solid #"+(~~(Math.random()*(1<<24))).toString(16)})
```
<!--more-->

在浏览器的console中跑一下就能看到效果了。那这行代码做了哪些事？

#取元素
作者其实还给出了一个131字节的版本：

```javascript
[].forEach.call(document.querySelectorAll("*"),function(a){a.style.outline="1px solid #"+(~~(Math.random()*(1<<24))).toString(16)})
```

其实就是用document.querySelectorAll("*")代替了$$("*")。实际上，$$可以理解成console中document.querySelectorAll方法的别名。

#遍历
前面$$("*")取出了所有元素，这个结果是作为一个NodeList存在的，是一个类似数组的对象。说到类数组对象，更有名的一个就是函数的arguments。这些类似数组的对象是有length属性的，但是并没有实现Array的所有方法，所以要直接调用$$("*").forEach是错误的。但是我们可以通过call&apply的方式在这些对象上调用数组的方法。

```javascript
[].forEach.call($$("*"),function(element){ /* .... */ });
```

上面的写法中，[].forEach.call就等价于Array.prototype.forEach.call，这么写是为了短一点。通过前面的分析可知，这就是为了在NodeList上调用Array的forEach方法。

#染色
CSS的outline属性是在CSS盒子模型之外的，不会影响元素的size与其在layout中的position，所以这里使用outline。

注意到0xffffff就是2^24 - 1。所以我们生成一个0xffffff以内的随机数。但是Math.random返回的是一个浮点数，利用~~得到结果的整数部分，再转成16进制的形式。
