title: "C++中的const pointer"
date: 2012-07-27 10:59:41
tags: C++

---
关于细节的小小整理。
<!--more-->

C++中，对于指针，我们可以制定它本身是const，或者它所指的数据是const，或者两者都是，或者两者都不是：

```c++
char greeting[] = "Hello";
char *p = greeting;//non-const pointer, non-const data
const char *p = greeting;//non-const pointer, const data
char * const p = greeting;//const pointer, non-const data
const char * const p = greeting;//const pointer, const data
```

仔细一点就会发现：const出现在星号左边，说明指针所指的内容是常量；const出现在星号右边，说明指针本身是常量。而当指针所指的内容为常量时，const与类型孰先孰后是没有差别的。将无同。

```c++
const char *p = greeting;
char const *p = greeting;
```