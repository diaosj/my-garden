---
title: PHP引用对象实例化的新特性
date: 2011-11-12 09:19:23
tags: ["PHP"]
description: "Archived from my original Hexo blog."
---
在鸟哥博客上看到的，以前我们不能直接操作一个对象实例化的结果，只能把实例化结果先保存起来，然后再调用：

<!-- more -->

```php
$a = new Foo();
$a->bar();
```

现在在PHP5.4里面可以有这些写法：

```php
(new foo())->bar();
(new $foo())->bar;
(new $bar->y)->x;
(new foo)[0];
```

使用括号是一个好习惯。
