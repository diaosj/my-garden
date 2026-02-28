---
title: Perl复习
date: 2014-07-28 01:26:32
tags:
- Perl

description: "Archived from my original Hexo blog."
---
骆驼书是去年看的了，最近在做的项目中，爬虫基本上是用Perl写的。趁着这个机会，复习一下Perl——因为基本上已经不记得Perl该怎么写了……

<!--more-->

#冷知识

##骆驼书

说到[骆驼书](http://book.douban.com/subject/1475893/)，Perl的版本号升到4，不是因为语言有什么重大改变，纯粹是由于这本书的出版。语言之父出书的待遇就是不一样啊。

##名称

文档中明说“PERL”是不对的[1]。

有些地方将名称视为“Practical Extraction and Report Language”的缩写，沃尔自己也曾开玩笑说这是“Pathologically Eclectic Rubbish Lister”。好吧，喜欢缩写文字游戏真是程序员一个奇怪的爱好。[Silicon Valley](http://movie.douban.com/subject/20644938/)里面一上来就黑了。

##标志
*Programming Perl*的封面是骆驼，所以骆驼成了吉祥物。其实……羊驼也是Perl的吉祥物。因为*Intermediate Perl*的封面是一只羊驼……另外，洋葱也是Perl的标志。

##思想
Perl的中心思想：
>There's More Than One Way To Do It.

缩写就是“TMTOWTDI”——沃尔说这个词可以念成"Tim Toady"。无聊的程序员啊。
这句话后来被扩充成：
>There's more than one way to do it, but sometimes consistency is not a bad thing either.

怎么有种承认打脸的感觉……另外缩写TMTOWTDIBSCINABTE发音就成了“Tim Toady Bicarbonate”。这孩子又多了个姓。你们程序员真是太无聊了……

还有句谚语：
>Easy things should be easy, and hard things should be possible.

##优点
在统一变量类型和掩盖运算细节方面，Perl做得比Python更为出色。

##缺点
一直有着write-only的“美誉”。

#语法
##变量
Perl是一种无类型语言。只有一种能接受各种类型数据的“无类型”变量。

标量（Scalar，$）以外，Perl还有数组（Array，@）和关联数组（Hash，%）两种集合类型。

另外，Perl还有一种特殊的类型，引用（reference），类似于指针，当作标量处理，可以指向任何类型。

```perl
$foo = \$bar; print $$foo;
$foo = \@bar; print @$foo;
$foo = \%bar; print %$foo;
$foo = \&bar; print $foo->(); print &$foo;
```

引用的好处在于，传递后依然可以修改指向的变量。

```perl
sub foo {
	my $var = shift;
	$$var = '1';
}
my $foo = '2';
my $var = \$foo;
print $$var;
foo ($var);
print $foo;
#21
```

##判断语句
*if区块

*if语句

*unless区块

*unless语句

*given/when（语句及区块）
```perl
use 5.010;
given ($foo) {
	say 'a' when 'a';
	when (/b/) { say 'b'; } #when可以写成语句或区块
	default { say 'not match'; } #只可以写成区块
}
```
也有不用关键字的判断语句，例如常用的打开文件语句：

```perl
open DATA, '<', $filename or die "Can't open $filename:$!\n";
```

##循环语句
*for/foreach

*while

*do...while

*until

*do...until

*map函数
```perl
map { print "$_\n" } @group;
```

##函数
//Todo


[1]:http://perldoc.perl.org/perlfaq1.html#What's-the-difference-between-%22perl%22-and-%22Perl%22%3f