title: 姜博的SQL题
date: 2015-07-28 11:38:35
tags: MySQL

---
大半夜的，InsideMySQL君在群里发了一道题，具体可以去公众号上查看。

<!-- more -->

简单说，就是有一张订单表v_orders，有customer、price、orderdate三个字段。现在要得到每个客户每周产生的订单总额（周一到周日）。输出的结果要包含每周的起始与结束日期。

先展示一下我的错误答案：

```mysql
SELECT 
  customer, 
  SUBDATE(orderdate, WEEKDAY(orderdate)) week_start, 
  ADDDATE(orderdate, 6 - WEEKDAY(orderdate)) week_end, 
  SUM(price) 
FROM v_orders 
GROUP BY customer, YEAR(orderdate), WEEK(orderdate)
```

但WEEK函数不适合用来分组，遇到跨年就两眼一黑了。（对，这是看了答案才恍然大悟的。）

姜博的正解是引入了一个magic number，1900-01-01是周一，根据这个条件就可以进行分组。

```mysql
SELECT
  customer,
  DATE_ADD('1900-01-01', INTERVAL FLOOR(DATEDIFF(orderdate, '1900-01-01') / 7) * 7 DAY) AS week_start, 
  DATE_ADD('1900-01-01', INTERVAL FLOOR(DATEDIFF(orderdate, '1900-01-01') / 7) * 7 + 6 DAY) AS week_end,
  SUM(price)
FROM
  v_orders
GROUP BY customer, FLOOR(DATEDIFF(orderdate, '1900-01-01') / 7);
```

