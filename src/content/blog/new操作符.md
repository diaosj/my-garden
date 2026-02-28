---
title: new操作符
date: 2011-08-02 10:02:32
description: "Archived from my original Hexo blog."
tags: ["JavaScript"]
---
1.创建一个空对象，并用this引用该对象，同时继承了该函数的原型。
2.属性和方法加入到this引用的对象中。
3.新创建的对象由this引用，最后隐式地返回this。

```javascript
var obj = {};
obj.__proto__ = Base.prototype;
Base.call(obj);
```
