---
title: AVL树
date: 2009-04-03 09:35:34
tags:
 - C++
 - 数据结构
description: "Archived from my original Hexo blog."
---
一棵AVL树或者是空树，或者是具有下列性质的二叉搜索树：它的左子树和右子树都是AVL树，且左子树和右子树的高度之差绝对值不超过1.

<!-- more -->

#平衡化旋转

每插入一个节点，AVL树中相关节点的平衡状态会改变。因此，每次插入，需要从插入位置向根回溯，检查各节点左右子树的高度差。如果发现不平衡，停止回溯，从不平衡的节点开始，沿来路反向取直接下两层的节点。如果三个节点处于一条直线上，则采用单旋转进行平衡化；如果三个节点处于一条折线上，则采用双旋转进行平衡化。

##左单旋转

```cpp
template <class E, class K>
void AVLTree<E,K>::RotateL(AVLNode<E,K> *& ptr) {
    AVLNode<E,K> *subL = ptr;
    ptr = subL->right;
    subL->right = ptr->left;
    ptr->left = subL;
    ptr->bf = subL->bf = 0;
};
```

##右单旋转

左单旋转的镜像。

```cpp
template <class E, class K>
void AVLTree<E,K>::RotateR(AVLNode<E,K> *& ptr) {
    AVLNode<E,K> *subR = ptr;
    ptr = subR->left;
    subR->left = ptr->right;
    ptr->right = subR;
    ptr->bf = subR->bf = 0;
};
```

##先左后右双旋转

双旋转总是考虑3个节点。

