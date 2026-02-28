---
title: "用pass by reference to const取代pass by value"
date: 2012-08-24 17:42:10
tags: [C++]
description: "Archived from my original Hexo blog."
---
缺省情况下，C++以传值方式将对象传入或传出函数。这个特性继承自C。

<!--more-->

也就是说，调用函数时，函数的参数以真身的拷贝进行初始化，而函数的调用者收到的也是函数返回值的一个拷贝。拷贝是由对象的拷贝构造函数生成的。所以，pass by value是一项代价很大的操作。

举个例子：

```cpp
class Person {
    public:
        Person();
        virtual ~Person();
    private:
        std::string name;
        std::string address;
};
class Student: public Person {
    public:
        Student();
        ~Student();
    private:
        std::string schoolName;
        std::string schoolAddress;
};
```

有了这两个类，现在看下面的代码：

```cpp
bool validateStudent(Student s);
Student plato;
bool platoIsOK = validateStudent(plato);
```

由于是传值方式，调用validateStudent函数时，Student的拷贝构造函数被调用，用plato来初始化参数s，而返回时s被销毁，又调用了一次Student的析构函数。但是要注意到Student内部有两个string对象，每构造一个Student对象你就得构造两个string对象。Student继承自Person，所以还有一个Person对象的构造。而Person对象内部也包含着两个string对象。统共算下来，这次传值的代价是一次Student的拷贝构造函数，一次Person的拷贝构造函数，以及四次string的拷贝构造函数。相应的，返回时还有对应的六次析构函数。

如果换下面这种写法，就能绕过这些构造和析构：

```cpp
bool validateStudent(const Student& s);
```

注意const的必要性。不用担心函数改变了传入的Student。
