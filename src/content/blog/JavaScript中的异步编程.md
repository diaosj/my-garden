---
title: JavaScript中的异步编程
date: 2015-06-27 09:09:08
tags: JavaScript
description: "Archived from my original Hexo blog."
---
JavaScript的执行环境是单线程的，不用考虑资源同步、死锁等问题。但这带来一个很现实的问题，就是某个任务执行时间很长时，后面的任务都要干等着，用户看到的就是响应不能，这显然不能忍。

<!-- more -->

所以出现了异步。后面的任务不用等前一个跑得慢的任务跑完才开始执行。任务结束时执行的是自己的回调函数。下面我们看看异步的几种形式：

##回调

假设我们有3个函数要调用：

```javascript
f1();
f2();
f3();
```

如果f1耗时很久，且f2要在f1之后执行，我们可以用回调写成这样：

```javascript
function f1(callback){
    setTimeout(function (){
        console.log('this is function1');
        var i = 'i', l = 'love', y = 'you';
        if (callback && typeof(callback) === 'function') {
            callback(i, l, y);
        }
    }, 50);
}

function f2(a, b, c) {
    alert(a + ' ' + b + ' ' + c);
    console.log('this is function2');
}

function f3() {
    console.log('this is function3');
}

f1(f2);
f3();
```


