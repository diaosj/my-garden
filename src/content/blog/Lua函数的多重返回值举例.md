---
title: Lua函数的多重返回值举例
date: 2014-08-05 09:20:51
tags: ["Lua"]
description: "Archived from my original Hexo blog."
---
Lua的函数可以返回多个结果，假设有这么几个函数：

<!--more-->

```lua
function foo0() end
function foo1() return "a" end
function foo2() return "a", "b" end
```

#多重赋值
多重赋值时，Lua是尽量匹配，匹配不上的用nil补充：

```lua
x,y = foo2()			-- x="a", y="b"
x = foo2()				-- x="a"
x,y,z = 10,foo2()		-- x=10, y="a", z="b"
x,y = foo0()			-- x=nil, y=nil
x,y = foo1()			-- x="a", y=nil
x,y,z = foo2()			-- x="a", y="b", z=nil
x,y = foo2(), 20		-- x="a", y=20
```

#传入参数
函数作为别的函数调用的传入参数时，也是尽量匹配，不行则将返回值数量调整为1：

```lua
print(foo0())			-->
print(foo1())			--> a
print(foo2())			--> a b
print(foo2(), 1)		--> a 1
print(foo2() .. "x")	--> ax
```

#table构造式
table构造式，看函数调用是否是最后一个元素：

```lua
t = {foo0()}			-- t = {}
t = {foo1()}			-- t = {"a"}
t = {foo2()}			-- t = {"a", "b"}
t = {foo0(), foo2(), 4}	-- t[1] = nil, t[2] = "a", t[3] = 4
```

#return语句
return语句中，函数能返回所有的返回值。

函数调用若处在一对圆括号中，将只返回一个结果：

```lua
print((foo0()))			--> nil
print((foo1()))			--> a
print((foo2()))			--> a
```

#unpack函数

```lua
print(unpack{10, 20, 30}) --> 10 20 30
```

unpack一个重要用途就是用于generic call。

unpack是用C编写的预定义函数，但是也可以在Lua中用递归实现：

```lua
function unpack (t, i)
  i = i or 1
  if t[i] then
    return t[i], unpack(t, i + 1)
  end
end
```