---
title: "Perl之utf8"
date: 2014-12-15 10:09:37
tags: ["Perl"]

description: "Archived from my original Hexo blog."
---
今天遇到一个问题。MySQL中用的是UTF-8编码，有一些日文词汇，从数据库中读取出来时能正常输出，但是经过encode_json之后就成了乱码，再存入数据库中也是乱码。
<!--more-->

一下子想到很久之前遇到过的一个类似的问题。不过那次是将页面上的内容抓取下来，用Perl处理之后再以json格式存入MySQL中，供以后PHP使用。目标页面是EUC-JP编码。信息给到脚本时进行了转码：

```perl
eval {
    Encode::from_to($content, "euc-jp", "utf8", Encode::FB_CROAK);
};
if ($@) {
    $conf->{log}->err("failed to convert encoding => file:$file", [$@, $content]);
}
```

转码之后再json_to_perl一下。到这里一切就和期待中的一样。做完一堆处理工作后再encode_json时，就遇到乱码了。当时百思不得其解。后来试了一下to_json，发现能得到期望的结果。结果是对了，但道理还是没想通。而且JSON模块的文档中明明是这么描述encode_json的：

>Converts the given Perl data structure to a UTF-8 encoded, binary string.

对to_json的描述是：

>Converts the given Perl data structure to a json string.

而且还有一句提醒：

>If you want to write a modern perl code which communicates to outer world, you should use encode_json (supposed that JSON data are encoded in UTF-8).

那为什么这里起作用的是to_json而不是encode_json呢？我转过utf8了啊？

再回到眼前的问题。根据历史经验，是不是这个把encode_json换成to_json就能奏效了呢？试一下，好，biaji，不行，还是乱码。

网上乱讲的文章太多了，好多人就互相转转，答案抄来抄去都是一样的。还有文章号称读了就“茅塞顿开”的，结果读了更混乱。还有说一定要用use utf8的。还是去看文档。文档对utf8的描述是：“Perl pragma to enable/disable UTF-8 (or UTF-EBCDIC) in source code.”所以，use utf8的意思只是告诉Perl这个脚本是用UTF-8写的，与函数的使用根本不搭界。
不仅不搭界，实际上只有在我们确定要的是UTF-8的源代码时才能写use utf8。

再看函数。文档中给出的示例如下：

```perl
# Convert the internal representation of a Perl scalar to/from UTF-8.

$num_octets = utf8::upgrade($string);
$success = utf8::downgrade($string[, $fail_ok]);

# Change each character of a Perl scalar to/from a series of
# characters that represent the UTF-8 bytes of each original character.

utf8::encode($string); # "\x{100}" becomes "\xc4\x80"
utf8::decode($string); # "\xc4\x80" becomes "\x{100}"

$flag = utf8::is_utf8($string); # since Perl 5.8.1
$flag = utf8::valid($string);
```

utf8::upgrade是本地将字符串内部的表现形式从比特流转成UTF-8。字符串外观上是不变的。如果字符串已经是UTF-8形式的，那就相当于什么也没做。utf8::downgrade与upgrade相对应，只不过当UTF-8序列不能用本地8比特编码时，$fail_ok为true时返回false，否则直接die。

utf8::encode是本地将字符串转换成相同比特流在UTF-8下代表的字符串。utf8::decode与encode相对应。

utf8::is_utf8与Encode::is_utf8在功能上等价。

看到这里，稍微想一下就知道，数据库中存的就是UTF-8编码，与这些函数都不相干。既然后面的转换是从Perl内部的格式转成UTF-8，那么是不是要先转成Perl内部的格式呢？

果然，加了下面这一句就解决问题了：

```perl
$word = Encode::decode("utf8", $word);
```
