---
title: JavaScript惰性载入
date: 2015-07-25 10:11:19
tags:
 - JavaScript
description: "Archived from my original Hexo blog."
---
一个小trick，可以用于提高函数代码的性能。

<!--more-->

```javascript
var addEvents = (function (){
    if (document.addEventListener){
        return function (type, element, fun){
            element.addEventListener(type, fun, false);
        }
    } else if (document.attachEvent) {
        return function (type, element, fun) {
            element.attachEvent('on' + type, fun);
        }
    } else {
        return function (type, element, fun) {
            element['on' + type] = type;
        }
    }
})();
```