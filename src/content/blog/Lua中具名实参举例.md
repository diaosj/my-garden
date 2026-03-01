---
title: Lua中具名实参举例
date: 2014-08-07 10:45:27
tags: ["Lua"]
description: "Archived from my original Hexo blog."
---
Lua中参数传递机制是具有位置性的。所以只能通过传table来实现具名实参。下面举个例子，实在太像JavaScript了。

<!--more-->

```lua
function Window (options)
  if type(options.title) ~= "string" then
    error("no title")
  elseif type(options.width) ~= "number" then
    error("no width")
  elseif type(options.height) ~= "number" then
    error("no height")
  end

  __Window(options.title,
           options.x or 0,
           options.y or 0,
           options.width, options.height,
           options.background or "white",
           options.border)
end
```

注意最后border选项，默认值就为false，因为用的是nil嘛。