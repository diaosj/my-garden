---
title: "Brighthouse学习"
date: 2015-04-16 16:23:11
tags: 
 - MySQL
 - Infobright
description: "Archived from my original Hexo blog."
---
最近接到开发专门research站点的任务。数据是放到数据仓库中的。虽然都是一样的连接，插入脚本生成的数据，取出数据用于业务逻辑，对于要做的任务来说，“数据仓库”这四个字是透明的。不过查知table的引擎是Brighthouse，去搜索了一些资料学习一下，主要是《Brighthouse: An Analytic Data Warehouse for Ad-hoc Queries》这篇文档。

<!--more-->

Wikipedia上Infobright词条对它技术的描述是，数据进表时，以2^16行为单位分成一个个group，然后再以列为单位分成一个个pack。单个pack的压缩比能达到10:1。这里没有传统的索引概念，取而代之的是一个称为Knowledge Grid的元数据层，这里面存的是内容的压缩信息以及pack之间的关系。优化器是根据rough set和Granular computing的理论决定解压哪些pack。


