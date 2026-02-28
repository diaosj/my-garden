title: ft-index源码阅读
date: 2016-01-21 10:32:53
tags:
 - MySQL
 - TokuDB

---
ft-index（Fractal Tree Index）是TokuDB引擎的索引数据结构。TokuDB号称写操作优于InnoDB，而读性能也近似InnoDB，这是由ft-index与B+树的结构决定的。另外ft-index天然支持在线修改DDL（Hot Schema Change）。

<!-- more -->

