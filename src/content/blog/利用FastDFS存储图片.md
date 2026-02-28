---
title: "利用FastDFS存储图片"
date: 2014-10-09 09:55:12
tags: ["PHP", "FastDFS"]
description: "Archived from my original Hexo blog."
---
现在做的这个应用，可以让用户查看久远的商品及相关的广告之类的活动。遇到一个问题，就是乐天上的图片可能失效。因此想把商品图片存至本地。由于都是一堆小图片，看资料上说FastDFS特别适合存储大量大小在4KB与500MB之间的文件。

<!--more-->

FastDFS的文档做得不是很好。网上搜到的资料基本上说得都差不多。有时间的话还是要看一下源代码，不过是纯C写的……（鄙视一下自己。）是应用级的分布式文件存储服务。Google FS以及FastDFS、mogileFS、HDFS、TFS这些类Google FS都是应用级的，不是系统级。所以只能通过专有的API对文件进行存取访问，不支持POSIX接口，不能mount使用。

#结构

FastDFS中分为两个角色：Tracker server和Storage server。Tracker server是中心节点，负责负载均衡和调度。Tracker server在内存中记录分组和Storage server的状态，不记录文件索引信息，在客户端和Storage server访问时给出应答，所以Tracker占用的内存很小。Storage server直接利用OS的文件系统存储文件。FastDFS不会对文件进行分块存储，客户端上传的文件和Storage server上的文件一一对应。

FastDFS采用了分组存储方式。集群由group组成，集群的存储总量为所有group的存储容量之和。同一个group内的Storage server之间是互备关系，相互连接，文件完全一致。Tracker server之间相互独立，没有直接联系。Storage server会连接所有的Tracker server，向它们报告状态。

Storage server采用binlog文件记录文件上传、更新等操作。binlog中只记录文件名，不记录文件内容。

#安装
先确保已安装libevent。然后：

```bash
wget http://fastdfs.googlecode.com/files/FastDFS_v3.03.tar.gz
tar -zxf FastDFS_v3.03.tar.gz
cd FastDFS
vi make.sh
```

确保WITH_HTTPD=1，以支持http。

```bash
./make.sh
./make.sh install
```

安装完成后，先启动Tracker server，再启动Storage server。

#使用
##上传
```php
private function uploadImg($filename) {
    if (!file_exists($filename)) {
        return '';
    }
    $pathParts = pathinfo($filename);
    $fileData = file_get_contents($filename);
    try {
        $dfsUrl = fastdfs_storage_upload_by_filebuff1($fileData, $pathParts['extension']);
    } catch (Exception $e) {
        echo $e->getMessage();
        return '';
    }
    unset($fileData, $pathParts);
    if (!unlink($filename)) {
        echo "Failed to delete file: $filename" . date('Y-m-d H:i:s') . "\n";
    }
    return '/' . $dfsUrl;
}
```

##用户站点使用
这里有坑，本来很自然的想法是，我已经传到FastDFS机器上了，还得到了访问地址，那岂不是理所当然地就能访问到了？后来发现居然后上传之后FastDFS认为文件不存在的！只好在使用之前先判定一下图片是否可用：

```php
public static function canUseDfsImg($dfsImg) {
    return $dfsImg && function_exists('fastdfs_storage_file_exist1') && function_exists('fastdfs_storage_download_file_to_buff1') && fastdfs_storage_file_exist1($dfsImg);
}
```

在controller中加一个取图片的action：
```php
public function actionFetchPic() {
    $request = Yii::app()->request;
    $dfsImg = $request->getParam('img');
    if (!empty($dfsImg)) {
        $realDfsImg = substr($dfsImg, 1);
        $pathInfo = pathinfo($dfsImg);
        ob_end_clean();
        header("Content-type: image/" . $pathInfo['extension']);
        $dfsImg = fastdfs_storage_download_file_to_buff1($realDfsImg);
        echo $dfsImg;
    }
}
```

然后在页面中使用：
```html
<?php if (Util::canUseDfsImg($value['local_img'])): ?>
    <?= CHtml::image(Yii::app()->createUrl('item/fetchPic', array('img' => $value['local_img'])), "", array('width' => 60)) ?>
<?php else: ?>
    <?= CHtml::image($value['img'], "", array('width' => 60)); ?>
<?php endif; ?>
```


