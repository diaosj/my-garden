title: Nginx源码阅读
date: 2016-01-20 20:58:29
tags:
 - Nginx
 - C

---

#启动流程

main函数执行过程：

<!-- more -->
* ngx\_get\_options()解析命令参数
* ngx\_time\_init()初始化时间，ngx\_cached\_time也在这里
* ngx\_log\_init()初始化日志
* 清零ngx\_cycle，并为ngx\_cycle.pool创建1024B的内存池
* ngx\_save\_argv()保存命令行参数至全局变量ngx\_os\_argv、ngx\_argc、ngx\_argv中
* ngx\_process\_options()初始化字段
* ngx\_os\_init()初始化系统相关变量
* ngx\_crc32\_table\_init()初始化CRC表（后续的CRC校验通过查表进行，效率高）
* ngx\_add\_inherited\_sockets()继承sockets
* 初始化每个module的index，并计算ngx\_max\_module
* ngx\_init\_cycle()进行初始化
* 若有信号，进入ngx\_signal\_process()处理，调用ngx\_init\_signals()初始化信号；若无信号，继承sockets，设置守护进程标识，ngx\_daemon()创建守护进程
* ngx\_create\_pidfile()创建进程记录文件
* 进入程序主循环：若为NGX\_PROCESS\_SINGLE=1模式，则调用ngx\_single\_process\_cycle()进入进程循环；否则为master-worker模式，调用ngx\_master\_process\_cycle()

##ngx\_pool\_s

Nginx的内存池。每个工作线程都会有一个。内存池的分配原理看ngx\_palloc方法。

##ngx\_cycle\_s

每个工作进程都会维护一个。

#数据结构

##ngx\_str\_t

加上了长度的字段。

```c
typedef struct {
    size_t	len;
    u_char	*data;
} ngx_str_t;
```

定义时，调用一下宏。

```c
#define ngx_string(str)	{sizeof(str) - 1, (u_char *) str }
```

##ngx\_queue\_t

双向链表。

```c
typedef struct ngx_queue_s ngx_queue_t;

struct ngx_queue_s {
    ngx_queue_t 	*prev;
    ngx_queue_t	*next;
};
```

ngx\_queue\_t只保存指针，那么数据呢？看一下数据获取的方法：

```c
#define ngx_queue_data(q, type, link) (type *) ((u_char *) q - offsetof(type, link))
```

##ngx\_array\_t

数组定义。

```c
typedef struct {
    void			*elts;
    ngx_uint_t	nelts;
    size_t		size;
    ngx_uint_t	nalloc;
    ngx_pool_t	*pool;
} ngx_array_t;
```

可见数组是结合内存池使用的，看下数组如何创建：

```c
ngx_array_t *ngx_array_create(ngx_pool_t *p, ngx_uint_t n, size_t size) {
    ngx_array_t *a;
    
    a = ngx_palloc(p, sizeof(ngx_array_t));
    if (a == NULL) {
        return NULL;
    }
    
    if (ngx_array_init(a, p, n, size) != NGX_OK) {
        return NULL;
    }
    
    return a;
}
```

##ngx\_list\_t

数组加链表的结合体。

```c
typedef struct ngx_list_part_s ngx_list_part_t;

struct ngx_list_part_s {
    void					*elts;
    ngx_uint_t			nelts;
    ngx_list_part_t		*next;
};

typedef struct {
    ngx_list_part_t		*last;
    ngx_list_part_t		part;
    size_t				size;
    ngx_uint_t			nalloc;
    ngx_pool_t			*pool;
} ngx_list_t;
```

##ngx\_table\_elt\_t

hash表的一个元素。

```c
typedef struct {
    void			*value;
    u_short		len;
    u_char		name[1];
} ngx_hash_elt_t;
```

顺便提一句，nginx用的是开放地址法，会往右查找空闲的bucket。因为它其实假设了hash表不会占用太多的数据和空间。

##ngx\_rbtree\_t

典型的红黑树。

```c
typedef struct ngx_rbtree_node_s ngx_rbtree_node_t;

struct ngx_rbtree_node_s {
    ngx_rbtree_key_t		key;
    ngx_rbtree_node_t		*left;
    ngx_rbtree_node_t		*right;
    ngx_rbtree_node_t		*parent;
    u_char					color;
    u_char					data;
};

typedef struct ngx_rbtree_s ngx_rbtree_t;

typedef void (*ngx_rbtree_insert_pt) (ngx_rbtree_node_t *root, ngx_rbtree_node_t *node, ngx_rbtree_node_t *sentinel);

struct ngx_rbtree_s {
    ngx_rbtree_node_t		*root;
    ngx_rbtree_node_t		*sentinel;
    ngx_rbtree_insert_pt	insert;
};
```

#内存管理

内存的申请最终调用的是malloc函数，ngx\_calloc在调用ngx\_alloc后，用memset来填0。

自己开发模块时，不要直接使用ngx\_malloc/ngx\_calloc，否则要自己管理内存的释放，可以使用ngx\_palloc。

#master进程

在ngx\_master\_process\_cycle()函数中。

启动过程：

* 阻塞信号
* 设置进程名称
* 启动工作进程
* 启动cache管理进程
* 进入循环处理信号

master工作过程：

* 设置worker退出等待时间
* 挂起，等待新的信号
* 更新时间
* 如果有worker因为SIGCHLD退出，则重启worker
* master退出
* 处理SIGTERM
* 处理SIGQUIT，关闭socket
* 处理SIGHUP
* 处理重启
* 处理SIGUSR1，重新打开所有文件
* 处理SIGUSR2，热代码替换，执行新程序
* 处理SIGWINCH

#worker进程

* ngx\_start\_worker\_processes()
* 进程相关结构初始化
* fork子进程
* 设置ngx\_processes[s]相关属性
* ngx\_pass\_open\_channel(cycle, &ch)通知子进程新进程创建完毕
* ngx\_worker\_process_init()初始化
* ngx\_channel\_handler()处理管道信号
* 处理相关信号

            
