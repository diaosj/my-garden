title: jQuery源码阅读
date: 2016-01-18 09:55:19
tags:
 - JavaScript
 - jQuery

---

#整体结构

##构造函数

看src/init.js文件。jQuery并不是用new来构造实例。原因在于，假设构造函数是这样写的：

<!--more-->

```javascript
var jQuery = function(selector, context) {
    return new jQuery();
};
jQuery.prototype = {
    name: function(){},
    age: function(){}
};
```

那就死循环了。

如果我们使用工厂模式：

```javascript
var jQuery = function(selector, context) {
    return jQuery.prototype.init();
};
jQuery.prototype = {
    init: function() {
        return this;
    },
    name: function(){},
    age: function(){}
};
```

那么问题来了，init里的this指向的并不是jQuery.prototype。

精髓在这里：

```javascript
jQuery.fn.init.prototype = jQuery.fn;
```

##链式调用

通过return this来实现。其实这一点很简单，也很好用。在当初学C++时，要重载=运算符与>>运算符也是一样的思路。

#选择器

还是src/init.js。注意下面这个正则表达式。

```javascript
rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
```

其实看一遍jQuery源码，能学到很多匹配页面内容的正则。上面这个表达式，就是为了匹配HTML标记，顺便可能的话，匹配ID表达式。

下面是选择器的入口，建议对照jQuery的API文档看，一目了然。几个分支对应着文档中列出来的几种选择器调用方式。

#Sizzle引擎

看/external/sizzle/sizzle.js文件。

浏览器选取DOM节点的接口：

```javascript
document.getElementById('id');
document.getElementsByTagName('tagName');
document.getElementsByName('name');
```

有些浏览器还支持这几个接口：

* document.getElementsByClassName
* document.querySelector
* document.querySelectorAll

Sizzle engine提供了统一的接口。顺便提下有点tricky的一个地方，从效率考虑，选择器匹配元素是从右向左匹配的，这也是为了不匹配的时候能尽早返回。

再看下compile函数的写法：

```javascript
compile = Sizzle.compile = function( selector, match ) {
    var i,
        setMatchers = [],
        elementMatchers = [],
        cached = compilerCache[ selector + " " ];
        
    if ( !cached ) {
        if ( !match ) {
            match = tokenize( selector );
        }
        i = match.length;
        while ( i-- ) {
            cached = matcherFromTokens( match[i] );
            if ( cached[ expando ] ) {
                setMatchers.push( cached );
            } else {
                elementMatchers.push( cached );
            }
        }
        
        cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
        
        cached.selector = selector;
    }
    return cached;
}
```

注意那个while循环，组合之后成组地提交编译。

#官方API的函数

基本上看源码就不用看文档了。也没什么好讲的。

#回调对象

看/src/callbacks.js。add()与fire()实际上是Observer模式。

#Deferred与Promise

看/src/deferred.js文件。抽出了回调对象到callbacks.js中，所以这个文件看着非常地明晰。

#缓存

看/src/data.js文件。

#遍历

jQuery内部维护了一个对象栈。而每个对象都有三个属性：context、selector和prevObject，其中prevObject指向栈中前一个对象。而常用的end()就是调用当前对象的prevObject。

```javascript
end: function() {
    return this.prevObject || this.constructor();
}
```

看下进栈的过程。

```javascript
pushStack: function( elems ) {
    var ret = jQuery.merge( this.constructor(), elems );
    ret.prevObject = this;
    return ret;
}
```

#事件绑定

推荐用on()。一方面是性能，另一方面是能委托。而且看源代码会发现，bind()、live()、delegate()都是通过on()实现的。

看一下/sec/event.js文件。on()对传进来的参数做一系列处理后调用的是jQuery.event.add()。

顺便提一下各个浏览器的差异，IE8.0及以下版本，event对象必须作为window对象的一个属性，而遵循W3C规范的浏览器中，event对象是随事件处理函数传入的。jQuery中解决事件浏览器兼容性的代码在jQuery.event.fix()中。

#Ajax

看/src/ajax.js。实现了一个jqXHR对象。