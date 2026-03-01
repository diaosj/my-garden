---
title: Lua函数的变长参数举例
date: 2014-08-05 10:05:10
tags: ["Lua"]
description: "Archived from my original Hexo blog."
---
Lua中的函数可以接受不同数量的实参。

<!--more-->

来个简单的例子：

```lua
function add (...)
local s = 0
  for i, v in ipairs{...} do
    s = s + v
  end
return s
end

print(add(3, 4, 10, 25, 12))		--> 54
```

要跟踪某个函数调用可以这样：

```lua
function foo1 (...)
print("calling foo:", ...)
  return foo(...)
end
```

用于格式化输出的函数：

```lua
function fwrite (fmt, ...)
return io.write(string.format(fmt, ...))
end
```

注意固定参数要放在变长参数之前。

通常情况下，我们要遍历变长参数时，只需要使用{...}。不过若变长参数中一定要传nil的话，就需要使用select函数了。例如：

```lua
for i=1, select('#', ...) do
local arg = select(i, ...)
-- ...
end
```