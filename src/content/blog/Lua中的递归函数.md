---
title: Lua中的递归函数
date: 2014-08-07 11:21:41
tags: ["Lua"]
description: "Archived from my original Hexo blog."
---
先说个容易犯的错误。

<!--more-->

下面这种写法是错误的。

```lua
local fact = function (n)
if n == 0 then return 1
  else return n*fact(n-1)
  end
end
```

错误就在于，Lua编译到fact(n-1)时，局部的fact尚未定义完，此时调用的是全局的fact。改正的写法如下：

```lua
local fact
fact = function (n)
if n == 0 then return 1
  else return n*fact(n-1)
  end
end
```

这还有个术语，叫前向声明（forward declaration）。

下面我们来看看尾调用。都知道尾调用不会耗费栈空间，所以一个程序可以拥有无数嵌套的尾调用。例如，调用下面的函数时，传入任何数字作为参数都不会造成栈溢出：

```lua
function foo (n)
  if n > 0 then return foo(n - 1) end
end
```

不过要仔细甄别是否是尾调用。标准就是看函数在调用之后是不是什么也不做。下面举几个反例，都不是尾调用：

```lua
function f(x) g(x) end		-- 必须丢弃g返回的临时结果
```

```lua
return g(x) + 1				-- 必须做一次加法
return x or g(x)			-- 必须调整为一个返回值
return (g(x))				-- 必须调整为一个返回值
```

一般来说，必须要符合“return <func>(<args>)”的形式。

```lua
return x[i].foo(x[j] + a*b, i + j)
```

尾调用的一大应用就是编写状态机。比如常见的迷宫游戏的例子：

```lua
function room1 ()
  local move = io.read()
  if move == "south" then return room3()
  elseif move == "east" then return room2()
  else
    print("invalid move")
    return room1()
  end
end

function room2 ()
  local move = io.read()
  if move == "south" then return room4()
  elseif move == "west" then return room1()
  else
    print("invalid move")
    return room2()
  end
end

function room3 ()
  local move = io.read()
  if move == "north" then return room1()
  elseif move == "east" then return room4()
  else
	print("invalid move")
	return room3()
  end
end

function room4 ()
  print("congratulations!")
end
```