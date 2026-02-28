title: PHP tricks
date: 2011-04-02 15:40:54
tags: PHP

---
一些PHP编程的tips & tricks。

<!-- more -->

1.使用list一次性获取变量的值。

```php
list(, $mid) = explode(';', $str);
```

2.使用===NULL代替is_null。

3.警惕loose comparison。

说的就是switch和in_array。变量类型不一样时很容易出错。

```php
switch ($name) {
    case 'foo':
        break;
    case 'bar':
        break;
}
```

上面的例子中，如果$name是数字0，那么它能满足任何一条case。in_array中也是这样。

所以比较之前要把类型转换成期望的类型。

```php
switch (strval($name)) {
    case 'foo':
        break;
    case 'bar':
        break;
}
```

注意in_array有一个可选的参数，可以指定比较的严格程度。

4.switch的别致用法。

```php
if ($a) {
} else if ($b) {
} else if ($c || $d) {
}
```

可以改写成：

```php
switch (TRUE) {
    case $a:
        break;
    case $b:
        break;
    case $c:
    case $d:
        break;
}
```

5.交换两个变量的值，还是用亦或比较好，防止精度丢失或者溢出。

6.do{}while(0)妙用。

```php
if (true) {
} else if (true) {
} else {
}
```

可改成：

```php
do {
    if (true) {
        break;
    }
    if (true) {
        break;
    }
} while (0);
```

7.用FALSE表示操作产生错误，用NULL表示查询找不到。

