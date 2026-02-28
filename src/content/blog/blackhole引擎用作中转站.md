---
title: "blackhole引擎用作中转站"
date: 2015-03-17 12:21:46
description: "Archived from my original Hexo blog."
tags: ["MySQL"]
---
#引擎
BLACKHOLE存储引擎是将进来的数据全都扔掉，所有的查询永远返回一个空集，但该记的log还是全都记的。相当于只打卡不做事。创建一个BLACKHOLE的表时，MySQL server在数据库目录下创建一个对应的.frm格式文件，除此之外没有对应的文件了。
<!--more-->

#场景
假设已有一个Master，一个Slave，配好了源源不断的同步。（嗯，我成语用得真是活灵活现。）现在有一个Remote，我希望将repl_table_201501..repl_table_201512这些月表都同步到Remote机器上。

出于容灾的考虑，Master和Slave上面binlog都是完备的。考虑到以下两点原因，直接加同步是不成立的：首先，Master是在生产环境下，最好不要在战斗的时候动手术；其次，binlog的量太大，全往网络上塞的行为太不环保。

这时，我们可以在Slave的机器上加一个名为Blackhole的实例，作为Slave的"Slave"与Remote的"Master"，实现一道滤网的作用。该实例中只有需要同步的表，且存储引擎都设为BLACKHOLE。这样，相当于只将需要的那部分binlog移到Remote上。

#步骤


##新实例
知道的启动MySQL实例的方式大致有3种：

* 使用service：service mysqld start
* 使用mysqld：/etc/init.d/mysqld start
* 使用mysqld_safe：mysqld_safe &

另外mysql_multi的套路待研究。因为不希望影响到之前的实例，这里使用最简单的第三种。

先看一下现在服务器上有哪些实例。

```bash
ps aux | grep mysql
```

然后新建个blackhole目录。初始化。

```bash
/usr/local/mysql/scripts/mysql_install_db --basedir=/usr/local/mysql --datadir=/path/to/blackhole --user=mysql
```

新建my.cnf文件，修改以下几个参数：

```
datadir = /path/to/blackhole
port = 3309
server-id = 4
```

其它的，看情况便宜行事。

启动blackhole实例：

```bash
mysqld_safe --defaults-file=/path/to/blackhole/my.cnf --pid-file=/path/to/blackhole/mysql.pid &
```

验证一下：

```bash
ps aux | grep 3309
```

要连的话：

```bash
mysql -h127.0.0.1 -P3309
```

注意，这里有个坑。-h参数不指明是127.0.0.1时可能默认用socket连接，也许你连上的不是你所想的实例。你以为你以为的就是你以为的？

##同步配置
分别修改Slave、Blackhole、Remote的my.cnf文件。
以Blackhole为例，作为Remote的"Master"：

```
log-slave-updates   = 1
log-bin             = mysql-bin
log-bin_index       = mysql-bin.index
binlog_format       = mixed
binlog_cache_size   = 1M
expire_logs_days    = 3
log-bin-trust-function-creators

binlog_ignore_db = information_schema
binlog_ignore_db = mysql
binlog_ignore_db = performance_schema
binlog_ignore_db = test
```

log-bin选项给出了二进制日志产生的所有文件的基本名。

log-bin-index选项给出了二进制索引文件的文件名，这个索引文件保存了所有binlog文件的列表。

作为Slave的"Slave"：

```
relay-log-index = mysql-relay-bin_index
relay-log       = mysql-relay-bin

replicate-wild-do-table = database.repl_table_20%
replicate-do-table = database.repl_table
```

另外两边的my.cnf文件类似配置一下。

Slave上要给Blackhole开一个复制的账号，Blackhole上也要给Remote开一个同步的账号：

```mysql
CREATE USER repl_user;
GRANT REPLICATION CLIENT, REPLICATION SLAVE ON *.* TO repl_user@'ip' IDENTIFIED BY 'password';
```

##数据
要使前面修改的配置生效必须重启各个实例。重启之前，我们要注意到，现在Master和Slave上的同步还在跑着，为了保证数据一致，我们修改Slave的my.cnf文件：

```
skip-networking
```

然后重启各个实例。这时Slave是处于“静止”的状态，没有数据插入。

将要同步的repl_table_201501..repl_table_201512这些月表dump出来。

```bash
mysqldump -p -d database --table repl_table > table_struct.sql
mysqldump -p -t database repl_table > table_data.sql
```

确定binlog位置。

```mysql
SHOW SLAVE STATUS\G
```

然后注释掉my.cnf中的skip-networking。重启，Slave正常运行。

Blackhole上建表，注意存储引擎都是BLACKHOLE。然后CHANGE MASTER TO之前记录的binlog位置。

Remote上导入数据。CHANGE MASTER TO Blackhole上。

这样就完成了。注意测试。

#后续
如果有别的表需要追加同步，遵循以下步骤即可：

* 停掉Slave：stop slave
* 导出Slave上的表结构和数据
* 修改Blackhole的my.cnf，增加同步，重启
* 表结构改为BLACKHOLE，导入Blackhole
* 表结构导入Remote
* 表数据导入BLACKHOLE
* 开启Slave：start slave
