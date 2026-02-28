---
title: "MySQL里的DESCRIBE/EXPLAIN"
date: 2013-09-06 21:02:39
tags: ["MySQL"]
description: "Archived from my original Hexo blog."
---
本来是想详细学一下EXPLAIN的用法，查下文档，意外地发现DESCRIBE和EXPLAIN竟然是同义词。以前一直用DESCRIBE获取表格结构信息，用EXPLAIN来分析查询语句。其实对于MySQL parser来说，两者完全等价。
<!--more-->

#获取table结构信息
要了解一个table中各列的信息，直接DESC table一下就好。这种情境下，DESC(RIBE)就是SHOW COLUMNS的简略版。

默认情况下，DESC列出了所有列的信息。当然也可以指明要描述的特定列。列名可以使用通配符“%”与“_”。

#语句分析
MySQL 5.6.3之前，EXPLAIN只能分析SELECT语句。现在能分析的语句涵盖了SELECT, DELETE, INSERT, REPLACE与UPDATE。

MySQL 5.6.5之后，可以用FORMAT指定输出的格式。TRADITIONAL还是表格的形式，而JSON格式则包含了extended和partition的信息。

##EXPLAIN
通过EXPLAIN可以检查是否加了索引，也可以检查优化器是否按最优的顺序join表。如果没有，可以使用SELECT STRAIGHT_JOIN强制优化器按指定的顺序join。

EXPLAIN对使用到的每张表生成一行信息。这些信息按照MySQL读表的顺序而列。MySQL是嵌套地处理JOIN的：先从第一张表取出一行，然后到第二张表中找到匹配的一行，然后是第三张表，依此类推；当所有的表都被处理后，MySQL将所选的列输出，并按table list往上游走，直到遇到还有其它匹配行的表，读入下一匹配的行，再往下游走一遍。

下面看下EXPLAIN的各个字段。

* id

	这个指的是SELECT的id。

* select_type

	SELECT的种类。

* table
* type

	join的种类。system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL.
	
	system指的是table只有一行的情况，是const的特例。
	
	const指的是最多只有一行匹配的情况，这种情况下只读取一次，优化器会将这行的值当成常数。将主键或唯一键的字段与一个常量对比时，type就会是const。
	
	eq_ref指的是对前一张表的每一行对应取出当前表的一行。当join用到索引且索引是PRIMARY KEY或者UNIQUE NOT NULL的情况就是eq_ref。
	
	与eq_ref类似，但取出不止一行时就是ref。
	
	fulltext意味着join使用了FULLTEXT索引。

* possible_keys

	MySQL可从中选取的索引。这一列的值与table在EXPLAIN结果中出现的顺序无关。也就是说，possible_keys中出现的值可能根本不会用到。如果这一列的值是NULL，那可能就要加索引了。

* key

	MySQL用到的索引。注意这一列有可能出现possible_keys以外的值。

* key_len
* rows

	MySQL认为必须要检查的行数。对于InnoDB来说，这个数值只是个估计值，不一定准。

* Extra

##EXPLAIN EXTENDED
多了一列filtered。

##EXPLAIN PARTITIONS
多了一列partitions。

