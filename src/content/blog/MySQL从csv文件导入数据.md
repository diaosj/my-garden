---
title: MySQL从csv文件导入数据
date: 2013-08-06 14:12:51
tags: ["MySQL"]
description: "Archived from my original Hexo blog."
---
要从一个csv文件里导数据到某张表中，表的结构如下：
<!--more-->

| Field           | Type         | Null | Key | Default           | Extra                       |
|:----:|:----:|:----:|:----:|:----:|:----:|
| id              | int(11)      | NO   | PRI | NULL              | auto_increment              |
| month           | date         | YES  |     | NULL              |                             |
| category_name   | varchar(255) | YES  |     | NULL              |                             |
| menu_name       | varchar(255) | YES  |     | NULL              |                             |
| position_name   | varchar(255) | YES  |     | NULL              |                             |
| position_num    | int(11)      | YES  |     | NULL              |                             |
| price           | int(11)      | YES  |     | NULL              |                             |
| start_date      | date         | YES  |     | NULL              |                             |
| end_date        | date         | YES  |     | NULL              |                             |
| sale_start_date | datetime     | YES  |     | NULL              |                             |
| sale_end_date   | datetime     | YES  |     | NULL              |                             |
| detail_url      | varchar(255) | YES  |     | NULL              |                             |
| ias_url         | varchar(255) | NO   |     | NULL              |                             |
| comments        | varchar(255) | YES  |     | NULL              |                             |
| type            | tinyint(1)   | YES  |     | 0                 |                             |
| source_type     | tinyint(1)   | YES  |     | 0                 |                             |
| is_check        | tinyint(1)   | YES  |     | 0                 |                             |
| page_url        | varchar(255) | YES  |     | NULL              |                             |
| create_time     | timestamp    | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |

Excel文件拿到手时字段已经排好顺序了，只是需要根据文件设置month字段。顺便提下，有个坑爹的小地方，mac上装的Excel 2007，将文件转成csv时不是utf-8编码。很早以前就遇到过这个问题。当时找到了一个解决办法，就是在Windows下用Excel转成csv文件，再用记事本打开，另存为时可以选择编码为utf-8。

##语法

```mysql
LOAD DATA [LOW_PRIORITY | CONCURRENT] [LOCAL] INFILE 'file_name.txt'
    [REPLACE | IGNORE]
    INTO TABLE tbl_name
    [FIELDS
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
        [ESCAPED BY 'char' ]
    ]
    [LINES
        [STARTING BY 'string']
        [TERMINATED BY 'string']
    ]
    [IGNORE number LINES]
    [(col_name_or_user_var,...)]
    [SET col_name = expr,...)]        
```

LOW_PRIORITY选项开启时，LOAD DATA语句会一直到没有其它client读表时才执行。

指定LOCAL时，文件会从client端读取，否则文件必须位于服务器主机上。漏掉的话会报权限错误。

别的选项，看字面意思就知道了。

具体执行的MySQL语句如下：
```mysql
LOAD DATA LOCAL INFILE '/Users/diaoshoujun/Downloads/list201409(1).csv'
INTO TABLE ads_schedule
CHARACTER SET utf8
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(category_name, menu_name, position_name, position_num, price, start_date, end_date, sale_start_date, sale_end_date, detail_url)
SET `month` = '2014-09-01'
```

翻文档时看到两句，顺便记在这里。

{% blockquote MySQL documentation http://dev.mysql.com/doc/refman/5.1/en/insert-speed.html %}
When loading a table from a text file, use **LOAD DATA INFILE**. This is usually 20 times faster than using **INSERT** statements.
{% endblockquote %}

{% blockquote MySQL documentation http://dev.mysql.com/doc/refman/5.1/en/select-into.html %}
The **SELECT ... INTO OUTFILE** statement is the complement of **LOAD DATA INFILE**.
{% endblockquote %}

最后感慨一句，记点笔记的时间都少了啊。
