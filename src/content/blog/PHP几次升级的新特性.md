---
title: "PHP几次升级的新特性一览"
date: 2015-03-26 02:03:11
tags: ["PHP"]

description: "Archived from my original Hexo blog."
---
#5.2.x to 5.3.x
<!--more-->
##支持namespace
##支持late static bindings
##支持标签跳转
##支持闭包（λ/匿名函数）
##新的魔术方法
__callStatic()与__invoke()
##Nowdoc
语法与Heredoc类似。
##const
可以在class的外部声明常量。
##三元运算符
即?:。
##HTTP stream wrapper
将200至399之间的状态码都看成是成功返回。
##动态访问静态方法
```php
class C {
	public static $foo = 123;
}
$a = "C";
echo $a::$foo; //123
```

##嵌套异常
```php
class MyCustomException extends Exception {}
try {
	throw new MyCustomException("Exceptional", 112);
} catch (Exception $e) {
	throw new RuntimeException("Rethrowing", 911, $e);
}
```

##垃圾回收处理循环引用

#5.3.x to 5.4.x
##支持traits
##增加数组的短语法
```php
$a = [1, 2, 3, 4];
$b = ['one' => 1, 'two' => 2, 'three' => 3, 'four' => 4];
```
##函数增加数组引用
```php
$a = foo()[0];
```

##闭包支持$this
##短标签写法一直有效
以前是要在php.ini文件中设置short_open_tag选项的，现在<?=这种写法总是有效的了。
##支持实例化时访问类的成员
```php
(new Foo)->bar();
```
##支持Class::{expr}()语法
##添加二进制数字格式
##session扩展可以追踪文件的上传进程
##内置CLI模式下的web server

#5.4.x to 5.5.x
##generator
通过yield关键字实现了对生成器的支持。

手册中给出了将range()函数重新实现为一个生成器的例子：（手册原文有一句at least for positive step values，实在是，有点鸡贼啊……）

```php
function xrange($start, $limit, $step = 1){
	for ($i = $start; $i <= $limit; $i += $step) {
		yield $i;
	}
}
function (xrange(1, 9, 2) as $num) {
	echo "$num ";
}
echo "\n";//1 3 5 7 9
```
生成器的优势就在于不用实现Iterator接口。记得当初学Python时一下子就被惊艳到了。是的，Python。具体到上面的例子中，没有创建数组，节省了内存。

##finally
try-catch语句块支持finally关键字了。

##password_hash()

##foreach支持list()
手册中的例子：
```php
$array = [
	[1, 2],
	[3, 4],
];
foreach ($array as list($a, $b)){
	echo "A: $a; B: $b\n";
}
```

##empty()支持表达式
手册中的例子：
```php
function always_false(){
	return false;
}
if (empty(always_false())){
	echo "This will be printed.\n";
}
if (empty(true)) {
	echo "This will not be printed.\n";
}
```

##数组与字符串的literal dereferencing
```php
echo [1, 2, 3][0];
echo 'PHP'[0];
```

##::class可得到class的名字
```php
namespace Name\Space;
class ClassName {}
echo ClassName::class;//Name\Space\ClassName
```

##OPcache

##foreach支持非标量的键
foreach支持任何类型的键。

#5.5.x to 5.6.x
##常量表达式
```php
const ONE = 1;
const TWO = ONE * 2;
class C {
	const THREE = TWO + 1;
	const ONE_THIRD = ONE / self::THREE;
	const SENTENCE = 'The value of THREE is ' . self::THREE;
	public function f($a = ONE + self::THREE) {
		return $a;
	}
}
echo (new C)->f() . "\n";//4
echo C::SENTENCE;//The value of THREE is 3
```

定义常量数组：
```php
const ARR = ['a', 'b'];
echo ARR[0];//a
```

##可变参数
```php
function f($req, $opt = null, ...$params) {
	printf('$req: %d; $opt: %d; number of params: %d' . "\n", $req, $opt, count($params));
}
f(1);
f(1, 2);
f(1, 2, 3);
f(1, 2, 3, 4);
f(1, 2, 3, 4, 5);
```

##解压参数
数组和可遍历对象可以解压为参数列表。
```php
function add($a, $b, $c) {
	return $a + $b + $c;
}
$operators = [2, 3];
echo add(1, ...$operators);//6
```

##**
幂运算。

##use function与use const
```php
namespace Name\Space {
	const FOO = 42;
	function f() {
		echo __FUNCTION__ . "\n";
	}
}
namespace {
	use const Name\Space\Foo;
	use function Name\Space\f;
	echo FOO . "\n";
	f();
}
```

##phpdbg

##字符集
现在有了default_charset，充作htmlentities()、html_entity_decode()与htmlspecialchars()的默认字符集。默认值就是UTF-8。

##php://input可重用
现在php://input可重复打开多次，这样减少了处理POST数据所需要的内存。

##上传大文件

##GMP支持操作符重载

##hash_equals()
可在常量时间内比较两个字符串。主要是用来防止时间攻击的。手册中举的例子是：

```php
$expected = crypt('12345', '$2a$07$usesomesillystringforsalt$');
$correct = crypt('12345', '$2a$07$usesomesillystringforsalt$');
$incorrect = crypt('1234', '$2a$07$usesomesillystringforsalt$');
var_dump(hash_equals($expected, $correct));//bool(true)
var_dump(hash_equals($expected, $incorrect));//bool(false)
```

##__debugInfo()
新加的这个魔术方法允许对对象var_dump()时改变属性与值。（这是要干什么？烟雾弹？）

```php
class C {
	private $prop;
	public function __construct($val) {
		$this->prop = $val;
	}
	public function __debugInfo() {
		return ['propSquared'] => $this->prop ** 2];
	}
}
var_dump(new C(42));
```

##gost-crypto哈希算法

##SSL/TLS改进

##pgsql支持异步