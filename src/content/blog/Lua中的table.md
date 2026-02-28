---
title: Lua中的table
date: 2014-08-03 12:33:30
tags:
 - Lua
description: "Archived from my original Hexo blog."
---
table是Lua中仅有的数据结构。其实就是PHP里面说的associative array。Lua通过table来表示module、package和object。例如，当输入io.read的时候，其含义是“使用read作为key来索引io这个table”。

<!--more-->

table是一个动态分配的对象，程序仅持有一个对它们的引用，Lua在赋值时不会产生table的副本。

```lua
a = {}
a["x"] = 10
b = a
print(b["x"])	-->10
b["x"] = 20
print(a["x"])	-->20
a = nil
b = nil
```

注意，Lua中通常以1作为索引的起始值。

长度操作符“#”用于返回一个数组或线性表的最后一个索引值。

```lua
--打印所有行
for i=1, #a do
  print(a[i])
end
```

长度操作符的习惯用法：

```lua
print(a[#a])	--打印最后一个值
a[#a] = nil		--删除最后一个值
a[#a+1] = v		--将v添加到列表末尾
```

Lua将nil作为界定数组结尾的标志。所以数组中有空隙时，长度操作符会认为nil元素就是结尾标志。所以需要处理包含空隙的数组时，可以使用table.maxn，返回table的最大正索引数。