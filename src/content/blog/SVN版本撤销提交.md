---
title: "SVN版本撤销提交"
date: 2012-05-09 16:46:22
description: "Archived from my original Hexo blog."
tags: ["SVN"]
---
今天写了一个正则，提交代码的时候脑子里面还在想着贪婪不贪婪的，结果写了svn commit -m 'xxx'后忘了写文件名了……结果把别的文件也提交了。还好google了一把，回退到之前的版本，傻傻地记一下操作步骤。

<!--more-->

* 确定要回退到哪里

	```bash
	svn log -l 3 xxx
	```

* 回滚到指定版本号

	```bash
	svn merge -r from:to xxx
	```

* 确认无误

	```bash
	svn diff xxx
	```

* 提交回滚

	```bash
	svn commit -m 'Revert revision' xxx
	```