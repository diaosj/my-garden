---
title: null和undefined的区别
date: 2011-08-02 09:48:07
description: "Archived from my original Hexo blog."
tags: ["JavaScript"]
---
null是一个表示“无”的对象，转为数值时为0；undefined是一个表示“无”的原始值，转为数值时为NaN。

<!-- more -->

所以undefined一般用于表示“缺少值”。比如：

* 变量已被声明，但还没赋值。
* 调用函数时，未提供的参数。
* 对象没有赋值的属性。
* 函数没有返回值。

null表示“此处不该有值”。比如：

* 作为函数的参数，表示该参数不是对象。
* 作为对象原型链的终点。
