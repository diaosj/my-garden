title: CodeIgniter框架学习
date: 2015-05-25 13:33:40
tags: 
- PHP
- CodeIgniter

---
离开前东家之后就挺背的，Paperwhite屏幕被挤裂，Surface Pro蓝屏，QQ、微信都被冻结，球衣球鞋弄丢了，折腾信用卡，折腾保险，连Mac上搭开发环境都搭得七窍生烟，更不要提C++被鄙视，面谈被误解。两周过得跟几个月似的。新东家用的是CodeIgniter框架，版本号2.2.0。一周来在各种培训与杂事之间抽空学习了框架的官方文档，完成了几个简单的功能。框架还不太熟，记了一些笔记在这里，希望能尽快用熟。

<!-- more -->

#MVC
以前用得比较熟的还是Yii框架。不过既然都是MVC框架，总有不少可以类比的地方。MVC框架里面Controller扮演的是交通枢纽的作用，可以载入libraries，可以载入views，可以操作整个框架。

#工作过程

请求过来时，先进入index.php文件，这是整个系统的入口。在index.php中，先设置应用程序的文件夹名称为application，系统的文件夹名称为system，定义APPPATH，BASEPATH，最后引入codeigniter/codeigniter.php文件。

在codeigniter.php中，require了几个文件：Common.php用于使用一些常用的函数，如load_class、log_message、show_404等；constants.php是一些文件权限的常量。然后用load_class()载入类库：Benchmark、Hooks、Config、Utf8、URI、Router等等。最后require了core/Controller.php文件，并调用CI_Controller::get_instance()得到一个实例。然后根据Router解析请求。

#form
CodeIgniter提供了比较实用的表单写法，如下所示。

##View层

```html
<?php echo validation_errors();?>
<?php echo form_open('news/create');?>
...
</form>
```

注意到页面文件中用的是form_open()方法，而不是手写form标签。这是因为CodeIgniter框架在这个方法中顺带做了一些其它的事，比如加入了一个防CSRF的隐藏字段。

##Controller层
```php
$this->load->helper('form');
$this->load->library('form_validation');
$this->form_validation->set_rules('title', 'Title', 'required');

if ($this->form_validation->run() === FALSE)
{
    //...
}
else
{
    $this->news_model->set_news();
    $this->load->view('news/success');
}
```

注意下设定校验规则的写法：
```php
$this->form_validation->set_rules(
    'username', 'Username',
    'required | min_length[5] | max_length[12] | is_unique[users.username]',
    array(
        'required'  => 'You have not provided %s',
        'is_unique' => 'This %s already exists.'
    )
);
$this->form_validation->set_rules('password', 'Password', 'required');
$this->form_validation->set_rules('passconf', 'Password Confirmation', 'required | matches[password]');
$this->form_validation->set_rules('email', 'Email', 'required | valid_email | is_unique[users.email]');
```

所有PHP原生函数都可以拿来做校验的规则：
```php
$this->form_validation->set_rules('password', 'Password', 'trim | required | md5');
```

##Model层
```php
public function set_news()
{
    $this->load->helper('url');
    $slug = url_title($this->input->post('title'), 'dash', TRUE);
    $data = array(
        'title' => $this->input->post('title'),
        'slug'  => $slug,
        'text'  => $this->input->post('text')
    );

    return $this->db->insert('news', $data);
}
```

#数据校验
CodeIgniter官方给出的最佳实践三原则，原文照录如下：
1.Validate the data to ensure it confirms to the correct type, length, size, etc.
2.Filter data as if it were tainted.
3.Escape the data before submitting it into your database or outputting it to a browser.

#Cache使用方法
```php
$this->load->driver('cache', array(
    'adapter' => 'apc',
    'backup'  => 'file'
));

$this->cache->get('item');
$this->cache->save('cache_item_id', 'data_to_cache');
```

也有不传adapter的写法：
```php
$this->load->driver('cache');
$this->cache->redis->save('foo', 'bar', 10);
```

#Profile
```php
$this->benchmark->mark('code_start');
$this->benchmark->mark('code_end');

echo $this->benchmark->elapsed_time('code_start', 'code_end');

echo $this->benchmark->memory_usage();
```

#一些实用函数
CI自带的，感觉以后可能会用到，留个印象，需要时随时可以查下文档备忘。

```php
$this->load->helper('date');
echo standard_date();
echo mysql_to_unix();
echo unix_to_human();
echo gmt_to_local();
echo unix_to_human();
echo timezone_menu();
```

```php
$this->load->helper('text');
$this->load->helper('inflector');
echo word_censor();
echo word_limiter();
echo underscore();
echo camelize();
```

