title: Python框架小结
date: 2015-03-25 22:58:14
tags:
 - Python
 - Django
 - Tornado
 - Flask
 - Gevent
 - Web.py
 - Bottle
 - Celery
 - Twisted
 - NumPy
 
---
<!--more-->

#Django

##ORM

```python
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
```

###批量插入

```python
product_list_to_insert = list()
for x in range(10):
    product_list_to_insert.append(Product(name='product name ' + str(x), price=x))
Product.objects.bulk_create(product_list_to_insert)
```

###批量更新

```python
Product.objects.filter(name__contains='name').update(name='new name')
```

###批量删除

```python
Product.objects.filter(name__contains='name query').delete()
```

#Flask

##基本写法

hello world.

```python
#!/usr/bin/env python
# encoding: utf-8

from flask import Flask
app = Flask(__name__)

@app.route('/')
def index():
	return 'hello world'
	
if __name__ == '__main__':
    app.run(debug=True)
```

post/get