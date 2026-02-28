title: PHP异步并行编程例子
date: 2014-08-27 13:26:41
tags: PHP

---
今天看了今年**PHPCONCHINA**一些PPT。分享的一些工具还是很有用的，比如Dash、httpie。正在考虑IDE是否需要采用推荐的PhpStorm。

这篇笔记里的几段代码都是来自韩天峰的PPT《PHP异步并行编程》。
<!--more-->

#第一个Server，阻塞+fork子进程
```php
$serv = stream_socket_server("tcp://0.0.0.0:8000", $errno, $errstr)
or die("create server failed");
while(1) {
	$conn = stream_socket_accept($serv);
	if (pcntl_fork() == 0) {
		$request = fread($conn);
		//do something
		//$response = "hello world"
		fwrite($response);
		fclose($conn);
		exit(0);
	}
}
```

#第二个Server，改良版
```php
$serv = stream_socket_server("tcp://0.0.0.0:8000", $errno, $errstr)
or die("create server failed");
for ($i = 0; $i < 32; $i ++) {
	if (pcntl_fork() == 0) {
		while(1) {
			$conn = stream_socket_accept($serv);
			if ($conn == false) continue;
			$request = fread($conn);
			//do something
			//$response = "hello world"
			fwrite($response);
			fclose($conn);
		}
		exit(0);
	}
}
```

#初步尝试异步
```php
$serv = stream_socket_server("tcp://0.0.0.0:8000", $errno, $errstr);
//for ($i = 0; $i < 32; $i ++)
$base = event_base_new();
$event = event_new();
function read_cb ($socket, $flag, $base) {
	fread($socket);
	fwrite("hello world\n");
}
function accept_cb ($socket, $flag, $base) {
	$conn = stream_socket_accept($socket, 0);
	stream_set_blocking($conn, 0);
	$event = event_new();
	event_set($event, $conn, EV_READ | EV_PERSIST, 'read_cb', $base);
	event_base_set($event, $base);
	event_add($event);
}
event_set($event, $socket, EV_READ | EV_PERSIST, 'accept_cb', $base);
event_base_set($event, $base);
event_add($event);
event_base_loop($base);
```