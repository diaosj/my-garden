---
title: Redis源码阅读
date: 2015-06-04 22:57:27
description: "Archived from my original Hexo blog."
tags: ["Redis", "C", "数据结构"]
---
Redis里每个键值对都是由对象组成的。

* key总是一个string object。
* value可以是string object、list object、hash object、set object、sorted set object中的一种。

#源码结构

##启动入口

看/src/server.c文件。找到main()入口。可以看到，Redis一上来先取一些时间，设置随机数种子、散列函数种子、sentinel模式，初始化各种配置（调用initServerConfig()），解析配置文件，通过initServer()初始化，最后在aeMain()里干活。

##服务器模型

看/src/ae_epoll.c文件。在epoll上面再封装了一层。

#数据结构

##SDS

Redis构建了SDS（Simple Dynamic String）这个抽象类型，用之作为默认字符串表示。

<!-- more -->

```c
struct sdshdr {
    int len;     //记录buf中已使用字节的数量
    int free;    //记录buf中未使用字节的数量
    char buf[];  //保存字符串的字节数组
}
```

buf中与C保持一致，字符串以空字符结尾。这个空字符对使用者透明。这样做的好处是，SDS可以直接重用一部分C字符串函数库里面的函数。

可看出的影响：

1.C字符串获取长度需遍历，复杂度为O(N)；SDS复杂度为O(1)。

2.SDS API对SDS修改时，会先检查空间是否满足需求，不满足，先进行扩展，避免了C字符串容易产生的缓冲区溢出问题。

3.C字符串长度变化时每次需要重新分配内存；SDS通过空间预分配，减少了内存重新分配的次数。

##链表

链表节点。

```c
typedef struct listNode {
    struct listNode *prev;  //前置节点
    struct listNode *next;  //后置节点
    void *value;
} listNode;
```

链表结构。

```c
typedef struct list {
    listNode *head;
    listNode *tail;
    unsigned long len;
    void *(*dup)(void *ptr);             //节点值复制函数
    void (*free)(void *ptr);             //节点值释放函数
    int (*match)(void *ptr, void *key);  //节点值对比函数
} list;
```

可以看出：

1.获取prev和next的复杂度都是O(1)。

2.链表无环。

3.获得链表头节点、尾节点的复杂度为O(1)。

4.获取节点数量的复杂度为O(1)。

5.链表节点用void *指针来保存节点值，并且list结构有dup、free、match三个函数，所以链表可以用于保存各种不同的值。

##字典

Redis的数据库就是使用字典来作为底层实现的，对数据库的增删改查也是构建在对字典的操作之上的。

哈希表。

```c
typedef struct dictht {
    dictEntry **table;
    unsigned long size;
    unsigned long sizemask;  //哈希表大小掩码，用于计算索引值，总是等于size - 1
    unsigned long used;      //哈希表节点数量
} dictht;
```

table是一个数组，数组中每个元素都是一个指向dictEntry结构的指针，每个dictEntry结构保存着一个键值对。

哈希表节点。

```c
typedef struct dictEntry {
    void *key;
    union {
        void *val;
        uint64_t u64;
        int64_t s64;
    } v;
    struct dictEntry *next;  //解决冲突
} dictEntry;
```

字典。

```c
typedef struct dict {
    dictType *type;
    void *privdata;
    dictht ht[2];
    int rehashidx;
} dict;
```

type属性是一个指向dictType结构的指针，每个dictType结构保存了一簇用于操作特定类型键值对的函数。privdata属性保存了需要传给那些类型特定函数的可选参数。这两个属性是为创建多态字典而设置的。

```c
typedef struct dictType {
    unsigned int (*hashFunction)(const void *key);
    void *(*keyDup)(void *privdata, const void *key);
    void *(*valDup)(void *privdata, const void *obj);
    int (*keyCompare)(void *privadta, const void *key1, const void *key2);
    void (*keyDestructor)(void *privdata, void *key);
    void (*valDestructor)(void *privdata, void *obj);
} dictType;
```

ht属性是一个数组，由两个dictht哈希表组成。一般情况下使用ht[0]，ht[1]用于rehash。

rehashidx记录了rehash的进度，如果没有进行rehash，那么值是-1。

当字典被用作数据库的底层实现，或者哈希键的底层实现时，Redis使用MurmurHash2算法计算键的哈希值。

##跳表

大部分情况下，跳表的效率可以和平衡树媲美，且实现要比平衡树简单。Redis使用跳表作为有序集合键的底层实现之一，如果一个有序集合包含的元素数量比较多，或者有序集合中元素的成员是比较长的字符串时，Redis就会使用跳表。

跳表节点。

```c
typedef struct zskiplistNode {
    struct zskiplistLevel {
        struct zskiplistNode *forward;
        unsigned int span;
    } level [];
    
    struct zskiplistNode *backward;
    double score;
    robj *obj
} zskiplistNode;
```

跨度并不是用来遍历，遍历靠前进指针就可以完成了，跨度是用来计算rank的。

跳表。

```c
typedef struct zskiplist {
    struct skiplistNode *header, *tail;
    unsigned long length;
    int level;
} zskiplist;
```

其实仅靠多个跳表节点就可以实现一个跳表。但是由zskiplist的结构可知，使用这个结构可以让某些功能更方便，比如快速访问跳表的表头节点和表尾节点，或者快速获取跳表长度等。

##整数集合

#命令

Redis所支持的命令均存储于redis.c文件中的redisCommandTable数组中。结构体redisCommand的定义可见于redis.h文件。