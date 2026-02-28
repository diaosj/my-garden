title: JavaScript中的this
date: 2015-04-02 10:23:43
tags: JavaScript

---
JavaScript总是要在一个宿主环境中运行的，最常见的宿主环境就是web浏览器，与之对接的是JavaScript引擎，这才是真正执行JavaScript代码的地方。常见的引擎有V8、JavaScript core。

<!-- more -->

#global this

在浏览器里，全局范围内，this等价于window对象。用var声明一个变量和给this或window添加属性是等价的。

```javascript
var foo = 'bar';
console.log(this.foo);//logs 'bar'
console.log(window.foo);//logs 'bar'
```

如果声明变量时没有使用var，那就是在给全局的this添加或改变属性值。

```javascript
foo = 'bar';

function testThis() {
    foo = 'foo';
}

console.log(this.foo); //logs bar
testThis();
console.log(this.foo); //logs foo
```

在node环境中，使用REPL执行一条条语句时，最高级的命名空间global与this等价。

但如果是执行一个脚本的形式，this以一个空对象开始作为最高级的命名空间，与global不等价。

```javascript
//test.js脚本
console.log(this);
console.log(this === global);
```

运行脚本结果：

```javascript
{}
false
```

#function this

无论是浏览器环境还是node环境，除了在DOM事件处理程序或者给出了thisArg外，如果不是用new调用，在函数里面使用this都是指代全局范围的this。

```javascript
foo = 'bar';

function testThis() {
    this.foo = 'foo';
}

console.log(this.foo); //logs 'bar'
testThis();
console.log(this.foo); //logs 'foo'
```

如果在调用函数时在前面使用了new，this就变成一个新的值，和global脱离。

```javascript
foo = 'bar';

function testThis() {
    this.foo = 'foo';
}

console.log(this.foo); //logs 'bar'
new testThis();
console.log(this.foo); //logs 'bar'

console.log(new testThis().foo); //logs 'foo'
```

#prototype this

this会沿着原型链往上查找需要的属性值。

```javascript
function Thing1() {
}
Thing1.prototype.foo = 'bar';

function Thing2() {
}
Thing2.prototype = new Thing1();

var thing = new Thing2();
console.log(thing.foo); //logs 'bar'
```

嵌套函数可以通过闭包捕获父函数的变量，但这个函数没有继承this。

```javascript
function Thing() {
}
Thing.prototype.foo = 'bar';
Thing.prototype.logFoo = function () {
    var info = 'attempting to log this.foo:';
    function doIt() {
        console.log(info, this.foo);
    }
    doIt();
}

var thing = new Thing();
thing.logFoo(); //logs 'attempting to log this.foo: undefined'
```

再举一个例子。

```javascript
function Thing() {
}
Thing.prototype.foo = 'bar';
Thing.prototype.logFoo = function() {
    console.log(this.foo);
}

function doIt(method) {
    method();
}


var thing = new Thing();
thing.logFoo(); //logs 'bar'
doIt(thing.logFoo); //logs undefined
```

有种做法是将this捕获到变量self中。

```javascript
function Thing() {
}
Thing.prototype.foo = 'bar';
Thing.prototype.logFoo = function() {
    var self = this;
    var info = 'attempting to log this.foo';
    function doIt() {
        console.log(info, self.foo);
    }
    doIt();
}


var thing = new Thing();
thing.logFoo(); //logs 'attempting to log this.foo: bar'
```

但这种写法对上面第二个例子来说，并不能解决问题。可以使用bind函数。

```javascript
function Thing() {
}
Thing.prototype.foo = 'bar';
Thing.prototype.logFoo = function () {
    console.log(this.foo);
}

function doIt(method) {
    method();
}

var thing = new Thing();
doIt(thing.logFoo.bind(thing)); //logs bar
```

同样可以使用apply或call来在新的上下文中调用方法或函数。

```javascript
function Thing() {
}
Thing.prototype.foo = 'bar';
Thing.prototype.logFoo = function () {
    function doIt() {
        console.log(this.foo);
    }
    doIt.apply(this);
}

function doItIndirectly(method) {
    method();
}

var thing = new Thing();
doItIndirectly(thing.logFoo.bind(thing)); //logs bar
```

进一步，可以用bind代替任何一个函数或者方法的this。

```javascript
function Thing() {
}
Thing.prototype.foo = 'bar';

function logFoo(aStr) {
    console.log(aStr, this.foo);
}

var thing = new Thing();
logFoo.bind(thing)('using bind'); //logs 'using bind bar'
logFoo.apply(thing, ['using apply']); //logs 'using apply bar'
logFoo.call(thing, 'using call'); //logs 'using call bar'
logFoo('using nothing'); //logs 'using nothing undefined'
```

