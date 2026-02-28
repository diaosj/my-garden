---
title: Lua中的迭代器与泛型for
date: 2014-08-09 23:05:35
tags:
 - Lua
description: "Archived from my original Hexo blog."
---
迭代器就是一种可以遍历一种集合中所有元素的机制。在Lua中，通常用closure来实现迭代器。因为closure可以访问其外部环境中的局部变量（被称作non-local variable），所以可以通过这个记住每次遍历到的位置。而由此我们也可以想到，一个closure结构通常涉及到两个函数，一个closure本身以及创建closure的工厂函数。

<!--more-->

#一个简单的迭代器

```lua
function values(t)
  local i = 0
  return function() i = i + 1; return t[i]  end
end
```

这个迭代器返回每个元素的值。

