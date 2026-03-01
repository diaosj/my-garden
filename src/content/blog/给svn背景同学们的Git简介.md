---
title: 给svn背景同学们的Git简介
date: 2015-05-26 16:20:35
description: "Archived from my original Hexo blog."
tags: ["SVN", "Git"]
---
#快速上手
其实版本控制软件最常用到的命令也就那么几条。看了一下本地svn相关的历史命令，我用得最多的就是svn up了，然后svn commit > svn st > svn log，然后就是其它零零碎碎的命令了。估计大家情形也都差不多。所以，我们先来看一下短时间内最常用到的几条命令。

<!-- more -->

##不要用svn的命令来比附Git
集中化的版本控制系统，比如我们熟悉的Subversion，都是有一个单一的集中管理的服务器，保存所有文件的修订版本，客户端们从服务器上取出最新的文件或者提交更新。作为枢纽的服务器显然就是脆弱环节。如果发生单点故障，开发人员就没法协同工作，没做好备份工作的话还会有丢失数据的风险。记得在前东家的某个夏天，上海风雨大作，svn服务器被雷劈了，后来也只补了一部分代码。

而Git的机制不同。作为分布式版本控制系统，客户端是把原始的代码仓库完整地镜像下来。每一次提取都是对代码仓库的完整备份。任何一处服务器发生故障，事后都可以用任何一个镜像出来的本地仓库恢复。

请不要用Subversion比附Git，虽然命令用的单词有类似的地方，但实际做的事情与Subversion颇为不同，不要混淆两边的操作。

##比较差异vs直接快照
Subversion每次记录有哪些文件更新了什么内容。而Git是把文件做快照后存在一个微型的文件系统中。每次提交更新时，它会纵览所有文件的指纹信息并对文件做一个快照，然后保存一个指向这次快照的索引。若文件没有变化，Git会只对上次保存的快照做一个连接，以提高性能。

##强大的本地操作
Subversion几乎所有的操作都是要联网的，而在Git中，本地磁盘上保存着所有有关当前项目的历史更新，绝大多数操作都只需要访问本地文件和资源，而且速度飞快。

##数据完整性
Git使用SHA-1算法计算数据的校验和。实际上，所有保存在Git数据库中的东西都是用这个计算得到的哈希值来做索引的，而不是文件名。

##文件状态
Git中有3个区域：git directory，staging area，working directory。Git将元数据和对象数据库保存在git directory。每次git clone时，实际上拷贝的就是这个目录里的数据。从git directory中checkout出某个版本的所有文件，就构成了working directory。我们就在这个目录中编辑代码。而staging area其实是git directory中的一个文件。所以，根据这3个区域，我们可以判定一个文件的状态：如果在git directory中，就是已提交状态；修改后存入staging area，就是已暂存状态；如果还没有存入staging area，就是已修改状态。

#安装
Windows上，msysGit自带命令行与图形界面管理工具。

#基础命令
##克隆仓库
Subversion中，我们要加入一个项目，一般是要先svn checkout，把项目代码拷出来。类似的命令在Git里面是git clone。注意这里使用的clone而非checkout，因为Git收取的是项目历史的所有数据（每一个文件的每一个版本），服务器上有的数据克隆之后本地也都有了。命令如下：

```
git clone https://github.com/diaosj/pyLeet.git
```

##检查状态
和Subversion中类似，我们随时可以检查代码的状态，命令就是：

```
git status
```

一般刚克隆一个仓库后，checkout出来的文件都是未更改的。此时若新建一个文件，git status一下就可看出，文件出于未跟踪状态。Git不会自动将文件纳入跟踪范围，这也很好理解，总不能随时把生成的log文件以及各种临时文件都纳入版本管理吧？

若我们有新文件code1.py要加进来，命令指定即可：

```
git add code1.py
```

再查看一下git status，可以发现code1.py文件列在了“Changes to be committed” 下面，说明文件已由未跟踪状态转成已暂存状态。

如果是改动已有的文件呢？

假设我们对原有的文件code0.py做了一些改动，查看git status，会发现code0.py出现在“Changed but not updated”下面，说明code0.py还没有放到暂存区下面。

```
git add code0.py
```

这时就可以看到，code0.py也在暂存区中的。所以，git add既可以跟踪新文件，也可以将已跟踪的文件放入staging area。这和Subversion里的svn add命令还是有些不同的。

##忽略文件
虽然Git不会自动将文件纳入版本管理，但有些文件一直出现在未跟踪列表下也挺烦的。当然你要是不烦的话，当我什么都没说。要将那些不想看到的文件移出视线的话，我们可以编辑.gitignore文件。可以使用标准的glob模式匹配。

##查看编辑内容
Subversion中命令是svn diff。Git中类似的是git diff。值得一提的是，git diff比较的是working directory和staging area之间的差异，也就是已修改且未暂存的内容。如果要看已暂存和上次提交的快照之间的差异，可以使用git diff --cached，或者git diff --staged。

##提交更新
git commit长得和svn commit一样，但它提交的是**staging area**中的内容，所以，提交之前要确认是否有文件没有git add过。实际上每一次提交相当于对项目做一次快照，以后可以很方便地返回，或者进行比较。

如果嫌两条命令敲得太麻烦，可以合并成一条：

```
git commit -a -m 'add and commit'
```

如果有内容漏提交了，可以修改上一次提交：

```
git commit -m 'missing something'
git add missing_file
git commit --amend
```

如果有文件已经误提交到staging area了，可以取消暂存：

```
git reset HEAD staged_file
```

##移除文件
git rm是从staging area移除文件，并在working directory中删除；如果仅仅是移出staging area，要在working directory中保留的话，要用git rm --cached。

##移动文件
```
git mv file_from file_to
```

等价于：
```
mv file_from file_to
git rm file_from
git add file_to
```

##查看提交历史
可以用git log，有多个选项可灵活定制，也可以用图形界面。

#远程仓库
git remote可查看当前有哪些远程仓库。

##从远程仓库抓取数据
```
git fetch remote_repository
```
注意，这个命令只是将远端的数据拉到本地仓库，并没有合并。要抓取数据并合并到working directory的当前分支的话，要用git pull。

##向远程仓库推送数据
与git pull对应：
```
git push remote_repository
```

##打标签
git tag可列出现有的标签。打标签的话也很简单：
```
git tag -a v1.7 -m 'version 1.7'
```

#Git分支
这是Git杀手锏级别的优势。几乎所有版本控制系统都支持分支，但很多版本控制系统中建分支的代价都很昂贵，常常要创建一个源代码目录的完整副本，项目越大，耗时越长。而Git的分支是难以置信地轻量级，新建操作可以说是秒建，分支间切换也是秒切，所以Git鼓励大家频繁使用分支与合并。

这里稍微提一下Git的做法。在Git中，每次提交会保存一个commit对象，这个对象包含一个指向内容快照的指针，一些附属信息，以及指向这个commit对象祖先的指针。而Git中的分支，本质上仅仅是个指向commit对象的指针。以Git默认分支名master为例，它就是一个指向最后一次commit对象的指针，每次提交的时候，这个指针都会向前移动。

至于用git branch新建分支，其实就是在当前commit对象上新建一个指针。那Git如何知道我们当前在哪个分支上呢？这靠的是HEAD指针。这个指针指向的是当前工作的分支。而用git checkout切换分支时，Git就是把HEAD指针移向目标分支，并将工作目录中的文件换成了目标分支指向的快照内容。由于分支的代价非常廉价，我们应该尽量多新建与使用分支。
